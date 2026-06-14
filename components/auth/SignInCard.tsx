"use client";

import { useState } from "react";
import { useAuth } from "./AuthProvider";

/**
 * "A chave do quarto." Cartão de entrada no estilo Lanterna — reutilizável
 * como tela cheia (/entrar) ou dentro dos Ajustes. Google + e-mail/senha,
 * alternando entre entrar e criar conta. Visitante continua sendo um caminho
 * legítimo (onGuest), nunca uma punição.
 */
export function SignInCard({
  onDone,
  onGuest,
}: {
  onDone?: () => void;
  onGuest?: () => void;
}) {
  const {
    configured,
    busy,
    error,
    clearError,
    signInWithGoogle,
    signInWithEmail,
    registerWithEmail,
  } = useAuth();

  const [mode, setMode] = useState<"entrar" | "criar">("entrar");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleGoogle() {
    if (await signInWithGoogle()) onDone?.();
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    const ok =
      mode === "entrar"
        ? await signInWithEmail(email, password)
        : await registerWithEmail(name, email, password);
    if (ok) onDone?.();
  }

  if (!configured) {
    return (
      <div className="rounded-(--radius-lg) bg-surface p-6 text-sm leading-relaxed text-ink-mid shadow-[0_0_0_1px_#ffffff0a]">
        <p className="mb-2 font-display text-lg text-ink-high">
          🔑 Sua conta (em breve)
        </p>
        <p>
          O Firebase ainda não foi configurado neste ambiente. Defina as chaves{" "}
          <code className="text-ink-high">NEXT_PUBLIC_FIREBASE_*</code> (veja{" "}
          <code className="text-ink-high">.env.example</code>) para ligar o login
          e a sincronização entre dispositivos.
        </p>
        <p className="mt-3 text-ink-low">
          Por enquanto, o quarto funciona em modo visitante — tudo salvo só neste
          navegador.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-5">
        <h2 className="font-display text-xl text-ink-high">
          {mode === "entrar" ? "Bem-vindo de volta." : "Crie a sua chave."}
        </h2>
        <p className="mt-1 text-sm text-ink-mid">
          {mode === "entrar"
            ? "Entre para o seu quarto te seguir em qualquer dispositivo."
            : "Uma conta guarda o seu semestre na nuvem, com segurança."}
        </p>
      </div>

      {/* Google */}
      <button
        onClick={handleGoogle}
        disabled={busy}
        className="flex w-full items-center justify-center gap-3 rounded-(--radius-md) bg-raised px-4 py-3 text-sm font-medium text-ink-high shadow-[0_0_0_1px_#ffffff12] transition-all hover:bg-raised/70 disabled:opacity-50"
      >
        <GoogleGlyph />
        continuar com Google
      </button>

      <div className="my-5 flex items-center gap-3 text-xs text-ink-low">
        <span className="h-px flex-1 bg-ink-faint/40" />
        ou com e-mail
        <span className="h-px flex-1 bg-ink-faint/40" />
      </div>

      <form onSubmit={handleEmail} className="space-y-3">
        {mode === "criar" && (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="como te chamamos"
            autoComplete="name"
            className="w-full rounded-(--radius-md) bg-surface px-4 py-3 text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
          />
        )}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          autoComplete="email"
          className="w-full rounded-(--radius-md) bg-surface px-4 py-3 text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={mode === "criar" ? "crie uma senha (6+)" : "sua senha"}
          autoComplete={mode === "criar" ? "new-password" : "current-password"}
          className="w-full rounded-(--radius-md) bg-surface px-4 py-3 text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
        />

        {error && (
          <p className="rounded-(--radius-sm) bg-clay/15 px-3 py-2 text-xs text-clay">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-(--radius-md) bg-amber py-3 text-sm font-medium text-void shadow-[0_0_32px_#e8a87c30] transition-transform hover:scale-[1.01] disabled:opacity-50"
        >
          {busy
            ? "um instante…"
            : mode === "entrar"
              ? "entrar"
              : "criar conta"}
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between text-xs">
        <button
          onClick={() => {
            clearError();
            setMode(mode === "entrar" ? "criar" : "entrar");
          }}
          className="text-ink-mid transition-colors hover:text-amber"
        >
          {mode === "entrar"
            ? "não tem conta? criar"
            : "já tem conta? entrar"}
        </button>
        {onGuest && (
          <button
            onClick={onGuest}
            className="text-ink-low transition-colors hover:text-ink-mid"
          >
            continuar como visitante
          </button>
        )}
      </div>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  );
}
