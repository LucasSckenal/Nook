"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNook } from "@/lib/store";
import { useMounted } from "./useMounted";

const ITEMS = [
  { href: "/", icon: "🏠", label: "Quarto" },
  { href: "/dashboard", icon: "💻", label: "Dashboard" },
  { href: "/tarefas", icon: "📝", label: "Tarefas" },
  { href: "/calendario", icon: "📅", label: "Calendário" },
  { href: "/disciplinas", icon: "📚", label: "Disciplinas" },
  { href: "/radio", icon: "📻", label: "Rádio" },
  { href: "/estatisticas", icon: "☕", label: "Estatísticas" },
  { href: "/foco", icon: "🎯", label: "Foco" },
];

const STATION_NAMES: Record<string, string> = {
  lofi: "LoFi",
  chuva: "Chuva",
  biblioteca: "Biblioteca",
  cafeteria: "Cafeteria",
  white: "White noise",
};

export function Dock() {
  const pathname = usePathname();
  const mounted = useMounted();
  const radio = useNook((s) => s.radio);
  const setRadio = useNook((s) => s.setRadio);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-3">
      <div className="pointer-events-auto flex items-center gap-1 rounded-(--radius-lg) bg-raised/90 px-3 py-2 opacity-60 shadow-[0_8px_32px_#00000040,0_0_0_1px_#ffffff0a] backdrop-blur-xl transition-opacity duration-(--nk-dur-quick) hover:opacity-100">
        {ITEMS.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-(--radius-md) text-lg transition-all duration-(--nk-dur-instant) hover:bg-surface ${
                active ? "bg-surface" : ""
              }`}
            >
              <span>{item.icon}</span>
              {active && (
                <span className="absolute -bottom-1 h-1 w-1 rounded-full bg-amber" />
              )}
              <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md bg-raised px-2 py-1 text-xs text-ink-mid opacity-0 shadow-[0_0_0_1px_#ffffff0a] transition-opacity group-hover:opacity-100">
                {item.label}
              </span>
            </Link>
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
