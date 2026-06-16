"use client";

import { useState } from "react";
import { useNook } from "@/lib/store";
import { greeting } from "@/lib/dates";
import { MODULE_ORIGIN, type ModuleKey } from "./room/ModuleOverlay";

/**
 * Onboarding diegético: o próprio quarto ensina. Depois das boas-vindas,
 * um holofote acende sobre cada objeto real da cena (que continua visível
 * atrás) — nada de modal listando ícones.
 *
 * O centro de cada holofote vem de MODULE_ORIGIN — a MESMA fonte que a câmera
 * usa para mergulhar no objeto — então o tour nunca sai de sincronia com a
 * cena, mesmo que os objetos sejam reposicionados.
 */

interface TourStop {
  key: ModuleKey; // de onde vem o centro do holofote (MODULE_ORIGIN)
  r: number; // raio do holofote (px)
  title: string;
  text: string;
  // posição do balão (% da caixa) — mantido perto do centro p/ caber em telas estreitas
  bx: number;
  by: number;
}

const TOUR: TourStop[] = [
  {
    key: "dashboard", r: 210,
    title: "💻 O computador",
    text: "Seu dia em uma tela: aulas, prazos e a Estuda — a assistente que conhece o seu semestre.",
    bx: 50, by: 76,
  },
  {
    key: "tarefas", r: 190,
    title: "📝 O caderno",
    text: "Tarefas e anotações moram aqui. Concluir é reversível — tudo tem desfazer.",
    bx: 50, by: 30,
  },
  {
    key: "disciplinas", r: 175,
    title: "📚 A estante",
    text: "Cada lombada é uma disciplina: notas, faltas e a média do semestre (CR) num lugar só.",
    bx: 55, by: 52,
  },
  {
    key: "foco", r: 130,
    title: "☕ O café",
    text: "Toque na xícara para uma sessão de foco: a luz do quarto apaga e só o relógio fica.",
    bx: 48, by: 24,
  },
];

export function Onboarding() {
  const onboarded = useNook((s) => s.onboarded);
  const setOnboarded = useNook((s) => s.setOnboarded);
  const userName = useNook((s) => s.userName);
  const setUserName = useNook((s) => s.setUserName);

  const [step, setStep] = useState(0); // 0 boas-vindas · 1 nome · 2.. tour
  const [name, setName] = useState(userName === "Marina" ? "" : userName);

  if (onboarded) return null;

  function finish() {
    if (name.trim()) setUserName(name.trim());
    setOnboarded(true);
  }

  const tourIdx = step - 2;
  const stop = TOUR[tourIdx];
  const origin = stop ? MODULE_ORIGIN[stop.key] : null;

  /* ── tour: holofotes sobre o quarto real ─────────────────────────── */
  if (stop && origin) {
    return (
      <div className="fixed inset-0 z-[60]">
        {/* a caixa 3:2 da cena, replicada para mirar os objetos — segue o mesmo
            enquadramento da cena (cover no desktop, quarto inteiro no mobile) */}
        <div className="absolute left-1/2 top-1/2 aspect-[3/2] w-[max(100vw,150vh)] -translate-x-1/2 -translate-y-1/2 max-[640px]:w-screen">
          {/* escuridão com o buraco do holofote (sombra gigante cobre o resto) */}
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle ${stop.r}px at ${origin.x}% ${origin.y}%, transparent ${Math.round(stop.r * 0.62)}px, #04060ae0 ${stop.r}px)`,
              boxShadow: "0 0 0 100vmax #04060ae0",
              transition: "background 600ms var(--nk-ease-ui)",
            }}
            aria-hidden
          />
          {/* anel quente do holofote */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${origin.x}%`,
              top: `${origin.y}%`,
              width: stop.r * 1.25,
              height: stop.r * 1.25,
              boxShadow: "0 0 0 1.5px #e8a87c55, 0 0 50px 8px #e8a87c22",
              transition: "all 600ms var(--nk-ease-room)",
            }}
            aria-hidden
          />

          {/* balão do passo */}
          <div
            className="nk-raised absolute w-[min(340px,86vw)] -translate-x-1/2 p-5"
            style={{
              left: `${stop.bx}%`,
              top: `${stop.by}%`,
              transition: "left 600ms var(--nk-ease-room), top 600ms var(--nk-ease-room)",
            }}
          >
            <p className="font-display text-lg text-ink-high">{stop.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-mid">{stop.text}</p>
            <div className="mt-4 flex items-center justify-between">
              <div className="flex gap-1.5">
                {TOUR.map((_, i) => (
                  <span
                    key={i}
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: i === tourIdx ? 20 : 7,
                      background: i <= tourIdx ? "var(--color-amber)" : "var(--color-ink-faint)",
                    }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={finish}
                  className="text-xs text-ink-low transition-colors hover:text-ink-mid"
                >
                  pular
                </button>
                <button
                  onClick={() => (tourIdx === TOUR.length - 1 ? finish() : setStep(step + 1))}
                  className="rounded-(--radius-md) bg-amber px-4 py-2 text-sm font-medium text-void transition-transform hover:scale-[1.02]"
                >
                  {tourIdx === TOUR.length - 1 ? "o quarto é seu" : "próximo"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── boas-vindas + nome (o quarto à meia-luz atrás) ──────────────── */
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6"
      style={{
        background:
          "radial-gradient(ellipse 60% 55% at 50% 45%, #04060a55, #04060ac4 80%)",
        backdropFilter: "blur(5px)",
        WebkitBackdropFilter: "blur(5px)",
      }}
    >
      <div
        className="w-[min(520px,94vw)] rounded-(--radius-lg) p-8 sm:p-10"
        style={{
          background: "color-mix(in srgb, var(--color-room) 82%, transparent)",
          backdropFilter: "blur(20px) saturate(1.15)",
          WebkitBackdropFilter: "blur(20px) saturate(1.15)",
          boxShadow:
            "0 32px 90px #00000080, 0 0 0 1px #ffffff14, inset 0 1px 0 #ffffff0f",
        }}
      >
        <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-1.5">
            {[0, 1].map((i) => (
              <span
                key={i}
                className="h-1.5 rounded-full transition-all duration-(--nk-dur-quick)"
                style={{
                  width: i === step ? 24 : 8,
                  background: i <= step ? "var(--color-amber)" : "var(--color-ink-faint)",
                }}
              />
            ))}
          </div>
          <button
            onClick={finish}
            className="text-xs text-ink-low transition-colors hover:text-ink-mid"
          >
            pular
          </button>
        </div>

        {step === 0 && (
          <div className="nk-reveal">
            <p className="text-sm text-amber">{greeting()}.</p>
            <h1 className="mt-2 font-display text-3xl leading-tight text-ink-high">
              Bem-vindo ao seu Nook.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-ink-mid">
              Isto não é mais um app de produtividade. É um quarto virtual de estudos —
              à meia-luz, com um lo-fi tocando baixo — feito pra você{" "}
              <span className="text-ink-high">querer voltar</span>. A organização
              acontece como consequência do aconchego.
            </p>
            <button
              onClick={() => setStep(1)}
              className="mt-8 w-full rounded-(--radius-md) bg-amber py-3.5 font-medium text-void shadow-[0_0_32px_#e8a87c30] transition-transform hover:scale-[1.01]"
            >
              entrar
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="nk-reveal">
            <h1 className="font-display text-2xl text-ink-high">
              Como podemos te chamar?
            </h1>
            <p className="mt-2 text-sm text-ink-mid">
              A Estuda e o quarto vão te cumprimentar por aqui.
            </p>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && setStep(2)}
              placeholder="seu nome ou apelido"
              className="mt-5 w-full rounded-(--radius-md) bg-surface px-4 py-3 text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
            />
            <div className="mt-8 flex gap-2">
              <button
                onClick={() => setStep(0)}
                className="rounded-(--radius-md) bg-surface px-5 py-3 text-sm text-ink-mid transition-colors hover:text-ink-high"
              >
                voltar
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-(--radius-md) bg-amber py-3 font-medium text-void transition-transform hover:scale-[1.01]"
              >
                conhecer o quarto
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
