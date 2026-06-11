"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dock } from "@/components/Dock";

const TITLES: Record<string, { icon: string; title: string; sub: string }> = {
  dashboard: { icon: "💻", title: "Computador", sub: "dashboard & Estuda" },
  tarefas: { icon: "📝", title: "Caderno", sub: "tarefas & anotações" },
  calendario: { icon: "📅", title: "Calendário", sub: "sua semana, sem sustos" },
  disciplinas: { icon: "📚", title: "Estante", sub: "disciplinas do semestre" },
  radio: { icon: "📻", title: "Rádio", sub: "sons do quarto" },
  estatisticas: { icon: "☕", title: "Caneca", sub: "seu esforço, com carinho" },
};

export default function ModuleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const key = pathname.split("/").filter(Boolean)[0] ?? "";
  const meta = TITLES[key];

  return (
    <div className="min-h-screen bg-room">
      <header className="sticky top-0 z-30 border-b border-ink-faint/30 bg-room/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-(--radius-sm) px-2 py-1 text-sm text-ink-mid transition-colors hover:text-amber"
              title="Voltar ao quarto (Esc)"
            >
              <span aria-hidden>←</span> quarto
            </Link>
            {meta && (
              <div className="flex items-baseline gap-3">
                <h1 className="font-display text-xl text-ink-high">
                  {meta.icon} {meta.title}
                </h1>
                <span className="hidden text-sm text-ink-low sm:inline">
                  {meta.sub}
                </span>
              </div>
            )}
          </div>
          <kbd className="hidden rounded-md bg-surface px-2 py-1 text-xs text-ink-low shadow-[0_0_0_1px_#ffffff10] md:block">
            Ctrl K
          </kbd>
        </div>
      </header>
      <main className="mx-auto max-w-[1280px] px-6 pb-28 pt-8">{children}</main>
      <Dock />
    </div>
  );
}
