/**
 * Renders model text as plain paragraphs and lists (no HTML injection, minimal markdown).
 */
const clean = (s) => s.replace(/\*\*(.+?)\*\*/g, '$1').replace(/^#+\s*/, '').trim();

const AiText = ({ text }) => {
  const blocks = String(text || '').split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
  return (
    <div className="space-y-3 text-sm leading-relaxed text-slate-800 dark:text-slate-200">
      {blocks.map((block, i) => {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        const isList = lines.every(l => /^([-*•]|\d+[.)])\s+/.test(l));
        if (isList) {
          const ordered = /^\d/.test(lines[0]);
          const Tag = ordered ? 'ol' : 'ul';
          return (
            <Tag key={i} className={`${ordered ? 'list-decimal' : 'list-disc'} pl-5 space-y-1`}>
              {lines.map((l, j) => <li key={j}>{clean(l.replace(/^([-*•]|\d+[.)])\s+/, ''))}</li>)}
            </Tag>
          );
        }
        if (lines.length === 1 && /^#+\s/.test(lines[0])) {
          return <p key={i} className="font-bold text-[#2B2B2B] dark:text-white">{clean(lines[0])}</p>;
        }
        return <p key={i}>{lines.map(clean).join(' ')}</p>;
      })}
    </div>
  );
};

export default AiText;
