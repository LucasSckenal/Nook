"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TaskRow } from "@/components/TaskRow";
import { useMounted } from "@/components/useMounted";
import { fromIso, iso, startOfWeek, todayIso } from "@/lib/dates";
import { useNook } from "@/lib/store";
import { toast } from "@/lib/toast";

const MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];
const DIAS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];

export default function CalendarioPage() {
  const mounted = useMounted();
  const router = useRouter();
  const subjects = useNook((s) => s.subjects);
  const tasks = useNook((s) => s.tasks);
  const addTask = useNook((s) => s.addTask);
  const [offset, setOffset] = useState(0); // meses a partir do atual
  const [selected, setSelected] = useState<string | null>(null);
  const [quickTitle, setQuickTitle] = useState("");
  const [quickSubject, setQuickSubject] = useState("");

  const today = todayIso();

  const view = useMemo(() => {
    const base = new Date();
    const first = new Date(base.getFullYear(), base.getMonth() + offset, 1);
    const start = startOfWeek(first);
    // 6 semanas fixas: o mês inteiro sempre visível, sem scroll
    const days: { date: string; inMonth: boolean }[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({ date: iso(d), inMonth: d.getMonth() === first.getMonth() });
    }
    return { first, days };
  }, [offset]);

  const byDay = useMemo(() => {
    const map = new Map<
      string,
      {
        aulas: { color: string; name: string; start: string; end: string; room?: string }[];
        provas: {
          color: string;
          title: string;
          kind: "prova" | "trabalho";
          subjectId: string;
          subjectName: string;
        }[];
        tarefas: number;
      }
    >();
    const get = (d: string) => {
      if (!map.has(d)) map.set(d, { aulas: [], provas: [], tarefas: 0 });
      return map.get(d)!;
    };
    const inView = new Set(view.days.map((d) => d.date));
    for (const { date } of view.days) {
      const wd = fromIso(date).getDay();
      for (const s of subjects) {
        for (const c of s.schedule) {
          if (c.weekday === wd)
            get(date).aulas.push({ color: s.color, name: s.name, start: c.start, end: c.end, room: s.room });
        }
      }
    }
    for (const s of subjects) {
      for (const a of s.assessments) {
        if (inView.has(a.date)) {
          get(a.date).provas.push({
            color: s.color,
            title: a.title,
            kind: a.kind,
            subjectId: s.id,
            subjectName: s.name,
          });
        }
      }
    }
    for (const t of tasks) {
      if (!t.done && t.due && inView.has(t.due)) get(t.due).tarefas += 1;
    }
    return map;
  }, [subjects, tasks, view]);

  if (!mounted) return <div className="nk-skeleton h-[60vh] w-full" />;

  const selectedInfo = selected ? byDay.get(selected) : null;
  const selectedTasks = selected ? tasks.filter((t) => !t.done && t.due === selected) : [];

  return (
    <div className="mx-auto max-w-[1040px]">
      {/* cabeçalho do mês */}
      <div className="nk-reveal mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOffset((o) => o - 1)}
            className="rounded-(--radius-sm) bg-surface px-3 py-1.5 text-sm text-ink-mid transition-colors hover:text-ink-high"
            aria-label="Mês anterior"
          >
            ←
          </button>
          <button
            onClick={() => setOffset(0)}
            className={`rounded-(--radius-sm) px-3 py-1.5 text-sm transition-colors ${
              offset === 0 ? "bg-amber/15 text-amber" : "bg-surface text-ink-mid hover:text-ink-high"
            }`}
          >
            hoje
          </button>
          <button
            onClick={() => setOffset((o) => o + 1)}
            className="rounded-(--radius-sm) bg-surface px-3 py-1.5 text-sm text-ink-mid transition-colors hover:text-ink-high"
            aria-label="Próximo mês"
          >
            →
          </button>
        </div>
        <h2 className="font-display text-2xl capitalize text-ink-high">
          {MESES[view.first.getMonth()]}{" "}
          <span className="text-ink-low">{view.first.getFullYear()}</span>
        </h2>
        <div className="flex items-center gap-4 text-xs text-ink-low">
          <span><span className="text-clay">◉</span> prova</span>
          <span><span className="text-mist">◍</span> entrega</span>
          <span><span className="text-amber">▪</span> tarefas</span>
          <span><span className="text-ink-mid">●</span> aula</span>
        </div>
      </div>

      {/* a folha do calendário */}
      <div className="nk-reveal nk-reveal-1 overflow-hidden rounded-(--radius-lg) bg-surface shadow-[0_0_0_1px_#ffffff08]">
        <div className="grid grid-cols-7 border-b border-ink-faint/30">
          {DIAS.map((d) => (
            <p key={d} className="py-2.5 text-center text-[11px] uppercase tracking-wider text-ink-low">
              {d}
            </p>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {view.days.map(({ date, inMonth }, i) => {
            const info = byDay.get(date);
            const isToday = date === today;
            const isSelected = date === selected;
            const dayNum = Number(date.slice(8));
            return (
              <button
                key={date}
                onClick={() => setSelected(isSelected ? null : date)}
                aria-label={`Dia ${dayNum}`}
                className={`relative flex min-h-[84px] flex-col items-stretch gap-1 border-ink-faint/15 p-1.5 text-left transition-colors sm:min-h-[92px] ${
                  i % 7 !== 0 ? "border-l" : ""
                } ${i >= 7 ? "border-t" : ""} ${
                  isSelected ? "bg-amber/10" : inMonth ? "hover:bg-raised/50" : "bg-void/30 hover:bg-raised/30"
                }`}
              >
                <div className="flex items-start justify-between">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs tabular-nums ${
                      isToday
                        ? "bg-amber font-semibold text-void"
                        : inMonth
                          ? "text-ink-high"
                          : "text-ink-faint"
                    }`}
                  >
                    {dayNum}
                  </span>
                  {/* aulas do dia: pontinhos nas cores das disciplinas */}
                  {info && info.aulas.length > 0 && inMonth && (
                    <span className="mt-1 flex gap-0.5">
                      {info.aulas.slice(0, 3).map((a, j) => (
                        <span key={j} className="h-1.5 w-1.5 rounded-full" style={{ background: a.color }} />
                      ))}
                    </span>
                  )}
                </div>

                {info?.provas.slice(0, 2).map((p, j) => (
                  <span
                    key={j}
                    className="truncate rounded-[4px] px-1 py-0.5 text-[10px] leading-tight"
                    style={{ background: `${p.color}26`, color: p.color }}
                  >
                    {p.kind === "prova" ? "◉" : "◍"} {p.title}
                  </span>
                ))}
                {info && info.provas.length > 2 && (
                  <span className="px-1 text-[10px] text-ink-low">+{info.provas.length - 2}</span>
                )}
                {info && info.tarefas > 0 && (
                  <span className="mt-auto px-1 text-[10px] text-amber">
                    ▪ {info.tarefas} tarefa{info.tarefas > 1 ? "s" : ""}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* o dia escolhido, por extenso */}
      {selected && (
        <div className="nk-card nk-reveal mt-4 p-5">
          <p className="mb-3 text-sm capitalize text-ink-high">
            {fromIso(selected).toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
            {selected === today && <span className="ml-2 text-xs text-amber">hoje</span>}
          </p>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              {selectedInfo?.aulas
                .slice()
                .sort((a, b) => a.start.localeCompare(b.start))
                .map((a, i) => (
                  <p key={i} className="flex items-center gap-2.5 text-sm text-ink-mid">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: a.color }} />
                    <span className="tabular-nums">{a.start}–{a.end}</span>
                    <span className="text-ink-high">{a.name}</span>
                    {a.room && <span className="text-xs text-ink-low">{a.room}</span>}
                  </p>
                ))}
              {selectedInfo?.provas.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() => router.push(`/?open=disciplinas&id=${p.subjectId}`)}
                    className="flex items-center gap-2.5 text-left transition-colors hover:text-amber"
                    title={`Abrir ${p.subjectName}`}
                  >
                    <span style={{ color: p.color }}>{p.kind === "prova" ? "◉" : "◍"}</span>
                    <span className="text-ink-high">{p.title}</span>
                    <span className="text-xs text-ink-low">{p.subjectName}</span>
                  </button>
                  <button
                    onClick={() => {
                      addTask({
                        title: `Estudar para ${p.title}`,
                        subjectId: p.subjectId,
                        due: selected!,
                      });
                      toast({ message: "Tarefa de estudo criada. 🌱" });
                    }}
                    className="ml-auto shrink-0 rounded-(--radius-sm) bg-surface px-2 py-1 text-xs text-ink-mid shadow-[0_0_0_1px_#ffffff0a] transition-colors hover:text-amber"
                    title="Criar tarefa de estudo para esta avaliação"
                  >
                    + estudar
                  </button>
                </div>
              ))}
              {!selectedInfo?.aulas.length && !selectedInfo?.provas.length && (
                <p className="text-sm text-ink-low">sem aulas nem avaliações — dia leve 🌿</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="space-y-0.5">
                {selectedTasks.length > 0 ? (
                  selectedTasks.map((t) => <TaskRow key={t.id} task={t} />)
                ) : (
                  <p className="text-sm text-ink-low">nenhuma tarefa com prazo neste dia</p>
                )}
              </div>
              {/* criar tarefa direto no dia escolhido */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!quickTitle.trim()) return;
                  addTask({
                    title: quickTitle.trim(),
                    subjectId: quickSubject || undefined,
                    due: selected!,
                  });
                  setQuickTitle("");
                  toast({ message: "Tarefa adicionada a este dia. ✓" });
                }}
                className="flex flex-wrap items-center gap-2 rounded-(--radius-md) bg-surface/60 p-2"
              >
                <input
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  placeholder="+ tarefa neste dia"
                  className="min-w-[120px] flex-1 rounded-(--radius-sm) bg-transparent px-2 py-1.5 text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
                />
                <select
                  value={quickSubject}
                  onChange={(e) => setQuickSubject(e.target.value)}
                  className="rounded-(--radius-sm) bg-raised px-2 py-1.5 text-xs text-ink-mid focus:outline-none"
                >
                  <option value="">sem disciplina</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  disabled={!quickTitle.trim()}
                  className="rounded-(--radius-sm) bg-amber px-3 py-1.5 text-xs font-medium text-void disabled:opacity-40"
                >
                  add
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
