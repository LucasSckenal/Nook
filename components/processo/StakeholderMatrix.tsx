"use client";

import { useState } from "react";
import {
  QUADRANTS,
  STAKEHOLDERS,
  quadrantOf,
  type StakeQuadrant,
  type Stakeholder,
} from "@/lib/processo";

/**
 * Matriz poder × interesse (Mendelow). Cada stakeholder é posicionado pelo
 * par (interesse, poder); o quadrante define a estratégia de relacionamento.
 */
export function StakeholderMatrix() {
  const [hover, setHover] = useState<Stakeholder | null>(null);
  const order: StakeQuadrant[] = ["satisfeito", "gerenciar", "monitorar", "informado"];

  return (
    <div>
      {/* matriz — rola horizontalmente no mobile, como o calendário */}
      <div className="overflow-x-auto">
        <div className="relative mx-auto min-w-[640px] max-w-[860px]">
          {/* rótulos dos eixos */}
          <div className="flex">
            <div className="flex w-7 items-center justify-center">
              <span className="-rotate-90 whitespace-nowrap text-xs tracking-wide text-ink-low">
                poder / influência →
              </span>
            </div>

            <div className="flex-1">
              <div className="relative aspect-[1.5/1]">
                {/* quadrantes de fundo */}
                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1.5">
                  {order.map((q) => (
                    <div
                      key={q}
                      className="flex flex-col justify-between rounded-(--radius-md) p-3"
                      style={{ background: `${QUADRANTS[q].color}0f`, boxShadow: `inset 0 0 0 1px ${QUADRANTS[q].color}22` }}
                    >
                      <div />
                      <div className="text-right">
                        <p className="text-xs font-medium" style={{ color: QUADRANTS[q].color }}>
                          {QUADRANTS[q].label}
                        </p>
                        <p className="text-[10px] text-ink-low">{QUADRANTS[q].strategy}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* eixos centrais */}
                <div className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-ink-faint/40" />
                <div className="pointer-events-none absolute inset-y-0 left-1/2 border-l border-dashed border-ink-faint/40" />

                {/* pontos */}
                {STAKEHOLDERS.map((s) => {
                  const q = quadrantOf(s);
                  const color = QUADRANTS[q].color;
                  const flip = s.interesse > 68; // rótulo à esquerda perto da borda direita
                  return (
                    <button
                      key={s.id}
                      onMouseEnter={() => setHover(s)}
                      onMouseLeave={() => setHover(null)}
                      onFocus={() => setHover(s)}
                      onBlur={() => setHover(null)}
                      className={`group absolute flex -translate-x-1/2 translate-y-1/2 items-center gap-1.5 ${
                        flip ? "flex-row-reverse" : ""
                      }`}
                      style={{ left: `${s.interesse}%`, bottom: `${s.poder}%` }}
                    >
                      <span
                        className="h-3 w-3 shrink-0 rounded-full ring-2 ring-room transition-transform group-hover:scale-125"
                        style={{ background: color, boxShadow: `0 0 10px ${color}80` }}
                      />
                      <span
                        className="whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] leading-tight text-ink-mid"
                        style={{ background: "var(--color-room)" }}
                      >
                        {s.name.split(" (")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>

              <p className="mt-2 text-center text-xs tracking-wide text-ink-low">
                interesse →
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* detalhe do ponto em foco */}
      <div className="mt-4 min-h-[44px] rounded-(--radius-md) bg-surface px-4 py-3 text-sm shadow-[0_0_0_1px_#ffffff08]">
        {hover ? (
          <p className="text-ink-mid">
            <span className="font-medium text-ink-high">{hover.name}</span>{" "}
            <span className="text-ink-low">
              · interesse {hover.interesse} · poder {hover.poder} ·{" "}
              {QUADRANTS[quadrantOf(hover)].label}
            </span>
            <br />
            {hover.note}
          </p>
        ) : (
          <p className="text-ink-low">
            Passe o mouse (ou foco do teclado) sobre um stakeholder para ver a estratégia de relacionamento.
          </p>
        )}
      </div>
    </div>
  );
}
