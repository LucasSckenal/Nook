"use client";

import { FLUXOS, HIERARQUIA, NAV_MAP } from "@/lib/processo";

export function Arquitetura() {
  return (
    <div className="space-y-6">
      {/* mapa de navegação — quarto central, módulos ao redor */}
      <div className="nk-card p-6">
        <h3 className="mb-1 font-display text-lg text-ink-high">Mapa de navegação</h3>
        <p className="mb-5 text-xs text-ink-low">
          arquitetura radial: o quarto é a raiz; cada objeto abre um módulo e devolve ao quarto.
        </p>
        <div className="flex flex-col items-center gap-4">
          <div className="rounded-full bg-amber/15 px-5 py-2.5 text-sm font-medium text-amber shadow-[0_0_0_1.5px_#e8a87c50]">
            🛏️ {NAV_MAP.centro}
          </div>
          <div className="text-ink-faint" aria-hidden>
            ↑↓
          </div>
          <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-4">
            {NAV_MAP.nos.map((n) => (
              <div
                key={n.nome}
                className="rounded-(--radius-md) bg-surface p-3 text-center shadow-[0_0_0_1px_#ffffff08]"
              >
                <div className="text-xl" aria-hidden>
                  {n.icon}
                </div>
                <p className="mt-1 text-sm text-ink-high">{n.nome}</p>
                <p className="text-[11px] leading-tight text-ink-low">{n.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* hierarquia da informação */}
        <div className="nk-card p-6">
          <h3 className="mb-3 font-display text-lg text-ink-high">Hierarquia da informação</h3>
          <ol className="space-y-2">
            {HIERARQUIA.map((h, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink-mid">
                <span
                  className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-raised text-[11px] text-amber"
                  aria-hidden
                >
                  {i + 1}
                </span>
                <span>{h}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* fluxos principais */}
        <div className="nk-card p-6">
          <h3 className="mb-3 font-display text-lg text-ink-high">Fluxos principais</h3>
          <div className="space-y-4">
            {FLUXOS.map((f) => (
              <div key={f.titulo}>
                <p className="mb-1 text-sm font-medium text-ink-high">{f.titulo}</p>
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-ink-mid">
                  {f.passos.map((p, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="rounded-(--radius-sm) bg-surface px-2 py-1">{p}</span>
                      {i < f.passos.length - 1 && <span className="text-ink-faint">→</span>}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
