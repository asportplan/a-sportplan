import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

// Categorical slots 1-3 of the dataviz reference palette (validated all-pairs, light + dark).
// Light-mode aqua sits below 3:1 on the surface: relief = legend + the data tables below the charts.
const VIZ_STYLE = `
.viz-root {
  --viz-surface: #fcfcfb;
  --viz-text-primary: #0b0b0b;
  --viz-text-secondary: #52514e;
  --viz-grid: #e7e5e1;
  --viz-series-1: #2a78d6;
  --viz-series-2: #eb6834;
  --viz-series-3: #1baf7a;
}
.dark .viz-root {
  --viz-surface: #1a1a19;
  --viz-text-primary: #ffffff;
  --viz-text-secondary: #c3c2b7;
  --viz-grid: #34332f;
  --viz-series-1: #3987e5;
  --viz-series-2: #d95926;
  --viz-series-3: #199e70;
}
`;

const SERIES = ['var(--viz-series-1)', 'var(--viz-series-2)', 'var(--viz-series-3)'];
const AXIS_TICK = { fill: 'var(--viz-text-secondary)', fontSize: 12 };

const ChartTooltip = ({ active, payload, label, unit, weekLabel }) => {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-[#EBE5E2] bg-white px-3 py-2 text-xs shadow-sm" style={{ color: 'var(--viz-text-primary)' }}>
      <p className="font-bold mb-1">{weekLabel} {label}</p>
      {payload.filter(p => p.value != null).map(p => (
        <p key={p.dataKey} className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: p.color }} aria-hidden="true" />
          <span style={{ color: 'var(--viz-text-secondary)' }}>{p.name}:</span>
          <span className="font-bold">{p.value} {unit}</span>
        </p>
      ))}
    </div>
  );
};

const ChartCard = ({ title, subtitle, empty, children }) => (
  <figure className="viz-root rounded-xl border border-[#EBE5E2] p-3 sm:p-4" style={{ background: 'var(--viz-surface)' }}>
    <figcaption className="mb-2">
      <p className="text-sm font-bold" style={{ color: 'var(--viz-text-primary)' }}>{title}</p>
      {subtitle && <p className="text-xs" style={{ color: 'var(--viz-text-secondary)' }}>{subtitle}</p>}
    </figcaption>
    {empty ? (
      <p className="py-8 text-center text-sm" style={{ color: 'var(--viz-text-secondary)' }}>{empty}</p>
    ) : (
      <div className="h-56 w-full">{children}</div>
    )}
  </figure>
);

/**
 * Progress charts for the Final Report: one question per chart, one y-axis each.
 * Data tables for every chart stay on the page as the accessible view.
 */
const ProgressCharts = ({ report, lang }) => {
  const en = lang === 'en';
  const weekLabel = en ? 'Week' : 'Minggu';

  // Strength: the 3 exercises with the most logged weeks (fold the rest - table shows all)
  const strengthEntries = Object.entries(report.strengthProgression || {})
    .sort((a, b) => Object.keys(b[1]).length - Object.keys(a[1]).length)
    .slice(0, 3);
  const weeks = (report.rpeTrends || []).map(t => t.week);
  const strengthData = weeks.map(w => {
    const row = { week: w };
    strengthEntries.forEach(([, map], i) => { row[`s${i}`] = map[w] ?? null; });
    return row;
  });
  const hasStrength = strengthEntries.length > 0;

  const rpeData = (report.rpeTrends || []).map(t => ({ week: t.week, rpe: t.averageRPE > 0 ? t.averageRPE : null }));
  const hasRpe = rpeData.some(d => d.rpe != null);

  const bwData = (report.bodyWeight?.data || []).map(b => ({
    week: b.week || b.week_number,
    bw: parseFloat(b.weightKg || b.body_weight_kg) || null,
  }));
  const hasBw = bwData.filter(d => d.bw != null).length > 0;

  const noData = en ? 'No logged data yet. Fill in the Log Results page to see this chart.' : 'Belum ada data. Isi halaman Input Hasil untuk melihat grafik ini.';

  const lineProps = { type: 'monotone', strokeWidth: 2, dot: { r: 4, strokeWidth: 2, fill: 'var(--viz-surface)' }, activeDot: { r: 6 }, connectNulls: true, isAnimationActive: false };
  const axes = (unit, domain) => ([
    <CartesianGrid key="g" stroke="var(--viz-grid)" vertical={false} />,
    <XAxis key="x" dataKey="week" tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: 'var(--viz-grid)' }} tickFormatter={w => `${en ? 'W' : 'M'}${w}`} />,
    <YAxis key="y" tick={AXIS_TICK} tickLine={false} axisLine={false} width={44} domain={domain} unit={unit} />,
  ]);

  return (
    <section className="space-y-3" aria-label={en ? 'Progress charts' : 'Grafik perkembangan'}>
      <style>{VIZ_STYLE}</style>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="lg:col-span-2">
          <ChartCard
            title={en ? 'Is my estimated 1RM going up week to week?' : 'Apakah estimasi 1RM saya naik tiap minggu?'}
            subtitle={en ? 'Top 3 most-logged exercises · full list in the table below' : '3 latihan paling sering dicatat · daftar lengkap di tabel bawah'}
            empty={hasStrength ? null : noData}
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={strengthData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
                {axes(' kg', ['auto', 'auto'])}
                <Tooltip content={<ChartTooltip unit="kg" weekLabel={weekLabel} />} cursor={{ stroke: 'var(--viz-text-secondary)', strokeDasharray: '3 3' }} />
                <Legend verticalAlign="top" align="left" iconType="circle" wrapperStyle={{ fontSize: 12, color: 'var(--viz-text-primary)', paddingBottom: 4 }} />
                {strengthEntries.map(([name], i) => (
                  <Line key={name} dataKey={`s${i}`} name={name} stroke={SERIES[i]} {...lineProps} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <ChartCard
          title={en ? 'How hard did sessions feel? (average RPE)' : 'Seberat apa sesi terasa? (rata-rata RPE)'}
          subtitle={en ? 'Sustained ≥ 9 signals accumulated fatigue' : 'Bertahan di ≥ 9 menandakan kelelahan menumpuk'}
          empty={hasRpe ? null : noData}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={rpeData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              {axes('', [1, 10])}
              <Tooltip content={<ChartTooltip unit="" weekLabel={weekLabel} />} cursor={{ stroke: 'var(--viz-text-secondary)', strokeDasharray: '3 3' }} />
              <Line dataKey="rpe" name="RPE" stroke={SERIES[0]} {...lineProps} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={en ? 'Body weight per week' : 'Berat badan per minggu'}
          subtitle={en ? 'From the weekly weigh-in on the Log Results page' : 'Dari timbangan mingguan di halaman Input Hasil'}
          empty={hasBw ? null : noData}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={bwData} margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              {axes(' kg', ['dataMin - 1', 'dataMax + 1'])}
              <Tooltip content={<ChartTooltip unit="kg" weekLabel={weekLabel} />} cursor={{ stroke: 'var(--viz-text-secondary)', strokeDasharray: '3 3' }} />
              <Line dataKey="bw" name={en ? 'Body weight' : 'Berat badan'} stroke={SERIES[0]} {...lineProps} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  );
};

export default ProgressCharts;
