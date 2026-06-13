"use client";

import { useState } from "react";
import { useNook } from "@/lib/store";

const TASK_COLORS = ["#e8a87c", "#9caf88", "#8fa8bf", "#a99bc4", "#c97b63", "#d98c98"];

/** markdown leve: #, ##, **negrito**, listas com - */
function renderMd(src: string) {
  const lines = src.split("\n");
  return lines.map((line, i) => {
    const bold = (s: string) =>
      s.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={j} className="text-ink-high">{part.slice(2, -2)}</strong>
        ) : (
          part
        )
      );
    if (line.startsWith("## "))
      return <p key={i} className="mt-2 text-sm font-medium text-ink-high">{bold(line.slice(3))}</p>;
    if (line.startsWith("# "))
      return <p key={i} className="mt-2 font-display text-base text-ink-high">{bold(line.slice(2))}</p>;
    if (line.startsWith("- "))
      return (
        <p key={i} className="flex gap-2 text-sm text-ink-mid">
          <span className="text-ink-low">·</span>
          <span>{bold(line.slice(2))}</span>
        </p>
      );
    if (line.trim() === "") return <span key={i} className="block h-2" />;
    return <p key={i} className="text-sm text-ink-mid">{bold(line)}</p>;
  });
}

/** detalhe da tarefa — personalização estilo caderno: cor, prazo, repetição e anotações */
export function TaskDetail({ taskId, onClose }: { taskId: string; onClose: () => void }) {
  const task = useNook((s) => s.tasks.find((t) => t.id === taskId));
  const subjects = useNook((s) => s.subjects);
  const updateTask = useNook((s) => s.updateTask);
  const [tab, setTab] = useState<"editar" | "ler">(task?.notes ? "ler" : "editar");

  if (!task) return null;

  return (
    <div
      className="nk-card nk-reveal mt-4 p-5"
      style={task.color ? { boxShadow: `0 0 0 1px ${task.color}55` } : undefined}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <input
          value={task.title}
          onChange={(e) => updateTask(task.id, { title: e.target.value })}
          className="min-w-0 flex-1 bg-transparent font-display text-xl text-ink-high focus:outline-none"
          aria-label="Título da tarefa"
        />
        <button
          onClick={onClose}
          className="rounded-(--radius-sm) px-2 py-1 text-xs text-ink-low transition-colors hover:text-ink-high"
        >
          fechar
        </button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        {/* prazo */}
        <label className="flex items-center gap-2 text-xs text-ink-low">
          prazo
          <input
            type="date"
            value={task.due ?? ""}
            onChange={(e) => updateTask(task.id, { due: e.target.value || undefined })}
            className="rounded-(--radius-sm) bg-raised px-2 py-1.5 text-sm text-ink-mid focus:outline-none"
          />
        </label>

        {/* disciplina */}
        <label className="flex items-center gap-2 text-xs text-ink-low">
          disciplina
          <select
            value={task.subjectId ?? ""}
            onChange={(e) => updateTask(task.id, { subjectId: e.target.value || undefined })}
            className="rounded-(--radius-sm) bg-raised px-2 py-1.5 text-sm text-ink-mid focus:outline-none"
          >
            <option value="">nenhuma</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </label>

        {/* cor */}
        <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Cor da tarefa">
          <span className="mr-0.5 text-xs text-ink-low">cor</span>
          <button
            role="radio"
            aria-checked={!task.color}
            aria-label="Sem cor"
            onClick={() => updateTask(task.id, { color: undefined })}
            className="flex h-5 w-5 items-center justify-center rounded-full border border-ink-faint text-[10px] text-ink-low transition-transform hover:scale-110"
          >
            ✕
          </button>
          {TASK_COLORS.map((c) => (
            <button
              key={c}
              role="radio"
              aria-checked={task.color === c}
              aria-label={`Cor ${c}`}
              onClick={() => updateTask(task.id, { color: c })}
              className="h-5 w-5 rounded-full transition-transform hover:scale-110"
              style={{
                background: c,
                boxShadow: task.color === c ? `0 0 0 2px var(--color-surface), 0 0 0 4px ${c}` : "none",
              }}
            />
          ))}
        </div>

        {/* recorrência */}
        <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-low">
          <input
            type="checkbox"
            checked={!!task.recurring}
            onChange={(e) => updateTask(task.id, { recurring: e.target.checked })}
            className="h-3.5 w-3.5 accent-(--color-amber)"
          />
          repete toda semana ↻
        </label>
      </div>

      {/* anotações em markdown */}
      <div className="rounded-(--radius-md) bg-raised/50 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs text-ink-low">anotações · markdown simples (#, ##, **, -)</p>
          <div className="flex gap-1">
            {(["editar", "ler"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-(--radius-sm) px-2 py-0.5 text-xs transition-colors ${
                  tab === t ? "bg-surface text-amber" : "text-ink-low hover:text-ink-mid"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        {tab === "editar" ? (
          <textarea
            value={task.notes ?? ""}
            onChange={(e) => updateTask(task.id, { notes: e.target.value || undefined })}
            placeholder={"## Anotações\n- detalhes, links, o que importa\n- **negrito** com asteriscos"}
            rows={6}
            className="w-full resize-y bg-transparent text-sm leading-relaxed text-ink-high placeholder:text-ink-faint focus:outline-none"
          />
        ) : (
          <div className="min-h-[80px] space-y-0.5">
            {task.notes ? renderMd(task.notes) : (
              <p className="text-sm text-ink-faint">nada anotado ainda — clique em “editar”</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
