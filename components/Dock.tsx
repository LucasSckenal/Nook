"use client";

/* eslint-disable @next/next/no-img-element */

import { useRouter } from "next/navigation";
import { useNook } from "@/lib/store";
import { useMounted } from "./useMounted";
import type { ModuleKey } from "./room/ModuleOverlay";

type DockItem =
  | { kind: "module"; key: ModuleKey; icon: string; label: string }
  | { kind: "route"; href: string; icon: string; label: string };

const ITEMS: DockItem[] = [
  { kind: "route", href: "/", icon: "/Icones/Casa.png", label: "Quarto" },
  { kind: "module", key: "dashboard", icon: "/Icones/Monitor.png", label: "Dashboard" },
  { kind: "module", key: "tarefas", icon: "/Icones/Livro.png", label: "Tarefas" },
  { kind: "module", key: "calendario", icon: "/Icones/Calendario.png", label: "Calendário" },
  { kind: "module", key: "disciplinas", icon: "/Icones/Livros.png", label: "Disciplinas" },
  { kind: "module", key: "radio", icon: "/Icones/Radio.png", label: "Rádio" },
  { kind: "module", key: "estatisticas", icon: "/Icones/Grafico.png", label: "Estatísticas" },
  { kind: "module", key: "foco", icon: "/Icones/Abajur.png", label: "Foco" },
];

const STATION_NAMES: Record<string, string> = {
  lofi: "LoFi",
  chuva: "Chuva",
  biblioteca: "Biblioteca",
  cafeteria: "Cafeteria",
  white: "Ventilador",
};

/**
 * Dock — troca lateral entre módulos sem voltar ao quarto.
 * Quando usada dentro do overlay, `onNavigate` troca o módulo ativo;
 * `activeKey` marca o atual.
 */
export function Dock({
  activeKey,
  onNavigate,
}: {
  activeKey?: ModuleKey;
  onNavigate?: (key: ModuleKey) => void;
}) {
  const router = useRouter();
  const mounted = useMounted();
  const radio = useNook((s) => s.radio);
  const setRadio = useNook((s) => s.setRadio);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-3">
      <div className="pointer-events-auto flex max-w-[calc(100vw-1.5rem)] items-center gap-1 overflow-x-auto rounded-(--radius-lg) bg-raised/90 px-3 py-2 opacity-60 shadow-[0_8px_32px_#00000040,0_0_0_1px_#ffffff0a] backdrop-blur-xl transition-opacity duration-(--nk-dur-quick) [scrollbar-width:none] hover:opacity-100 [&::-webkit-scrollbar]:hidden">
        {ITEMS.map((item) => {
          const active = item.kind === "module" && item.key === activeKey;
          const go = () => {
            if (item.kind === "route") router.push(item.href);
            else if (onNavigate) onNavigate(item.key);
            else router.push(`/?open=${item.key}`);
          };
          return (
            <button
              key={item.kind === "route" ? item.href : item.key}
              onClick={go}
              title={item.label}
              className={`group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-(--radius-md) transition-all duration-(--nk-dur-instant) hover:-translate-y-0.5 hover:bg-surface sm:h-11 sm:w-11 ${
                active ? "bg-surface" : ""
              }`}
            >
              <img
                src={item.icon}
                alt=""
                aria-hidden
                draggable={false}
                className="h-7 w-7 select-none rounded-[9px] object-contain transition-transform duration-(--nk-dur-instant) group-hover:scale-110 sm:h-9 sm:w-9"
              />
              {active && (
                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-amber" />
              )}
              <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md bg-raised px-2 py-1 text-xs text-ink-mid opacity-0 shadow-[0_0_0_1px_#ffffff0a] transition-opacity group-hover:opacity-100">
                {item.label}
              </span>
            </button>
          );
        })}

        {/* mini-player persistente */}
        {mounted && radio.playing && (
          <>
            <div className="mx-1 h-6 w-px bg-ink-faint/60" />
            <button
              onClick={() => setRadio({ playing: false })}
              className="flex items-center gap-2 rounded-(--radius-md) px-2.5 py-1.5 text-xs text-ink-mid transition-colors hover:bg-surface hover:text-ink-high"
              title="Pausar"
            >
              <span className="nk-led-on inline-block h-1.5 w-1.5 rounded-full bg-moss" />
              {STATION_NAMES[radio.station]}
              <span className="text-ink-low">⏸</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
