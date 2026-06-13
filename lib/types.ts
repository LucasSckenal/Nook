export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface ClassSlot {
  weekday: Weekday; // 0 = domingo
  start: string; // "HH:mm"
  end: string;
}

export interface Assessment {
  id: string;
  title: string;
  kind: "prova" | "trabalho";
  date: string; // ISO yyyy-mm-dd
  weight: number; // 0–1, soma 1 por disciplina
  grade: number | null; // 0–10
}

export interface Material {
  id: string;
  title: string;
  kind: "arquivo" | "link";
  url?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string;
  professor?: string;
  room?: string;
  schedule: ClassSlot[];
  assessments: Assessment[];
  materials: Material[];
}

export interface Task {
  id: string;
  title: string;
  subjectId?: string;
  due?: string; // ISO yyyy-mm-dd
  done: boolean;
  doneAt?: string;
  notes?: string; // anotações em markdown leve
  color?: string; // cor de destaque escolhida pelo usuário
  recurring?: boolean; // semanal: ao concluir, renasce +7 dias
  createdAt: string;
}

export type Mood = "leve" | "ok" | "pesado";

export interface FocusSession {
  id: string;
  date: string; // ISO yyyy-mm-dd
  minutes: number;
  subjectId?: string;
  taskId?: string;
  goal?: string;
  mood?: Mood;
}

export type ThemeId = "meia-noite" | "entardecer" | "madrugada" | "lampiao";

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId?: string;
  updatedAt: string; // ISO yyyy-mm-dd
}

export type StationId = "lofi" | "chuva" | "biblioteca" | "cafeteria" | "white";

export interface RadioState {
  station: StationId;
  playing: boolean;
  volume: number; // 0–1
  rainLayer: boolean; // camada ambiente de chuva
  rainVolume: number;
  sleepMinutes: number | null; // timer de som
}
