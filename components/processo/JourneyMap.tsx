"use client";

import { JOURNEY } from "@/lib/processo";

/** curva suave (Catmull-Rom → Bézier) a partir de pontos [x,y] */
function smoothPath(pts: [number, number][]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6;
    const c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6;
    const c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const N = JOURNEY.length;
// emoção -2..+2 → y 90..10 (invertido); x = centro da coluna i
const pts: [number, number][] = JOURNEY.map((p, i) => [i + 0.5, 50 - p.emotion * 20]);

const ROWS: { key: keyof (typeof JOURNEY)[number]; label: string; tone: string }[] = [
  { key: "action", label: "Ação", tone: "text-ink-high" },
  { key: "thought", label: "Pensamento", tone: "italic text-ink-mid" },
  { key: "pain", label: "Ponto de dor", tone: "text-clay" },
  { key: "nook", label: "Como o Nook responde", tone: "text-moss" },
];

export function JourneyMap() {
  return (
    <div className="overflow-x-auto">
      <div className="min-w-[920px]">
        {/* cabeçalho: fases */}
        <div
          className="grid gap-px"
          style={{ gridTemplateColumns: `132px repeat(${N}, minmax(0,1fr))` }}
        >
          <div className="flex items-end pb-2 pr-2">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-low">
              fase
            </span>
          </div>
          {JOURNEY.map((p) => (
            <div key={p.id} className="px-2 pb-2 text-center">
              <div className="text-lg">{p.icon}</div>
              <p className="mt-0.5 text-sm font-medium text-ink-high">{p.label}</p>
            </div>
          ))}
        </div>

        {/* curva de emoção */}
        <div
          className="grid items-stretch"
          style={{ gridTemplateColumns: `132px repeat(${N}, minmax(0,1fr))` }}
        >
          <div className="flex items-center pr-2">
            <span className="text-xs font-medium uppercase tracking-wide text-ink-low">
              emoção
            </span>
          </div>
          <div className="relative col-start-2" style={{ gridColumn: `2 / span ${N}` }}>
            <div className="relative h-[120px] rounded-(--radius-md) bg-surface shadow-[0_0_0_1px_#ffffff08]">
              <svg
                viewBox={`0 0 ${N} 100`}
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
              >
                {/* linha neutra */}
                <line x1="0" y1="50" x2={N} y2="50" stroke="#3D4150" strokeWidth="0.4" strokeDasharray="1 1" vectorEffect="non-scaling-stroke" />
                {/* área sob a curva */}
                <path
                  d={`${smoothPath(pts)} L ${N} 100 L 0 100 Z`}
                  fill="#E8A87C"
                  fillOpacity="0.08"
                />
                <path
                  d={smoothPath(pts)}
                  fill="none"
                  stroke="#E8A87C"
                  strokeWidth="2"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                {pts.map(([x, y], i) => (
                  <circle key={i} cx={x} cy={y} r="1.1" fill="#E8A87C" vectorEffect="non-scaling-stroke" />
                ))}
              </svg>
              {/* emojis de emoção, alinhados às colunas */}
              <div className="absolute inset-0 grid" style={{ gridTemplateColumns: `repeat(${N}, minmax(0,1fr))` }}>
                {JOURNEY.map((p) => (
                  <div key={p.id} className="flex items-start justify-center pt-1.5">
                    <span className="text-base" title={`emoção: ${p.emotion}`}>
                      {p.emoji}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* linhas de conteúdo */}
        {ROWS.map((row) => (
          <div
            key={row.key}
            className="grid gap-px border-t border-ink-faint/20"
            style={{ gridTemplateColumns: `132px repeat(${N}, minmax(0,1fr))` }}
          >
            <div className="flex items-center py-3 pr-2">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-low">
                {row.label}
              </span>
            </div>
            {JOURNEY.map((p) => (
              <div key={p.id} className="px-2 py-3">
                <p className={`text-xs leading-relaxed ${row.tone}`}>{p[row.key]}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
