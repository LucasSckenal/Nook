"use client";

import { useMounted } from "@/components/useMounted";
import { useNook } from "@/lib/store";
import type { StationId } from "@/lib/types";

const STATIONS: { id: StationId; icon: string; name: string; desc: string }[] = [
  { id: "lofi", icon: "🎧", name: "LoFi", desc: "pad quente, vinil estalando" },
  { id: "chuva", icon: "🌧", name: "Chuva", desc: "fina, constante, na janela" },
  { id: "biblioteca", icon: "🤫", name: "Biblioteca", desc: "quase silêncio, ar distante" },
  { id: "cafeteria", icon: "☕", name: "Cafeteria", desc: "burburinho morno de fundo" },
  { id: "white", icon: "🌫", name: "White noise", desc: "cobertor de som uniforme" },
];

export default function RadioPage() {
  const mounted = useMounted();
  const radio = useNook((s) => s.radio);
  const setRadio = useNook((s) => s.setRadio);

  if (!mounted) return <div className="nk-skeleton h-[60vh] w-full" />;

  return (
    <div className="mx-auto max-w-[680px]">
      {/* o aparelho */}
      <div className="nk-raised nk-reveal mb-6 p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-ink-low">tocando agora</p>
            <p className="font-display text-2xl text-ink-high">
              {STATIONS.find((s) => s.id === radio.station)?.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                radio.playing ? "nk-led-on bg-moss" : "bg-ink-faint"
              }`}
              aria-hidden
            />
            <button
              onClick={() => setRadio({ playing: !radio.playing })}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-amber text-xl text-void shadow-[0_0_24px_#e8a87c40] transition-transform hover:scale-105"
              aria-label={radio.playing ? "Pausar" : "Tocar"}
            >
              {radio.playing ? "⏸" : "▶"}
            </button>
          </div>
        </div>

        {/* dial de estações */}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
          {STATIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => setRadio({ station: s.id, playing: true })}
              className={`rounded-(--radius-md) px-3 py-4 text-center transition-all duration-(--nk-dur-quick) ${
                radio.station === s.id
                  ? "bg-amber/15 shadow-[0_0_0_1.5px_#e8a87c80]"
                  : "bg-surface hover:bg-raised"
              }`}
            >
              <span className="text-xl">{s.icon}</span>
              <p
                className={`mt-1.5 text-sm ${
                  radio.station === s.id ? "font-medium text-amber" : "text-ink-high"
                }`}
              >
                {s.name}
              </p>
              <p className="mt-0.5 text-[11px] leading-tight text-ink-low">{s.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* mixer */}
      <div className="nk-card nk-reveal nk-reveal-1 mb-6 space-y-5 p-6">
        <div>
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-ink-mid">volume</span>
            <span className="text-ink-low">{Math.round(radio.volume * 100)}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={radio.volume}
            onChange={(e) => setRadio({ volume: Number(e.target.value) })}
            className="w-full accent-(--color-amber)"
            aria-label="Volume"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-ink-mid">camada de chuva 🌧</p>
            <p className="text-xs text-ink-low">misture chuva por baixo de qualquer estação</p>
          </div>
          <button
            role="switch"
            aria-checked={radio.rainLayer}
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
        nesta demo todo o som é <em>sintetizado no navegador</em> (Web Audio API) — zero arquivos.
        <br />
        em produção: loops licenciados com crossfade, cache offline e a mesma mesa de mixagem.
      </p>
    </div>
  );
}
