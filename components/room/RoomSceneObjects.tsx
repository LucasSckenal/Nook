"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNook } from "@/lib/store";
import { useRoomPhase, phaseFromClock } from "@/lib/roomPhase";
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

/** vídeos do quarto vivo: loops de ambiente + transições entre fases */
const LOOP: Record<"dia" | "noite", string> = {
  dia: "/room/ChuvaDia.mp4",
  noite: "/room/ChuvaNoite.mp4",
};
const TRANS: Record<"diaPraNoite" | "noitePraDia", string> = {
  diaPraNoite: "/room/TransicaoDiaPraNoite.mp4",
  noitePraDia: "/room/TransicaoNoitePraDia.mp4",
};
/** quarto SEM chuva (quando a config "Chuva na janela" está desligada) */
const STILL: Record<"dia" | "noite", string> = {
  dia: "/room/Background.jpg",
  noite: "/room/Noite.png",
};

/** ponto de mergulho da câmera por módulo (% do palco) — segue a composição */
const ZOOM_POINT: Record<ModuleKey, { x: number; y: number }> = {
  dashboard: { x: 49, y: 48 },
  tarefas: { x: 46, y: 72 },
  calendario: { x: 66, y: 20 },
  disciplinas: { x: 90, y: 25 },
  radio: { x: 12, y: 50 },
  estatisticas: { x: 71, y: 70 },
  foco: { x: 26, y: 64 },
  ajustes: { x: 32, y: 38 },
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
  { key: "foco", src: "/Objetos/Cafe.png", label: "🎯 Modo foco", left: 22.2, top: 58.1, width: 7.4, glow: "#e8a87c", z: 13 },
  { key: "estatisticas", src: "/Objetos/Agenda.png", label: "📔 Diário", left: 61.9, top: 59.7, width: 18, glow: "#c97b63", z: 12 },
  { key: "tarefas", src: "/Objetos/Caderno.png", label: "📝 Caderno", left: 33.7, top: 61.6, width: 24.2, glow: "#e8a87c", z: 14 },
  { key: "ajustes", src: "/Objetos/Luminaria.png", label: "💡 Ajustes", left: 24.9, top: 27.6, width: 14, glow: "#e8c98a", z: 8 },
];

const NOTES_AREA: Pos = { left: 62.6, top: 39, width: 14.6 };

type Pos = { left: number; top: number; width: number };

/** chave de persistência de um objeto (módulo, ou decorativo por índice) */
function layoutKey(o: SceneObject, i: number): string {
  return o.key ?? `deco-${i}`;
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
  const radioPlaying = useNook((s) => s.radio.playing);
  const roomLayout = useNook((s) => s.roomLayout);
  const setRoomLayout = useNook((s) => s.setRoomLayout);
  const resetRoomLayout = useNook((s) => s.resetRoomLayout);
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

  // quarto vivo: vídeo de fundo por fase (dia/noite) + transições
  const calmMotion = useNook((s) => s.calmMotion);
  const rainVisual = useNook((s) => s.rainVisual);
  const phase = useRoomPhase((s) => s.phase);
  const transition = useRoomPhase((s) => s.transition);
  const clearTransition = useRoomPhase((s) => s.clearTransition);

  // fase inicial pelo relógio real (ou ?t=dia|noite para prévia)
  useEffect(() => {
    const st = useRoomPhase.getState();
    if (st.initialized) return;
    const forced = params.get("t");
    st.init(forced === "dia" || forced === "noite" ? forced : phaseFromClock());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // o sol se põe sozinho: a cada minuto segue o relógio (a menos que o
  // usuário tenha escolhido a fase à mão pelo toggle ☀️/🌙)
  useEffect(() => {
    const id = window.setInterval(() => {
      useRoomPhase.getState().autoAdvance();
    }, 60000);
    return () => window.clearInterval(id);
  }, []);

  // posições dos objetos — partem do padrão, sobrepostas pelo layout salvo
  const [pos, setPos] = useState<Pos[]>(() =>
    OBJECTS.map((o, i) => {
      const saved = roomLayout[layoutKey(o, i)];
      return saved ? { ...saved } : { left: o.left, top: o.top, width: o.width };
    })
  );
  const [notesPos, setNotesPos] = useState<Pos>(() => ({ ...NOTES_AREA, ...roomLayout["notes"] }));
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ t: number | "notes"; sx: number; sy: number; sl: number; st: number } | null>(null);
  const [saved, setSaved] = useState(false);

  function saveLayout() {
    const layout: Record<string, Pos> = {};
    OBJECTS.forEach((o, i) => {
      layout[layoutKey(o, i)] = { ...pos[i] };
    });
    layout["notes"] = { ...notesPos };
    setRoomLayout(layout);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1600);
  }

  function resetLayout() {
    resetRoomLayout();
    setPos(OBJECTS.map((o) => ({ left: o.left, top: o.top, width: o.width })));
    setNotesPos({ ...NOTES_AREA });
  }

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

  // ponto de mergulho da câmera — segue o objeto mesmo se o usuário o moveu
  const zoomPt = useMemo(() => {
    if (!zoomTarget || edit) return null;
    const base = ZOOM_POINT[zoomTarget];
    const i = OBJECTS.findIndex((o) => o.key === zoomTarget);
    if (i < 0) return base;
    const d = OBJECTS[i];
    const p = pos[i];
    return {
      x: base.x + (p.left + p.width / 2 - (d.left + d.width / 2)),
      y: base.y + (p.top - d.top),
    };
  }, [zoomTarget, edit, pos]);
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
      {/* fundo borrado preenchendo as bordas (segue a fase dia/noite) */}
      <img
        src={STILL[phase]}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
        style={{ filter: "blur(26px) brightness(0.8)", transform: "scale(1.12)" }}
        draggable={false}
      />

      {/* palco 3:2. No desktop cobre a viewport (cover); no mobile mostra o
          quarto INTEIRO (largura toda), como um quadro, com o fundo borrado
          preenchendo o resto — todos os objetos visíveis e tocáveis. */}
      <div
        className="absolute left-1/2 top-1/2 aspect-[3/2] w-[max(100vw,150vh)] -translate-x-1/2 -translate-y-1/2 max-[640px]:w-screen"
        style={{
          filter: lit || edit ? "brightness(1)" : "brightness(0.05)",
          transition: "filter 1300ms var(--nk-ease-ui) 250ms",
        }}
      >
        <div className="h-full w-full" style={camStyle}>
          <div className="relative h-full w-full" ref={stageRef}>
            {/* quarto vivo: vídeo em loop da fase (com chuva). Sem chuva,
                movimento calmo ou edição → still da fase (dia/noite). */}
            {!rainVisual || calmMotion || edit ? (
              <img
                src={STILL[phase]}
                alt="Quarto de estudos do Nook"
                className="h-full w-full select-none object-cover"
                draggable={false}
              />
            ) : (
              <>
                <video
                  key={phase}
                  src={LOOP[phase]}
                  poster={STILL[phase]}
                  autoPlay
                  loop
                  muted
                  playsInline
                  aria-label="Quarto de estudos do Nook"
                  className="h-full w-full select-none object-cover"
                />
                {transition && (
                  <video
                    key={transition}
                    src={TRANS[transition]}
                    autoPlay
                    muted
                    playsInline
                    onEnded={clearTransition}
                    className="absolute inset-0 h-full w-full select-none object-cover"
                  />
                )}
              </>
            )}

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

                  {/* vapor subindo do café (modo foco) */}
                  {o.key === "foco" && (
                    <span
                      className="pointer-events-none absolute left-1/2 top-0 h-6 w-8 -translate-x-1/2 -translate-y-2"
                      aria-hidden
                    >
                      {[0, 1, 2].map((k) => (
                        <span
                          key={k}
                          className="nk-steam absolute bottom-0 rounded-full"
                          style={{
                            left: 8 + k * 6,
                            width: 4,
                            height: 12,
                            background: "radial-gradient(circle, rgba(255,255,255,0.85), transparent 70%)",
                            filter: "blur(1.5px)",
                            animationDelay: `${k * 1000}ms`,
                          }}
                        />
                      ))}
                    </span>
                  )}

                  {/* LED do rádio quando está tocando */}
                  {o.key === "radio" && radioPlaying && (
                    <span
                      className="nk-led-on pointer-events-none absolute h-1.5 w-1.5 rounded-full"
                      style={{
                        left: "21%",
                        top: "33%",
                        background: "#9caf88",
                        boxShadow: "0 0 6px 1px #9caf88cc",
                      }}
                      aria-hidden
                    />
                  )}

                  <img
                    src={o.src}
                    alt=""
                    aria-hidden
                    draggable={false}
                    className="w-full select-none drop-shadow-[0_10px_14px_#00000066] transition-transform duration-(--nk-dur-quick) group-hover:-translate-y-1.5 group-hover:rotate-[-1.5deg] group-hover:scale-[1.04] group-active:scale-95"
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

      {/* painel do modo "organizar o quarto" */}
      {edit && (
        <div className="absolute right-3 top-3 z-[60] w-[300px] rounded-(--radius-md) bg-void/90 p-4 text-xs text-ink-mid shadow-[0_0_0_1px_#ffffff14] backdrop-blur-md">
          <p className="mb-1.5 font-display text-base text-ink-high">🪴 Organizando o quarto</p>
          <p className="mb-3 leading-relaxed text-ink-low">
            Arraste os objetos para onde quiser. Use o scroll sobre um objeto para
            aumentar ou diminuir. Salve quando gostar do resultado.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={saveLayout}
              className="w-full rounded-(--radius-sm) bg-amber py-2 text-sm font-medium text-void transition-opacity hover:opacity-90"
            >
              {saved ? "salvo! ✓" : "salvar layout"}
            </button>
            <div className="flex gap-2">
              <button
                onClick={resetLayout}
                className="flex-1 rounded-(--radius-sm) bg-surface py-2 text-sm text-ink-mid transition-colors hover:text-ink-high"
              >
                restaurar padrão
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex-1 rounded-(--radius-sm) bg-surface py-2 text-sm text-ink-mid transition-colors hover:text-ink-high"
              >
                concluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
