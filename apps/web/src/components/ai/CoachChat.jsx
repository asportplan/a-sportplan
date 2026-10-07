import { useState, useRef, useEffect } from 'react';
import AiText from './AiText.jsx';
import { askCoach } from '../../lib/ai-client.js';

const SUGGESTIONS = {
  id: ['Kenapa minggu deload bebannya lebih ringan?', 'Apa arti RPE 8?', 'Bahu saya agak nyeri saat shoulder press, bagaimana?'],
  en: ['Why is the deload week lighter?', 'What does RPE 8 mean?', 'My shoulder hurts a bit on shoulder press, what should I do?'],
};

/**
 * "Tanya Coach" - Q&A about the athlete's own program. Conversation lives only in this view.
 */
const CoachChat = ({ program, lang }) => {
  const en = lang === 'en';
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'nearest' }); }, [messages, loading]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || loading) return;
    const next = [...messages, { role: 'user', content: q }];
    setMessages(next);
    setInput('');
    setError('');
    setLoading(true);
    try {
      const answer = await askCoach(program, next);
      setMessages([...next, { role: 'assistant', content: answer }]);
    } catch (e) {
      setError(e.message);
      setMessages(messages); // roll back the unanswered question
      setInput(q);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#EBE5E2] dark:border-slate-700 bg-white dark:bg-slate-900">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full min-h-11 flex items-center justify-between gap-3 p-4 sm:p-5 text-left cursor-pointer"
      >
        <span>
          <span className="block text-base font-black text-[#2B2B2B] dark:text-white">{en ? 'Ask the Coach' : 'Tanya Coach'}</span>
          <span className="block text-xs text-slate-600 dark:text-slate-400">
            {en ? 'Questions about this program, answered by Claude. Loads stay with the rule engine.' : 'Tanya soal program ini, dijawab oleh Claude. Beban tetap ditentukan rule engine.'}
          </span>
        </span>
        <span className="material-symbols-outlined text-slate-500" aria-hidden="true">{open ? 'expand_less' : 'expand_more'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS[en ? 'en' : 'id'].map(s => (
                <button key={s} type="button" onClick={() => send(s)} className="min-h-11 px-3 py-2 rounded-xl border border-[#EBE5E2] dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 text-left cursor-pointer hover:border-[#E63946]">
                  {s}
                </button>
              ))}
            </div>
          )}

          <ol className="space-y-3 max-h-[50dvh] overflow-y-auto" aria-live="polite">
            {messages.map((m, i) => (
              <li key={i} className={m.role === 'user' ? 'flex justify-end' : ''}>
                {m.role === 'user'
                  ? <p className="max-w-[85%] rounded-2xl bg-[#2B2B2B] text-white px-3 py-2 text-sm">{m.content}</p>
                  : <div className="rounded-2xl bg-[#FAF8F7] dark:bg-slate-800/60 p-3"><AiText text={m.content} /></div>}
              </li>
            ))}
            {loading && <li className="text-sm text-slate-500">{en ? 'Coach is typing...' : 'Coach sedang menulis...'}</li>}
            <li ref={endRef} aria-hidden="true" />
          </ol>

          {error && <p role="alert" className="text-sm font-semibold text-[#B91C1C]">{error}</p>}

          <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
            <label htmlFor="coach-input" className="sr-only">{en ? 'Your question' : 'Pertanyaan Anda'}</label>
            <input
              id="coach-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={1000}
              placeholder={en ? 'Type your question...' : 'Ketik pertanyaan...'}
              className="flex-1 min-w-0 min-h-11 px-3 rounded-xl border border-[#EBE5E2] dark:border-slate-700 bg-white dark:bg-slate-800 text-base sm:text-sm text-[#2B2B2B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#E63946]"
            />
            <button type="submit" disabled={loading || !input.trim()} className="min-h-11 px-4 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white font-bold text-sm cursor-pointer disabled:opacity-60">
              {en ? 'Send' : 'Kirim'}
            </button>
          </form>
          <p className="text-[11px] text-slate-500">
            {en ? 'Not medical advice. Chest pain, dizziness or sharp joint pain: stop and see a doctor.' : 'Bukan nasihat medis. Nyeri dada, pusing, atau nyeri sendi tajam: hentikan latihan dan temui dokter.'}
          </p>
        </div>
      )}
    </section>
  );
};

export default CoachChat;
