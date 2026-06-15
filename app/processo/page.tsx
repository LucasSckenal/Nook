"use client";

import Link from "next/link";
import { useState } from "react";
import { Arquitetura } from "@/components/processo/Arquitetura";
import { Benchmarking } from "@/components/processo/Benchmarking";
import { EmpathyMap } from "@/components/processo/EmpathyMap";
import { HeuristicasTab } from "@/components/processo/Heuristicas";
import { JourneyMap } from "@/components/processo/JourneyMap";
import { StakeholderMatrix } from "@/components/processo/StakeholderMatrix";
import { Wireframes } from "@/components/processo/Wireframes";
import { CENARIOS, OBJETIVOS_INTERFACE, PROBLEMA } from "@/lib/processo";

type Tab =
  | "problema"
  | "objetivos"
  | "benchmarking"
  | "stakeholders"
  | "empatia"
  | "jornada"
  | "arquitetura"
  | "wireframes"
  | "heuristicas";

const TABS: { id: Tab; label: string }[] = [
  { id: "problema", label: "Problema & contexto" },
  { id: "objetivos", label: "Objetivos" },
  { id: "benchmarking", label: "Benchmarking" },
  { id: "stakeholders", label: "Stakeholders" },
  { id: "empatia", label: "Mapa de empatia" },
  { id: "jornada", label: "Jornada & cenários" },
  { id: "arquitetura", label: "Arquitetura" },
  { id: "wireframes", label: "Wireframes" },
  { id: "heuristicas", label: "Avaliação heurística" },
];

export default function ProcessoPage() {
  const [tab, setTab] = useState<Tab>("problema");

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
                investigação · arquitetura · avaliação
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
          {tab === "problema" && <ProblemaTab />}
          {tab === "objetivos" && <Objetivos />}
          {tab === "benchmarking" && <BenchmarkingTab />}
          {tab === "stakeholders" && <StakeholdersTab />}
          {tab === "empatia" && <EmpathyMap />}
          {tab === "jornada" && <JornadaTab />}
          {tab === "arquitetura" && <ArquiteturaTab />}
          {tab === "wireframes" && <WireframesTab />}
          {tab === "heuristicas" && <HeuristicasTab />}
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

function ProblemaTab() {
  return (
    <div>
      <SectionIntro title="Problema & contexto">
        O ponto de partida da investigação: o que dói, em que contexto, e para quem.
      </SectionIntro>

      {/* declaração do problema */}
      <div className="nk-card mb-5 border-l-2 border-clay/60 p-6">
        <p className="text-xs uppercase tracking-wider text-ink-low">Declaração do problema</p>
        <p className="mt-2 text-base leading-relaxed text-ink-high">{PROBLEMA.declaracao}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* contextualização */}
        <div className="nk-card p-6">
          <h3 className="mb-3 font-display text-lg text-ink-high">Contextualização</h3>
          <ul className="space-y-2">
            {PROBLEMA.contexto.map((c, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-ink-mid">
                <span className="mt-0.5 shrink-0 text-mist">•</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* público-alvo */}
        <div className="nk-card p-6">
          <h3 className="mb-3 font-display text-lg text-ink-high">Público-alvo</h3>
          <div className="space-y-3">
            {PROBLEMA.publico.map((p) => (
              <div key={p.title} className="flex gap-3">
                <span className="text-2xl" aria-hidden>
                  {p.icon}
                </span>
                <div>
                  <p className="text-sm font-medium text-ink-high">{p.title}</p>
                  <p className="text-xs leading-relaxed text-ink-low">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function BenchmarkingTab() {
  return (
    <div>
      <SectionIntro title="Benchmarking">
        Comparação com ferramentas que os estudantes já usam (desk research). O Nook nasce na
        interseção que ninguém cobre: organização acadêmica + foco + acolhimento.
      </SectionIntro>
      <Benchmarking />
    </div>
  );
}

function ArquiteturaTab() {
  return (
    <div>
      <SectionIntro title="Arquitetura da informação & fluxos">
        Como a informação se organiza e como o usuário se move — sem nunca “sair” do quarto.
      </SectionIntro>
      <Arquitetura />
    </div>
  );
}

function WireframesTab() {
  return (
    <div>
      <SectionIntro title="Wireframes">
        Esqueleto lo-fi das telas principais — layout, hierarquia e fluxo antes do acabamento
        visual. O protótipo de alta fidelidade é o próprio app (o quarto).
      </SectionIntro>
      <Wireframes />
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

      {/* cenários de uso — narrativas ancoradas na persona */}
      <div className="mt-8">
        <h3 className="mb-1 font-display text-xl text-ink-high">Cenários de uso</h3>
        <p className="mb-4 max-w-2xl text-sm text-ink-mid">
          Três situações concretas em que a Marina vive a jornada acima dentro do Nook.
        </p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {CENARIOS.map((c) => (
            <div key={c.titulo} className="nk-card p-5">
              <p className="text-[11px] uppercase tracking-wider text-amber">{c.contexto}</p>
              <h4 className="mt-1.5 text-base font-medium text-ink-high">{c.titulo}</h4>
              <p className="mt-2 text-sm leading-relaxed text-ink-mid">{c.narrativa}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
