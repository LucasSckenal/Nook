"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useNook } from "@/lib/store";

/**
 * Modo demonstração — para apresentar o Nook sem depender do estado local:
 * restaura o seed (datas sempre relativas a hoje), garante onboarding feito
 * e volta ao quarto com a luz acendendo.
 */
export default function DemoPage() {
  const router = useRouter();
  const resetDemo = useNook((s) => s.resetDemo);
  const setOnboarded = useNook((s) => s.setOnboarded);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    resetDemo();
    setOnboarded(true);
    // o lembrete de chegada faz parte do show
    localStorage.removeItem("nook-greet");
    router.replace("/");
  }, [resetDemo, setOnboarded, router]);

  return (
    <main className="flex h-screen items-center justify-center bg-void">
      <p className="font-display text-xl text-ink-low">arrumando o quarto…</p>
    </main>
  );
}
