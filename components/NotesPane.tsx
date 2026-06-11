"use client";

import { useMemo, useState } from "react";
import { subjectById, useNook } from "@/lib/store";
import { toast } from "@/lib/toast";
import { fmtShort } from "@/lib/dates";
import type { Note } from "@/lib/types";

/** Renderização leve de markdown: #/## títulos, **negrito**, - listas. */
function renderMd(src: string) {
  const lines = src.split("\n");
  const blocks: React.ReactNode[] = [];
  let list: string[] = [];
  const flush = (key: string) => {
    if (list.length) {
      blocks.push(
        <ul key={key} className="my-1.5 space-y-1 pl-1">
          {list.map((it, i) => (
            <li key={i} className="flex gap-2 text-sm text-ink-mid">
              <span className="text-amber">·</span>
              <span>{inline(it)}</span>
            </li>
          ))}
        </ul>
      );
      list = [];
    }
  };
  const inline = (t: string) =>
    t.split(/(\*\*[^*]+\*\*)/g).map((p, i) =>
      p.startsWith("**") ? (
        <strong key={i} className="font-semibold text-ink-high">
          {p.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{p}</span>
      )
    );

  lines.forEach((raw, i) => {
    const line = raw.trimEnd();
    if (line.startsWith("## ")) {
      flush(`f${i}`);
      blocks.push(
        <h4 key={i} className="mt-3 mb-1 text-sm font-semibold text-ink-high">
          {inline(line.slice(3))}
        </h4>
      );
    } else if (line.startsWith("# ")) {
      flush(`f${i}`);
      blocks.push(
        <h3 key={i} className="mt-2 mb-1.5 font-display text-lg text-ink-high">
          {inline(line.slice(2))}
        </h3>
      );
    } else if (line.startsWith("- ")) {
      list.push(line.slice(2));
    } else if (line === "") {
      flush(`f${i}`);
    } else {
      flush(`f${i}`);
      blocks.push(
        <p key={i} className="text-sm leading-relaxed text-ink-mid">
          {inline(line)}
        </p>
      );
    }
  });
  flush("end");
  return blocks;
}

export function NotesPane() {
  const notes = useNook((s) => s.notes);
  const subjects = useNook((s) => s.subjects);
  const addNote = useNook((s) => s.addNote);
  const updateNote = useNook((s) => s.updateNote);
  const removeNote = useNook((s) => s.removeNote);

  const sorted = useMemo(
    () => [...notes].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [notes]
  );
  const [selected, setSelected] = useState<string | null>(sorted[0]?.id ?? null);
  const [preview, setPreview] = useState(false);

  const note: Note | undefined = notes.find((n) => n.id === selected);

  function onNew() {
    const id = addNote({});
    setSelected(id);
    setPreview(false);
  }

  function onDelete(n: Note) {
    removeNote(n.id);
    setSelected(notes.find((x) => x.id !== n.id)?.id ?? null);
    toast({
      message: "Anotação apagada.",
      undoLabel: "desfazer",
      onUndo: () => {
        useNook.setState((s) => ({ notes: [n, ...s.notes] }));
        setSelected(n.id);
      },
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-[260px_1fr]">
      {/* lista */}
      <aside className="nk-card flex max-h-[60vh] flex-col p-2 md:max-h-[640px]">
        <button
          onClick={onNew}
          className="mb-1 flex items-center gap-2 rounded-(--radius-sm) px-3 py-2.5 text-sm text-amber transition-colors hover:bg-raised/60"
        >
          <span className="text-base leading-none">＋</span> nova anotação
        </button>
        <div className="-mx-1 flex-1 space-y-0.5 overflow-y-auto px-1">
          {sorted.map((n) => {
            const sub = subjectById(subjects, n.subjectId);
            const active = n.id === selected;
            return (
              <button
                key={n.id}
                onClick={() => {
                  setSelected(n.id);
                  setPreview(false);
                }}
                className={`w-full rounded-(--radius-sm) px-3 py-2 text-left transition-colors ${
                  active ? "bg-raised" : "hover:bg-raised/50"
                }`}
              >
                <p className={`truncate text-sm ${active ? "text-ink-high" : "text-ink-mid"}`}>
                  {n.title.trim() || "Sem título"}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  {sub && (
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: sub.color }} />
                  )}
                  <span className="truncate text-[11px] text-ink-low">
                    {sub ? sub.name : "nota rápida"} · {fmtShort(n.updatedAt)}
                  </span>
                </div>
              </button>
            );
          })}
          {sorted.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-ink-low">
              Nenhuma anotação ainda.
            </p>
          )}
        </div>
      </aside>

      {/* editor */}
      {note ? (
        <section className="nk-card flex max-h-[640px] flex-col p-5">
          <div className="mb-3 flex items-center gap-2">
            <input
              value={note.title}
              onChange={(e) => updateNote(note.id, { title: e.target.value })}
              placeholder="Título da anotação"
              className="flex-1 bg-transparent font-display text-xl text-ink-high placeholder:text-ink-low focus:outline-none"
            />
            <select
              value={note.subjectId ?? ""}
              onChange={(e) => updateNote(note.id, { subjectId: e.target.value || undefined })}
              className="rounded-(--radius-sm) bg-raised px-2 py-1.5 text-xs text-ink-mid focus:outline-none"
            >
              <option value="">nota rápida</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setPreview((p) => !p)}
              className={`rounded-(--radius-sm) px-2.5 py-1.5 text-xs transition-colors ${
                preview ? "bg-amber/15 text-amber" : "bg-raised text-ink-mid hover:text-ink-high"
              }`}
              title="Pré-visualizar markdown"
            >
              {preview ? "editar" : "ler"}
            </button>
            <button
              onClick={() => onDelete(note)}
              aria-label="Apagar anotação"
              className="rounded-(--radius-sm) px-2 py-1.5 text-xs text-ink-low transition-colors hover:text-clay"
            >
              ✕
            </button>
          </div>

          {preview ? (
            <div className="flex-1 overflow-y-auto pr-1">
              {note.content.trim() ? (
                renderMd(note.content)
              ) : (
                <p className="text-sm text-ink-low">Nada escrito ainda.</p>
              )}
            </div>
          ) : (
            <textarea
              value={note.content}
              onChange={(e) => updateNote(note.id, { content: e.target.value })}
              placeholder={"Escreva à vontade…\n\nUse # título, ## subtítulo, **negrito** e - listas."}
              className="flex-1 resize-none bg-transparent text-sm leading-relaxed text-ink-mid placeholder:text-ink-low focus:outline-none"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          )}
          <p className="mt-3 border-t border-ink-faint/30 pt-2 text-[11px] text-ink-low">
            salvo automaticamente · markdown simples · atualizado em {fmtShort(note.updatedAt)}
          </p>
        </section>
      ) : (
        <section className="nk-card flex items-center justify-center p-10 text-center">
          <div>
            <p className="mb-1 text-2xl">📝</p>
            <p className="text-sm text-ink-mid">Crie sua primeira anotação.</p>
            <button onClick={onNew} className="mt-3 text-sm text-amber">
              ＋ nova anotação
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
