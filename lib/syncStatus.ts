"use client";

import { create } from "zustand";

/**
 * Estado de sincronização com a nuvem — separado do store principal porque é
 * efêmero (não persiste, não vai pro Firestore). Alimenta o indicador de
 * "salvando… / salvo ☁️ / offline" (Nielsen #1: visibilidade do estado).
 */
export type SyncState = "guest" | "saving" | "saved" | "offline";

interface SyncStatusStore {
  status: SyncState;
  setStatus: (s: SyncState) => void;
}

export const useSyncStatus = create<SyncStatusStore>((set) => ({
  status: "guest",
  setStatus: (status) => set({ status }),
}));
