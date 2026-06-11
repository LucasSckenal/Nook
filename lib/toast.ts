"use client";

import { create } from "zustand";

export interface Toast {
  id: string;
  message: string;
  undoLabel?: string;
  onUndo?: () => void;
}

interface ToastState {
  toasts: Toast[];
  push: (t: Omit<Toast, "id">) => void;
  dismiss: (id: string) => void;
}

const DURATION = 6000;

export const useToasts = create<ToastState>((set, get) => ({
  toasts: [],
  push: (t) => {
    const id = `to-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }));
    window.setTimeout(() => get().dismiss(id), DURATION);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

/** atalho para uso fora de componentes (ex.: dentro de handlers) */
export const toast = (t: Omit<Toast, "id">) => useToasts.getState().push(t);
