"use client";

import { useMounted } from "@/components/useMounted";
import { useSyncStatus } from "@/lib/syncStatus";

/**
 * Indicador discreto do estado da sincronização (Nielsen #1: visibilidade do
 * estado do sistema). Some no modo visitante; quando logado, mostra
 * salvando… / salvo ☁️ / offline.
 */
export function SyncIndicator({ className = "" }: { className?: string }) {
  const mounted = useMounted();
  const status = useSyncStatus((s) => s.status);

  if (!mounted || status === "guest") return null;

  const map = {
    saving: { dot: "var(--color-amber)", text: "salvando…", pulse: true, title: "Salvando na nuvem" },
    saved: { dot: "var(--color-moss)", text: "salvo", pulse: false, title: "Tudo salvo na sua conta" },
    offline: { dot: "var(--color-clay)", text: "offline", pulse: false, title: "Sem conexão — salvo neste aparelho, sincroniza ao reconectar" },
  }[status];

  return (
    <span
      className={`flex items-center gap-1.5 text-xs text-ink-low ${className}`}
      title={map.title}
      role="status"
      aria-live="polite"
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${map.pulse ? "nk-led-on" : ""}`}
        style={{ background: map.dot }}
        aria-hidden
      />
      {map.text}
      {status === "saved" && <span aria-hidden>☁️</span>}
    </span>
  );
}
