"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useNook } from "@/lib/store";
import { addDaysIso, relativeDay } from "@/lib/dates";

interface Item {
  id: string;
  label: string;
  hint?: string;
  group: "Navegação" | "Tarefas" | "Disciplinas" | "Criar";
  run: () => void;
}

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const subjects = useNook((s) => s.subjects);
  const tasks = useNook((s) => s.tasks);
  const addTask = useNook((s) => s.addTask);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const items = useMemo<Item[]>(() => {
    const go = (path: string) => () => {
      router.push(path);
      onClose();
    };
    const nav: Item[] = [
      { id: "n-home", label: "Voltar ao quarto", hint: "Esc", group: "Navegação", run: go("/") },
      { id: "n-dash", label: "Abrir dashboard", hint: "G D", group: "Navegação", run: go("/dashboard") },
      { id: "n-tar", label: "Abrir tarefas", hint: "G T", group: "Navegação", run: go("/tarefas") },
      { id: "n-cal", label: "Abrir calendário", hint: "G C", group: "Navegação", run: go("/calendario") },
      { id: "n-dis", label: "Abrir estante de disciplinas", hint: "G E", group: "Navegação", run: go("/disciplinas") },
      { id: "n-rad", label: "Abrir rádio", hint: "G R", group: "Navegação", run: go("/radio") },
      { id: "n-est", label: "Abrir estatísticas", hint: "G S", group: "Navegação", run: go("/estatisticas") },
      { id: "n-foco", label: "Iniciar sessão de foco", hint: "F", group: "Navegação", run: go("/foco") },
      { id: "n-ajustes", label: "Abrir ajustes", hint: "tema · perfil", group: "Navegação", run: go("/ajustes") },
      { id: "n-proc", label: "Ver processo de design", hint: "Etapa 1", group: "Navegação", run: go("/processo") },
    ];
    const subItems: Item[] = subjects.map((s) => ({
      id: `s-${s.id}`,
      label: s.name,
      hint: s.code,
      group: "Disciplinas",
      run: go(`/disciplinas/${s.id}`),
    }));
    const taskItems: Item[] = tasks
      .filter((t) => !t.done)
      .slice(0, 8)
      .map((t) => ({
        id: `t-${t.id}`,
        label: t.title,
        hint: t.due ? relativeDay(t.due) : undefined,
        group: "Tarefas",
        run: go("/tarefas"),
      }));
    return [...nav, ...subItems, ...taskItems];
  }, [subjects, tasks, router, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    const hits = items.filter((i) => i.label.toLowerCase().includes(q));
    // captura rápida: texto livre vira tarefa ("amanhã"/"hoje" viram prazo)
    if (q.length > 2) {
      let due: string | undefined;
      let title = query.trim();
      if (/\bamanhã\b/i.test(title)) {
        due = addDaysIso(1);
        title = title.replace(/\bamanhã\b/gi, "").trim();
      } else if (/\bhoje\b/i.test(title)) {
        due = addDaysIso(0);
        title = title.replace(/\bhoje\b/gi, "").trim();
      }
      hits.push({
        id: "create-task",
        label: `Criar tarefa: “${title}”`,
        hint: due ? relativeDay(due) : "sem prazo",
        group: "Criar",
        run: () => {
          addTask({ title, due });
          onClose();
        },
      });
    }
    return hits;
  }, [query, items, addTask, onClose]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh]"
      style={{ background: "var(--nk-overlay)", backdropFilter: "blur(24px)" }}
      onClick={onClose}
    >
      <div
        className="nk-raised w-[min(560px,92vw)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              filtered[active]?.run();
            } else if (e.key === "Escape") {
              onClose();
            }
          }}
          placeholder="Buscar, navegar ou criar tarefa…"
          className="w-full bg-transparent px-5 py-4 text-ink-high placeholder:text-ink-low focus:outline-none"
          style={{ boxShadow: "none" }}
        />
        <div className="max-h-[320px] overflow-y-auto border-t border-ink-faint/40 p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-ink-low">
              Nada por aqui. Tente outro termo.
            </p>
          )}
          {filtered.map((item, i) => (
            <button
              key={item.id}
              onClick={item.run}
              onMouseEnter={() => setActive(i)}
              className={`flex w-full items-center justify-between rounded-(--radius-sm) px-3 py-2.5 text-left text-sm transition-colors ${
                i === active ? "bg-raised text-ink-high" : "text-ink-mid"
              }`}
            >
              <span className="truncate">{item.label}</span>
              <span className="ml-4 shrink-0 text-xs text-ink-low">
                {item.hint ?? item.group}
              </span>
            </button>
          ))}
        </div>
        <div className="flex gap-4 border-t border-ink-faint/40 px-5 py-2.5 text-xs text-ink-low">
          <span>↑↓ navegar</span>
          <span>↵ abrir</span>
          <span>esc fechar</span>
        </div>
      </div>
    </div>
  );
}
