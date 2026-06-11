"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useMounted } from "@/components/useMounted";
import { useNook } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { ThemeId } from "@/lib/types";

const THEMES: { id: ThemeId; name: string; desc: string; swatch: string[] }[] = [
  { id: "meia-noite", name: "Meia-noite", desc: "o quarto à noite — padrão", swatch: ["#11151F", "#171C28", "#E8A87C"] },
  { id: "entardecer", name: "Entardecer", desc: "fundos roxos, âmbar rosado", swatch: ["#1A1620", "#221A28", "#E89A8C"] },
  { id: "madrugada", name: "Madrugada de chuva", desc: "azulado e calmo", swatch: ["#0E1218", "#141B26", "#9FBAD0"] },
  { id: "lampiao", name: "Lampião", desc: "acastanhado, âmbar intenso", swatch: ["#16130E", "#1E1A12", "#F0A86A"] },
];

function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm text-ink-high">{label}</p>
        <p className="text-xs text-ink-low">{desc}</p>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          checked ? "bg-amber" : "bg-ink-faint"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-ink-high transition-all ${
            checked ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function AjustesPage() {
  const mounted = useMounted();
  const userName = useNook((s) => s.userName);
  const setUserName = useNook((s) => s.setUserName);
  const theme = useNook((s) => s.theme);
  const setTheme = useNook((s) => s.setTheme);
  const uiSounds = useNook((s) => s.uiSounds);
  const setUiSounds = useNook((s) => s.setUiSounds);
  const calmMotion = useNook((s) => s.calmMotion);
  const setCalmMotion = useNook((s) => s.setCalmMotion);
  const rainVisual = useNook((s) => s.rainVisual);
  const setRainVisual = useNook((s) => s.setRainVisual);
  const resetDemo = useNook((s) => s.resetDemo);

  const [name, setName] = useState(userName);

  return (
    <div className="min-h-screen bg-room">
      <header className="sticky top-0 z-30 border-b border-ink-faint/30 bg-room/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[760px] items-center gap-4 px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-(--radius-sm) px-2 py-1 text-sm text-ink-mid transition-colors hover:text-amber"
            title="Voltar ao quarto (Esc)"
          >
            <span aria-hidden>←</span> quarto
          </Link>
          <h1 className="font-display text-xl text-ink-high">⚙️ Ajustes</h1>
        </div>
      </header>

      <main className="mx-auto max-w-[760px] px-6 pb-24 pt-8">
        {!mounted ? (
          <div className="nk-skeleton h-96 w-full" />
        ) : (
          <div className="space-y-6">
            {/* tema do quarto */}
            <section className="nk-card nk-reveal p-6">
              <h2 className="font-display text-lg text-ink-high">Tema do quarto</h2>
              <p className="mb-4 text-xs text-ink-low">
                muda a atmosfera de todo o app — escolha o clima que te acolhe
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`flex items-center gap-3 rounded-(--radius-md) p-3 text-left transition-all ${
                      theme === t.id
                        ? "bg-raised shadow-[0_0_0_1.5px_#e8a87c80]"
                        : "bg-surface hover:bg-raised/70"
                    }`}
                  >
                    <div className="flex gap-1">
                      {t.swatch.map((c, i) => (
                        <span
                          key={i}
                          className="h-9 w-4 rounded-sm"
                          style={{ background: c, boxShadow: "inset 0 0 0 1px #ffffff10" }}
                        />
                      ))}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm ${theme === t.id ? "text-amber" : "text-ink-high"}`}>
                        {t.name}
                      </p>
                      <p className="truncate text-xs text-ink-low">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* perfil */}
            <section className="nk-card nk-reveal nk-reveal-1 p-6">
              <h2 className="mb-4 font-display text-lg text-ink-high">Perfil</h2>
              <label className="mb-1.5 block text-xs text-ink-low">como te chamamos</label>
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 rounded-(--radius-sm) bg-raised px-4 py-2.5 text-sm text-ink-high focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (name.trim()) {
                      setUserName(name.trim());
                      toast({ message: "Nome atualizado." });
                    }
                  }}
                  className="rounded-(--radius-sm) bg-amber px-4 py-2.5 text-sm font-medium text-void"
                >
                  salvar
                </button>
              </div>
            </section>

            {/* preferências */}
            <section className="nk-card nk-reveal nk-reveal-2 p-6">
              <h2 className="mb-1 font-display text-lg text-ink-high">Ambiente & acessibilidade</h2>
              <div className="divide-y divide-ink-faint/20">
                <Toggle
                  label="Sons da interface"
                  desc="toques sutis ao concluir tarefas e interagir"
                  checked={uiSounds}
                  onChange={(v) => setUiSounds(v)}
                />
                <Toggle
                  label="Movimento calmo"
                  desc="reduz animações de clima (chuva, vapor, gato) para menos distração"
                  checked={calmMotion}
                  onChange={(v) => setCalmMotion(v)}
                />
                <Toggle
                  label="Chuva na janela"
                  desc="liga ou desliga a chuva visual do quarto"
                  checked={rainVisual}
                  onChange={(v) => setRainVisual(v)}
                />
              </div>
            </section>

            {/* dados */}
            <section className="nk-card nk-reveal nk-reveal-3 p-6">
              <h2 className="mb-1 font-display text-lg text-ink-high">Dados</h2>
              <p className="mb-4 text-xs text-ink-low">
                tudo é salvo localmente no seu navegador (esta é uma demonstração)
              </p>
              <button
                onClick={() => {
                  resetDemo();
                  toast({ message: "Dados de demonstração restaurados." });
                }}
                className="rounded-(--radius-sm) bg-surface px-4 py-2.5 text-sm text-ink-mid shadow-[0_0_0_1px_#ffffff0a] transition-colors hover:text-ink-high"
              >
                restaurar dados de demonstração
              </button>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
