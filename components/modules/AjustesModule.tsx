"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMounted } from "@/components/useMounted";
import { AccountSection } from "@/components/auth/AccountSection";
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

/**
 * Conteúdo dos Ajustes — "a luminária do quarto" (controle do ambiente).
 * Usado tanto na rota /ajustes quanto no módulo diegético que nasce do objeto.
 */
export default function AjustesModule() {
  const router = useRouter();
  const mounted = useMounted();
  const setOnboarded = useNook((s) => s.setOnboarded);
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
  const geminiKey = useNook((s) => s.geminiKey);
  const setGeminiKey = useNook((s) => s.setGeminiKey);
  const resetDemo = useNook((s) => s.resetDemo);

  const [name, setName] = useState(userName);
  const [keyDraft, setKeyDraft] = useState(geminiKey);
  const [confirmDemo, setConfirmDemo] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<string | null>(null);

  if (!mounted) return <div className="nk-skeleton mx-auto h-96 w-full max-w-[760px]" />;

  return (
    <div className="mx-auto max-w-[760px] space-y-6">
      {/* conta */}
      <AccountSection />

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
          <div className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="text-sm text-ink-high">Organizar o quarto</p>
              <p className="text-xs text-ink-low">
                arraste os objetos para onde quiser — o seu cantinho, do seu jeito
              </p>
            </div>
            <button
              onClick={() => router.push("/?edit=1")}
              className="shrink-0 rounded-(--radius-sm) bg-surface px-4 py-2 text-sm text-ink-mid shadow-[0_0_0_1px_#ffffff0a] transition-colors hover:text-ink-high"
            >
              organizar
            </button>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="text-sm text-ink-high">Refazer a apresentação</p>
              <p className="text-xs text-ink-low">
                rever as boas-vindas e o tour pelos objetos do quarto
              </p>
            </div>
            <button
              onClick={() => {
                setOnboarded(false);
                toast({ message: "Vamos rever o quarto juntos. 🕯" });
                router.push("/");
              }}
              className="shrink-0 rounded-(--radius-sm) bg-surface px-4 py-2 text-sm text-ink-mid shadow-[0_0_0_1px_#ffffff0a] transition-colors hover:text-ink-high"
            >
              rever
            </button>
          </div>
        </div>
      </section>

      {/* Estuda com IA real */}
      <section className="nk-card nk-reveal nk-reveal-3 p-6">
        <h2 className="mb-1 font-display text-lg text-ink-high">🪻 Estuda com IA real</h2>
        <p className="mb-4 text-xs leading-relaxed text-ink-low">
          cole uma chave do <strong className="text-ink-mid">Google Gemini</strong> (gratuita em
          aistudio.google.com/apikey) para a Estuda responder de verdade, com o contexto do seu
          semestre. A chave fica só no seu navegador. Sem chave, ela funciona em modo local.
        </p>
        <div className="flex flex-wrap gap-2">
          <input
            type="password"
            value={keyDraft}
            onChange={(e) => setKeyDraft(e.target.value)}
            placeholder="AIza…"
            className="min-w-[220px] flex-1 rounded-(--radius-sm) bg-raised px-4 py-2.5 font-mono text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
            aria-label="Chave da API do Gemini"
          />
          <button
            onClick={() => {
              setGeminiKey(keyDraft.trim());
              toast({ message: keyDraft.trim() ? "Estuda ligada à IA. 🪻" : "Chave removida — modo local." });
            }}
            className="rounded-(--radius-sm) bg-amber px-4 py-2.5 text-sm font-medium text-void transition-opacity hover:opacity-90"
          >
            salvar chave
          </button>
          {geminiKey && (
            <button
              onClick={() => {
                setGeminiKey("");
                setKeyDraft("");
                toast({ message: "Chave removida — modo local." });
              }}
              className="rounded-(--radius-sm) bg-surface px-4 py-2.5 text-sm text-ink-mid shadow-[0_0_0_1px_#ffffff0a] transition-colors hover:text-ink-high"
            >
              remover
            </button>
          )}
        </div>
        <p className="mt-3 text-xs">
          {geminiKey ? (
            <span className="text-moss">● conectada — a Estuda já está usando o Gemini</span>
          ) : (
            <span className="text-ink-low">○ desconectada — Estuda em modo local (roteiro)</span>
          )}
        </p>
      </section>

      {/* dados */}
      <section className="nk-card nk-reveal nk-reveal-4 p-6">
        <h2 className="mb-1 font-display text-lg text-ink-high">Dados</h2>
        <p className="mb-4 text-xs text-ink-low">
          tudo é salvo localmente no seu navegador — baixe um backup de vez em
          quando para não perder o semestre
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              const raw = localStorage.getItem("nook-v1");
              if (!raw) {
                toast({ message: "Nada para exportar ainda." });
                return;
              }
              const blob = new Blob([raw], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `nook-backup-${new Date().toISOString().slice(0, 10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast({ message: "Backup baixado. Guarde com carinho. 🗃" });
            }}
            className="rounded-(--radius-sm) bg-amber px-4 py-2.5 text-sm font-medium text-void transition-opacity hover:opacity-90"
          >
            baixar backup (.json)
          </button>
          <label className="cursor-pointer rounded-(--radius-sm) bg-surface px-4 py-2.5 text-sm text-ink-mid shadow-[0_0_0_1px_#ffffff0a] transition-colors hover:text-ink-high">
            restaurar de um backup…
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const text = String(reader.result);
                    const parsed = JSON.parse(text);
                    if (!parsed?.state || typeof parsed.state !== "object") {
                      throw new Error("formato inválido");
                    }
                    // não aplica ainda — pede confirmação (Nielsen #5)
                    setConfirmDemo(false);
                    setPendingBackup(text);
                  } catch {
                    toast({ message: "Esse arquivo não parece um backup do Nook." });
                  }
                };
                reader.readAsText(file);
                e.target.value = "";
              }}
            />
          </label>
          <button
            onClick={() => {
              setPendingBackup(null);
              setConfirmDemo(true);
            }}
            className="rounded-(--radius-sm) bg-surface px-4 py-2.5 text-sm text-ink-mid shadow-[0_0_0_1px_#ffffff0a] transition-colors hover:text-ink-high"
          >
            restaurar demo
          </button>
        </div>

        {/* confirmação — substituir dados é irreversível */}
        {(pendingBackup || confirmDemo) && (
          <div className="mt-4 rounded-(--radius-md) bg-clay/10 p-4 shadow-[0_0_0_1px_#c97b6340]">
            <p className="text-sm text-ink-high">
              {pendingBackup
                ? "Restaurar este backup substitui todos os dados atuais deste aparelho."
                : "Restaurar a demonstração substitui seus dados atuais por dados de exemplo."}
            </p>
            <p className="mt-1 text-xs text-ink-low">
              Isso não tem desfazer. {pendingBackup ? "" : "Que tal baixar um backup antes?"}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => {
                  if (pendingBackup) {
                    localStorage.setItem("nook-v1", pendingBackup);
                    setPendingBackup(null);
                    toast({ message: "Backup restaurado. Recarregando o quarto…" });
                    window.setTimeout(() => window.location.reload(), 900);
                  } else {
                    resetDemo();
                    setConfirmDemo(false);
                    toast({ message: "Dados de demonstração restaurados." });
                  }
                }}
                className="rounded-(--radius-sm) bg-clay px-4 py-2 text-sm font-medium text-void transition-opacity hover:opacity-90"
              >
                {pendingBackup ? "restaurar backup" : "restaurar demo"}
              </button>
              <button
                onClick={() => {
                  setPendingBackup(null);
                  setConfirmDemo(false);
                }}
                className="rounded-(--radius-sm) bg-surface px-4 py-2 text-sm text-ink-mid shadow-[0_0_0_1px_#ffffff0a] transition-colors hover:text-ink-high"
              >
                cancelar
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
