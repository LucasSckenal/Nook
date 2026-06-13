"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ESTUDA_SUGGESTIONS, estudaRespond, type EstudaArtifact } from "@/lib/estuda";
import { estudaGemini } from "@/lib/gemini";
import { useNook } from "@/lib/store";

interface Msg {
  role: "user" | "estuda";
  text: string;
  artifact?: EstudaArtifact;
}

/** negrito simples em **texto**, sem lib de markdown */
function rich(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") ? (
      <strong key={i} className="font-semibold text-ink-high">
        {p.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{p}</span>
    )
  );
}

export function EstudaChat() {
  const subjects = useNook((s) => s.subjects);
  const tasks = useNook((s) => s.tasks);
  const sessions = useNook((s) => s.sessions);
  const geminiKey = useNook((s) => s.geminiKey);
  const live = geminiKey.trim().length > 0;

  const [msgs, setMsgs] = useState<Msg[]>([
    {
      role: "estuda",
      text: "Oi! Eu sou a **Estuda** 🪻 — conheço seu semestre inteiro: disciplinas, provas, tarefas e seu ritmo de estudo. Me pede um plano, um panorama ou uns flashcards.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, thinking]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || thinking) return;
    const history = msgs
      .filter((m) => !m.artifact) // só texto puro vira histórico
      .map((m) => ({ role: m.role, text: m.text }));
    setMsgs((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setThinking(true);

    if (live) {
      try {
        const reply = await estudaGemini(geminiKey, history, q, { subjects, tasks, sessions });
        setMsgs((m) => [...m, { role: "estuda", text: reply }]);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "algo deu errado";
        // cai para o roteiro local, mas avisa o que houve
        const fb = estudaRespond(q, { subjects, tasks });
        setMsgs((m) => [
          ...m,
          { role: "estuda", text: `*(Gemini: ${msg} — respondendo no modo local)*\n\n${fb.text}`, artifact: fb.artifact },
        ]);
      } finally {
        setThinking(false);
      }
      return;
    }

    // sem chave: roteiro local com pausa proposital (ritmo calmo)
    window.setTimeout(() => {
      const reply = estudaRespond(q, { subjects, tasks });
      setMsgs((m) => [...m, { role: "estuda", text: reply.text, artifact: reply.artifact }]);
      setThinking(false);
    }, 900);
  }

  return (
    <div className="nk-card flex h-[560px] flex-col">
      <div className="flex items-center gap-2 border-b border-ink-faint/30 px-5 py-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-lavender/20 text-sm">
          🪻
        </span>
        <div className="flex-1">
          <p className="text-sm font-medium text-ink-high">Estuda</p>
          <p className="text-xs text-ink-low">
            {live ? (
              <span className="text-moss">● IA ao vivo (Gemini) · conhece o seu semestre</span>
            ) : (
              <>
                modo local — ligue a IA real em{" "}
                <Link href="/ajustes" className="text-amber hover:underline">
                  Ajustes
                </Link>
              </>
            )}
          </p>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <p className="max-w-[80%] rounded-(--radius-md) rounded-br-sm bg-raised px-4 py-2.5 text-sm text-ink-high">
                {m.text}
              </p>
            </div>
          ) : (
            <div key={i} className="flex flex-col items-start gap-2">
              <p className="max-w-[85%] rounded-(--radius-md) rounded-bl-sm bg-surface px-4 py-2.5 text-sm leading-relaxed text-ink-mid shadow-[0_0_0_1px_#ffffff08]">
                {rich(m.text)}
              </p>
              {m.artifact && (
                <div className="w-full max-w-[85%] rounded-(--radius-md) border border-lavender/40 bg-lavender/5 p-4">
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-lavender">
                    {m.artifact.kind === "plano" && "plano de estudos"}
                    {m.artifact.kind === "flashcards" && "flashcards"}
                    {m.artifact.kind === "resumo" && "análise"}
                  </p>
                  <p className="mb-3 text-sm font-medium text-ink-high">
                    {m.artifact.title}
                  </p>
                  <ul className="space-y-2">
                    {m.artifact.items.map((item, j) => (
                      <li key={j} className="flex gap-2 text-sm text-ink-mid">
                        <span className="text-lavender">·</span>
                        <span>{rich(item)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )
        )}
        {thinking && (
          <div className="nk-think px-1 py-2" aria-label="Estuda pensando">
            <span />
            <span />
            <span />
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t border-ink-faint/30 p-4">
        <div className="mb-3 flex flex-wrap gap-2">
          {ESTUDA_SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="rounded-full border border-ink-faint/50 px-3 py-1 text-xs text-ink-mid transition-colors hover:border-lavender hover:text-lavender"
            >
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre o seu semestre…"
            className="flex-1 rounded-(--radius-sm) bg-raised px-4 py-2.5 text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
          />
          <button
            type="submit"
            disabled={thinking || !input.trim()}
            className="rounded-(--radius-sm) bg-amber px-4 py-2.5 text-sm font-medium text-void transition-opacity disabled:opacity-40"
          >
            enviar
          </button>
        </form>
      </div>
    </div>
  );
}
