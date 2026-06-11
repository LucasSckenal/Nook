"use client";

import Link from "next/link";
import { RoomScene } from "@/components/room/RoomScene";
import { useMounted } from "@/components/useMounted";
import { useNook } from "@/lib/store";
import { greeting } from "@/lib/dates";

export default function RoomPage() {
  const mounted = useMounted();
  const userName = useNook((s) => s.userName);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-void">
      {mounted ? (
        <RoomScene />
      ) : (
        <div className="flex h-full items-center justify-center">
          <p className="font-display text-xl text-ink-low">acendendo a luz…</p>
        </div>
      )}

      {/* topo: marca + saudação */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-6 md:p-8">
        <div>
          <p className="font-display text-2xl text-ink-high">Nook</p>
          {mounted && (
            <p className="mt-1 text-sm text-ink-mid">
              {greeting()}, {userName}. O quarto é todo seu.
            </p>
          )}
        </div>
        <div className="pointer-events-auto flex items-center gap-3 text-xs text-ink-low">
          <span className="hidden items-center gap-2 sm:flex">
            <kbd className="rounded-md bg-surface px-2 py-1 shadow-[0_0_0_1px_#ffffff10]">
              Ctrl K
            </kbd>
            buscar · criar · navegar
          </span>
          <Link
            href="/ajustes"
            aria-label="Ajustes"
            title="Ajustes"
            className="rounded-md px-1.5 py-1 text-base transition-colors hover:text-amber"
          >
            ⚙️
          </Link>
        </div>
      </header>

      {/* rodapé: navegação simples (acessibilidade — a metáfora nunca é pedágio) */}
      <nav
        aria-label="Navegação simples"
        className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 p-4 text-xs text-ink-low"
      >
        <Link className="transition-colors hover:text-amber" href="/dashboard">computador</Link>
        <Link className="transition-colors hover:text-amber" href="/tarefas">caderno</Link>
        <Link className="transition-colors hover:text-amber" href="/calendario">calendário</Link>
        <Link className="transition-colors hover:text-amber" href="/disciplinas">estante</Link>
        <Link className="transition-colors hover:text-amber" href="/radio">rádio</Link>
        <Link className="transition-colors hover:text-amber" href="/estatisticas">caneca</Link>
        <Link className="transition-colors hover:text-amber" href="/foco">modo foco</Link>
        <span className="text-ink-faint">·</span>
        <Link className="transition-colors hover:text-lavender" href="/processo">processo de design</Link>
      </nav>
    </main>
  );
}
