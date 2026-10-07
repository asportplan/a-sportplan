import { useState } from 'react';
import AiText from './AiText.jsx';
import { generateAiReport, proposeAdjustments } from '../../lib/ai-client.js';
import { validateProposals, applyProposals } from '../../core/engine/ai-adjustments.js';
import { getWorkoutResults, saveProgramToLibrary } from '../../core/db/user-store.js';

const REJECT_LABEL = {
  id: {
    unknown_type: 'jenis usulan tidak dikenal',
    week_not_found: 'minggu tidak ada di program',
    week_already_done: 'minggu ini sudah dijalani',
    duplicate: 'usulan ganda',
    already_deload: 'minggu ini sudah deload',
    invalid_value: 'nilai tidak valid',
    outside_safe_range: 'di luar batas aman engine',
    no_change: 'tidak mengubah apa pun',
    deload_week_no_increase: 'intensitas tidak boleh naik di minggu deload',
  },
  en: {
    unknown_type: 'unknown proposal type',
    week_not_found: 'week not in program',
    week_already_done: 'week already completed',
    duplicate: 'duplicate proposal',
    already_deload: 'already a deload week',
    invalid_value: 'invalid value',
    outside_safe_range: 'outside the engine safety range',
    no_change: 'changes nothing',
    deload_week_no_increase: 'intensity cannot rise in a deload week',
  },
};

const describe = (p, en) => {
  if (p.type === 'deload') return en ? `Week ${p.week}: make it a deload week` : `Minggu ${p.week}: jadikan minggu deload`;
  const sign = p.change_pct > 0 ? '+' : '';
  if (p.type === 'volume') return en ? `Week ${p.week}: sets ${sign}${p.change_pct}%` : `Minggu ${p.week}: jumlah set ${sign}${p.change_pct}%`;
  return en ? `Week ${p.week}: intensity ${sign}${p.change_pct} pts` : `Minggu ${p.week}: intensitas ${sign}${p.change_pct} poin`;
};

/**
 * AI narrative report + AI adjustment proposals (validated by the rule engine before applying).
 */
const AiReportPanel = ({ program, report, lang, onProgramUpdated }) => {
  const en = lang === 'en';
  const [reportText, setReportText] = useState('');
  const [reportState, setReportState] = useState({ loading: false, error: '' });
  const [proposal, setProposal] = useState(null); // { summary, accepted, rejected }
  const [adjustState, setAdjustState] = useState({ loading: false, error: '', applied: false });

  const progId = program?.id || program?.program_id || 'default_program';
  const lastLoggedWeek = Math.max(0, ...getWorkoutResults(progId).map(r => r.week || 0));

  const runReport = async () => {
    setReportState({ loading: true, error: '' });
    try {
      setReportText(await generateAiReport(program, report));
      setReportState({ loading: false, error: '' });
    } catch (e) {
      setReportState({ loading: false, error: e.message });
    }
  };

  const runAdjust = async () => {
    setAdjustState({ loading: true, error: '', applied: false });
    setProposal(null);
    try {
      const result = await proposeAdjustments(program, report);
      const { accepted, rejected } = validateProposals(program, result?.proposals, lastLoggedWeek);
      setProposal({ summary: result?.summary || '', accepted, rejected });
      setAdjustState({ loading: false, error: '', applied: false });
    } catch (e) {
      setAdjustState({ loading: false, error: e.message, applied: false });
    }
  };

  const apply = () => {
    const updated = applyProposals(program, proposal.accepted);
    saveProgramToLibrary(updated);
    if (onProgramUpdated) onProgramUpdated(updated);
    setAdjustState({ loading: false, error: '', applied: true });
  };

  const btn = 'min-h-11 px-4 py-2 rounded-xl font-bold text-sm cursor-pointer disabled:opacity-60 disabled:cursor-wait';

  return (
    <section className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-7 border border-[#EBE5E2] dark:border-slate-800 space-y-5">
      <div>
        <h2 className="text-base font-black text-[#2B2B2B] dark:text-white">{en ? 'AI analysis' : 'Analisis AI'}</h2>
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
          {en
            ? 'Written by Claude from your logged data. Loads and safety limits are still decided by the rule engine.'
            : 'Ditulis oleh Claude dari data log Anda. Beban dan batas keamanan tetap ditentukan oleh rule engine.'}
        </p>
      </div>

      {/* Narrative report */}
      <div className="space-y-3">
        <button type="button" onClick={runReport} disabled={reportState.loading} className={`${btn} bg-[#2B2B2B] hover:bg-slate-700 text-white`}>
          {reportState.loading ? (en ? 'Writing report...' : 'Menulis laporan...') : reportText ? (en ? 'Rewrite report' : 'Tulis ulang laporan') : (en ? 'Write report with AI' : 'Tulis laporan dengan AI')}
        </button>
        {reportState.error && <p role="alert" className="text-sm font-semibold text-[#B91C1C]">{reportState.error}</p>}
        {reportText && <div className="rounded-xl bg-[#FAF8F7] dark:bg-slate-800/60 p-4"><AiText text={reportText} /></div>}
      </div>

      {/* Adjustment proposals */}
      <div className="space-y-3 border-t border-[#EBE5E2] dark:border-slate-800 pt-5">
        <h3 className="text-sm font-bold text-[#2B2B2B] dark:text-white">{en ? 'Program adjustment proposals' : 'Usulan penyesuaian program'}</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">
          {lastLoggedWeek > 0
            ? (en ? `Only weeks after week ${lastLoggedWeek} (your last logged week) can change.` : `Hanya minggu setelah minggu ${lastLoggedWeek} (log terakhir Anda) yang bisa diubah.`)
            : (en ? 'Log at least one week first so the AI has data to work from.' : 'Isi log minimal satu minggu dulu supaya AI punya data.')}
        </p>
        <button type="button" onClick={runAdjust} disabled={adjustState.loading || lastLoggedWeek === 0} className={`${btn} border border-[#2B2B2B] dark:border-slate-500 text-[#2B2B2B] dark:text-white`}>
          {adjustState.loading ? (en ? 'Analysing...' : 'Menganalisis...') : (en ? 'Ask AI for proposals' : 'Minta usulan AI')}
        </button>
        {adjustState.error && <p role="alert" className="text-sm font-semibold text-[#B91C1C]">{adjustState.error}</p>}

        {proposal && (
          <div className="space-y-3">
            {proposal.summary && <AiText text={proposal.summary} />}
            {proposal.accepted.length === 0 && proposal.rejected.length === 0 && (
              <p className="text-sm text-slate-700 dark:text-slate-300">{en ? 'No change needed. Keep following the program.' : 'Tidak perlu perubahan. Lanjutkan program seperti biasa.'}</p>
            )}
            {proposal.accepted.length > 0 && (
              <div>
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 mb-1">{en ? 'Passed engine validation' : 'Lolos validasi engine'}</p>
                <ul className="space-y-2">
                  {proposal.accepted.map((p, i) => (
                    <li key={i} className="text-sm rounded-lg border border-emerald-200 dark:border-emerald-900 p-3">
                      <span className="font-bold">{describe(p, en)}</span>
                      <span className="block text-slate-600 dark:text-slate-400">{p.reason}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {proposal.rejected.length > 0 && (
              <div>
                <p className="text-xs font-bold text-[#B91C1C] mb-1">{en ? 'Rejected by the engine' : 'Ditolak engine'}</p>
                <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                  {proposal.rejected.map((p, i) => (
                    <li key={i}>{describe(p, en)} — {REJECT_LABEL[en ? 'en' : 'id'][p.rejected_reason] || p.rejected_reason}</li>
                  ))}
                </ul>
              </div>
            )}
            {proposal.accepted.length > 0 && !adjustState.applied && (
              <button type="button" onClick={apply} className={`${btn} bg-[#E63946] hover:bg-[#D62839] text-white`}>
                {en ? `Apply ${proposal.accepted.length} change(s)` : `Terapkan ${proposal.accepted.length} perubahan`}
              </button>
            )}
            {adjustState.applied && (
              <p role="status" className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                {en ? 'Applied. The program and your library were updated.' : 'Diterapkan. Program dan koleksi Anda sudah diperbarui.'}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default AiReportPanel;
