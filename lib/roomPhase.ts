"use client";

import { create } from "zustand";

/**
 * Fase do quarto (dia/noite) — efêmero, compartilhado entre a cena (que
 * renderiza o vídeo de fundo) e o header (toggle ☀️/🌙). Ao mudar de fase,
 * marca a transição a tocar uma vez por cima do loop.
 */
export type Phase = "dia" | "noite";
export type Transition = "diaPraNoite" | "noitePraDia" | null;

/** fase pelo relógio: dia das 6h às 18h, noite no resto */
export function phaseFromClock(): Phase {
  const h = new Date().getHours();
  return h >= 6 && h < 18 ? "dia" : "noite";
}

interface RoomPhaseStore {
  phase: Phase;
  transition: Transition;
  initialized: boolean;
  /** o usuário escolheu a fase à mão? (desliga o auto-relógio) */
  manual: boolean;
  /** define a fase inicial (pelo horário real) sem tocar transição */
  init: (p: Phase) => void;
  /** muda a fase tocando a transição correspondente */
  setPhase: (p: Phase) => void;
  /** alternância manual (passa a ignorar o relógio até recarregar) */
  toggle: () => void;
  /** o sol seguindo o relógio — só age se o usuário não tiver escolhido */
  autoAdvance: () => void;
  clearTransition: () => void;
}

export const useRoomPhase = create<RoomPhaseStore>((set, get) => ({
  phase: "noite",
  transition: null,
  initialized: false,
  manual: false,
  init: (p) => set({ phase: p, initialized: true }),
  setPhase: (p) => {
    if (p === get().phase) return;
    set({
      phase: p,
      transition: p === "noite" ? "diaPraNoite" : "noitePraDia",
    });
  },
  toggle: () => {
    set({ manual: true });
    get().setPhase(get().phase === "dia" ? "noite" : "dia");
  },
  autoAdvance: () => {
    if (get().manual) return;
    get().setPhase(phaseFromClock());
  },
  clearTransition: () => set({ transition: null }),
}));
