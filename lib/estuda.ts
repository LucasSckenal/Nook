import { daysBetween, relativeDay, todayIso, WEEKDAYS_LONG } from "./dates";
import { gradeOutlook } from "./store";
import type { Subject, Task } from "./types";

/**
 * "Estuda" — a assistente do Nook.
 *
 * Nesta versão de demonstração as respostas são geradas localmente, com
 * regras sobre os dados reais do semestre (sem chamada de API). Em produção,
 * este módulo é substituído pelo gateway da API Claude descrito no doc 09:
 * mesmo contrato (contexto → resposta + artefato), troca-se só o motor.
 */

export interface EstudaArtifact {
  kind: "plano" | "flashcards" | "resumo";
  title: string;
  items: string[];
}

export interface EstudaReply {
  text: string;
  artifact?: EstudaArtifact;
}

interface Ctx {
  subjects: Subject[];
  tasks: Task[];
}

function nextExam(subjects: Subject[]) {
  const today = todayIso();
  const upcoming = subjects
    .flatMap((s) => s.assessments.map((a) => ({ subject: s, a })))
    .filter((x) => x.a.grade == null && daysBetween(today, x.a.date) >= 0)
    .sort((x, y) => x.a.date.localeCompare(y.a.date));
  return upcoming[0] ?? null;
}

function buildPlan(ctx: Ctx): EstudaReply {
  const next = nextExam(ctx.subjects);
  if (!next) {
    return { text: "Não encontrei nenhuma prova ou entrega em aberto no semestre. Que tal aproveitar para revisar com calma?" };
  }
  const days = daysBetween(todayIso(), next.a.date);
  const span = Math.min(Math.max(days, 1), 7);
  const topics = [
    "revisão da teoria + releitura das anotações",
    "exercícios guiados (os que o professor resolveu)",
    "lista de exercícios, primeira metade",
    "lista de exercícios, segunda metade",
    "simulado cronometrado de uma prova antiga",
    "revisão dos erros do simulado",
    "revisão leve + descanso (véspera é pra consolidar, não pra aprender)",
  ];
  const items: string[] = [];
  for (let i = 0; i < span; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i + Math.max(0, days - span));
    const slot = i === span - 1 ? topics[6] : topics[Math.min(i, 5)];
    items.push(`${WEEKDAYS_LONG[d.getDay()]} (${d.getDate()}/${d.getMonth() + 1}) — ${slot}`);
  }
  return {
    text: `Sua próxima avaliação é **${next.a.title}** de ${next.subject.name}, ${relativeDay(next.a.date)}. Montei um plano de ${span} dias com sessões de ~50min. Quer que eu ajuste alguma coisa antes de você levar pro calendário?`,
    artifact: { kind: "plano", title: `Plano para ${next.a.title} · ${next.subject.name}`, items },
  };
}

function buildRisk(ctx: Ctx): EstudaReply {
  const notes: string[] = [];
  for (const s of ctx.subjects) {
    const o = gradeOutlook(s);
    if (o.current != null && o.current < 6) {
      notes.push(`**${s.name}**: média parcial ${o.current.toFixed(1)}. Para fechar em 6.0 você precisa de ${o.neededAvg?.toFixed(1)} nas próximas avaliações — dá, mas vale começar a revisão antes.`);
    }
    const soon = s.assessments.filter((a) => a.grade == null && daysBetween(todayIso(), a.date) >= 0 && daysBetween(todayIso(), a.date) <= 4);
    for (const a of soon) {
      notes.push(`**${s.name}**: ${a.title} ${relativeDay(a.date)} — reserve pelo menos uma sessão de foco até lá.`);
    }
  }
  if (notes.length === 0) {
    return { text: "Olhei o semestre inteiro e está tudo sob controle: nenhuma média em risco e nada urgente nos próximos dias. Continua nesse ritmo. ☕" };
  }
  return {
    text: "Dei uma olhada no seu semestre. Dois pontos merecem atenção — nada de pânico, só planejamento:",
    artifact: { kind: "resumo", title: "Pontos de atenção", items: notes },
  };
}

function buildFlashcards(ctx: Ctx, input: string): EstudaReply {
  const sub =
    ctx.subjects.find((s) => input.toLowerCase().includes(s.name.toLowerCase().split(" ")[0])) ??
    nextExam(ctx.subjects)?.subject;
  const deckBySubject: Record<string, string[]> = {
    calc2: [
      "P: Quando uma série geométrica converge? → R: quando |r| < 1; soma = a/(1−r)",
      "P: O que diz o teste da razão? → R: se lim |aₙ₊₁/aₙ| = L < 1, a série converge absolutamente",
      "P: Raio de convergência de Σ xⁿ/n! → R: infinito (converge para todo x)",
    ],
    aed: [
      "P: Altura máxima de uma árvore AVL com n nós? → R: ~1,44·log₂(n)",
      "P: Complexidade de busca em hash com encadeamento? → R: O(1) médio, O(n) pior caso",
      "P: BFS encontra o quê em grafos não ponderados? → R: o caminho mais curto em arestas",
    ],
    fis1: [
      "P: Segunda lei de Newton? → R: F = m·a (resultante)",
      "P: Trabalho de força constante? → R: W = F·d·cos(θ)",
      "P: Energia cinética? → R: Ec = m·v²/2",
    ],
    bd: [
      "P: O que é 3FN? → R: 2FN + nenhum atributo não-chave depende transitivamente da chave",
      "P: Diferença entre INNER e LEFT JOIN? → R: LEFT mantém linhas da esquerda sem correspondência",
      "P: O que garante o A de ACID? → R: atomicidade — a transação acontece inteira ou não acontece",
    ],
    engsoft: [
      "P: Diferença entre requisito funcional e não-funcional? → R: o que o sistema faz × como/quão bem faz",
      "P: O que é um incremento no Scrum? → R: o produto potencialmente entregável ao fim da sprint",
      "P: Custo de corrigir defeito cresce quando? → R: quanto mais tarde no ciclo ele é encontrado",
    ],
  };
  const items = (sub && deckBySubject[sub.id]) ?? deckBySubject.calc2;
  return {
    text: `Preparei um deck inicial de ${sub ? sub.name : "revisão"} com 3 cartões. Na versão completa eu gero a partir das suas anotações e agendo as revisões espaçadas.`,
    artifact: { kind: "flashcards", title: `Flashcards · ${sub?.name ?? "Revisão"}`, items },
  };
}

function buildSummary(): EstudaReply {
  return {
    text: "Para gerar um resumo eu leio suas anotações da disciplina. Nesta demonstração as anotações ainda não têm conteúdo — escreva algo no Caderno e me chame de novo, ou peça um **plano de estudos** e **flashcards**, que já funcionam com os dados do semestre.",
  };
}

export function estudaRespond(input: string, ctx: Ctx): EstudaReply {
  const q = input.toLowerCase();
  if (/(cronograma|plano|planejar|organizar.*(prova|semana)|me ajuda.*prova)/.test(q)) return buildPlan(ctx);
  if (/(risco|como estou|situação|panorama|notas|média)/.test(q)) return buildRisk(ctx);
  if (/(flashcard|cartao|cartão|revisão espaçada|decorar)/.test(q)) return buildFlashcards(ctx, q);
  if (/(resumo|resumir)/.test(q)) return buildSummary();
  if (/(oi|olá|ola|bom dia|boa tarde|boa noite|hey)/.test(q)) {
    return {
      text: "Oi! Eu sou a Estuda. Conheço suas disciplinas, tarefas e provas. Posso montar um **plano de estudos**, checar **riscos do semestre**, gerar **flashcards** ou **resumir anotações**. Por onde começamos?",
    };
  }
  return {
    text: "Posso ajudar com: **\"monte um plano para a próxima prova\"**, **\"como estou no semestre?\"**, **\"flashcards de cálculo\"** ou **\"resuma minhas anotações\"**. (Nesta demo eu respondo localmente, sem API — a arquitetura completa está no doc 09.)",
  };
}

export const ESTUDA_SUGGESTIONS = [
  "Monte um plano para a próxima prova",
  "Como estou no semestre?",
  "Flashcards de algoritmos",
];
