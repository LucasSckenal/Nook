"use client";

import { useRef } from "react";
import { useMounted } from "@/components/useMounted";
import { useNook } from "@/lib/store";
import type { StationId } from "@/lib/types";

const STATIONS: { id: StationId; freq: string; name: string; desc: string }[] = [
  { id: "lofi", freq: "88.9", name: "LoFi", desc: "pad quente, vinil estalando" },
  { id: "chuva", freq: "93.5", name: "Chuva", desc: "fina, constante, na janela" },
  { id: "biblioteca", freq: "98.1", name: "Biblioteca", desc: "quase silêncio, ar distante" },
  { id: "cafeteria", freq: "102.7", name: "Cafeteria", desc: "burburinho morno de fundo" },
  { id: "white", freq: "107.3", name: "Ventilador", desc: "pás girando no canto do quarto" },
];

/* ── knob radial: clássico no toque, moderno na leitura ─────────────── */

function polar(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function arcPath(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  return `M ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

const SWEEP = 270; // graus úteis do knob (-135° a +135°)

function Knob({
  value,
  onChange,
  label,
  readout,
  color = "#e8a87c",
  step = 0.05,
  ariaLabel,
  ariaText,
}: {
  value: number; // 0..1
  onChange: (v: number) => void;
  label: string;
  readout: string;
  color?: string;
  step?: number;
  ariaLabel: string;
  ariaText: string;
}) {
  const drag = useRef<{ y: number; v: number } | null>(null);
  const angle = -135 + value * SWEEP;
  const clamp = (v: number) => Math.min(1, Math.max(0, v));

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(value * 100)}
        aria-valuetext={ariaText}
        className="cursor-ns-resize touch-none select-none rounded-full focus:outline-none focus-visible:shadow-[0_0_0_3px_var(--nk-amber-glow)]"
        onPointerDown={(e) => {
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          drag.current = { y: e.clientY, v: value };
        }}
        onPointerMove={(e) => {
          if (!drag.current) return;
          onChange(clamp(drag.current.v + (drag.current.y - e.clientY) / 160));
        }}
        onPointerUp={() => (drag.current = null)}
        onWheel={(e) => onChange(clamp(value + (e.deltaY < 0 ? step : -step)))}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp" || e.key === "ArrowRight") onChange(clamp(value + step));
          if (e.key === "ArrowDown" || e.key === "ArrowLeft") onChange(clamp(value - step));
        }}
      >
        <svg width="116" height="116" viewBox="0 0 116 116" aria-hidden>
          {/* trilho do arco */}
          <path d={arcPath(58, 58, 50, -135, 135)} fill="none" stroke="#ffffff14" strokeWidth="5" strokeLinecap="round" />
          {/* arco de valor */}
          {value > 0.005 && (
            <path
              d={arcPath(58, 58, 50, -135, angle)}
              fill="none"
              stroke={color}
              strokeWidth="5"
              strokeLinecap="round"
              style={{ filter: `drop-shadow(0 0 5px ${color}80)` }}
            />
          )}
          {/* corpo do knob */}
          <circle cx="58" cy="58" r="38" fill="url(#knobBody)" stroke="#00000080" strokeWidth="1.5" />
          <circle cx="58" cy="58" r="38" fill="none" stroke="#ffffff14" strokeWidth="1" />
          {/* serrilha lateral (toque clássico) */}
          {Array.from({ length: 24 }).map((_, i) => {
            const [x0, y0] = polar(58, 58, 35, i * 15);
            const [x1, y1] = polar(58, 58, 38, i * 15);
            return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke="#00000060" strokeWidth="1.5" />;
          })}
          {/* indicador */}
          <g transform={`rotate(${angle} 58 58)`}>
            <line x1="58" y1="34" x2="58" y2="22" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
          </g>
          <defs>
            <radialGradient id="knobBody" cx="0.38" cy="0.32" r="1">
              <stop offset="0" stopColor="#39415a" />
              <stop offset="0.55" stopColor="#232a3c" />
              <stop offset="1" stopColor="#141925" />
            </radialGradient>
          </defs>
        </svg>
      </div>
      <p className="text-[11px] uppercase tracking-widest text-ink-low">{label}</p>
      <p className="font-mono text-sm tabular-nums" style={{ color }}>
        {readout}
      </p>
    </div>
  );
}

/* ── o aparelho ─────────────────────────────────────────────────────── */

export default function RadioPage() {
  const mounted = useMounted();
  const radio = useNook((s) => s.radio);
  const setRadio = useNook((s) => s.setRadio);

  if (!mounted) return <div className="nk-skeleton h-[60vh] w-full" />;

  const idx = Math.max(0, STATIONS.findIndex((s) => s.id === radio.station));
  const current = STATIONS[idx];
  const needle = 7 + (idx / (STATIONS.length - 1)) * 86; // % no vidro do dial

  function tuneTo(i: number) {
    const next = STATIONS[Math.min(STATIONS.length - 1, Math.max(0, i))];
    if (next.id !== radio.station) setRadio({ station: next.id, playing: true });
  }

  return (
    <div className="mx-auto max-w-[680px]">
      {/* o aparelho: madeira, vidro e latão */}
      <div
        className="nk-reveal mb-6 rounded-(--radius-lg) p-6 sm:p-8"
        style={{
          background: "linear-gradient(165deg, #2b211a 0%, #221a14 55%, #1b140f 100%)",
          boxShadow:
            "0 24px 60px #00000060, 0 0 0 1px #00000080, inset 0 1px 0 #ffffff14, inset 0 0 40px #00000040",
        }}
      >
        {/* vidro do dial de sintonia */}
        <div
          className="relative h-[88px] overflow-hidden rounded-(--radius-md)"
          style={{
            background: "linear-gradient(180deg, #12161f, #1a202e 70%, #12161f)",
            boxShadow: "inset 0 2px 12px #000000a0, 0 1px 0 #ffffff10",
          }}
        >
          {/* régua de ticks */}
          <div
            className="absolute inset-x-3 top-[34px] h-3 opacity-60"
            style={{
              background:
                "repeating-linear-gradient(90deg, #6b6a66 0 1px, transparent 1px 9px)",
            }}
            aria-hidden
          />
          {/* estações sobre o vidro */}
          {STATIONS.map((s, i) => {
            const left = 7 + (i / (STATIONS.length - 1)) * 86;
            const active = i === idx;
            return (
              <button
                key={s.id}
                onClick={() => tuneTo(i)}
                className="absolute top-0 flex h-full -translate-x-1/2 flex-col items-center justify-between py-2 transition-colors"
                style={{ left: `${left}%` }}
                title={`${s.name} · ${s.desc}`}
              >
                <span
                  className={`whitespace-nowrap text-[11px] tracking-wide transition-all ${
                    active ? "font-medium text-amber" : "text-ink-low hover:text-ink-mid"
                  }`}
                  style={active ? { textShadow: "0 0 12px #e8a87c80" } : undefined}
                >
                  {s.name}
                </span>
                <span className={`font-mono text-[10px] ${active ? "text-amber/80" : "text-ink-faint"}`}>
                  {s.freq}
                </span>
              </button>
            );
          })}
          {/* agulha */}
          <div
            className="pointer-events-none absolute top-1.5 bottom-1.5 w-[2px] rounded-full"
            style={{
              left: `${needle}%`,
              background: "#e8a87c",
              boxShadow: "0 0 10px 2px #e8a87c80",
              transition: "left 480ms var(--nk-ease-room)",
            }}
            aria-hidden
          />
        </div>

        {/* painel: volume · alto-falante · sintonia */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
          <Knob
            value={radio.volume}
            onChange={(v) => setRadio({ volume: v })}
            label="volume"
            readout={`${Math.round(radio.volume * 100)}%`}
            ariaLabel="Volume"
            ariaText={`${Math.round(radio.volume * 100)} por cento`}
          />

          {/* alto-falante + play */}
          <div className="flex min-w-[180px] flex-1 flex-col items-center gap-4">
            <div
              className="h-[92px] w-full max-w-[260px] rounded-(--radius-md)"
              style={{
                background:
                  "repeating-linear-gradient(0deg, #00000088 0 3px, #2b211a 3px 7px)",
                boxShadow: "inset 0 0 18px #000000c0, 0 1px 0 #ffffff0a",
              }}
              aria-hidden
            />
            <div className="flex items-center gap-4">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  radio.playing ? "nk-led-on bg-moss" : "bg-ink-faint"
                }`}
                aria-hidden
              />
              <button
                onClick={() => setRadio({ playing: !radio.playing })}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-amber text-void shadow-[0_4px_18px_#e8a87c50,inset_0_-2px_4px_#00000040] transition-transform hover:scale-105 active:scale-95"
                aria-label={radio.playing ? "Pausar" : "Tocar"}
              >
                {radio.playing ? (
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden>
                    <rect x="6" y="5" width="4" height="14" rx="1.2" />
                    <rect x="14" y="5" width="4" height="14" rx="1.2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-6 w-6 translate-x-[1px]" fill="currentColor" aria-hidden>
                    <path d="M8 5.5 19.5 12 8 18.5 Z" />
                  </svg>
                )}
              </button>
              <p className="w-20 text-xs leading-tight text-ink-low">{current.desc}</p>
            </div>
          </div>

          <Knob
            value={idx / (STATIONS.length - 1)}
            onChange={(v) => tuneTo(Math.round(v * (STATIONS.length - 1)))}
            label="sintonia"
            readout={current.freq}
            step={1 / (STATIONS.length - 1)}
            ariaLabel="Sintonia de estação"
            ariaText={`${current.name}, ${current.freq} FM`}
          />
        </div>
      </div>

      {/* mixer ambiente */}
      <div className="nk-card nk-reveal nk-reveal-1 mb-6 space-y-5 p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ink-mid">camada de chuva 🌧</p>
            <p className="text-xs text-ink-low">misture chuva por baixo de qualquer estação</p>
          </div>
          <button
            role="switch"
            aria-checked={radio.rainLayer}
            aria-label="Camada de chuva"
            onClick={() => setRadio({ rainLayer: !radio.rainLayer })}
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              radio.rainLayer ? "bg-mist" : "bg-ink-faint"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-ink-high transition-all ${
                radio.rainLayer ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
        {radio.rainLayer && (
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={radio.rainVolume}
            onChange={(e) => setRadio({ rainVolume: Number(e.target.value) })}
            className="w-full accent-(--color-mist)"
            aria-label="Volume da chuva"
          />
        )}

        <div className="flex items-center justify-between gap-4 border-t border-ink-faint/30 pt-5">
          <div>
            <p className="text-sm text-ink-mid">timer de som 🌙</p>
            <p className="text-xs text-ink-low">desligar sozinho depois de…</p>
          </div>
          <div className="flex gap-1.5">
            {[null, 15, 30, 60].map((m) => (
              <button
                key={String(m)}
                onClick={() => setRadio({ sleepMinutes: m })}
                className={`rounded-(--radius-sm) px-3 py-1.5 text-xs transition-colors ${
                  radio.sleepMinutes === m
                    ? "bg-amber/20 text-amber"
                    : "bg-surface text-ink-mid hover:text-ink-high"
                }`}
              >
                {m == null ? "não" : `${m}min`}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="nk-reveal nk-reveal-2 text-center text-xs leading-relaxed text-ink-low">
        gire os botões com o mouse (arrastar, scroll) ou setas do teclado.
        <br />
        nesta demo todo o som é <em>sintetizado no navegador</em> (Web Audio API) — zero arquivos.
      </p>
    </div>
  );
}
