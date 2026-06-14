"use client";

/* eslint-disable @next/next/no-img-element */

import { useAuth } from "./AuthProvider";
import { SignInCard } from "./SignInCard";
import { toast } from "@/lib/toast";

/**
 * Bloco de conta para os Ajustes. Mostra o perfil quando logado (com "sair")
 * ou o cartão de entrada quando visitante. Sem Firebase configurado, o próprio
 * cartão explica o estado.
 */
export function AccountSection() {
  const { status, user, configured, signOutUser } = useAuth();

  return (
    <section className="nk-card nk-reveal p-6">
      <h2 className="mb-1 font-display text-lg text-ink-high">🔑 Sua conta</h2>
      <p className="mb-4 text-xs text-ink-low">
        {configured
          ? "entre para o seu quarto te acompanhar em qualquer dispositivo"
          : "identidade e sincronização — disponível quando o Firebase for ligado"}
      </p>

      {status === "authed" && user ? (
        <div className="flex items-center gap-4">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt=""
              aria-hidden
              className="h-12 w-12 rounded-full object-cover shadow-[0_0_0_1px_#ffffff14]"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-raised text-lg text-amber shadow-[0_0_0_1px_#ffffff14]">
              {(user.displayName || user.email || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-ink-high">
              {user.displayName || "Sem nome"}
            </p>
            <p className="truncate text-xs text-ink-low">{user.email}</p>
          </div>
          <button
            onClick={async () => {
              await signOutUser();
              toast({ message: "Você saiu. O quarto continua aqui. 🕯" });
            }}
            className="shrink-0 rounded-(--radius-sm) bg-surface px-4 py-2 text-sm text-ink-mid shadow-[0_0_0_1px_#ffffff0a] transition-colors hover:text-ink-high"
          >
            sair
          </button>
        </div>
      ) : (
        <SignInCard onDone={() => toast({ message: "Conectado. Bem-vindo. 🪻" })} />
      )}
    </section>
  );
}
