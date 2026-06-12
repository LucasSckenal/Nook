"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dock } from "@/components/Dock";
import { DisciplinaDetail } from "@/components/modules/DisciplinaDetail";
import DashboardPage from "@/components/modules/DashboardModule";
import TarefasPage from "@/components/modules/TarefasModule";
import CalendarioPage from "@/components/modules/CalendarioModule";
import DisciplinasPage from "@/components/modules/DisciplinasModule";
import RadioPage from "@/components/modules/RadioModule";
import EstatisticasPage from "@/components/modules/EstatisticasModule";

export type ModuleKey =
  | "dashboard"
  | "tarefas"
  | "calendario"
  | "disciplinas"
  | "radio"
  | "estatisticas";

export const MODULE_META: Record<
  ModuleKey,
  { icon: string; title: string; sub: string }
> = {
  dashboard: { icon: "/Icones/Monitor.png", title: "Computador", sub: "dashboard & Estuda" },
  tarefas: { icon: "/Icones/Livro.png", title: "Caderno", sub: "tarefas & anotações" },
  calendario: { icon: "/Icones/Calendario.png", title: "Calendário", sub: "sua semana, sem sustos" },
  disciplinas: { icon: "/Icones/Livros.png", title: "Estante", sub: "disciplinas do semestre" },
  radio: { icon: "/Icones/Radio.png", title: "Rádio", sub: "sons do quarto" },
  estatisticas: { icon: "/Icones/Grafico.png", title: "Caneca", sub: "seu esforço, com carinho" },
};

/** origem aproximada de cada objeto na cena (% da viewport) para o morph */
export const MODULE_ORIGIN: Record<ModuleKey, { x: number; y: number }> = {
  dashboard: { x: 50, y: 50 },
  tarefas: { x: 23, y: 62 },
  calendario: { x: 37, y: 16 },
  disciplinas: { x: 88, y: 40 },
  radio: { x: 70, y: 61 },
  estatisticas: { x: 61, y: 62 },
};

function ModuleBody({ moduleKey, detailId }: { moduleKey: ModuleKey; detailId?: string }) {
  switch (moduleKey) {
    case "dashboard":
      return <DashboardPage />;
    case "tarefas":
      return <TarefasPage />;
    case "calendario":
      return <CalendarioPage />;
    case "disciplinas":
      return detailId ? <DisciplinaDetail id={detailId} /> : <DisciplinasPage />;
    case "radio":
      return <RadioPage />;
    case "estatisticas":
      return <EstatisticasPage />;
  }
}

/**
 * O módulo como "vidro" dentro do quarto: a câmera já mergulhou no objeto
 * (RoomScene) e este painel translúcido emerge dele — o quarto continua
 * visível atrás e nas bordas. Nunca saímos do quarto: só olhamos mais de
 * perto. Clicar fora do vidro devolve a câmera.
 */
export function ModuleOverlay({
  moduleKey,
  detailId,
  origin,
  closing,
  onClose,
}: {
  moduleKey: ModuleKey;
  detailId?: string;
  origin: { x: number; y: number };
  closing: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [entered, setEntered] = useState(false);
  const meta = MODULE_META[moduleKey];

  // dispara a animação de entrada no próximo frame
  useEffect(() => {
    const r = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(r);
  }, []);

  const open = entered && !closing;

  // o vidro nasce na direção do objeto (deslocado do centro da tela)
  const dx = (origin.x - 50) * 0.8;
  const dy = (origin.y - 50) * 0.8;

  return (
    <div className="fixed inset-0 z-40 flex justify-center px-3 pb-20 pt-3 sm:px-8 sm:pb-22 sm:pt-6 md:px-14 md:pt-8">
      {/* clicar no quarto (fora do vidro) volta a câmera */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden />

      <div
        className="relative flex w-full max-w-[1180px] flex-col overflow-hidden rounded-(--radius-lg)"
        style={{
          background: "color-mix(in srgb, var(--color-room) 82%, transparent)",
          backdropFilter: "blur(18px) saturate(1.15)",
          WebkitBackdropFilter: "blur(18px) saturate(1.15)",
          boxShadow:
            "0 32px 90px #00000073, 0 0 0 1px #ffffff14, inset 0 1px 0 #ffffff0f",
          transform: open
            ? "translate(0, 0) scale(1)"
            : `translate(${dx}vw, ${dy}vh) scale(0.24)`,
          opacity: open ? 1 : 0,
          filter: open ? "blur(0px)" : "blur(10px)",
          transition: `transform 620ms var(--nk-ease-room), opacity 380ms var(--nk-ease-ui), filter 460ms var(--nk-ease-ui)`,
          transitionDelay: open ? "140ms" : "0ms",
        }}
        role="dialog"
        aria-label={meta.title}
      >
        {/* cabeçalho fino do vidro */}
        <header className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3 sm:px-7">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 rounded-(--radius-sm) px-2 py-1 text-sm text-ink-mid transition-colors hover:text-amber"
              title="Voltar ao quarto (Esc)"
            >
              <span aria-hidden>←</span> quarto
            </button>
            <div className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={meta.icon} alt="" aria-hidden draggable={false} className="h-7 w-7 select-none rounded-[7px] object-contain" />
              <h1 className="font-display text-lg text-ink-high">{meta.title}</h1>
              <span className="hidden text-sm text-ink-low sm:inline">{meta.sub}</span>
            </div>
          </div>
          <kbd className="hidden rounded-md bg-surface/70 px-2 py-1 text-xs text-ink-low shadow-[0_0_0_1px_#ffffff10] md:block">
            Ctrl K
          </kbd>
        </header>

        {/* conteúdo do módulo */}
        <div className="flex-1 overflow-y-auto">
          <main
            className="mx-auto max-w-[1100px] px-4 pb-10 pt-6 sm:px-7"
            style={{
              opacity: open ? 1 : 0,
              transition: "opacity 320ms var(--nk-ease-ui) 260ms",
            }}
          >
            <ModuleBody moduleKey={moduleKey} detailId={detailId} />
          </main>
        </div>
      </div>

      <Dock
        activeKey={moduleKey}
        onNavigate={(k) => router.push(`/?open=${k}`)}
      />
    </div>
  );
}
