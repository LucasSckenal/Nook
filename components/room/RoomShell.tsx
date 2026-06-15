"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RoomSceneObjects } from "./RoomSceneObjects";
import {
  ModuleOverlay,
  MODULE_ORIGIN,
  type ModuleKey,
} from "./ModuleOverlay";
import { useMounted } from "@/components/useMounted";
import { SyncIndicator } from "@/components/auth/SyncIndicator";
import { useRoomPhase } from "@/lib/roomPhase";
import { useNook } from "@/lib/store";
import { daysBetween, greeting, relativeDay, todayIso } from "@/lib/dates";
import { toast } from "@/lib/toast";

const KEYS: ModuleKey[] = [
  "dashboard",
  "tarefas",
  "calendario",
  "disciplinas",
  "radio",
  "estatisticas",
  "foco",
  "ajustes",
];

function isModuleKey(v: string | null): v is ModuleKey {
  return !!v && (KEYS as string[]).includes(v);
}

const QUICK_NAV: { href: string; icon: string; label: string }[] = [
  { href: "/?open=dashboard", icon: "/Icones/Monitor.png", label: "Computador" },
  { href: "/?open=tarefas", icon: "/Icones/Livro.png", label: "Caderno" },
  { href: "/?open=calendario", icon: "/Icones/Calendario.png", label: "Calendário" },
  { href: "/?open=disciplinas", icon: "/Icones/Livros.png", label: "Estante" },
  { href: "/?open=radio", icon: "/Icones/Radio.png", label: "Rádio" },
  { href: "/?open=estatisticas", icon: "/Icones/Grafico.png", label: "Diário" },
  { href: "/?open=foco", icon: "/Objetos/Cafe.png", label: "Modo foco" },
  { href: "/?open=ajustes", icon: "/Icones/Abajur.png", label: "Ajustes" },
  { href: "/processo", icon: "/Icones/Foto.png", label: "Processo de design" },
];

interface Rendered {
  key: ModuleKey;
  id?: string;
  origin: { x: number; y: number };
}

/**
 * Palco persistente do Nook. O quarto nunca "sai de cena": quando um módulo
 * abre, ele nasce do próprio objeto (morph + blur) enquanto o quarto recua e
 * desfoca atrás. Fechar devolve o módulo ao objeto. O quarto é o sistema.
 */
export function RoomShell() {
  const router = useRouter();
  const params = useSearchParams();
  const mounted = useMounted();
  const userName = useNook((s) => s.userName);
  const phase = useRoomPhase((s) => s.phase);
  const togglePhase = useRoomPhase((s) => s.toggle);

  const openParam = params.get("open");
  const idParam = params.get("id") ?? undefined;
  const activeKey = isModuleKey(openParam) ? openParam : null;

  // origem do morph definida pelo clique no objeto (precisa); senão, aproximada
  const pendingOrigin = useRef<{ x: number; y: number } | null>(null);

  const [rendered, setRendered] = useState<Rendered | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    if (activeKey) {
      const origin = pendingOrigin.current ?? MODULE_ORIGIN[activeKey];
      pendingOrigin.current = null;
      setRendered({ key: activeKey, id: idParam, origin });
      setClosing(false);
    } else if (rendered) {
      setClosing(true);
      const t = window.setTimeout(() => {
        setRendered(null);
        setClosing(false);
      }, 620);
      return () => window.clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, idParam]);

  // Esc fecha o módulo (volta ao quarto)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && activeKey) {
        const el = document.activeElement as HTMLElement | null;
        const typing =
          el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
        if (!typing) router.push("/");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeKey, router]);

  // lembrete gentil na chegada: prazos próximos, no máximo 1x por dia
  const subjects = useNook((s) => s.subjects);
  const tasks = useNook((s) => s.tasks);
  const onboarded = useNook((s) => s.onboarded);
  useEffect(() => {
    if (!mounted || !onboarded || activeKey) return;
    const today = todayIso();
    if (localStorage.getItem("nook-greet") === today) return;

    const exam = subjects
      .flatMap((s) => s.assessments.map((a) => ({ s, a })))
      .filter(({ a }) => a.grade == null && daysBetween(today, a.date) >= 0 && daysBetween(today, a.date) <= 2)
      .sort((x, y) => x.a.date.localeCompare(y.a.date))[0];
    const dueToday = tasks.filter((t) => !t.done && t.due && t.due <= today).length;

    if (!exam && dueToday === 0) return;
    localStorage.setItem("nook-greet", today);

    const t = window.setTimeout(() => {
      if (exam) {
        toast({
          message: `🕯 ${exam.a.title} (${exam.s.name}) ${relativeDay(exam.a.date)}.`,
          undoLabel: "focar agora",
          onUndo: () => router.push("/?open=foco"),
        });
      } else {
        toast({
          message: `🕯 ${dueToday} tarefa${dueToday > 1 ? "s" : ""} esperando por hoje.`,
          undoLabel: "ver tarefas",
          onUndo: () => router.push("/?open=tarefas"),
        });
      }
    }, 1600); // depois da luz acender
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, onboarded]);

  function openFromRoom(key: ModuleKey, origin: { x: number; y: number }) {
    pendingOrigin.current = origin;
    router.push(`/?open=${key}`);
  }

  const recede = !!activeKey;

  return (
    <main className="relative h-screen w-full overflow-hidden bg-void">
      {/* o quarto — a câmera mergulha no objeto; o quarto segue visível,
          só ganha um leve desfoque de profundidade de campo */}
      <div
        aria-hidden={recede}
        style={{
          filter: recede ? "brightness(0.72) blur(2.5px)" : "none",
          transition: "filter 600ms var(--nk-ease-ui)",
        }}
      >
        {mounted ? (
          <RoomSceneObjects onOpen={openFromRoom} zoomTarget={activeKey} />
        ) : (
          <div className="flex h-screen items-center justify-center">
            <p className="font-display text-xl text-ink-low">acendendo a luz…</p>
          </div>
        )}
      </div>

      {/* scrims de contraste p/ o chrome (essencial nas artes claras de dia) */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-40"
        style={{
          background: "linear-gradient(to bottom, #06080acc, transparent)",
          opacity: recede ? 0 : 1,
          transition: "opacity 300ms var(--nk-ease-ui)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-28"
        style={{
          background: "linear-gradient(to top, #06080acc, transparent)",
          opacity: recede ? 0 : 1,
          transition: "opacity 300ms var(--nk-ease-ui)",
        }}
        aria-hidden
      />

      {/* topo: marca + saudação (some quando um módulo abre) */}
      <header
        className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-6 md:p-8"
        style={{
          opacity: recede ? 0 : 1,
          transition: "opacity 300ms var(--nk-ease-ui)",
        }}
      >
        <div>
          <p className="font-display text-2xl text-ink-high">Nook</p>
          {mounted && (
            <p className="mt-1 text-sm text-ink-mid">
              {greeting()}, {userName}. O quarto é todo seu.
            </p>
          )}
        </div>
        <div className="pointer-events-auto flex items-center gap-3 text-xs text-ink-low">
          <SyncIndicator />
          <span className="hidden items-center gap-2 sm:flex">
            <kbd className="rounded-md bg-surface px-2 py-1 shadow-[0_0_0_1px_#ffffff10]">
              Ctrl K
            </kbd>
            buscar · criar · navegar
          </span>
          {mounted && (
            <button
              onClick={togglePhase}
              aria-label={phase === "dia" ? "Mudar para noite" : "Mudar para dia"}
              title={phase === "dia" ? "Anoitecer" : "Amanhecer"}
              className="rounded-md px-1.5 py-1 text-base transition-colors hover:text-amber"
            >
              {phase === "dia" ? "🌙" : "☀️"}
            </button>
          )}
          <button
            onClick={() =>
              window.dispatchEvent(new KeyboardEvent("keydown", { key: "?", bubbles: true }))
            }
            aria-label="Atalhos de teclado"
            title="Atalhos (?)"
            className="rounded-md px-2 py-1 text-sm text-ink-low transition-colors hover:text-amber"
          >
            ?
          </button>
          <Link
            href="/?edit=1"
            aria-label="Organizar o quarto"
            title="Organizar o quarto"
            className="flex items-center rounded-md px-1.5 py-1 text-ink-low transition-colors hover:text-amber"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M5 9l-3 3 3 3" />
              <path d="M9 5l3-3 3 3" />
              <path d="M15 19l-3 3-3-3" />
              <path d="M19 9l3 3-3 3" />
              <path d="M2 12h20" />
              <path d="M12 2v20" />
            </svg>
          </Link>
          <Link
            href="/?open=ajustes"
            aria-label="Ajustes"
            title="Ajustes"
            className="rounded-md px-1.5 py-1 text-base transition-colors hover:text-amber"
          >
            ⚙️
          </Link>
        </div>
      </header>

      {/* rodapé: navegação rápida em ícones (mesma linguagem da dock) */}
      <nav
        aria-label="Navegação rápida"
        className="absolute inset-x-0 bottom-0 z-10 flex justify-center pb-3"
        style={{
          opacity: recede ? 0 : 1,
          pointerEvents: recede ? "none" : "auto",
          transition: "opacity 300ms var(--nk-ease-ui)",
        }}
      >
        <div className="flex max-w-[calc(100vw-1.5rem)] flex-wrap items-center justify-center gap-1 rounded-(--radius-lg) bg-raised/85 px-3 py-2 opacity-75 shadow-[0_8px_32px_#00000040,0_0_0_1px_#ffffff0a] backdrop-blur-xl transition-opacity duration-(--nk-dur-quick) hover:opacity-100">
          {QUICK_NAV.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              title={it.label}
              aria-label={it.label}
              className="group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-(--radius-md) transition-all duration-(--nk-dur-instant) hover:-translate-y-0.5 hover:bg-surface sm:h-11 sm:w-11"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={it.icon}
                alt=""
                aria-hidden
                draggable={false}
                className="h-7 w-7 select-none rounded-[9px] object-contain transition-transform duration-(--nk-dur-instant) group-hover:scale-110 sm:h-9 sm:w-9"
              />
              <span className="pointer-events-none absolute -top-9 whitespace-nowrap rounded-md bg-raised px-2 py-1 text-xs text-ink-mid opacity-0 shadow-[0_0_0_1px_#ffffff0a] transition-opacity group-hover:opacity-100">
                {it.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      {/* o módulo, nascendo do objeto */}
      {rendered && (
        <ModuleOverlay
          moduleKey={rendered.key}
          detailId={rendered.id}
          origin={rendered.origin}
          closing={closing}
          onClose={() => router.push("/")}
        />
      )}
    </main>
  );
}
