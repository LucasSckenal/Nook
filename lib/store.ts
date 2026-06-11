"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type {
  FocusSession,
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

  // tarefas
  addTask: (t: { title: string; subjectId?: string; due?: string }) => void;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  restoreTask: (t: Task) => void;
  rescheduleTask: (id: string, due: string) => void;

  // notas
  addNote: (n?: { subjectId?: string }) => string;
  updateNote: (id: string, patch: Partial<Omit<Note, "id">>) => void;
  removeNote: (id: string) => void;

  // notas de disciplina (avaliações)
  setGrade: (subjectId: string, assessmentId: string, grade: number | null) => void;

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
  resetDemo: () => void;
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
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, done: !t.done, doneAt: !t.done ? todayIso() : undefined }
              : t
          ),
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

      resetDemo: () =>
        set({
          subjects: seedSubjects(),
          tasks: seedTasks(),
          sessions: seedSessions(),
          notes: seedNotes(),
        }),
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

/** média atual + nota necessária nas avaliações restantes para fechar em 6.0 */
export function gradeOutlook(sub: Subject) {
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
  const neededAvg = weightLeft > 0 ? (6 - earned) / weightLeft : null;
  return {
    current,
    weightDone,
    neededAvg: neededAvg == null ? null : Math.max(0, neededAvg),
    closed: weightLeft === 0,
    finalIfClosed: weightLeft === 0 ? earned : null,
  };
}
