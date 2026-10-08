import { useLanguage } from '../../hooks/useLanguage';

/**
 * Home entry point for the AI layer. Each row opens the real feature; nothing here is a mock-up.
 */
const AiCoachSection = ({ user, hasProgram, onAskCoach, onOpenReport, onStart, onLogin }) => {
  const { lang } = useLanguage();
  const en = lang === 'en';

  const rows = [
    {
      icon: 'forum',
      title: en ? 'Ask the Coach' : 'Tanya Coach',
      desc: en
        ? '"Why is week 4 lighter?" "What does RPE 8 feel like?" Answers come from your own program.'
        : '"Kenapa minggu 4 lebih ringan?" "RPE 8 itu seberat apa?" Jawaban diambil dari program Anda sendiri.',
      action: en ? 'Open Coach' : 'Buka Coach',
      onClick: onAskCoach,
    },
    {
      icon: 'article',
      title: en ? 'AI final report' : 'Laporan akhir AI',
      desc: en
        ? 'Turns your logged RPE, volume and body weight into a written review for you and your coach.'
        : 'Mengubah catatan RPE, volume, dan berat badan Anda menjadi ulasan tertulis untuk Anda dan pelatih.',
      action: en ? 'Open report' : 'Buka laporan',
      onClick: onOpenReport,
    },
    {
      icon: 'tune',
      title: en ? 'Adjustment proposals' : 'Usulan penyesuaian',
      desc: en
        ? 'Suggests lighter or harder weeks from your data. The rule engine checks every proposal before it changes anything.'
        : 'Menyarankan minggu lebih ringan atau lebih berat dari data Anda. Rule engine memeriksa setiap usulan sebelum ada yang berubah.',
      action: en ? 'See proposals' : 'Lihat usulan',
      onClick: onOpenReport,
    },
  ];

  return (
    <section className="px-4 sm:px-6 pb-6 max-w-container-max mx-auto w-full" aria-labelledby="ai-coach-heading">
      <div className="rounded-3xl border border-[#EBE5E2] dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-8 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-10">
        <div className="space-y-3">
          <p className="text-xs font-bold text-[#E63946]">Coach AI · Claude</p>
          <h2 id="ai-coach-heading" className="text-xl sm:text-2xl font-extrabold text-[#2B2B2B] dark:text-white leading-tight">
            {en ? 'A coach that knows your program' : 'Coach yang memahami program Anda'}
          </h2>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {en
              ? 'The AI explains, reviews and suggests. Weights and safety limits are still calculated by the ACSM/NSCA rule engine, so an AI answer can never push you past your injury or age limits.'
              : 'AI menjelaskan, mengulas, dan memberi saran. Beban dan batas keamanan tetap dihitung oleh rule engine ACSM/NSCA, jadi jawaban AI tidak akan pernah melewati batas cedera atau usia Anda.'}
          </p>
          {!user && (
            <p className="text-sm text-slate-700 dark:text-slate-300">
              {en ? 'AI features need a free account.' : 'Fitur AI memerlukan akun (gratis).'}{' '}
              <button type="button" onClick={onLogin} className="min-h-11 font-bold text-[#E63946] underline underline-offset-2 cursor-pointer">
                {en ? 'Sign in' : 'Masuk'}
              </button>
            </p>
          )}
          {!hasProgram && (
            <button type="button" onClick={onStart} className="min-h-11 px-5 py-2.5 rounded-xl bg-[#E63946] hover:bg-[#D62839] text-white font-bold text-sm cursor-pointer">
              {en ? 'Create a program first' : 'Buat program dulu'}
            </button>
          )}
        </div>

        <ul className="divide-y divide-[#EBE5E2] dark:divide-slate-800">
          {rows.map((row) => (
            <li key={row.title} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="material-symbols-outlined text-2xl text-[#2B2B2B] dark:text-slate-200 shrink-0" aria-hidden="true">{row.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-sm text-[#2B2B2B] dark:text-white">{row.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{row.desc}</p>
              </div>
              <button
                type="button"
                onClick={row.onClick}
                disabled={!hasProgram}
                className="min-h-11 shrink-0 self-start sm:self-center px-4 py-2 rounded-xl border border-[#2B2B2B] dark:border-slate-500 text-[#2B2B2B] dark:text-white font-bold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {row.action}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default AiCoachSection;
