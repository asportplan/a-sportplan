/* global process */
/**
 * POST /api/ai  - AI coaching layer (Vercel serverless function, also mounted by Vite in dev).
 *
 * Modes:
 *   report  - narrative analysis of logged results for athlete + coach
 *   coach   - Q&A about the athlete's own program ("Tanya Coach")
 *   adjust  - structured adjustment PROPOSALS; the browser re-validates every proposal with the
 *             rule engine before anything is applied. The AI never sets loads directly.
 *
 * Requires: ANTHROPIC_API_KEY. Callers must be signed in (Supabase access token) so the API
 * key cannot be spent anonymously.
 */
import Anthropic from '@anthropic-ai/sdk';

export const config = { maxDuration: 60 };

const MODEL = 'claude-opus-5-5';
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://faijkobwgsgjiovtkgjp.supabase.co';
// Public anon key (same one shipped in the web bundle); only used to verify user tokens
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZhaWprb2J3Z3NnamlvdnRrZ2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczOTU4NTUsImV4cCI6MjEwMjk3MTg1NX0.VeeWLg_0VgMtXoIJRl8jN_oRIm3rF2qwqtoL1EMMplc';

const MAX_BODY_CHARS = 60_000;
const MAX_CHAT_TURNS = 20;
const RATE_LIMIT_PER_HOUR = 30;
const usage = new Map(); // per warm instance; a soft guard, not a billing control

const SAFETY_RULES = `Aturan yang tidak boleh dilanggar:
- Anda TIDAK menentukan beban (kg, %1RM, set) secara langsung. Beban dan keamanan ditentukan oleh rule engine aplikasi berbasis ACSM/NSCA. Jelaskan keputusan engine; jangan menggantinya.
- Jika atlet menyebut nyeri dada, sesak napas berat, pusing/pingsan, jantung berdebar tidak normal, atau nyeri tajam/bengkak pada sendi: minta berhenti latihan dan konsultasi dokter/fisioterapis. Jangan memberi diagnosis.
- Jangan memberi saran obat, suplemen dosis tertentu, atau diet ekstrem.
- Jawab dalam bahasa yang dipakai pengguna (Indonesia atau Inggris). Singkat, konkret, tanpa emoji.`;

const SYSTEM = {
  report: `Anda adalah asisten sport scientist di aplikasi aplanworkout. Tugas: menulis laporan akhir siklus latihan dari data log atlet untuk dibaca atlet DAN pelatihnya.
Struktur: (1) Ringkasan 2-3 kalimat, (2) Yang berjalan baik, (3) Yang perlu diperhatikan (kepatuhan, tren RPE, progres 1RM, berat badan), (4) 2-4 rekomendasi untuk siklus berikutnya.
Sebut angka dari data. Jika data terlalu sedikit untuk menyimpulkan, katakan terus terang.
${SAFETY_RULES}`,
  coach: `Anda adalah "Coach" di aplikasi aplanworkout. Atlet bertanya tentang program latihannya sendiri. Data program (periodisasi, minggu deload, latihan, set/rep, RPE, catatan medis) ada di pesan pertama.
Jelaskan alasan ilmiah di balik program dengan bahasa sederhana. Jika pertanyaan di luar konteks latihan/program, arahkan kembali dengan sopan.
${SAFETY_RULES}`,
  adjust: `Anda adalah asisten sport scientist. Berdasarkan program dan data log atlet, usulkan penyesuaian untuk minggu-minggu yang BELUM dijalani.
Jenis usulan yang diizinkan: "volume" (ubah jumlah set, -50%..+20%), "intensity" (ubah intensitas, -10..+5 poin persen), "deload" (jadikan minggu deload).
Usulkan hanya jika data mendukung (mis. RPE rata-rata >= 9 dua minggu berturut-turut -> kurangi volume/intensitas; RPE <= 6.5 dan semua repetisi tercapai -> naikkan sedikit). Jika tidak perlu perubahan, kembalikan daftar kosong.
Setiap usulan akan divalidasi ulang oleh rule engine; batas keamanan (cedera, usia, batas intensitas latihan) tetap berlaku.
${SAFETY_RULES}`,
};

const ADJUST_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['summary', 'proposals'],
  properties: {
    summary: { type: 'string' },
    proposals: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['type', 'week', 'change_pct', 'reason'],
        properties: {
          type: { type: 'string', enum: ['volume', 'intensity', 'deload'] },
          week: { type: 'integer' },
          change_pct: { type: 'number' },
          reason: { type: 'string' },
        },
      },
    },
  },
};

const client = new Anthropic();

async function verifyUser(req) {
  const header = req.headers.authorization || req.headers.Authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return null;
  const r = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
  });
  if (!r.ok) return null;
  const user = await r.json();
  return user?.id ? user : null;
}

function overLimit(userId) {
  const now = Date.now();
  const recent = (usage.get(userId) || []).filter(t => now - t < 3_600_000);
  if (recent.length >= RATE_LIMIT_PER_HOUR) { usage.set(userId, recent); return true; }
  recent.push(now);
  usage.set(userId, recent);
  return false;
}

function textOf(response) {
  return response.content.filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
}

async function callClaude({ mode, messages, effort, format }) {
  return client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: SYSTEM[mode],
    output_config: { effort, ...(format ? { format } : {}) },
    messages,
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(503).json({ error: 'AI belum dikonfigurasi (ANTHROPIC_API_KEY kosong).' });
    return;
  }

  const user = await verifyUser(req).catch(() => null);
  if (!user) {
    res.status(401).json({ error: 'Silakan masuk (login) untuk memakai fitur AI.' });
    return;
  }
  if (overLimit(user.id)) {
    res.status(429).json({ error: 'Batas pemakaian AI tercapai. Coba lagi dalam 1 jam.' });
    return;
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const { mode, context, messages: chat } = body;
  if (!SYSTEM[mode]) {
    res.status(400).json({ error: 'Mode tidak dikenal.' });
    return;
  }
  const contextJson = JSON.stringify(context || {});
  if (contextJson.length > MAX_BODY_CHARS) {
    res.status(413).json({ error: 'Data terlalu besar.' });
    return;
  }

  try {
    let response;
    if (mode === 'coach') {
      const turns = (Array.isArray(chat) ? chat : [])
        .slice(-MAX_CHAT_TURNS)
        .filter(m => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
        .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
      if (turns.length === 0 || turns[turns.length - 1].role !== 'user') {
        res.status(400).json({ error: 'Pertanyaan kosong.' });
        return;
      }
      response = await callClaude({
        mode,
        effort: 'low',
        messages: [
          { role: 'user', content: `Data program atlet (JSON):\n${contextJson}` },
          { role: 'assistant', content: 'Data program sudah saya baca. Silakan bertanya.' },
          ...turns,
        ],
      });
    } else if (mode === 'report') {
      response = await callClaude({
        mode,
        effort: 'medium',
        messages: [{ role: 'user', content: `Data siklus latihan (JSON):\n${contextJson}\n\nTulis laporan akhirnya.` }],
      });
    } else {
      response = await callClaude({
        mode,
        effort: 'medium',
        format: { type: 'json_schema', schema: ADJUST_SCHEMA },
        messages: [{ role: 'user', content: `Program dan data log (JSON):\n${contextJson}\n\nBerikan usulan penyesuaian.` }],
      });
    }

    if (response.stop_reason === 'refusal') {
      res.status(422).json({ error: 'Permintaan ini tidak dapat diproses oleh AI.' });
      return;
    }
    if (response.stop_reason === 'max_tokens') {
      res.status(502).json({ error: 'Jawaban AI terpotong. Coba pertanyaan yang lebih singkat.' });
      return;
    }

    const text = textOf(response);
    if (mode === 'adjust') {
      res.status(200).json({ result: JSON.parse(text) });
    } else {
      res.status(200).json({ text });
    }
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      res.status(429).json({ error: 'Layanan AI sedang sibuk. Coba lagi sebentar.' });
    } else if (error instanceof Anthropic.AuthenticationError) {
      res.status(503).json({ error: 'Kunci API AI tidak valid.' });
    } else if (error instanceof Anthropic.APIError) {
      res.status(502).json({ error: `Layanan AI error (${error.status}).` });
    } else {
      console.error('[ai] unexpected error', error);
      res.status(500).json({ error: 'Terjadi kesalahan pada fitur AI.' });
    }
  }
}
