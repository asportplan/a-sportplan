import { useEffect, useState } from 'react';

let mediaCache = null;

/** Loads the free-exercise-db mapping on first use so it stays out of the main bundle. */
export async function loadExerciseMedia() {
  if (!mediaCache) {
    mediaCache = (await import('../../core/db/exercise-media.json')).default;
  }
  return mediaCache;
}

/**
 * Demonstration images + step-by-step instructions for one exercise.
 * Source: yuhonas/free-exercise-db (Unlicense / public domain).
 */
const ExerciseGuideModal = ({ slug, title, lang, onClose }) => {
  const [media, setMedia] = useState(undefined);

  useEffect(() => {
    let active = true;
    loadExerciseMedia().then((all) => { if (active) setMedia(all[slug] || null); });
    return () => { active = false; };
  }, [slug]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className="bg-white dark:bg-slate-900 w-full sm:max-w-lg max-h-[90dvh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-4 sm:p-5 space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-bold text-base text-[#2B2B2B] dark:text-white capitalize">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="min-w-11 min-h-11 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
          >
            ✕
          </button>
        </div>

        {media === undefined && (
          <p className="text-sm text-slate-500">{lang === 'en' ? 'Loading demonstration...' : 'Memuat contoh gerakan...'}</p>
        )}

        {media === null && (
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {lang === 'en'
              ? 'No demonstration available for this exercise yet. Ask your coach for a cue.'
              : 'Belum ada contoh gerakan untuk latihan ini. Minta arahan teknik dari pelatih Anda.'}
          </p>
        )}

        {media && (
          <>
            <div className="grid grid-cols-2 gap-2">
              {media.images.map((src, i) => (
                <figure key={src} className="space-y-1">
                  <img
                    src={src}
                    alt={`${title} - ${i === 0 ? (lang === 'en' ? 'start position' : 'posisi awal') : (lang === 'en' ? 'end position' : 'posisi akhir')}`}
                    loading="lazy"
                    className="w-full aspect-[4/3] object-cover rounded-lg bg-slate-100 dark:bg-slate-800"
                  />
                  <figcaption className="text-[11px] text-slate-500 text-center">
                    {i === 0 ? (lang === 'en' ? 'Start' : 'Awal') : (lang === 'en' ? 'End' : 'Akhir')}
                  </figcaption>
                </figure>
              ))}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'en' ? 'How to perform' : 'Cara melakukan'}
                {lang !== 'en' && <span className="font-normal text-slate-500"> (bahasa Inggris)</span>}
              </p>
              <ol className="list-decimal pl-5 space-y-1 text-sm text-slate-700 dark:text-slate-300">
                {media.instructions.map((step, i) => <li key={i}>{step}</li>)}
              </ol>
            </div>
            <p className="text-[11px] text-slate-500">
              {lang === 'en' ? 'Reference: ' : 'Referensi: '}{media.source_name} · free-exercise-db (public domain)
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default ExerciseGuideModal;
