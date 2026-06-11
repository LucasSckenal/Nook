"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { TaskRow } from "@/components/TaskRow";
import { useMounted } from "@/components/useMounted";
import { fmtShort, relativeDay, todayIso, WEEKDAYS_LONG } from "@/lib/dates";
import { gradeOutlook, useNook } from "@/lib/store";

export default function DisciplinaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const mounted = useMounted();
  const subjects = useNook((s) => s.subjects);
  const tasks = useNook((s) => s.tasks);
  const setGrade = useNook((s) => s.setGrade);
  const sub = subjects.find((s) => s.id === id);

  // simulador de média: notas hipotéticas para avaliações sem nota
  const [sim, setSim] = useState<Record<string, number>>({});

  const projection = useMemo(() => {
    if (!sub) return null;
    let total = 0;
    let covered = 0;
    for (const a of sub.assessments) {
      const g = a.grade ?? sim[a.id];
      if (g != null) {
        total += g * a.weight;
        covered += a.weight;
      }
    }
    return covered > 0.999 ? total : null;
  }, [sub, sim]);

  if (!mounted) return <div className="nk-skeleton h-[60vh] w-full" />;

  if (!sub) {
    return (
      <div className="py-20 text-center">
        <p className="mb-2 text-3xl">📚</p>
        <p className="text-ink-mid">Essa disciplina não está na estante.</p>
        <Link href="/disciplinas" className="mt-3 inline-block text-sm text-amber">
          ← voltar à estante
        </Link>
      </div>
    );
  }

  const outlook = gradeOutlook(sub);
  const subTasks = tasks.filter((t) => t.subjectId === sub.id && !t.done);
  const today = todayIso();

  return (
    <div className="mx-auto max-w-[900px]">
      {/* cabeçalho */}
      <header
        className="nk-reveal mb-6 rounded-(--radius-lg) p-6"
        style={{
          background: `linear-gradient(135deg, ${sub.color}24, transparent 60%)`,
          boxShadow: "0 0 0 1px #ffffff08",
        }}
      >
        <p className="text-xs uppercase tracking-wider text-ink-low">{sub.code}</p>
        <h2 className="mt-1 font-display text-3xl text-ink-high">{sub.name}</h2>
        <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm text-ink-mid">
          {sub.professor && <span>{sub.professor}</span>}
          {sub.room && <span>{sub.room}</span>}
          {sub.schedule.map((c, i) => (
            <span key={i}>
              {WEEKDAYS_LONG[c.weekday]} {c.start}–{c.end}
            </span>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* provas, notas e simulador */}
        <section className="nk-card nk-reveal nk-reveal-1 p-6 md:col-span-2">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-display text-lg text-ink-high">Avaliações & notas</h3>
            <div className="text-sm text-ink-mid">
              {outlook.current != null && (
                <>
                  média parcial{" "}
                  <span
                    className="font-display text-xl"
                    style={{ color: outlook.current >= 6 ? "#9caf88" : "#c97b63" }}
                  >
                    {outlook.current.toFixed(1)}
                  </span>
                </>
              )}
              {outlook.neededAvg != null && outlook.neededAvg > 0 && (
                <span className="ml-3 text-xs text-ink-low">
                  precisa de {outlook.neededAvg.toFixed(1)} no que falta p/ fechar em 6.0
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {sub.assessments
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center gap-3 rounded-(--radius-md) bg-raised/50 px-4 py-3"
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: a.kind === "prova" ? "#c97b63" : "#8fa8bf" }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink-high">{a.title}</p>
                    <p className="text-xs text-ink-low">
                      {fmtShort(a.date)}
                      {a.grade == null && a.date >= today && (
                        <span className="text-clay"> · {relativeDay(a.date)}</span>
                      )}{" "}
                      · peso {Math.round(a.weight * 100)}%
                    </p>
                  </div>
                  {a.grade != null ? (
                    <span
                      className="font-display text-lg"
                      style={{ color: a.grade >= 6 ? "#9caf88" : "#c97b63" }}
                    >
                      {a.grade.toFixed(1)}
                    </span>
                  ) : (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={0.5}
                        placeholder="e se…"
                        value={sim[a.id] ?? ""}
                        onChange={(e) =>
                          setSim((m) => {
                            const v = e.target.value;
                            const next = { ...m };
                            if (v === "") delete next[a.id];
                            else next[a.id] = Math.min(10, Math.max(0, Number(v)));
                            return next;
                          })
                        }
                        className="w-20 rounded-(--radius-sm) bg-surface px-2 py-1.5 text-center text-sm text-lavender placeholder:text-ink-low focus:outline-none"
                        aria-label={`Simular nota de ${a.title}`}
                      />
                      <button
                        onClick={() => {
                          const v = sim[a.id];
                          if (v != null) setGrade(sub.id, a.id, v);
                        }}
                        disabled={sim[a.id] == null}
                        className="rounded-(--radius-sm) px-2 py-1.5 text-xs text-ink-low transition-colors hover:text-moss disabled:opacity-30"
                        title="Lançar como nota real"
                      >
                        lançar
                      </button>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {projection != null && (
            <p className="mt-4 rounded-(--radius-md) border border-lavender/30 bg-lavender/5 px-4 py-3 text-sm text-ink-mid">
              🪻 Com essas notas simuladas, a média final seria{" "}
              <strong
                className="font-display text-lg"
                style={{ color: projection >= 6 ? "#9caf88" : "#c97b63" }}
              >
                {projection.toFixed(1)}
              </strong>
              {projection >= 6 ? " — fecharia a disciplina. 🌱" : " — ainda abaixo de 6.0, mas dá tempo de virar."}
            </p>
          )}
        </section>

        {/* tarefas da disciplina */}
        <section className="nk-card nk-reveal nk-reveal-2 p-6">
          <h3 className="mb-3 font-display text-lg text-ink-high">Tarefas abertas</h3>
          {subTasks.length === 0 ? (
            <p className="text-sm text-ink-low">Nenhuma tarefa aberta aqui. 🌿</p>
          ) : (
            <div className="space-y-0.5">
              {subTasks.map((t) => (
                <TaskRow key={t.id} task={t} />
              ))}
            </div>
          )}
        </section>

        {/* materiais */}
        <section className="nk-card nk-reveal nk-reveal-3 p-6">
          <h3 className="mb-3 font-display text-lg text-ink-high">Materiais</h3>
          {sub.materials.length === 0 ? (
            <p className="text-sm text-ink-low">Nada guardado ainda.</p>
          ) : (
            <ul className="space-y-2">
              {sub.materials.map((m) => (
                <li key={m.id}>
                  <a
                    href={m.url ?? "#"}
                    target={m.url ? "_blank" : undefined}
                    rel="noreferrer"
                    className="flex items-center gap-2.5 rounded-(--radius-sm) px-2 py-1.5 text-sm text-ink-mid transition-colors hover:bg-raised/60 hover:text-ink-high"
                  >
                    <span className="text-ink-low">{m.kind === "arquivo" ? "📄" : "🔗"}</span>
                    {m.title}
                  </a>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-xs text-ink-low">
            upload real chega com o Firebase Storage (doc 08)
          </p>
        </section>
      </div>
    </div>
  );
}
