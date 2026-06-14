"use client";

import { useRef } from "react";
import { useFocusTrap } from "./useFocusTrap";

/**
 * Folha de atalhos (Nielsen #7 flexibilidade/eficiência + #10 ajuda).
 * Os atalhos existiam mas eram invisíveis — aqui ficam à mão (tecla "?").
 * Apresentacional: a tecla "?" e o Esc são tratados no GlobalChrome.
 */

const GROUPS: { title: string; items: { keys: string[]; label: string }[] }[] = [
  {
    title: "Em qualquer lugar",
    items: [
      { keys: ["Ctrl", "K"], label: "Buscar, criar e navegar" },
      { keys: ["F"], label: "Entrar no modo foco" },
      { keys: ["Esc"], label: "Voltar ao quarto" },
      { keys: ["?"], label: "Mostrar estes atalhos" },
    ],
  },
  {
    title: "Ir para… (tecle G, depois)",
    items: [
      { keys: ["G", "D"], label: "Computador" },
      { keys: ["G", "C"], label: "Calendário" },
      { keys: ["G", "T"], label: "Caderno (tarefas)" },
      { keys: ["G", "E"], label: "Estante (disciplinas)" },
      { keys: ["G", "R"], label: "Rádio" },
      { keys: ["G", "S"], label: "Estatísticas" },
    ],
  },
];

export function ShortcutsHelp({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, open);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-6"
      style={{
        background:
          "radial-gradient(ellipse 60% 55% at 50% 45%, #04060a66, #04060ad0 80%)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Atalhos de teclado"
    >
      <div
        ref={ref}
        onClick={(e) => e.stopPropagation()}
        className="w-[min(520px,94vw)] rounded-(--radius-lg) p-7 sm:p-8"
        style={{
          background: "color-mix(in srgb, var(--color-room) 88%, transparent)",
          backdropFilter: "blur(20px) saturate(1.15)",
          WebkitBackdropFilter: "blur(20px) saturate(1.15)",
          boxShadow:
            "0 32px 90px #00000080, 0 0 0 1px #ffffff14, inset 0 1px 0 #ffffff0f",
        }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-ink-high">Atalhos</h2>
          <button
            onClick={onClose}
            className="rounded-(--radius-sm) px-2 py-1 text-sm text-ink-low transition-colors hover:text-amber"
            aria-label="Fechar"
          >
            fechar ✕
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <p className="mb-3 text-xs uppercase tracking-wider text-ink-low">
                {g.title}
              </p>
              <ul className="space-y-2.5">
                {g.items.map((it) => (
                  <li key={it.label} className="flex items-center justify-between gap-3">
                    <span className="text-sm text-ink-mid">{it.label}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      {it.keys.map((k) => (
                        <kbd
                          key={k}
                          className="rounded-md bg-surface px-2 py-1 text-xs text-ink-high shadow-[0_0_0_1px_#ffffff12]"
                        >
                          {k}
                        </kbd>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-ink-low">
          dica: tudo também está na busca — <kbd className="rounded bg-surface px-1.5 py-0.5 text-ink-mid">Ctrl K</kbd>
        </p>
      </div>
    </div>
  );
}
