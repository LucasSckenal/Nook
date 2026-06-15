/**
 * Artefatos de UX da Etapa 1 (Investigação e definição do problema).
 *
 * NATUREZA DA PESQUISA: hipotética. Os dados abaixo derivam de desk research
 * (relatórios de mercado, literatura sobre procrastinação acadêmica) e de
 * projeção de personas — não de entrevistas/questionários primários. Esse
 * recorte é declarado na interface para honestidade metodológica.
 */

/* ── Objetivos da interface ──────────────────────────────────────────── */

export const OBJETIVOS_INTERFACE = [
  {
    icon: "🎯",
    title: "Reduzir a carga cognitiva da organização",
    desc: "Reunir disciplinas, tarefas, provas e foco em um único ambiente, eliminando a troca entre 3–4 ferramentas frias.",
  },
  {
    icon: "🫧",
    title: "Tratar o estado emocional como requisito",
    desc: "Transformar o ato de estudar em algo acolhedor — para que o estudante queira voltar, e a organização aconteça como consequência.",
  },
  {
    icon: "🧭",
    title: "Tornar a navegação memorável e de baixo atrito",
    desc: "Usar memória espacial (o quarto) para usuários novos e atalhos diretos (Ctrl+K, teclas) para recorrentes — a metáfora nunca é pedágio.",
  },
  {
    icon: "🌱",
    title: "Sustentar constância sem punir",
    desc: "Substituir streaks e alarmes por feedback gentil, contagens serenas e reforço positivo do esforço real.",
  },
];

/* ── Problema, contexto e público-alvo (Etapa 1) ─────────────────────── */

export const PROBLEMA = {
  declaracao:
    "Estudantes universitários enfrentam dificuldade em organizar disciplinas, prazos, estudos independentes e atividades extracurriculares — espalhando tudo entre várias ferramentas frias que resolvem o “o quê”, mas ignoram a vontade de voltar a usá-las.",
  contexto: [
    "A rotina acadêmica combina muitas fontes (planos de ensino, provas, trabalhos, horários) que raramente convivem num só lugar.",
    "Apps de produtividade genéricos exigem montagem e manutenção — viram mais uma tarefa.",
    "Ferramentas acadêmicas tendem a ser corporativas e impessoais; a dimensão emocional (ansiedade, procrastinação) fica de fora.",
    "A procrastinação acadêmica é documentada como ligada a fatores emocionais, não só de gestão de tempo.",
  ],
  publico: [
    { icon: "🎓", title: "Estudante de graduação", desc: "17–26 anos, 1 a 6 disciplinas por semestre, fluente em apps e sensível à estética." },
    { icon: "🎧", title: "Perfil “LoFi / cozy”", desc: "Estuda em casa, valoriza ambiente acolhedor; foge de interfaces frias e gamificação agressiva." },
    { icon: "⏳", title: "Procrastinador ansioso", desc: "Organiza por impulso, estuda na véspera; precisa de reforço gentil, não de cobrança." },
  ],
};

/* ── Benchmarking (desk research de concorrentes) ────────────────────── */

export const BENCH_PRODUCTS = ["Notion", "Google Agenda", "Todoist", "Forest", "Nook"];

export const BENCH_CRITERIA: { criterio: string; valores: ("sim" | "parcial" | "nao")[] }[] = [
  { criterio: "Organização acadêmica (disciplinas/notas)", valores: ["parcial", "nao", "nao", "nao", "sim"] },
  { criterio: "Prazos, provas e calendário", valores: ["parcial", "sim", "sim", "nao", "sim"] },
  { criterio: "Foco / pomodoro integrado", valores: ["nao", "nao", "nao", "sim", "sim"] },
  { criterio: "Acompanhamento de desempenho", valores: ["parcial", "nao", "parcial", "parcial", "sim"] },
  { criterio: "Acolhimento emocional / ambiente", valores: ["nao", "nao", "nao", "parcial", "sim"] },
  { criterio: "Tudo em um só lugar (sem montar)", valores: ["nao", "parcial", "parcial", "nao", "sim"] },
];

export const BENCH_GAPS = [
  "Nenhum concorrente reúne organização acadêmica + foco + acolhimento num só ambiente.",
  "Os genéricos exigem configuração manual; os acadêmicos são frios.",
  "Desempenho e bem-estar quase nunca aparecem juntos.",
  "Lacuna central: um espaço que o estudante queira reabrir — onde organizar seja consequência, não esforço.",
];

/* ── Arquitetura da informação e fluxos (Etapa 3) ────────────────────── */

export const NAV_MAP = {
  centro: "Quarto (cena 2.5D)",
  nos: [
    { icon: "💻", nome: "Computador", desc: "painel + Estuda (IA)" },
    { icon: "📓", nome: "Caderno", desc: "tarefas & anotações" },
    { icon: "📅", nome: "Calendário", desc: "mês & grade de aulas" },
    { icon: "📚", nome: "Estante", desc: "disciplinas, notas, CR, faltas" },
    { icon: "📻", nome: "Rádio", desc: "sons de foco" },
    { icon: "📔", nome: "Diário", desc: "esforço & constância" },
    { icon: "☕", nome: "Café", desc: "modo foco" },
    { icon: "💡", nome: "Luminária", desc: "ambiente & conta" },
  ],
};

export const HIERARQUIA = [
  "Quarto (raiz) — ponto de partida e retorno; nada “sai” da cena.",
  "Módulo (objeto) — aberto por ?open=<chave>, nasce do próprio objeto.",
  "Detalhe (item) — disciplina, tarefa ou nota específica (?id · ?task · ?note).",
  "Ações — criar, editar, concluir; sempre reversíveis (desfazer).",
];

export const FLUXOS = [
  { titulo: "Abrir um módulo", passos: ["Clicar no objeto (ou Ctrl+K / G+tecla)", "Câmera mergulha no objeto", "Módulo emerge como vidro", "Esc ou clicar fora retorna ao quarto"] },
  { titulo: "Lançar uma nota", passos: ["Estante → disciplina", "Avaliações & notas → digitar nota", "Média parcial e CR recalculam", "✓ aparece no calendário"] },
  { titulo: "Foco → revisão", passos: ["Café (foco) → escolher tempo", "Sessão → humor ao terminar", "Oferta de revisão (+2/+7 dias)", "Vira tarefa no calendário"] },
];

/* ── Cenários de uso (narrativos, ancorados na persona Marina) ───────── */

export const CENARIOS = [
  {
    titulo: "A véspera que deixou de ser susto",
    contexto: "Domingo à noite · prova de Cálculo na quinta",
    narrativa:
      "Marina abre o Nook e vê o post-it “em 4 dias”, sem alarme vermelho. Pede um plano à Estuda, que distribui três blocos até quarta. Liga o rádio LoFi, entra em foco por 50 min e, ao terminar, aceita revisar em 2 dias. Vai dormir sabendo o que fazer amanhã.",
  },
  {
    titulo: "A semana inteira num olhar",
    contexto: "Segunda de manhã · muitas entregas",
    narrativa:
      "Na grade de aulas ela vê os horários fixos; no calendário, as provas e tarefas, com os dias passados riscados. Cria uma tarefa direto no dia da entrega e segue para a primeira aula tranquila.",
  },
  {
    titulo: "O quarto do jeito dela",
    contexto: "Primeiro acesso",
    narrativa:
      "Depois das boas-vindas, Marina arrasta os objetos para aproximar o café da luminária, troca o tema para “Madrugada de chuva” e sente que o espaço é dela — não mais uma ferramenta.",
  },
];

/* ── Mapa de stakeholders (matriz poder × interesse — Mendelow) ───────── */

export type StakeQuadrant =
  | "gerenciar" // alto poder + alto interesse
  | "satisfeito" // alto poder + baixo interesse
  | "informado" // baixo poder + alto interesse
  | "monitorar"; // baixo poder + baixo interesse

export interface Stakeholder {
  id: string;
  name: string;
  /** interesse 0–100 (eixo X) */
  interesse: number;
  /** poder/influência 0–100 (eixo Y) */
  poder: number;
  note: string;
}

export const QUADRANTS: Record<
  StakeQuadrant,
  { label: string; strategy: string; color: string }
> = {
  gerenciar: { label: "Gerenciar de perto", strategy: "envolver nas decisões", color: "#E8A87C" },
  satisfeito: { label: "Manter satisfeito", strategy: "atender e não frustrar", color: "#8FA8BF" },
  informado: { label: "Manter informado", strategy: "ouvir e dar visibilidade", color: "#9CAF88" },
  monitorar: { label: "Monitorar", strategy: "acompanhar sem esforço", color: "#A8A49A" },
};

export function quadrantOf(s: Stakeholder): StakeQuadrant {
  const hiP = s.poder >= 50;
  const hiI = s.interesse >= 50;
  if (hiP && hiI) return "gerenciar";
  if (hiP && !hiI) return "satisfeito";
  if (!hiP && hiI) return "informado";
  return "monitorar";
}

export const STAKEHOLDERS: Stakeholder[] = [
  { id: "estudante", name: "Estudante (usuário primário)", interesse: 95, poder: 78, note: "Razão de ser do produto; adoção e permanência dependem dele." },
  { id: "equipe", name: "Equipe de produto", interesse: 80, poder: 93, note: "Design, dev e conteúdo — quem constrói e prioriza." },
  { id: "investidor", name: "Investidores", interesse: 62, poder: 70, note: "Financiam o crescimento; cobram métricas de retenção." },
  { id: "grupos", name: "Grupos de estudo / colegas", interesse: 74, poder: 40, note: "Usuários secundários; impulsionam adoção por indicação." },
  { id: "professor", name: "Professores", interesse: 56, poder: 54, note: "Fonte do conteúdo acadêmico (planos, provas); influenciam uso." },
  { id: "instituicao", name: "Instituição de ensino", interesse: 44, poder: 80, note: "Canal B2B2C potencial e autoridade sobre dados acadêmicos." },
  { id: "anthropic", name: "Provedor de IA (Anthropic)", interesse: 24, poder: 70, note: "Dependência técnica da Estuda; preço e limites afetam o produto." },
  { id: "stores", name: "App stores / plataformas", interesse: 20, poder: 82, note: "Gatekeepers de distribuição e políticas." },
  { id: "regulador", name: "Reguladores (LGPD)", interesse: 28, poder: 74, note: "Dados sensíveis de estudantes exigem conformidade." },
  { id: "familia", name: "Família / responsáveis", interesse: 38, poder: 46, note: "Em parte dos casos, pagadores do plano." },
  { id: "concorrente", name: "Concorrentes (Notion, Google…)", interesse: 32, poder: 34, note: "Definem expectativas de mercado; monitorar movimentos." },
];

/* ── Mapa de empatia (persona-âncora: Marina) ────────────────────────── */

export interface EmpathyQuadrant {
  key: string;
  title: string;
  icon: string;
  accent: string;
  items: string[];
}

export const EMPATHY_PERSONA = {
  name: "Marina",
  role: "Estudante LoFi · 4º semestre",
  avatar: "🎧",
  bio: "Organizada por impulso, ansiosa nas vésperas. Estuda ouvindo LoFi e quer um lugar que a acolha, não que a cobre.",
};

export const EMPATHY_MAP: EmpathyQuadrant[] = [
  {
    key: "pensa",
    title: "Pensa & sente",
    icon: "💭",
    accent: "#A99BC4",
    items: [
      "“Será que vou dar conta de tudo isso?”",
      "Ansiedade que aperta na véspera de prova",
      "Quer se sentir no controle, não cobrada",
      "Culpa quando percebe que procrastinou",
    ],
  },
  {
    key: "ve",
    title: "Vê",
    icon: "👀",
    accent: "#8FA8BF",
    items: [
      "Colegas postando rotinas de produtividade",
      "Apps acadêmicos frios e corporativos",
      "Vídeos de “study with me” e LoFi no YouTube",
      "A agenda do semestre lotando aos poucos",
    ],
  },
  {
    key: "ouve",
    title: "Ouve",
    icon: "👂",
    accent: "#9CAF88",
    items: [
      "“Você já começou a estudar pra prova?”",
      "Professores anunciando entregas de repente",
      "Dicas de produtividade que não se sustentam",
      "Playlists de foco recomendadas",
    ],
  },
  {
    key: "fala",
    title: "Fala & faz",
    icon: "🗣️",
    accent: "#E8A87C",
    items: [
      "Espalha tarefas em post-its e 3 apps diferentes",
      "Abre o YouTube “pra estudar” e se distrai",
      "Promete que “segunda eu me organizo”",
      "Estuda de madrugada, no susto",
    ],
  },
];

export const EMPATHY_PAINS = [
  "Ferramentas fragmentadas e impessoais",
  "Sensação de estar sempre atrasada",
  "Procrastinação que vira bola de neve",
  "Apps que parecem mais trabalho do que ajuda",
];

export const EMPATHY_GAINS = [
  "Um lugar só, que dá vontade de voltar",
  "Estudar com leveza e aconchego",
  "Constância sem streaks que punem",
  "Sentir que o ambiente cuida dela",
];

/* ── Jornada do usuário (ciclo de estudo, com Nook) ──────────────────── */

export interface JourneyPhase {
  id: string;
  label: string;
  icon: string;
  /** emoção de -2 (baixa) a +2 (alta), para a curva */
  emotion: number;
  emoji: string;
  action: string;
  thought: string;
  pain: string;
  nook: string;
}

export const JOURNEY: JourneyPhase[] = [
  {
    id: "gatilho",
    label: "Gatilho",
    icon: "📌",
    emotion: -1.5,
    emoji: "😰",
    action: "Vê uma prova marcada para o fim do semestre.",
    thought: "“Preciso me organizar, mas é muita coisa.”",
    pain: "O peso de tudo aparece de uma vez.",
    nook: "Post-it sereno no monitor e contagem “em 9 dias”, sem alarme vermelho.",
  },
  {
    id: "intencao",
    label: "Intenção",
    icon: "💡",
    emotion: -0.5,
    emoji: "😟",
    action: "Decide montar um plano de estudos.",
    thought: "“Por onde eu começo?”",
    pain: "Paralisia diante da página em branco.",
    nook: "A Estuda propõe um cronograma (propor → confirmar), pronto pra ajustar.",
  },
  {
    id: "organizacao",
    label: "Organização",
    icon: "🗂️",
    emotion: 0.4,
    emoji: "🙂",
    action: "Distribui tarefas e blocos de estudo.",
    thought: "“Agora consigo enxergar a semana.”",
    pain: "Ferramentas frias dispersam a informação.",
    nook: "Tudo em um quarto só; o radar de carga mostra o peso de cada dia.",
  },
  {
    id: "foco",
    label: "Foco",
    icon: "🎯",
    emotion: 1.1,
    emoji: "😌",
    action: "Senta para estudar de fato.",
    thought: "“Deixa eu entrar no clima.”",
    pain: "Distração: o YouTube puxa pra outro lugar.",
    nook: "Modo foco + rádio LoFi; o gato dorme na mesa, nada interrompe.",
  },
  {
    id: "conclusao",
    label: "Conclusão",
    icon: "✅",
    emotion: 1.6,
    emoji: "😄",
    action: "Marca a tarefa como concluída.",
    thought: "“Consegui o que planejei hoje.”",
    pain: "Apps atuais não dão reforço positivo.",
    nook: "Traço de caneta, vapor sobe da caneca, constância registrada com carinho.",
  },
  {
    id: "prova",
    label: "Prova",
    icon: "📝",
    emotion: 1.0,
    emoji: "🙂",
    action: "Faz a prova.",
    thought: "“Estudei do meu jeito, no meu ritmo.”",
    pain: "Insegurança de quem estudou correndo.",
    nook: "O histórico de constância dá confiança antes da prova.",
  },
  {
    id: "retrospectiva",
    label: "Retrospectiva",
    icon: "🌙",
    emotion: 1.6,
    emoji: "🥰",
    action: "Revê o que fez no período.",
    thought: "“Fui mais constante do que eu achava.”",
    pain: "Outros apps punem com o streak quebrado.",
    nook: "Estatísticas gentis: “você esteve aqui em 11 dos últimos 14 dias”.",
  },
];
