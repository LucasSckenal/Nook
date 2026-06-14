"use client";

import Link from "next/link";
import AjustesModule from "@/components/modules/AjustesModule";

/**
 * Rota /ajustes — mesma página, agora um shell fino sobre o AjustesModule
 * (que também vive como módulo diegético, nascendo da luminária do quarto).
 */
export default function AjustesPage() {
  return (
    <div className="min-h-screen bg-room">
      <header className="sticky top-0 z-30 border-b border-ink-faint/30 bg-room/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[760px] items-center gap-4 px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-(--radius-sm) px-2 py-1 text-sm text-ink-mid transition-colors hover:text-amber"
            title="Voltar ao quarto (Esc)"
          >
            <span aria-hidden>←</span> quarto
          </Link>
          <h1 className="font-display text-xl text-ink-high">⚙️ Ajustes</h1>
        </div>
      </header>

      <main className="mx-auto max-w-[760px] px-6 pb-24 pt-8">
        <AjustesModule />
      </main>
    </div>
  );
}
