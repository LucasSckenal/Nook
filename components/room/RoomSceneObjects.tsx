"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNook } from "@/lib/store";
import { daysBetween, relativeDay, todayIso } from "@/lib/dates";
import type { ModuleKey } from "./ModuleOverlay";

/**
 * O Quarto — cena montada: um fundo (quarto vazio) + objetos PNG soltos
 * posicionados por cima. Cada objeto é o próprio hotspot do seu módulo,
 * e o módulo nasce dele (a câmera mergulha no objeto).
 *
 * MODO DE EDIÇÃO: abra com `/?edit=1` para arrastar os objetos com o mouse
 * (scroll redimensiona). Um painel mostra o array OBJECTS pronto para colar
 * aqui. É só para ajuste fino — não afeta o uso normal.
 */

const BG = "/room/Background.jpg";

/** ponto de mergulho da câmera por módulo (% do palco) — segue a composição */
const ZOOM_POINT: Record<ModuleKey, { x: number; y: number }> = {
  dashboard: { x: 49, y: 48 },
  tarefas: { x: 46, y: 72 },
  calendario: { x: 66, y: 20 },
  disciplinas: { x: 90, y: 25 },
  radio: { x: 12, y: 50 },
  estatisticas: { x: 71, y: 70 },
  foco: { x: 31, y: 52 },
};

interface SceneObject {
  key?: ModuleKey; // sem key = decorativo
  src: string;
  label?: string;
  left: number; // % do palco
  top: number;
  width: number;
  glow?: string;
  z?: number;
}

/** posições seguindo a composição de referência (% do palco 3:2).
 * parede: calendário e estante (z baixo); mesa: o resto. */
const OBJECTS: SceneObject[] = [
  { key: "calendario", src: "/Objetos/Calendario.png", label: "📅 Calendário", left: 58.3, top: 10, width: 15, glow: "#a99bc4", z: 5 },
  { key: "disciplinas", src: "/Objetos/Estante.png", label: "📚 Estante", left: 79.1, top: 0.6, width: 22, glow: "#9caf88", z: 6 },
  { key: "radio", src: "/Objetos/Radio.png", label: "📻 Rádio", left: 4.5, top: 42.9, width: 16, glow: "#c9a06a", z: 10 },
  { key: "dashboard", src: "/Objetos/Notebook.png", label: "💻 Computador", left: 36.9, top: 37.2, width: 23.6, glow: "#8fa8bf", z: 11 },
  { key: "foco", src: "/Objetos/Cafe.png", label: "🎯 Modo foco", left: 26.5, top: 46.5, width: 8, glow: "#e8a87c", z: 13 },
  { key: "estatisticas", src: "/Objetos/Agenda.png", label: "📊 Estatísticas", left: 61.9, top: 59.7, width: 18, glow: "#c97b63", z: 12 },
  { key: "tarefas", src: "/Objetos/Caderno.png", label: "📝 Caderno", left: 33.7, top: 61.6, width: 24.2, glow: "#e8a87c", z: 14 },
];

/** área dos post-its de aviso (% do palco) — arraste no modo ?edit=1 */
const NOTES_AREA: Pos = { left: 62.6, top: 39, width: 14.6 };

type Pos = { left: number; top: number; width: number };

function buildSnippet(objs: SceneObject[], pos: Pos[], np: Pos): string {
  const r = (n: number) => Math.round(n * 10) / 10;
  const lines = objs.map((o, i) => {
    const p = pos[i];
    const parts = [
      o.key ? `key: "${o.key}"` : null,
      `src: "${o.src}"`,
      o.label ? `label: ${JSON.stringify(o.label)}` : null,
      `left: ${r(p.left)}`,
      `top: ${r(p.top)}`,
      `width: ${r(p.width)}`,
      o.glow ? `glow: "${o.glow}"` : null,
      o.z != null ? `z: ${o.z}` : null,
    ].filter(Boolean);
    return `  { ${parts.join(", ")} },`;
  });
  const arr = `const OBJECTS: SceneObject[] = [\n${lines.join("\n")}\n];`;
  const na = `const NOTES_AREA: Pos = { left: ${r(np.left)}, top: ${r(np.top)}, width: ${r(np.width)} };`;
  return `${arr}\n\n${na}`;
}

export function RoomSceneObjects({
  onOpen,
  zoomTarget,
}: {
  onOpen: (key: ModuleKey, origin: { x: number; y: number }) => void;
  zoomTarget?: ModuleKey | null;
}) {
  const params = useSearchParams();
  const edit = params.get("edit") === "1";
  const router = useRouter();

  // avisos dinâmicos (post-its abaixo do calendário)
  const subjects = useNook((s) => s.subjects);
  const tasks = useNook((s) => s.tasks);
  const notes = useMemo(() => {
    const today = todayIso();
    const out: { kind: string; text: string; sub?: string; color: string; href?: string }[] = [];
    const exam = subjects
      .flatMap((s) => s.assessments.map((a) => ({ s, a })))
      .filter(({ a }) => a.grade == null && daysBetween(today, a.date) >= 0 && daysBetween(today, a.date) <= 5)
      .sort((x, y) => x.a.date.localeCompare(y.a.date))[0];
    if (exam)
      out.push({
        kind: exam.a.kind === "prova" ? "PROVA" : "ENTREGA",
        text: exam.a.title,
        sub: `${exam.s.name} · ${relativeDay(exam.a.date)}`,
        color: "#e8c98a",
        href: `/?open=disciplinas&id=${exam.s.id}`,
      });
    const due = tasks.filter((t) => !t.done && t.due && t.due <= today).length;
    if (due > 0)
      out.push({
        kind: "HOJE",
        text: `${due} tarefa${due > 1 ? "s" : ""} para hoje`,
        color: "#cdd9a6",
        href: "/?open=tarefas",
      });
    if (out.length === 0) out.push({ kind: "", text: "Tudo em dia 🌿", color: "#c7d8c0" });
    return out.slice(0, 3);
  }, [subjects, tasks]);

  // "acende a luz" ao entrar
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setLit(true));
    return () => cancelAnimationFrame(r);
  }, []);

  // posições editáveis (modo de ajuste)
  const [pos, setPos] = useState<Pos[]>(() =>
    OBJECTS.map((o) => ({ left: o.left, top: o.top, width: o.width }))
  );
  const [notesPos, setNotesPos] = useState<Pos>(() => ({ ...NOTES_AREA }));
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ t: number | "notes"; sx: number; sy: number; sl: number; st: number } | null>(null);
  const [copied, setCopied] = useState(false);

  function startDrag(e: React.PointerEvent, t: number | "notes", cur: Pos) {
    if (!edit) return;
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { t, sx: e.clientX, sy: e.clientY, sl: cur.left, st: cur.top };
  }
  function onDragMove(e: React.PointerEvent) {
    if (!edit || !drag.current || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const d = drag.current;
    const nl = Math.max(-12, Math.min(100, d.sl + ((e.clientX - d.sx) / rect.width) * 100));
    const nt = Math.max(-12, Math.min(100, d.st + ((e.clientY - d.sy) / rect.height) * 100));
    if (d.t === "notes") setNotesPos((p) => ({ ...p, left: nl, top: nt }));
    else setPos((prev) => prev.map((p, j) => (j === d.t ? { ...p, left: nl, top: nt } : p)));
  }
  function onDragEnd() {
    drag.current = null;
  }
  function onResize(e: React.WheelEvent, t: number | "notes") {
    if (!edit) return;
    const step = e.deltaY < 0 ? 0.6 : -0.6;
    if (t === "notes") setNotesPos((p) => ({ ...p, width: Math.max(8, Math.min(45, p.width + step)) }));
    else setPos((prev) => prev.map((p, j) => (j === t ? { ...p, width: Math.max(4, Math.min(45, p.width + step)) } : p)));
  }

  function openMod(e: React.SyntheticEvent, key: ModuleKey) {
    const r = (e.currentTarget as Element).getBoundingClientRect();
    onOpen(key, {
      x: ((r.left + r.width / 2) / window.innerWidth) * 100,
      y: ((r.top + r.height / 2) / window.innerHeight) * 100,
    });
  }

  const zoomPt = zoomTarget && !edit ? ZOOM_POINT[zoomTarget] : null;
  const camStyle: React.CSSProperties = zoomPt
    ? {
        transform: "scale(2.1)",
        transformOrigin: `${zoomPt.x}% ${zoomPt.y}%`,
        transition: "transform 700ms var(--nk-ease-room)",
      }
    : { transform: "scale(1)", transition: "transform 700ms var(--nk-ease-room)" };

  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-void"
      style={{ pointerEvents: zoomTarget && !edit ? "none" : undefined }}
    >
      {/* fundo borrado preenchendo as bordas */}
      <img
        src={BG}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
        style={{ filter: "blur(26px) brightness(0.8)", transform: "scale(1.12)" }}
        draggable={false}
      />

      {/* palco 3:2 cobrindo a viewport */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "max(100vw, 150vh)",
          aspectRatio: "3 / 2",
          filter: lit || edit ? "brightness(1)" : "brightness(0.05)",
          transition: "filter 1300ms var(--nk-ease-ui) 250ms",
        }}
      >
        <div className="h-full w-full" style={camStyle}>
          <div className="relative h-full w-full" ref={stageRef}>
            {/* quarto vazio */}
            <img
              src={BG}
              alt="Quarto de estudos do Nook"
              className="h-full w-full select-none object-cover"
              draggable={false}
            />

            {/* objetos */}
            {OBJECTS.map((o, i) => {
              const p = pos[i];
              const style: React.CSSProperties = {
                left: `${p.left}%`,
                top: `${p.top}%`,
                width: `${p.width}%`,
                zIndex: edit ? 50 + i : o.z ?? 10,
              };

              // ── modo de edição: tudo é arrastável ──
              if (edit) {
                return (
                  <div
                    key={i}
                    className="absolute cursor-grab touch-none select-none active:cursor-grabbing"
                    style={{ ...style, outline: "2px dashed #e8a87caa", outlineOffset: 2 }}
                    onPointerDown={(e) => startDrag(e, i, pos[i])}
                    onPointerMove={onDragMove}
                    onPointerUp={onDragEnd}
                    onWheel={(e) => onResize(e, i)}
                    title={`${o.key ?? "deco"} — arraste; scroll redimensiona`}
                  >
                    <img src={o.src} alt="" aria-hidden draggable={false} className="w-full select-none" />
                    <span className="pointer-events-none absolute -top-5 left-0 rounded bg-amber px-1.5 text-[10px] font-medium text-void">
                      {o.key ?? "deco"}
                    </span>
                  </div>
                );
              }

              // ── decorativo ──
              if (!o.key) {
                return (
                  <img
                    key={i}
                    src={o.src}
                    alt=""
                    aria-hidden
                    draggable={false}
                    className="pointer-events-none absolute select-none drop-shadow-[0_10px_14px_#00000055]"
                    style={style}
                  />
                );
              }

              // ── hotspot do módulo ──
              return (
                <button
                  key={i}
                  className="nk-obj group absolute"
                  style={style}
                  aria-label={o.label?.replace(/^\S+\s/, "Abrir ") ?? "Abrir"}
                  onClick={(e) => openMod(e, o.key!)}
                >
                  <span
                    className="nk-obj-glow pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      width: "115%",
                      height: "115%",
                      background: `radial-gradient(ellipse at center, ${o.glow ?? "#e8a87c"}66 0%, transparent 70%)`,
                      animationDelay: `${i * 350}ms`,
                    }}
                    aria-hidden
                  />
                  <img
                    src={o.src}
                    alt=""
                    aria-hidden
                    draggable={false}
                    className="w-full select-none drop-shadow-[0_10px_14px_#00000066] transition-transform duration-(--nk-dur-quick) group-hover:-translate-y-1.5 group-hover:scale-[1.04]"
                  />
                  <span className="nk-obj-label pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-raised/95 px-3 py-1.5 text-sm text-ink-high opacity-0 shadow-[0_4px_16px_#00000060,0_0_0_1px_#ffffff12] transition-opacity">
                    {o.label}
                  </span>
                </button>
              );
            })}

            {/* post-its de aviso (quadrados), na área escolhida */}
            {!edit && (
              <div
                className="absolute"
                style={{ left: `${notesPos.left}%`, top: `${notesPos.top}%`, width: `${notesPos.width}%`, zIndex: 7 }}
              >
                <div className="flex flex-wrap gap-2">
                  {notes.map((n, i) => (
                    <button
                      key={i}
                      onClick={() => n.href && router.push(n.href)}
                      className="flex aspect-square flex-col justify-between rounded-[3px] p-2 text-left shadow-[0_5px_12px_#00000055] transition-transform hover:scale-[1.04]"
                      style={{
                        width: "calc(50% - 4px)",
                        background: n.color,
                        color: "#33302a",
                        transform: `rotate(${i % 2 === 0 ? -2 : 1.6}deg)`,
                      }}
                      title={n.sub ? `${n.text} — ${n.sub}` : n.text}
                    >
                      {n.kind && (
                        <span className="text-[8px] font-bold tracking-widest opacity-80">{n.kind}</span>
                      )}
                      <span className="line-clamp-3 text-[11px] font-medium leading-tight">{n.text}</span>
                      {n.sub && <span className="line-clamp-2 text-[9px] opacity-70">{n.sub}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* área editável dos post-its (modo ?edit=1) */}
            {edit && (
              <div
                className="absolute cursor-grab touch-none rounded-[4px] active:cursor-grabbing"
                style={{
                  left: `${notesPos.left}%`,
                  top: `${notesPos.top}%`,
                  width: `${notesPos.width}%`,
                  aspectRatio: "2 / 1",
                  zIndex: 80,
                  outline: "2px dashed #8fa8bfcc",
                  outlineOffset: 2,
                  background: "#8fa8bf22",
                }}
                onPointerDown={(e) => startDrag(e, "notes", notesPos)}
                onPointerMove={onDragMove}
                onPointerUp={onDragEnd}
                onWheel={(e) => onResize(e, "notes")}
                title="área dos avisos — arraste; scroll redimensiona"
              >
                <span className="pointer-events-none absolute -top-5 left-0 rounded bg-mist px-1.5 text-[10px] font-medium text-void">
                  avisos
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* clarão da luz ao entrar */}
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background: "radial-gradient(ellipse 40% 50% at 18% 32%, #f0c08930, transparent 70%)",
          opacity: lit || edit ? 0 : 1,
          transition: "opacity 1500ms var(--nk-ease-ui) 650ms",
        }}
        aria-hidden
      />

      {/* vinheta */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 82% 70% at 50% 46%, transparent 66%, #04060a66 100%)",
        }}
      />

      {/* painel do modo de edição */}
      {edit && (
        <div className="absolute right-3 top-3 z-[60] w-[330px] rounded-(--radius-md) bg-void/90 p-3 text-xs text-ink-mid shadow-[0_0_0_1px_#ffffff14] backdrop-blur-md">
          <p className="mb-2 font-medium text-ink-high">🛠 Modo de ajuste</p>
          <p className="mb-2 leading-relaxed text-ink-low">
            Arraste os objetos. Scroll sobre um objeto redimensiona. Copie o array
            abaixo e me mande (ou cole em <code>RoomSceneObjects.tsx</code>). Saia tirando o <code>?edit=1</code>.
          </p>
          <textarea
            readOnly
            value={buildSnippet(OBJECTS, pos, notesPos)}
            className="h-48 w-full resize-none rounded-(--radius-sm) bg-surface p-2 font-mono text-[10px] leading-tight text-ink-high focus:outline-none"
            onFocus={(e) => e.currentTarget.select()}
          />
          <button
            onClick={() => {
              navigator.clipboard?.writeText(buildSnippet(OBJECTS, pos, notesPos));
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1500);
            }}
            className="mt-2 w-full rounded-(--radius-sm) bg-amber py-1.5 text-sm font-medium text-void transition-opacity hover:opacity-90"
          >
            {copied ? "copiado! ✓" : "copiar array"}
          </button>
        </div>
      )}
    </div>
  );
}
