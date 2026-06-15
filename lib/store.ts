"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  Assessment,
  ClassSlot,
  FocusSession,
  Material,
  Note,
  RadioState,
  StationId,
  Subject,
  Task,
  ThemeId,
} from "./types";
import { seedNotes, seedSessions, seedSubjects, seedTasks } from "./seed";
import { todayIso } from "./dates";

interface NookState {
  userName: string;
  onboarded: boolean;
  subjects: Subject[];
  tasks: Task[];
  sessions: FocusSession[];
  notes: Note[];
  radio: RadioState;
  rainVisual: boolean; // chuva na janela do quarto

  // preferências
  theme: ThemeId;
  uiSounds: boolean;
  calmMotion: boolean;
  geminiKey: string; // chave da API do Gemini (opcional) — Estuda com IA real
  /** posições custom dos objetos do quarto (por chave de objeto); vazio = padrão */
  roomLayout: Record<string, { left: number; top: number; width: number }>;

  // tarefas
  addTask: (t: { title: string; subjectId?: string; due?: string }) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  restoreTask: (t: Task) => void;
  rescheduleTask: (id: string, due: string) => void;
  updateTask: (id: string, patch: Partial<Omit<Task, "id">>) => void;

  // notas
  addNote: (n?: { subjectId?: string }) => string;
  updateNote: (id: string, patch: Partial<Omit<Note, "id">>) => void;
  removeNote: (id: string) => void;

  // disciplinas
  addSubject: (s: {
    name: string;
    code?: string;
    color: string;
    emoji?: string;
    professor?: string;
    room?: string;
    schedule?: ClassSlot[];
  }) => string;
  updateSubject: (id: string, patch: Partial<Omit<Subject, "id">>) => void;
  removeSubject: (id: string) => void;
  restoreSubject: (s: Subject) => void;

  // avaliações
  addAssessment: (
    subjectId: string,
    a: { title: string; kind: Assessment["kind"]; date: string; weight: number }
  ) => void;
  removeAssessment: (subjectId: string, assessmentId: string) => void;
  setGrade: (subjectId: string, assessmentId: string, grade: number | null) => void;

  // materiais (links por enquanto; arquivos chegam com o Storage)
  addMaterial: (subjectId: string, m: { title: string; kind: Material["kind"]; url?: string }) => void;
  removeMaterial: (subjectId: string, materialId: string) => void;

  // foco
  addSession: (s: Omit<FocusSession, "id" | "date">) => void;

  // rádio
  setRadio: (patch: Partial<RadioState>) => void;
  setStation: (s: StationId) => void;

  setRainVisual: (v: boolean) => void;
  setUserName: (n: string) => void;
  setOnboarded: (v: boolean) => void;
  setTheme: (t: ThemeId) => void;
  setUiSounds: (v: boolean) => void;
  setCalmMotion: (v: boolean) => void;
  setGeminiKey: (k: string) => void;
  setRoomLayout: (layout: Record<string, { left: number; top: number; width: number }>) => void;
  resetRoomLayout: () => void;
  resetDemo: () => void;

  /** substitui os dados do semestre (vindos da nuvem) sem tocar nas prefs locais */
  hydrate: (data: Partial<SyncSlice>) => void;
}

/** o que mora na nuvem (Firestore) — o resto é preferência do aparelho */
export interface SyncSlice {
  subjects: Subject[];
  tasks: Task[];
  sessions: FocusSession[];
  notes: Note[];
  userName: string;
}

export const SYNC_KEYS: (keyof SyncSlice)[] = [
  "subjects",
  "tasks",
  "sessions",
  "notes",
  "userName",
];

/** extrai só a fatia sincronizável do estado */
export function syncSlice(s: SyncSlice): SyncSlice {
  return {
    subjects: s.subjects,
    tasks: s.tasks,
    sessions: s.sessions,
    notes: s.notes,
    userName: s.userName,
  };
}

const nextId = () =>
  `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const useNook = create<NookState>()(
  persist(
    (set) => ({
      userName: "Marina",
      onboarded: false,
      subjects: seedSubjects(),
      tasks: seedTasks(),
      sessions: seedSessions(),
      notes: seedNotes(),
      rainVisual: true,
      theme: "meia-noite",
      uiSounds: true,
      calmMotion: false,
      geminiKey: "",
      roomLayout: {},
      radio: {
        station: "lofi",
        playing: false,
        volume: 0.6,
        rainLayer: false,
        rainVolume: 0.4,
        sleepMinutes: null,
      },

      addTask: (t) =>
        set((s) => ({
          tasks: [
            { id: nextId(), title: t.title, subjectId: t.subjectId, due: t.due, done: false, createdAt: todayIso() },
            ...s.tasks,
          ],
        })),

      toggleTask: (id) =>
        set((s) => {
          const target = s.tasks.find((t) => t.id === id);
          const completing = target && !target.done;
          let tasks = s.tasks.map((t) =>
            t.id === id
              ? { ...t, done: !t.done, doneAt: !t.done ? todayIso() : undefined }
              : t
          );
          // recorrência semanal: ao concluir, a tarefa renasce pra semana que vem
          if (completing && target.recurring) {
            const base = target.due ?? todayIso();
            const d = new Date(`${base}T12:00:00`);
            d.setDate(d.getDate() + 7);
            const nextDue = d.toISOString().slice(0, 10);
            tasks = [
              {
                ...target,
                id: nextId(),
                due: nextDue,
                done: false,
                doneAt: undefined,
                createdAt: todayIso(),
              },
              ...tasks,
            ];
          }
          return { tasks };
        }),

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)),
        })),

      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      restoreTask: (t) =>
        set((s) => (s.tasks.some((x) => x.id === t.id) ? s : { tasks: [t, ...s.tasks] })),

      rescheduleTask: (id, due) =>
        set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, due } : t)) })),

      addNote: (n) => {
        const id = nextId();
        set((s) => ({
          notes: [
            { id, title: "", content: "", subjectId: n?.subjectId, updatedAt: todayIso() },
            ...s.notes,
          ],
        }));
        return id;
      },

      updateNote: (id, patch) =>
        set((s) => ({
          notes: s.notes.map((n) =>
            n.id === id ? { ...n, ...patch, updatedAt: todayIso() } : n
          ),
        })),

      removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

      addSubject: (s) => {
        const id = nextId();
        set((st) => ({
          subjects: [
            ...st.subjects,
            {
              id,
              name: s.name,
              code: s.code ?? "",
              color: s.color,
              emoji: s.emoji,
              professor: s.professor,
              room: s.room,
              schedule: s.schedule ?? [],
              assessments: [],
              materials: [],
            },
          ],
        }));
        return id;
      },

      updateSubject: (id, patch) =>
        set((st) => ({
          subjects: st.subjects.map((sub) => (sub.id === id ? { ...sub, ...patch } : sub)),
        })),

      removeSubject: (id) =>
        set((st) => ({
          subjects: st.subjects.filter((sub) => sub.id !== id),
          // tarefas e notas da disciplina ficam, só perdem o vínculo
          tasks: st.tasks.map((t) => (t.subjectId === id ? { ...t, subjectId: undefined } : t)),
          notes: st.notes.map((n) => (n.subjectId === id ? { ...n, subjectId: undefined } : n)),
        })),

      restoreSubject: (sub) =>
        set((st) =>
          st.subjects.some((x) => x.id === sub.id) ? st : { subjects: [...st.subjects, sub] }
        ),

      addAssessment: (subjectId, a) =>
        set((st) => ({
          subjects: st.subjects.map((sub) =>
            sub.id === subjectId
              ? {
                  ...sub,
                  assessments: [...sub.assessments, { ...a, id: nextId(), grade: null }],
                }
              : sub
          ),
        })),

      removeAssessment: (subjectId, assessmentId) =>
        set((st) => ({
          subjects: st.subjects.map((sub) =>
            sub.id === subjectId
              ? { ...sub, assessments: sub.assessments.filter((a) => a.id !== assessmentId) }
              : sub
          ),
        })),

      setGrade: (subjectId, assessmentId, grade) =>
        set((s) => ({
          subjects: s.subjects.map((sub) =>
            sub.id === subjectId
              ? {
                  ...sub,
                  assessments: sub.assessments.map((a) =>
                    a.id === assessmentId ? { ...a, grade } : a
                  ),
                }
              : sub
          ),
        })),

      addMaterial: (subjectId, m) =>
        set((st) => ({
          subjects: st.subjects.map((sub) =>
            sub.id === subjectId
              ? { ...sub, materials: [...sub.materials, { ...m, id: nextId() }] }
              : sub
          ),
        })),

      removeMaterial: (subjectId, materialId) =>
        set((st) => ({
          subjects: st.subjects.map((sub) =>
            sub.id === subjectId
              ? { ...sub, materials: sub.materials.filter((mt) => mt.id !== materialId) }
              : sub
          ),
        })),

      addSession: (sess) =>
        set((s) => ({
          sessions: [...s.sessions, { ...sess, id: nextId(), date: todayIso() }],
        })),

      setRadio: (patch) => set((s) => ({ radio: { ...s.radio, ...patch } })),
      setStation: (station) => set((s) => ({ radio: { ...s.radio, station } })),

      setRainVisual: (rainVisual) => set({ rainVisual }),
      setUserName: (userName) => set({ userName }),
      setOnboarded: (onboarded) => set({ onboarded }),
      setTheme: (theme) => set({ theme }),
      setUiSounds: (uiSounds) => set({ uiSounds }),
      setCalmMotion: (calmMotion) => set({ calmMotion }),
      setGeminiKey: (geminiKey) => set({ geminiKey }),
      setRoomLayout: (roomLayout) => set({ roomLayout }),
      resetRoomLayout: () => set({ roomLayout: {} }),

      resetDemo: () =>
        set({
          subjects: seedSubjects(),
          tasks: seedTasks(),
          sessions: seedSessions(),
          notes: seedNotes(),
        }),

      hydrate: (data) => set((s) => ({ ...s, ...data })),
    }),
    {
      name: "nook-v1",
      storage: createJSONStorage(() => localStorage),
      // o estado de "tocando" do rádio não deve persistir entre sessões
      partialize: (s) => ({
        ...s,
        radio: { ...s.radio, playing: false, sleepMinutes: null },
      }),
    }
  )
);

/* ── seletores derivados ───────────────────────────────────────────── */

export function subjectById(subjects: Subject[], id?: string) {
  return subjects.find((s) => s.id === id);
}

/** média atual + nota necessária nas avaliações restantes para fechar na meta */
export function gradeOutlook(sub: Subject) {
  const target = sub.targetGrade ?? 6;
  let earned = 0;
  let weightDone = 0;
  for (const a of sub.assessments) {
    if (a.grade != null) {
      earned += a.grade * a.weight;
      weightDone += a.weight;
    }
  }
  const weightLeft = Math.max(0, 1 - weightDone);
  const current = weightDone > 0 ? earned / weightDone : null;
  const neededAvg = weightLeft > 0 ? (target - earned) / weightLeft : null;
  return {
    current,
    weightDone,
    target,
    neededAvg: neededAvg == null ? null : Math.max(0, neededAvg),
    closed: weightLeft === 0,
    finalIfClosed: weightLeft === 0 ? earned : null,
  };
}

/** coeficiente do semestre (CR): média das disciplinas com nota, ponderada por créditos */
export function semesterGPA(subjects: Subject[]) {
  let sum = 0;
  let weight = 0;
  let counted = 0;
  for (const s of subjects) {
    const o = gradeOutlook(s);
    if (o.current == null) continue;
    const c = s.credits && s.credits > 0 ? s.credits : 1;
    sum += o.current * c;
    weight += c;
    counted += 1;
  }
  return { cr: weight > 0 ? sum / weight : null, counted };
}
