"use client";

import {
  EMPATHY_GAINS,
  EMPATHY_MAP,
  EMPATHY_PAINS,
  EMPATHY_PERSONA,
} from "@/lib/processo";

/**
 * Mapa de empatia da persona-âncora (Marina): Pensa&sente / Vê / Ouve /
 * Fala&faz ao redor; Dores e Ganhos na base.
 */
export function EmpathyMap() {
  return (
    <div className="space-y-4">
      {/* persona */}
      <div className="nk-card flex items-center gap-4 p-5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-amber/15 text-2xl">
          {EMPATHY_PERSONA.avatar}
        </span>
        <div>
          <p className="font-display text-xl text-ink-high">{EMPATHY_PERSONA.name}</p>
          <p className="text-xs text-ink-low">{EMPATHY_PERSONA.role}</p>
          <p className="mt-1 max-w-xl text-sm text-ink-mid">{EMPATHY_PERSONA.bio}</p>
        </div>
      </div>

      {/* quatro quadrantes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {EMPATHY_MAP.map((q) => (
          <section
            key={q.key}
            className="rounded-(--radius-md) bg-surface p-5 shadow-[0_0_0_1px_#ffffff08]"
            style={{ borderTop: `2.5px solid ${q.accent}` }}
          >
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium" style={{ color: q.accent }}>
              <span className="text-base">{q.icon}</span>
              {q.title}
            </h3>
            <ul className="space-y-2">
              {q.items.map((item, i) => (
                <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-mid">
                  <span style={{ color: q.accent }}>·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      {/* dores e ganhos */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <section className="rounded-(--radius-md) border border-clay/30 bg-clay/[0.06] p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-clay">
            <span>🌧</span> Dores
          </h3>
          <ul className="space-y-2">
            {EMPATHY_PAINS.map((p, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-mid">
                <span className="text-clay">·</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-(--radius-md) border border-moss/30 bg-moss/[0.06] p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-moss">
            <span>🌱</span> Ganhos
          </h3>
          <ul className="space-y-2">
            {EMPATHY_GAINS.map((g, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-ink-mid">
                <span className="text-moss">·</span>
                <span>{g}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
