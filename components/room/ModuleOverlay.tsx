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
import FocoModule from "@/components/modules/FocoModule";
import AjustesModule from "@/components/modules/AjustesModule";

export type ModuleKey =
  | "dashboard"
  | "tarefas"
  | "calendario"
  | "disciplinas"
  | "radio"
  | "estatisticas"
  | "foco"
  | "ajustes";

export const MODULE_META: Record<
  ModuleKey,
  { icon: string; title: string; sub: string }
> = {
  dashboard: { icon: "/Icones/Monitor.png", title: "Computador", sub: "dashboard & Estuda" },
  tarefas: { icon: "/Icones/Livro.png", title: "Caderno", sub: "tarefas & anotações" },
  calendario: { icon: "/Icones/Calendario.png", title: "Calendário", sub: "sua semana, sem sustos" },
  disciplinas: { icon: "/Icones/Livros.png", title: "Estante", sub: "disciplinas do semestre" },
  radio: { icon: "/Icones/Radio.png", title: "Rádio", sub: "sons do quarto" },
  estatisticas: { icon: "/Icones/Grafico.png", title: "Diário", sub: "seu esforço, com carinho" },
  foco: { icon: "/Objetos/Cafe.png", title: "Café", sub: "modo foco" },
  ajustes: { icon: "/Icones/Abajur.png", title: "Ajustes", sub: "ambiente & conta" },
};

/** origem aproximada de cada objeto na cena (% da viewport) para o morph */
export const MODULE_ORIGIN: Record<ModuleKey, { x: number; y: number }> = {
  dashboard: { x: 49, y: 48 },
  tarefas: { x: 46, y: 72 },
  calendario: { x: 66, y: 20 },
  disciplinas: { x: 90, y: 25 },
  radio: { x: 12, y: 50 },
  estatisticas: { x: 71, y: 70 },
  foco: { x: 26, y: 64 },
  ajustes: { x: 32, y: 38 },
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
    case "foco":
      return <FocoModule />;
    case "ajustes":
      return <AjustesModule />;
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

  // FOCO: não é um vidro — é a luz do quarto apagando. Só a luminária fica
  // acesa e o relógio flutua na própria cena. Sem dock, sem distração.
  if (moduleKey === "foco") {
    return (
      <div className="fixed inset-0 z-40">
        {/* escuridão que toma o quarto */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 70% at 14% 64%, #e8a87c14, transparent 60%), radial-gradient(ellipse 70% 50% at 50% 38%, #e8a87c0a, transparent 70%), #06080acc",
            opacity: open ? 1 : 0,
            transition: "opacity 700ms var(--nk-ease-ui)",
          }}
          aria-hidden
        />
        <button
          onClick={onClose}
          className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-(--radius-sm) px-2 py-1 text-sm text-ink-low transition-colors hover:text-amber"
          title="Voltar ao quarto (Esc)"
          style={{
            opacity: open ? 1 : 0,
            transition: "opacity 400ms var(--nk-ease-ui) 200ms",
          }}
        >
          <span aria-hidden>←</span> acender a luz
        </button>
        <div
          className="relative h-full overflow-y-auto"
          role="dialog"
          aria-label="Sessão de foco"
          style={{
            opacity: open ? 1 : 0,
            transform: open ? "scale(1)" : "scale(0.97)",
            transition:
              "opacity 500ms var(--nk-ease-ui) 150ms, transform 600ms var(--nk-ease-room) 150ms",
          }}
        >
          <ModuleBody moduleKey={moduleKey} detailId={detailId} />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-3 pb-20 pt-3 sm:px-6 sm:pb-20 sm:pt-6">
      {/* clicar no quarto (fora do vidro) volta a câmera */}
      <div className="absolute inset-0" onClick={onClose} aria-hidden />

      <div
        className="relative flex max-h-full w-full max-w-[1320px] flex-col overflow-hidden rounded-(--radius-lg)"
        style={{
          background: "color-mix(in srgb, var(--color-room) 82%, transparent)",
          backdropFilter: "blur(18px) saturate(1.15)",
          WebkitBackdropFilter: "blur(18px) saturate(1.15)",
          boxShadow:
            "0 32px 90px #00000073, 0 0 0 1px #ffffff14, inset 0 1px 0 #ffffff0f",
          transformOrigin: `${origin.x}% ${origin.y}%`,
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
        {/* ── o material do objeto ──────────────────────────────────── */}
        {moduleKey === "tarefas" && (
          <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
            {/* pauta do caderno */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent 0 27px, #8fa8bf10 27px 28px)",
                backgroundPosition: "0 72px",
              }}
            />
            {/* margem vermelha */}
            <div className="absolute bottom-0 top-12 w-px" style={{ left: 60, background: "#c97b6338" }} />
            {/* espiral */}
            <div className="absolute bottom-8 left-3 top-16 flex flex-col justify-between">
              {Array.from({ length: 12 }).map((_, i) => (
                <span
                  key={i}
                  className="h-3.5 w-3.5 rounded-full border-2"
                  style={{ borderColor: "#3d4150", background: "#0b0e1480", boxShadow: "inset 0 1px 2px #000" }}
                />
              ))}
            </div>
          </div>
        )}
        {moduleKey === "dashboard" && (
          <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
            {/* brilho azulado de tela ligada */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 90% 60% at 50% 0%, #1c284055, transparent 65%)",
              }}
            />
            <div
              className="absolute inset-x-0 top-0 h-px"
              style={{ background: "linear-gradient(90deg, transparent, #8fa8bf50, transparent)" }}
            />
          </div>
        )}
        {moduleKey === "calendario" && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center" aria-hidden>
            {/* o pino que prende a folha na parede */}
            <span
              className="-mt-2 h-4 w-4 rounded-full"
              style={{
                background: "radial-gradient(circle at 35% 30%, #d9a88a, #8a5a3f 70%)",
                boxShadow: "0 3px 6px #000000a0, 0 0 0 1px #00000060",
              }}
            />
          </div>
        )}
        {moduleKey === "radio" && (
          <div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background:
                "linear-gradient(165deg, #2b211a30 0%, transparent 50%, #1b140f40 100%)",
            }}
            aria-hidden
          />
        )}

        {/* cabeçalho fino do vidro — o dashboard tem a sua própria barra de título */}
        {moduleKey !== "dashboard" && (
        <header className="relative z-[1] flex items-center justify-between border-b border-white/[0.06] px-5 py-3 sm:px-7">
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
          <div className="flex items-center gap-3">
            <kbd className="hidden rounded-md bg-surface/70 px-2 py-1 text-xs text-ink-low shadow-[0_0_0_1px_#ffffff10] md:block">
              Ctrl K
            </kbd>
          </div>
        </header>
        )}

        {/* conteúdo do módulo */}
        <div className="relative z-[1] flex-1 overflow-y-auto">
          <main
            className={
              moduleKey === "dashboard"
                ? "w-full"
                : "mx-auto max-w-[1180px] px-4 pb-10 pt-6 sm:px-7"
            }
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
