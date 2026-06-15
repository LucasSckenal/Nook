"use client";

import { BENCH_CRITERIA, BENCH_GAPS, BENCH_PRODUCTS } from "@/lib/processo";

const MARK: Record<"sim" | "parcial" | "nao", { glyph: string; color: string; label: string }> = {
  sim: { glyph: "✓", color: "#9caf88", label: "atende" },
  parcial: { glyph: "~", color: "#e8a87c", label: "parcial" },
  nao: { glyph: "✕", color: "#c97b63", label: "não atende" },
};

export function Benchmarking() {
  const nookIdx = BENCH_PRODUCTS.indexOf("Nook");
  return (
    <div className="space-y-6">
      {/* matriz comparativa */}
      <div className="nk-card overflow-x-auto p-2">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-3 text-left text-xs font-normal uppercase tracking-wider text-ink-low">
                Critério
              </th>
              {BENCH_PRODUCTS.map((p, i) => (
                <th
                  key={p}
                  className={`p-3 text-center text-xs font-medium ${
                    i === nookIdx ? "text-amber" : "text-ink-mid"
                  }`}
                >
                  {p}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {BENCH_CRITERIA.map((row) => (
              <tr key={row.criterio} className="border-t border-ink-faint/20">
                <td className="p-3 text-ink-high">{row.criterio}</td>
                {row.valores.map((v, i) => {
                  const m = MARK[v];
                  return (
                    <td
                      key={i}
                      className={`p-3 text-center ${i === nookIdx ? "bg-amber/[0.06]" : ""}`}
                    >
                      <span
                        title={m.label}
                        className="inline-grid h-6 w-6 place-items-center rounded-full text-sm font-semibold"
                        style={{ color: m.color, background: `${m.color}1f` }}
                      >
                        {m.glyph}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* legenda */}
      <div className="flex flex-wrap gap-4 text-xs text-ink-low">
        {(["sim", "parcial", "nao"] as const).map((k) => (
          <span key={k} className="flex items-center gap-1.5">
            <span style={{ color: MARK[k].color }}>{MARK[k].glyph}</span> {MARK[k].label}
          </span>
        ))}
      </div>

      {/* lacunas identificadas */}
      <div className="nk-card p-6">
        <h3 className="mb-3 font-display text-lg text-ink-high">Lacunas identificadas</h3>
        <ul className="space-y-2">
          {BENCH_GAPS.map((g, i) => (
            <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink-mid">
              <span className="mt-0.5 shrink-0 text-amber">→</span>
              <span>{g}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
