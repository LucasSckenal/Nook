"use client";

import { useMemo, useState } from "react";
import { TaskRow } from "@/components/TaskRow";
import { NotesPane } from "@/components/NotesPane";
import { useMounted } from "@/components/useMounted";
import { addDaysIso, todayIso } from "@/lib/dates";
import { useNook } from "@/lib/store";

type Filter = "hoje" | "semana" | "tudo" | "feitas";

export default function TarefasPage() {
  const mounted = useMounted();
  const tasks = useNook((s) => s.tasks);
  const subjects = useNook((s) => s.subjects);
  const addTask = useNook((s) => s.addTask);
  const notesCount = useNook((s) => s.notes.length);

  const [pane, setPane] = useState<"tarefas" | "anotacoes">("tarefas");
  const [filter, setFilter] = useState<Filter>("semana");
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [due, setDue] = useState("");

  const filtered = useMemo(() => {
    const today = todayIso();
    const weekEnd = addDaysIso(7);
    const open = tasks.filter((t) => !t.done);
    switch (filter) {
      case "hoje":
        return open.filter((t) => t.due && t.due <= today);
      case "semana":
        return open.filter((t) => !t.due || t.due <= weekEnd);
      case "tudo":
        return open;
      case "feitas":
        return tasks.filter((t) => t.done);
    }
  }, [tasks, filter]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        if (!a.due && !b.due) return 0;
        if (!a.due) return 1;
        if (!b.due) return -1;
        return a.due.localeCompare(b.due);
      }),
    [filtered]
  );

  if (!mounted)
    return (
      <div className="space-y-3">
        <div className="nk-skeleton h-12 w-full" />
        <div className="nk-skeleton h-64 w-full" />
      </div>
    );

  if (pane === "anotacoes") {
    return (
      <div className="mx-auto max-w-[960px]">
        <PaneSwitch pane={pane} setPane={setPane} notesCount={notesCount} />
        <NotesPane />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[760px]">
      <PaneSwitch pane={pane} setPane={setPane} notesCount={notesCount} />
      {/* captura rápida */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!title.trim()) return;
          addTask({
            title: title.trim(),
            subjectId: subjectId || undefined,
            due: due || undefined,
          });
          setTitle("");
          setDue("");
        }}
        className="nk-card nk-reveal mb-6 flex flex-wrap items-center gap-2 p-3"
      >
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="O que precisa ser feito? (dica: Ctrl+K também cria tarefas)"
          className="min-w-[200px] flex-1 rounded-(--radius-sm) bg-transparent px-3 py-2 text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
        />
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="rounded-(--radius-sm) bg-raised px-3 py-2 text-sm text-ink-mid focus:outline-none"
        >
          <option value="">sem disciplina</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={due}
          onChange={(e) => setDue(e.target.value)}
          className="rounded-(--radius-sm) bg-raised px-3 py-2 text-sm text-ink-mid focus:outline-none"
        />
        <button
          type="submit"
          disabled={!title.trim()}
          className="rounded-(--radius-sm) bg-amber px-4 py-2 text-sm font-medium text-void disabled:opacity-40"
        >
          adicionar
        </button>
      </form>

      {/* filtros */}
      <div className="nk-reveal nk-reveal-1 mb-4 flex gap-1 rounded-(--radius-md) bg-surface p-1">
        {(["hoje", "semana", "tudo", "feitas"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 rounded-(--radius-sm) px-3 py-1.5 text-sm capitalize transition-colors ${
              filter === f ? "bg-raised text-ink-high" : "text-ink-mid hover:text-ink-high"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* lista */}
      <div className="nk-card nk-reveal nk-reveal-2 p-2">
        {sorted.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="mb-1 text-2xl">🌙</p>
            <p className="text-sm text-ink-mid">
              {filter === "feitas"
                ? "Nada concluído ainda — sem pressa."
                : "Tudo limpo por aqui. Aproveita o silêncio."}
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {sorted.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        )}
      </div>

      <p className="mt-4 text-center text-xs text-ink-low">
        concluir é reversível — clique de novo na caixinha para reabrir
      </p>
    </div>
  );
}

function PaneSwitch({
  pane,
  setPane,
  notesCount,
}: {
  pane: "tarefas" | "anotacoes";
  setPane: (p: "tarefas" | "anotacoes") => void;
  notesCount: number;
}) {
  return (
    <div className="nk-reveal mb-5 flex gap-1 rounded-(--radius-md) bg-surface p-1">
      <button
        onClick={() => setPane("tarefas")}
        className={`flex-1 rounded-(--radius-sm) px-3 py-2 text-sm transition-colors ${
          pane === "tarefas" ? "bg-raised text-ink-high" : "text-ink-mid hover:text-ink-high"
        }`}
      >
        ✓ Tarefas
      </button>
      <button
        onClick={() => setPane("anotacoes")}
        className={`flex-1 rounded-(--radius-sm) px-3 py-2 text-sm transition-colors ${
          pane === "anotacoes" ? "bg-raised text-ink-high" : "text-ink-mid hover:text-ink-high"
        }`}
      >
        ✎ Anotações{" "}
        <span className="text-ink-low">({notesCount})</span>
      </button>
    </div>
  );
}
