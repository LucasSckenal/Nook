"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { RoomSceneImage } from "./RoomSceneImage";
import {
  ModuleOverlay,
  MODULE_ORIGIN,
  type ModuleKey,
} from "./ModuleOverlay";
import { useMounted } from "@/components/useMounted";
import { useNook } from "@/lib/store";
import { greeting } from "@/lib/dates";

const KEYS: ModuleKey[] = [
  "dashboard",
  "tarefas",
  "calendario",
  "disciplinas",
  "radio",
  "estatisticas",
];

function isModuleKey(v: string | null): v is ModuleKey {
  return !!v && (KEYS as string[]).includes(v);
}

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
          <RoomSceneImage onOpen={openFromRoom} zoomTarget={activeKey} />
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

      {/* rodapé: navegação simples (a metáfora nunca é pedágio) */}
      <nav
        aria-label="Navegação simples"
        className="absolute inset-x-0 bottom-0 z-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 p-4 text-xs text-ink-low"
        style={{
          opacity: recede ? 0 : 1,
          pointerEvents: recede ? "none" : "auto",
          transition: "opacity 300ms var(--nk-ease-ui)",
        }}
      >
        <Link className="transition-colors hover:text-amber" href="/?open=dashboard">computador</Link>
        <Link className="transition-colors hover:text-amber" href="/?open=tarefas">caderno</Link>
        <Link className="transition-colors hover:text-amber" href="/?open=calendario">calendário</Link>
        <Link className="transition-colors hover:text-amber" href="/?open=disciplinas">estante</Link>
        <Link className="transition-colors hover:text-amber" href="/?open=radio">rádio</Link>
        <Link className="transition-colors hover:text-amber" href="/?open=estatisticas">caneca</Link>
        <Link className="transition-colors hover:text-amber" href="/foco">modo foco</Link>
        <span className="text-ink-faint">·</span>
        <Link className="transition-colors hover:text-lavender" href="/processo">processo de design</Link>
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
