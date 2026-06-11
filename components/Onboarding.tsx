"use client";

import { useState } from "react";
import { useNook } from "@/lib/store";
import { greeting } from "@/lib/dates";

const OBJETOS = [
  { icon: "💻", name: "Computador", desc: "seu dia e a Estuda, a IA que conhece o semestre" },
  { icon: "📝", name: "Caderno", desc: "tarefas e anotações" },
  { icon: "📅", name: "Calendário", desc: "aulas, provas e entregas da semana" },
  { icon: "📚", name: "Estante", desc: "suas disciplinas e notas" },
  { icon: "📻", name: "Rádio", desc: "LoFi, chuva e outros sons pra focar" },
  { icon: "☕", name: "Caneca", desc: "suas estatísticas, sem cobrança" },
];

export function Onboarding() {
  const onboarded = useNook((s) => s.onboarded);
  const setOnboarded = useNook((s) => s.setOnboarded);
  const userName = useNook((s) => s.userName);
  const setUserName = useNook((s) => s.setUserName);

  const [step, setStep] = useState(0);
  const [name, setName] = useState(userName === "Marina" ? "" : userName);

  if (onboarded) return null;

  function finish() {
    if (name.trim()) setUserName(name.trim());
    setOnboarded(true);
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-6"
      style={{
        background:
          "radial-gradient(ellipse 80% 60% at 50% 35%, #1a1620, #0b0e14 75%)",
      }}
    >
      <div className="nk-raised w-[min(520px,94vw)] p-8 sm:p-10">
        {/* progresso */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
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
          {step < 2 && (
            <button
              onClick={finish}
              className="text-xs text-ink-low transition-colors hover:text-ink-mid"
            >
              pular
            </button>
          )}
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
                continuar
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="nk-reveal">
            <h1 className="font-display text-2xl text-ink-high">
              {name.trim() ? `Tudo pronto, ${name.trim()}.` : "Tudo pronto."}
            </h1>
            <p className="mt-2 text-sm text-ink-mid">
              No Nook, <span className="text-ink-high">o quarto é a navegação</span>.
              Toque num objeto e a câmera se aproxima. Sem menus frios.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {OBJETOS.map((o) => (
                <div
                  key={o.name}
                  className="flex items-start gap-2.5 rounded-(--radius-md) bg-surface px-3 py-2.5"
                >
                  <span className="text-lg">{o.icon}</span>
                  <div>
                    <p className="text-sm text-ink-high">{o.name}</p>
                    <p className="text-xs leading-snug text-ink-low">{o.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-center text-xs text-ink-low">
              dica: <kbd className="rounded bg-surface px-1.5 py-0.5">Ctrl K</kbd> busca,
              cria e navega de qualquer lugar
            </p>
            <button
              onClick={finish}
              className="mt-6 w-full rounded-(--radius-md) bg-amber py-3.5 font-medium text-void shadow-[0_0_32px_#e8a87c30] transition-transform hover:scale-[1.01]"
            >
              entrar no quarto
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
