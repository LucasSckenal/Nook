"use client";

/**
 * Avaliação heurística do Nook — instrumento central da disciplina:
 * as 10 heurísticas de Nielsen + os 8 critérios ergonômicos de
 * Bastien & Scapin, com evidências concretas da interface e
 * lacunas assumidas honestamente.
 */

interface Item {
  n: string;
  title: string;
  how: string;
  gap?: string;
}

const NIELSEN: Item[] = [
  {
    n: "N1",
    title: "Visibilidade do status do sistema",
    how: "O estado vira cena: post-it de prazo no monitor, LED verde quando o rádio toca, vapor na caneca após estudar, agulha do dial na estação, toasts confirmando cada ação.",
    gap: "Não há indicador de persistência (dados locais) — um “salvo ✓” discreto resolveria.",
  },
  {
    n: "N2",
    title: "Correspondência com o mundo real",
    how: "A metáfora inteira: rádio com knobs e frequências, calendário-folha presa por pino, estatísticas em folhas seguradas pela caneca, linguagem coloquial (“guardar na estante”, “tirar da estante”).",
  },
  {
    n: "N3",
    title: "Controle e liberdade do usuário",
    how: "Desfazer em tudo que destrói (concluir/apagar tarefa, remover disciplina); Esc e clique-fora fecham módulos; “acender a luz” interrompe o foco sem punição.",
  },
  {
    n: "N4",
    title: "Consistência e padrões",
    how: "Design system Lanterna (tokens de cor/raio/tipografia); Ctrl+K segue o padrão de palettes; “← quarto” e Esc funcionam igual em todo módulo; toggles e knobs respondem igual.",
    gap: "Microtextos variam entre minúsculas e capitalizadas em alguns cantos.",
  },
  {
    n: "N5",
    title: "Prevenção de erros",
    how: "Botões desabilitados sem dados válidos; restauração de backup valida o arquivo antes de aplicar; recorrência e exclusões preferem desfazer a diálogos de confirmação.",
  },
  {
    n: "N6",
    title: "Reconhecimento em vez de memorização",
    how: "Objetos têm lugar fixo no quarto; rótulos surgem no hover/foco; a dock mostra todos os destinos com tooltip; a palette lista comandos com dicas de atalho.",
  },
  {
    n: "N7",
    title: "Flexibilidade e eficiência de uso",
    how: "Dois caminhos sempre: cênico (clicar no objeto) e rápido (G+T/D/C/E/R/S, F para foco, Ctrl+K, dock, deep-links ?open=).",
  },
  {
    n: "N8",
    title: "Estética e design minimalista",
    how: "Princípio Ma: tela limpa por padrão, luz indica o interativo, um destaque por vez; módulos com só o essencial e o resto a um clique.",
  },
  {
    n: "N9",
    title: "Reconhecer, diagnosticar e recuperar erros",
    how: "Mensagens em linguagem humana e sem culpa (“esse arquivo não parece um backup do Nook”), sempre com saída próxima (desfazer, tentar de novo).",
  },
  {
    n: "N10",
    title: "Ajuda e documentação",
    how: "Onboarding diegético (o quarto se apresenta), dicas contextuais nos rodapés de cada módulo, esta seção /processo documentando as decisões.",
    gap: "Falta uma central de ajuda pesquisável para dúvidas pontuais.",
  },
];

const BASTIEN: Item[] = [
  {
    n: "B1",
    title: "Condução (presteza, agrupamento, feedback, legibilidade)",
    how: "Tour guiado na chegada; informação agrupada por “material” (folhas, papel pautado, vidro do rádio); feedback imediato em toda interação (halo, agulha, toast).",
  },
  {
    n: "B2",
    title: "Carga de trabalho (brevidade, densidade informacional)",
    how: "Criar tarefa é uma linha; trocar de módulo é um clique na dock; cada tela mostra pouco de propósito — densidade baixa é decisão de projeto.",
  },
  {
    n: "B3",
    title: "Controle explícito",
    how: "Nada acontece sem gesto do usuário: som só toca ao tocar, chuva é opt-in, o lembrete diário é um toast dispensável — nunca um modal que interrompe.",
  },
  {
    n: "B4",
    title: "Adaptabilidade (flexibilidade e experiência do usuário)",
    how: "4 temas de quarto, sons da interface e “movimento calmo” opcionais; novatos navegam pelo cenário, experientes voam por atalhos; molduras ficam visíveis no toque (mobile).",
  },
  {
    n: "B5",
    title: "Gestão de erros (proteção, qualidade, correção)",
    how: "Desfazer universal protege; validação antes de importar backup; mensagens dizem o que houve e o que fazer, sem jargão técnico.",
  },
  {
    n: "B6",
    title: "Homogeneidade / coerência",
    how: "Todos os módulos nascem do mesmo painel-vidro com o mesmo cabeçalho; mesma família de raios, sombras e easing em tudo; knobs, toggles e chips repetem o mesmo comportamento.",
  },
  {
    n: "B7",
    title: "Significado dos códigos e denominações",
    how: "A cor da disciplina é constante (lombada → calendário → tarefa → gráfico); ◉ é prova e ◍ é entrega em qualquer tela; âmbar sinaliza “interativo/quente” no app inteiro.",
  },
  {
    n: "B8",
    title: "Compatibilidade",
    how: "Vocabulário do estudante brasileiro (prova, média 6.0, semestre, sala); datas relativas (“em 2 dias”); a metáfora do quarto conversa com o repertório de quem estuda à noite.",
  },
];

function Bloco({ titulo, fonte, itens }: { titulo: string; fonte: string; itens: Item[] }) {
  return (
    <section className="mb-8">
      <h3 className="font-display text-xl text-ink-high">{titulo}</h3>
      <p className="mb-4 text-xs text-ink-low">{fonte}</p>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {itens.map((it) => (
          <div key={it.n} className="nk-card p-4">
            <p className="mb-1.5 text-sm font-medium text-ink-high">
              <span className="mr-2 rounded bg-raised px-1.5 py-0.5 font-mono text-[11px] text-amber">
                {it.n}
              </span>
              {it.title}
            </p>
            <p className="text-sm leading-relaxed text-ink-mid">{it.how}</p>
            {it.gap && (
              <p className="mt-2 text-xs leading-relaxed text-clay">
                <span className="font-medium">lacuna assumida:</span> {it.gap}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export function HeuristicasTab() {
  return (
    <div className="nk-reveal">
      <p className="mb-6 max-w-[760px] text-sm leading-relaxed text-ink-mid">
        Cada decisão de interface do Nook foi verificada contra dois instrumentos:
        as <strong className="text-ink-high">10 heurísticas de Nielsen</strong> e os{" "}
        <strong className="text-ink-high">8 critérios ergonômicos de Bastien &amp; Scapin</strong>.
        Abaixo, a evidência concreta de cada critério na interface — e, onde existe,
        a lacuna assumida (avaliação honesta vale mais que avaliação perfeita).
      </p>
      <Bloco
        titulo="Heurísticas de Nielsen"
        fonte="NIELSEN, J. 10 Usability Heuristics for User Interface Design. Nielsen Norman Group, 1994 (rev. 2024)."
        itens={NIELSEN}
      />
      <Bloco
        titulo="Critérios ergonômicos de Bastien & Scapin"
        fonte="BASTIEN, J. M. C.; SCAPIN, D. L. Ergonomic Criteria for the Evaluation of Human-Computer Interfaces. INRIA, 1993."
        itens={BASTIEN}
      />
      <p className="text-xs text-ink-low">
        método: inspeção por checklist sobre o protótipo funcional, percorrendo os fluxos
        principais (chegar, organizar disciplina, concluir tarefa, focar, ouvir rádio).
      </p>
    </div>
  );
}
