"use client";

import { useToasts } from "@/lib/toast";

/** Pilha de toasts no canto inferior esquerdo — acima da dock, com desfazer. */
export function ToastHost() {
  const toasts = useToasts((s) => s.toasts);
  const dismiss = useToasts((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-50 flex w-[min(340px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="nk-raised pointer-events-auto flex items-center gap-3 px-4 py-3 text-sm"
          style={{ animation: "nk-reveal 240ms var(--nk-ease-room) both" }}
          role="status"
        >
          <span className="flex-1 text-ink-mid">{t.message}</span>
          {t.onUndo && (
            <button
              onClick={() => {
                t.onUndo?.();
                dismiss(t.id);
              }}
              className="shrink-0 rounded-(--radius-sm) px-2 py-1 text-xs font-medium text-amber transition-colors hover:bg-amber/10"
            >
              {t.undoLabel ?? "desfazer"}
            </button>
          )}
          <button
            onClick={() => dismiss(t.id)}
            aria-label="Fechar"
            className="shrink-0 text-ink-low transition-colors hover:text-ink-mid"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
