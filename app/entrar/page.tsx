"use client";

import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { SignInCard } from "@/components/auth/SignInCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { RoomSceneObjects } from "@/components/room/RoomSceneObjects";

/**
 * A porta do quarto. Em vez de um fundo chapado, o próprio quarto espera
 * atrás — desfocado e à meia-luz — e o login flutua como um vidro sobre ele.
 * Entrar é só destrancar a porta: o quarto já está ali.
 */
export default function EntrarPage() {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "authed") router.replace("/");
  }, [status, router]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      {/* o quarto, ao fundo — desfocado, escurecido e sem interação */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ filter: "brightness(0.55) blur(5px)", transform: "scale(1.04)" }}
        aria-hidden
      >
        <Suspense fallback={<div className="h-full w-full bg-void" />}>
          <RoomSceneObjects onOpen={() => {}} />
        </Suspense>
      </div>

      {/* véu para contraste do cartão */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 55% at 50% 45%, #04060a55, #04060ac4 80%)",
        }}
        aria-hidden
      />

      {/* o cartão, flutuando como um vidro sobre o quarto */}
      <div className="relative z-10 w-[min(440px,94vw)]">
        <div className="mb-6 text-center">
          <p className="font-display text-3xl text-ink-high [text-shadow:0_2px_12px_#000a]">
            Nook
          </p>
          <p className="mt-1 text-sm text-ink-mid [text-shadow:0_1px_8px_#000a]">
            seu quarto de estudos, à meia-luz 🕯
          </p>
        </div>

        <div
          className="rounded-(--radius-lg) p-7 sm:p-8"
          style={{
            background: "color-mix(in srgb, var(--color-room) 82%, transparent)",
            backdropFilter: "blur(20px) saturate(1.15)",
            WebkitBackdropFilter: "blur(20px) saturate(1.15)",
            boxShadow:
              "0 32px 90px #00000080, 0 0 0 1px #ffffff14, inset 0 1px 0 #ffffff0f",
          }}
        >
          <SignInCard
            onDone={() => router.replace("/")}
            onGuest={() => router.replace("/")}
          />
        </div>

        <p className="mt-5 text-center text-xs text-ink-low [text-shadow:0_1px_8px_#000a]">
          entrar é opcional — visitantes guardam tudo neste navegador
        </p>
      </div>
    </main>
  );
}
