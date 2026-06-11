import { addDaysIso, iso, addDays } from "./dates";
import type { FocusSession, Note, Subject, Task } from "./types";

/**
 * Dados de demonstração ("modo demonstração" do onboarding).
 * Datas são relativas ao dia em que o app abre pela primeira vez,
 * para o cenário fazer sentido em qualquer momento.
 */

export const SUBJECT_COLORS = [
  "#C9A0A0", // rosé
  "#A0B8C9", // céu
  "#A8C9A0", // folha
  "#C9C2A0", // trigo
  "#B3A0C9", // íris
  "#A0C9C2", // lago
  "#C9ADA0", // pêssego
  "#A0A8C9", // anil
  "#BFC9A0", // lima-suave
  "#C9A0BC", // malva
];

export function seedSubjects(): Subject[] {
  return [
    {
      id: "calc2",
      name: "Cálculo II",
      code: "MAT-202",
      color: "#A0B8C9",
      professor: "Profa. Helena Duarte",
      room: "Bloco C, sala 214",
      schedule: [
        { weekday: 1, start: "08:00", end: "10:00" },
        { weekday: 3, start: "08:00", end: "10:00" },
      ],
      assessments: [
        { id: "c2p1", title: "Prova 1 — Integrais", kind: "prova", date: addDaysIso(-21), weight: 0.3, grade: 7.5 },
        { id: "c2p2", title: "Prova 2 — Séries", kind: "prova", date: addDaysIso(9), weight: 0.4, grade: null },
        { id: "c2t1", title: "Lista avaliativa 3", kind: "trabalho", date: addDaysIso(16), weight: 0.3, grade: null },
      ],
      materials: [
        { id: "c2m1", title: "Plano de ensino.pdf", kind: "arquivo" },
        { id: "c2m2", title: "Stewart — Cap. 11 (séries)", kind: "link", url: "#" },
      ],
    },
    {
      id: "aed",
      name: "Algoritmos e Estruturas de Dados",
      code: "INF-210",
      color: "#B3A0C9",
      professor: "Prof. Caio Nogueira",
      room: "Lab 3",
      schedule: [
        { weekday: 2, start: "10:00", end: "12:00" },
        { weekday: 4, start: "10:00", end: "12:00" },
      ],
      assessments: [
        { id: "aedp1", title: "Prova 1 — Listas e pilhas", kind: "prova", date: addDaysIso(-30), weight: 0.35, grade: 8.2 },
        { id: "aedp2", title: "Prova 2 — Árvores e grafos", kind: "prova", date: addDaysIso(3), weight: 0.35, grade: null },
        { id: "aedt1", title: "Projeto final", kind: "trabalho", date: addDaysIso(28), weight: 0.3, grade: null },
      ],
      materials: [
        { id: "aedm1", title: "Slides — árvores AVL", kind: "arquivo" },
        { id: "aedm2", title: "Visualgo", kind: "link", url: "https://visualgo.net" },
      ],
    },
    {
      id: "fis1",
      name: "Física I",
      code: "FIS-101",
      color: "#C9A0A0",
      professor: "Prof. Marcos Tavares",
      room: "Bloco B, sala 105",
      schedule: [
        { weekday: 2, start: "14:00", end: "16:00" },
        { weekday: 5, start: "14:00", end: "16:00" },
      ],
      assessments: [
        { id: "f1r1", title: "Relatório de laboratório 2", kind: "trabalho", date: addDaysIso(2), weight: 0.2, grade: null },
        { id: "f1p1", title: "Prova 1 — Cinemática", kind: "prova", date: addDaysIso(-14), weight: 0.4, grade: 5.8 },
        { id: "f1p2", title: "Prova 2 — Dinâmica", kind: "prova", date: addDaysIso(22), weight: 0.4, grade: null },
      ],
      materials: [{ id: "f1m1", title: "Roteiro do lab 2.pdf", kind: "arquivo" }],
    },
    {
      id: "bd",
      name: "Banco de Dados",
      code: "INF-230",
      color: "#A8C9A0",
      professor: "Profa. Lívia Sampaio",
      room: "Lab 1",
      schedule: [{ weekday: 3, start: "14:00", end: "17:00" }],
      assessments: [
        { id: "bdt1", title: "Modelagem ER do projeto", kind: "trabalho", date: addDaysIso(6), weight: 0.3, grade: null },
        { id: "bdp1", title: "Prova 1 — SQL e normalização", kind: "prova", date: addDaysIso(13), weight: 0.4, grade: null },
        { id: "bdt2", title: "Projeto final", kind: "trabalho", date: addDaysIso(35), weight: 0.3, grade: null },
      ],
      materials: [{ id: "bdm1", title: "Esquema do estudo de caso", kind: "arquivo" }],
    },
    {
      id: "engsoft",
      name: "Engenharia de Software",
      code: "INF-240",
      color: "#C9C2A0",
      professor: "Prof. André Luz",
      room: "Bloco D, sala 302",
      schedule: [{ weekday: 5, start: "08:00", end: "11:00" }],
      assessments: [
        { id: "est1", title: "Documento de requisitos", kind: "trabalho", date: addDaysIso(-7), weight: 0.25, grade: 9.0 },
        { id: "esp1", title: "Prova 1 — Processos", kind: "prova", date: addDaysIso(18), weight: 0.45, grade: null },
        { id: "est2", title: "Sprint review (equipe)", kind: "trabalho", date: addDaysIso(11), weight: 0.3, grade: null },
      ],
      materials: [{ id: "esm1", title: "Template de requisitos.docx", kind: "arquivo" }],
    },
  ];
}

export function seedTasks(): Task[] {
  const created = addDaysIso(-3);
  return [
    { id: "t1", title: "Terminar relatório do lab de Física", subjectId: "fis1", due: addDaysIso(1), done: false, createdAt: created },
    { id: "t2", title: "Lista 7 de Cálculo (séries de potências)", subjectId: "calc2", due: addDaysIso(2), done: false, createdAt: created },
    { id: "t3", title: "Revisar árvores AVL e rubro-negras", subjectId: "aed", due: addDaysIso(1), done: false, createdAt: created },
    { id: "t4", title: "Montar diagrama ER do projeto", subjectId: "bd", due: addDaysIso(5), done: false, createdAt: created },
    { id: "t5", title: "Ler cap. 4 do Sommerville", subjectId: "engsoft", due: addDaysIso(7), done: false, createdAt: created },
    { id: "t6", title: "Renovar livros na biblioteca", due: addDaysIso(0), done: false, createdAt: created },
    { id: "t7", title: "Exercícios de grafos do Visualgo", subjectId: "aed", due: addDaysIso(2), done: false, createdAt: created },
    { id: "t8", title: "Enviar dúvida da lista pro monitor", subjectId: "calc2", done: true, doneAt: addDaysIso(-1), createdAt: addDaysIso(-4) },
  ];
}

export function seedSessions(): FocusSession[] {
  // duas semanas de histórico verossímil, determinístico
  const pattern: { d: number; min: number; subjectId: string; mood: "leve" | "ok" | "pesado" }[] = [
    { d: -13, min: 50, subjectId: "calc2", mood: "ok" },
    { d: -12, min: 25, subjectId: "aed", mood: "leve" },
    { d: -11, min: 75, subjectId: "fis1", mood: "pesado" },
    { d: -9, min: 50, subjectId: "bd", mood: "ok" },
    { d: -8, min: 100, subjectId: "calc2", mood: "ok" },
    { d: -7, min: 25, subjectId: "engsoft", mood: "leve" },
    { d: -6, min: 50, subjectId: "aed", mood: "ok" },
    { d: -4, min: 75, subjectId: "calc2", mood: "ok" },
    { d: -3, min: 50, subjectId: "fis1", mood: "pesado" },
    { d: -2, min: 50, subjectId: "aed", mood: "leve" },
    { d: -1, min: 25, subjectId: "bd", mood: "ok" },
  ];
  return pattern.map((p, i) => ({
    id: `s${i}`,
    date: iso(addDays(new Date(), p.d)),
    minutes: p.min,
    subjectId: p.subjectId,
    mood: p.mood,
  }));
}

export function seedNotes(): Note[] {
  return [
    {
      id: "n1",
      title: "Resumo — Séries de potências",
      subjectId: "calc2",
      updatedAt: addDaysIso(-2),
      content:
        "# Séries de potências\n\nUma série de potências tem a forma **Σ aₙ(x − c)ⁿ**.\n\n## Convergência\n- **Geométrica** converge se |r| < 1, com soma a/(1 − r)\n- **Teste da razão**: lim |aₙ₊₁/aₙ| = L; converge se L < 1\n- O **raio de convergência** define o intervalo onde a série vale\n\n## Lembrar\n- Sempre checar os extremos do intervalo separadamente\n- Revisar os exemplos que a profa resolveu em aula",
    },
    {
      id: "n2",
      title: "Ideias para o projeto de Banco de Dados",
      subjectId: "bd",
      updatedAt: addDaysIso(-1),
      content:
        "Modelagem do estudo de caso (biblioteca):\n\n- Entidades: **Aluno**, **Livro**, **Empréstimo**, **Exemplar**\n- Empréstimo liga Aluno × Exemplar com data de retirada e devolução\n- Cuidar da normalização até a 3FN\n\nPerguntar à profa se exemplar e livro devem ser tabelas separadas.",
    },
    {
      id: "n3",
      title: "Notas rápidas",
      updatedAt: addDaysIso(0),
      content:
        "- Perguntar ao monitor sobre a lista 7 de Cálculo\n- Levar calculadora na prova de Física\n- Renovar os livros antes de sexta",
    },
  ];
}
