"use client";

import Link from "next/link";
import { useState } from "react";
import { EmpathyMap } from "@/components/processo/EmpathyMap";
import { JourneyMap } from "@/components/processo/JourneyMap";
import { StakeholderMatrix } from "@/components/processo/StakeholderMatrix";
import { OBJETIVOS_INTERFACE } from "@/lib/processo";

type Tab = "objetivos" | "stakeholders" | "empatia" | "jornada";

const TABS: { id: Tab; label: string }[] = [
  { id: "objetivos", label: "Objetivos" },
  { id: "stakeholders", label: "Stakeholders" },
  { id: "empatia", label: "Mapa de empatia" },
  { id: "jornada", label: "Jornada do usuário" },
];

export default function ProcessoPage() {
  const [tab, setTab] = useState<Tab>("objetivos");

  return (
    <div className="min-h-screen bg-room">
      <header className="sticky top-0 z-30 border-b border-ink-faint/30 bg-room/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-(--radius-sm) px-2 py-1 text-sm text-ink-mid transition-colors hover:text-amber"
              title="Voltar ao quarto (Esc)"
            >
              <span aria-hidden>←</span> quarto
            </Link>
            <div className="flex items-baseline gap-3">
              <h1 className="font-display text-xl text-ink-high">✦ Processo de design</h1>
              <span className="hidden text-sm text-ink-low sm:inline">
                Etapa 1 — investigação & definição do problema
              </span>
            </div>
          </div>
          <span className="hidden rounded-full bg-surface px-3 py-1 text-xs text-ink-low shadow-[0_0_0_1px_#ffffff10] md:block">
            Design de Interface & IHC
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-[1100px] px-6 pb-24 pt-6">
        {/* nota de metodologia — honestidade sobre a natureza da pesquisa */}
        <div className="nk-reveal mb-6 flex items-start gap-3 rounded-(--radius-md) border border-mist/30 bg-mist/[0.06] px-4 py-3">
          <span className="mt-0.5 text-mist">ⓘ</span>
          <p className="text-sm leading-relaxed text-ink-mid">
            <span className="font-medium text-ink-high">Natureza da pesquisa: hipotética.</span>{" "}
            Os artefatos derivam de <em>desk research</em> (literatura sobre procrastinação
            acadêmica e relatórios de mercado) e de projeção de personas — não de entrevistas
            ou questionários primários. O recorte é declarado por honestidade metodológica.
          </p>
        </div>

        {/* abas */}
        <div className="nk-reveal nk-reveal-1 mb-6 flex flex-wrap gap-1 rounded-(--radius-md) bg-surface p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 whitespace-nowrap rounded-(--radius-sm) px-3 py-2 text-sm transition-colors ${
                tab === t.id ? "bg-raised text-ink-high" : "text-ink-mid hover:text-ink-high"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="nk-reveal nk-reveal-2">
          {tab === "objetivos" && <Objetivos />}
          {tab === "stakeholders" && <StakeholdersTab />}
          {tab === "empatia" && <EmpathyMap />}
          {tab === "jornada" && <JornadaTab />}
        </div>
      </main>
    </div>
  );
}

function SectionIntro({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-2xl text-ink-high">{title}</h2>
      <p className="mt-1 max-w-2xl text-sm leading-relaxed text-ink-mid">{children}</p>
    </div>
  );
}

function Objetivos() {
  return (
    <div>
      <SectionIntro title="Objetivos da interface">
        Quatro objetivos guiam cada decisão de design do Nook — derivados diretamente do problema
        investigado: ferramentas que resolvem o organizar, mas ignoram o querer voltar.
      </SectionIntro>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {OBJETIVOS_INTERFACE.map((o) => (
          <div key={o.title} className="nk-card p-6">
            <span className="text-2xl">{o.icon}</span>
            <h3 className="mt-3 text-base font-medium text-ink-high">{o.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-mid">{o.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StakeholdersTab() {
  return (
    <div>
      <SectionIntro title="Mapa de stakeholders">
        Matriz <strong>poder × interesse</strong> (Mendelow): posiciona cada parte interessada para
        definir a estratégia de relacionamento. O estudante e a equipe de produto ficam no topo —
        é por eles que tudo se decide.
      </SectionIntro>
      <StakeholderMatrix />
    </div>
  );
}

function JornadaTab() {
  return (
    <div>
      <SectionIntro title="Jornada do usuário">
        O ciclo de estudo da Marina, do gatilho da prova à retrospectiva. A curva de emoção mostra o
        vale da ansiedade inicial e a subida sustentada conforme o Nook atua em cada ponto de dor.
      </SectionIntro>
      <JourneyMap />
    </div>
  );
}
