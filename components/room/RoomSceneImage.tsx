"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useNook } from "@/lib/store";
import { daysBetween, relativeDay, todayIso } from "@/lib/dates";
import { audioPurrStart, audioPurrStop } from "@/lib/audio";
import type { ModuleKey } from "./ModuleOverlay";

/**
 * O Quarto — versão com arte ilustrada (public/room/*.png, 1536×1024, 3:2).
 * A imagem é o palco; por cima vivem os elementos dinâmicos: hotspots com
 * halo, post-it de urgência, vapor da caneca, chuva na janela, LED do rádio
 * e o zoom de câmera que mergulha no objeto ao abrir um módulo.
 *
 * Variações de fundo: gere imagens com a MESMA composição e salve em
 * public/room/ como manha.png, tarde.png, entardecer.png — depois basta
 * apontar no mapa ROOM_IMG abaixo.
 */

type Phase = "noite" | "manhã" | "tarde" | "entardecer";

function phaseOf(h: number): Phase {
  if (h >= 5 && h < 11) return "manhã";
  if (h >= 11 && h < 17) return "tarde";
  if (h >= 17 && h < 19) return "entardecer";
  return "noite";
}

const ROOM_IMG: Record<Phase, string> = {
  noite: "/room/noite.png",
  manhã: "/room/manha.png",
  tarde: "/room/tarde.png",
  entardecer: "/room/entardecer.png",
};

/** vídeo de fundo por fase (quando existir) — o quarto ganha vida.
 * Cai para a imagem estática quando "Movimento calmo" está ligado.
 * Conforme novos vídeos forem criados, é só apontar aqui. */
const ROOM_VIDEO: Partial<Record<Phase, string>> = {
  noite: "/room/noite.mp4",
};

/** ponto de mergulho da câmera por módulo (% da imagem) */
const ZOOM_POINT: Record<ModuleKey, { x: number; y: number }> = {
  dashboard: { x: 50, y: 50 },
  tarefas: { x: 23, y: 63 },
  calendario: { x: 37, y: 15 },
  disciplinas: { x: 88, y: 40 },
  radio: { x: 70, y: 61 },
  estatisticas: { x: 61, y: 63 },
  foco: { x: 9, y: 62 },
  ajustes: { x: 32, y: 38 },
};

interface Spot {
  key: ModuleKey;
  label: string;
  /** retângulo do hotspot em % da imagem */
  left: number;
  top: number;
  width: number;
  height: number;
  /** posição do farol dentro do botão (%) + cor + atraso da pulsação */
  bx: number;
  by: number;
  color: string;
  delay: number;
}

const SPOTS: Spot[] = [
  { key: "dashboard", label: "💻 Dashboard & Estuda", left: 35.5, top: 36, width: 28, height: 31, bx: 50, by: 58, color: "#e8a87c", delay: 0 },
  { key: "tarefas", label: "📝 Tarefas", left: 16, top: 55, width: 16, height: 14, bx: 52, by: 48, color: "#e8a87c", delay: 400 },
  { key: "calendario", label: "📅 Calendário", left: 32, top: 8, width: 15, height: 19, bx: 50, by: 60, color: "#e8a87c", delay: 900 },
  { key: "disciplinas", label: "📚 Disciplinas", left: 75.5, top: 4, width: 23, height: 73, bx: 42, by: 32, color: "#9caf88", delay: 1300 },
  { key: "radio", label: "📻 Rádio", left: 65, top: 55, width: 11, height: 13, bx: 50, by: 52, color: "#e8a87c", delay: 700 },
  { key: "estatisticas", label: "☕ Estatísticas", left: 59.3, top: 57.5, width: 5.2, height: 11, bx: 50, by: 42, color: "#c97b63", delay: 1700 },
];

/** moldura de objeto clicável (estilo cenário point-and-click) */
function Frame({ color, delay = 0 }: { color: string; delay?: number }) {
  return (
    <span
      className="nk-frame"
      style={{ ["--c" as string]: color, animationDelay: `${delay}ms` } as React.CSSProperties}
      aria-hidden
    />
  );
}

export function RoomSceneImage({
  onOpen,
  zoomTarget,
}: {
  onOpen: (key: ModuleKey, origin: { x: number; y: number }) => void;
  zoomTarget?: ModuleKey | null;
}) {
  const router = useRouter();
  const subjects = useNook((s) => s.subjects);
  const sessions = useNook((s) => s.sessions);
  const rainVisual = useNook((s) => s.rainVisual);
  const setRainVisual = useNook((s) => s.setRainVisual);
  const setRadio = useNook((s) => s.setRadio);
  const radioPlaying = useNook((s) => s.radio.playing);
  const uiSounds = useNook((s) => s.uiSounds);

  // "acendendo a luz": a cena nasce do escuro, a luminária acende primeiro
  const [lit, setLit] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setLit(true));
    return () => cancelAnimationFrame(r);
  }, []);
  const calmMotion = useNook((s) => s.calmMotion);
  const params = useSearchParams();

  // ?t=noite|manha|tarde|entardecer força um horário (útil para prévia)
  const FORCE: Record<string, Phase> = {
    noite: "noite",
    manha: "manhã",
    tarde: "tarde",
    entardecer: "entardecer",
  };
  const forced = FORCE[params.get("t") ?? ""];
  const phase = forced ?? phaseOf(new Date().getHours());
  const videoSrc = !calmMotion ? ROOM_VIDEO[phase] : undefined;
  const today = todayIso();
  const steamToday = sessions.some((s) => s.date === today);
  const urgent = useMemo(() => {
    const all = subjects
      .flatMap((s) => s.assessments.map((a) => ({ s, a })))
      .filter(
        ({ a }) =>
          a.grade == null &&
          daysBetween(today, a.date) >= 0 &&
          daysBetween(today, a.date) <= 2
      )
      .sort((x, y) => x.a.date.localeCompare(y.a.date));
    return all[0] ?? null;
  }, [subjects, today]);

  function openMod(e: React.SyntheticEvent, key: ModuleKey) {
    const r = (e.currentTarget as Element).getBoundingClientRect();
    onOpen(key, {
      x: ((r.left + r.width / 2) / window.innerWidth) * 100,
      y: ((r.top + r.height / 2) / window.innerHeight) * 100,
    });
  }

  const zoomPt = zoomTarget ? ZOOM_POINT[zoomTarget] : null;
  const camStyle: React.CSSProperties = zoomPt
    ? {
        transform: "scale(2.1)",
        transformOrigin: `${zoomPt.x}% ${zoomPt.y}%`,
        transition: "transform 700ms var(--nk-ease-room)",
      }
    : {
        transform: "scale(1)",
        transition: "transform 700ms var(--nk-ease-room)",
      };

  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-void"
      style={{ pointerEvents: zoomTarget ? "none" : undefined }}
    >
      {/* fundo borrado da mesma arte preenche as bordas (sem barras chapadas) */}
      <img
        src={ROOM_IMG[phase]}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full select-none object-cover"
        style={{
          filter: `blur(22px) brightness(${lit ? 0.78 : 0.03}) saturate(1.15)`,
          transform: "scale(1.12)",
          transition: "filter 1300ms var(--nk-ease-ui) 250ms",
        }}
        draggable={false}
      />

      {/* caixa 3:2 — mostra a cena inteira (contain) com sangria mínima */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: "max(100vw, 150vh)",
          aspectRatio: "3 / 2",
          filter: lit ? "brightness(1)" : "brightness(0.04)",
          transition: "filter 1300ms var(--nk-ease-ui) 250ms",
        }}
      >
        {/* a câmera */}
        <div className="h-full w-full" style={camStyle}>
          <div className="relative h-full w-full">
            {videoSrc ? (
              <video
                key={videoSrc}
                src={videoSrc}
                poster={ROOM_IMG[phase]}
                className="h-full w-full select-none object-cover"
                autoPlay
                loop
                muted
                playsInline
                aria-label="Quarto de estudos do Nook"
              />
            ) : (
              <img
                src={ROOM_IMG[phase]}
                alt="Quarto de estudos do Nook"
                className="h-full w-full select-none object-cover"
                draggable={false}
              />
            )}

            {/* ── camadas vivas sobre a arte ─────────────────────────── */}

            {/* chuva na janela */}
            {rainVisual && (
              <svg
                className="pointer-events-none absolute"
                style={{ left: "2.5%", top: "3.5%", width: "27.5%", height: "27.5%" }}
                viewBox="0 0 400 420"
                preserveAspectRatio="none"
              >
                <g className="nk-rain-layer" stroke="#8fa8bf" strokeWidth="2.5" opacity="0.4">
                  {Array.from({ length: 14 }).map((_, i) => (
                    <line
                      key={i}
                      x1={14 + i * 28}
                      y1={-420 + ((i * 67) % 240)}
                      x2={8 + i * 28}
                      y2={-386 + ((i * 67) % 240)}
                    />
                  ))}
                </g>
              </svg>
            )}

            {/* o dia de hoje, pendurado no calendário da parede */}
            <span
              className="pointer-events-none absolute z-[4] -rotate-2 rounded-[5px] px-1.5 py-0.5 font-mono text-[clamp(8px,0.8vw,12px)] tabular-nums"
              style={{
                left: "40.2%",
                top: "23.4%",
                background: "#e8a87c",
                color: "#16130e",
                boxShadow: "0 2px 8px #00000070",
              }}
              aria-hidden
            >
              {new Date().getDate()}
            </span>

            {/* post-it de urgência no monitor */}
            {urgent && (
              <button
                onClick={() => router.push(`/?open=disciplinas&id=${urgent.s.id}`)}
                className="absolute z-10 rotate-3 rounded-[2px] px-1.5 py-1 text-center shadow-[0_3px_8px_#00000060] transition-transform hover:rotate-1 hover:scale-105"
                style={{ left: "58.5%", top: "35%", width: "5.5%", background: "#c9c2a0" }}
                title={`${urgent.a.title} · ${urgent.s.name}`}
              >
                <span className="block text-[clamp(7px,0.7vw,11px)] font-bold leading-tight text-[#33302a]">
                  {urgent.a.kind === "prova" ? "PROVA" : "ENTREGA"}
                </span>
                <span className="block text-[clamp(6px,0.62vw,10px)] leading-tight text-[#33302a]">
                  {relativeDay(urgent.a.date)}
                </span>
              </button>
            )}

            {/* vapor da caneca (sessão de foco feita hoje) */}
            {steamToday && (
              <svg
                className="pointer-events-none absolute"
                style={{ left: "59.2%", top: "51.5%", width: "4.5%", height: "8%" }}
                viewBox="0 0 40 60"
              >
                <g stroke="#cfc8ba" strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.65">
                  <path className="nk-steam" d="M14 56 q5 -10 0 -20 q-5 -10 0 -18" />
                  <path className="nk-steam" style={{ animationDelay: "1.2s" }} d="M26 56 q-5 -10 0 -20 q5 -10 0 -18" />
                </g>
              </svg>
            )}

            {/* LED do rádio */}
            {radioPlaying && (
              <span
                className="nk-led-on pointer-events-none absolute rounded-full bg-moss"
                style={{
                  left: "73.4%",
                  top: "57.2%",
                  width: "0.55%",
                  aspectRatio: "1",
                  boxShadow: "0 0 8px 2px #9caf8890",
                }}
              />
            )}

            {/* ── hotspots dos módulos ──────────────────────────────── */}
            {SPOTS.map((s) => (
              <button
                key={s.key}
                className="nk-hotspot group absolute"
                style={{
                  left: `${s.left}%`,
                  top: `${s.top}%`,
                  width: `${s.width}%`,
                  height: `${s.height}%`,
                }}
                aria-label={s.label.replace(/^\S+\s/, "Abrir ")}
                onClick={(e) => openMod(e, s.key)}
              >
                <Frame color={s.color} delay={s.delay} />
                <span
                  className="nk-label absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-raised/95 px-3 py-1.5 text-sm text-ink-high shadow-[0_4px_16px_#00000060,0_0_0_1px_#ffffff12]"
                  aria-hidden
                >
                  {s.label}
                </span>
              </button>
            ))}

            {/* janela: alterna a chuva */}
            <button
              className="nk-hotspot group absolute"
              style={{ left: "2.5%", top: "3.5%", width: "27.5%", height: "28%" }}
              aria-label={rainVisual ? "Parar a chuva" : "Deixar chover"}
              onClick={() => {
                const next = !rainVisual;
                setRainVisual(next);
                // o que se vê também se ouve: a chuva visual liga a sonora
                setRadio({ rainLayer: next });
              }}
            >
              <Frame color="#8fa8bf" delay={1100} />
              <span
                className="nk-label absolute -bottom-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-raised/95 px-3 py-1.5 text-sm text-ink-high shadow-[0_4px_16px_#00000060,0_0_0_1px_#ffffff12]"
                aria-hidden
              >
                {rainVisual ? "Parar a chuva 🌙" : "Deixar chover 🌧"}
              </span>
            </button>

            {/* luminária: modo foco */}
            <button
              className="nk-hotspot group absolute"
              style={{ left: "3.5%", top: "47%", width: "11%", height: "30%" }}
              aria-label="Iniciar modo foco"
              onClick={(e) => openMod(e, "foco")}
            >
              <Frame color="#e8a87c" delay={2100} />
              <span
                className="nk-label absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-raised/95 px-3 py-1.5 text-sm text-ink-high shadow-[0_4px_16px_#00000060,0_0_0_1px_#ffffff12]"
                aria-hidden
              >
                🎯 Modo foco
              </span>
            </button>

            {/* o gato — fazer carinho (ele ronrona) */}
            <button
              className="absolute cursor-pointer"
              style={{ left: "1.5%", top: "76%", width: "19%", height: "20%" }}
              aria-label="Fazer carinho no gato"
              title="rrrr…"
              onMouseEnter={() => uiSounds && audioPurrStart()}
              onMouseLeave={() => audioPurrStop()}
              onClick={() => {
                if (!uiSounds) return;
                audioPurrStart();
                window.setTimeout(() => audioPurrStop(), 2200);
              }}
            />

            {/* pôster: processo de design */}
            <button
              className="nk-hotspot group absolute"
              style={{ left: "53%", top: "9%", width: "12%", height: "21%" }}
              aria-label="Ver processo de design"
              onClick={() => router.push("/processo")}
            >
              <Frame color="#a99bc4" delay={1500} />
              <span
                className="nk-label absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-raised/95 px-3 py-1.5 text-sm text-ink-high shadow-[0_4px_16px_#00000060,0_0_0_1px_#ffffff12]"
                aria-hidden
              >
                ✦ Processo de design
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* clarão quente da luminária acendendo primeiro */}
      <div
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            "radial-gradient(ellipse 34% 44% at 11% 62%, #f0c08938, transparent 70%)",
          opacity: lit ? 0 : 1,
          transition: "opacity 1500ms var(--nk-ease-ui) 650ms",
        }}
        aria-hidden
      />

      {/* vinheta cinematográfica por cima da arte */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 66% at 50% 44%, transparent 64%, #04060a88 100%)",
        }}
      />
    </div>
  );
}
