"use client";

import Link from "next/link";
import { subjectById, useNook } from "@/lib/store";
import { relativeDay, todayIso } from "@/lib/dates";
import { toast } from "@/lib/toast";
import { audioUiTick } from "@/lib/audio";
import type { Task } from "@/lib/types";

export function TaskRow({ task }: { task: Task }) {
  const subjects = useNook((s) => s.subjects);
  const toggleTask = useNook((s) => s.toggleTask);
  const removeTask = useNook((s) => s.removeTask);
  const restoreTask = useNook((s) => s.restoreTask);
  const uiSounds = useNook((s) => s.uiSounds);
  const sub = subjectById(subjects, task.subjectId);
  const overdue = !task.done && task.due && task.due < todayIso();

  function onToggle() {
    const willComplete = !task.done;
    toggleTask(task.id);
    if (willComplete) {
      if (uiSounds) {
        try {
          audioUiTick();
        } catch {
          /* contexto de áudio pode exigir gesto; silencioso */
        }
      }
      toast({
        message: "Tarefa concluída.",
        undoLabel: "desfazer",
        onUndo: () => toggleTask(task.id),
      });
    }
  }

  function onDelete() {
    const snapshot = task;
    removeTask(task.id);
    toast({
      message: "Tarefa apagada.",
      undoLabel: "desfazer",
      onUndo: () => restoreTask(snapshot),
    });
  }

  return (
    <div
      className={`group flex items-center gap-3 rounded-(--radius-md) px-3 py-2.5 transition-colors hover:bg-raised/60 ${
        task.done ? "nk-done opacity-50" : ""
      }`}
    >
      <button
        onClick={onToggle}
        aria-label={task.done ? "Reabrir tarefa" : "Concluir tarefa"}
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all duration-(--nk-dur-instant) ${
          task.done
            ? "border-moss bg-moss/20 text-moss"
            : "border-ink-faint text-transparent hover:border-amber"
        }`}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path
            d="M2 6.5 L4.8 9 L10 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <span
        className={`min-w-0 flex-1 truncate text-sm ${
          task.done ? "text-ink-low line-through decoration-moss/50" : "text-ink-high"
        }`}
      >
        {task.title}
      </span>

      {sub && (
        <Link
          href={`/disciplinas/${sub.id}`}
          className="hidden shrink-0 rounded-full px-2 py-0.5 text-xs sm:inline"
          style={{ background: `${sub.color}22`, color: sub.color }}
        >
          {sub.name}
        </Link>
      )}

      {task.due && !task.done && (
        <span
          className={`shrink-0 text-xs ${overdue ? "font-semibold text-clay" : "text-ink-low"}`}
        >
          {relativeDay(task.due)}
        </span>
      )}

      {!task.done && (
        <Link
          href={`/?open=foco&task=${task.id}`}
          title="Focar nesta tarefa"
          className="shrink-0 rounded-(--radius-sm) px-1.5 py-0.5 text-xs text-ink-low opacity-0 transition-all hover:text-amber group-hover:opacity-100"
        >
          ▶ focar
        </Link>
      )}

      <button
        onClick={onDelete}
        title="Apagar tarefa"
        aria-label="Apagar tarefa"
        className="shrink-0 rounded-(--radius-sm) px-1.5 py-0.5 text-xs text-ink-low opacity-0 transition-all hover:text-clay group-hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
