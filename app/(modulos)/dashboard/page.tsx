"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { EstudaChat } from "@/components/EstudaChat";
import { TaskRow } from "@/components/TaskRow";
import { useMounted } from "@/components/useMounted";
import {
  addDays,
  daysBetween,
  fmtShort,
  greeting,
  iso,
  minutesToHuman,
  relativeDay,
  startOfWeek,
  todayIso,
  WEEKDAYS_SHORT,
} from "@/lib/dates";
import { estudaRespond } from "@/lib/estuda";
import { useNook } from "@/lib/store";

export default function DashboardPage() {
  const mounted = useMounted();
  const [tab, setTab] = useState<"visao" | "estuda">("visao");
  const userName = useNook((s) => s.userName);

  if (!mounted)
    return (
      <div className="space-y-4">
        <div className="nk-skeleton h-10 w-72" />
        <div className="nk-skeleton h-40 w-full" />
        <div className="nk-skeleton h-64 w-full" />
      </div>
    );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-3xl text-ink-high">
          {greeting()}, {userName}.
        </h2>
        <div className="flex gap-1 rounded-(--radius-md) bg-surface p-1">
          <button
            onClick={() => setTab("visao")}
            className={`rounded-(--radius-sm) px-4 py-1.5 text-sm transition-colors ${
              tab === "visao" ? "bg-raised text-ink-high" : "text-ink-mid hover:text-ink-high"
            }`}
          >
            Visão geral
          </button>
          <button
            onClick={() => setTab("estuda")}
            className={`rounded-(--radius-sm) px-4 py-1.5 text-sm transition-colors ${
              tab === "estuda" ? "bg-raised text-lavender" : "text-ink-mid hover:text-ink-high"
            }`}
          >
            🪻 Estuda
          </button>
        </div>
      </div>

      {tab === "visao" ? <Overview /> : <EstudaChat />}
    </div>
  );
}

function Overview() {
  const subjects = useNook((s) => s.subjects);
  const tasks = useNook((s) => s.tasks);
  const sessions = useNook((s) => s.sessions);
  const today = todayIso();

  const todayTasks = tasks.filter((t) => !t.done && t.due && t.due <= today);
  const weekday = new Date().getDay();
  const todayClasses = subjects
    .flatMap((s) => s.schedule.filter((c) => c.weekday === weekday).map((c) => ({ s, c })))
    .sort((a, b) => a.c.start.localeCompare(b.c.start));

  const upcoming = useMemo(
    () =>
      subjects
        .flatMap((s) => s.assessments.map((a) => ({ s, a })))
        .filter(({ a }) => a.grade == null && daysBetween(today, a.date) >= 0)
        .sort((x, y) => x.a.date.localeCompare(y.a.date))
        .slice(0, 5),
    [subjects, today]
  );

  // radar de carga: itens com prazo nas próximas 4 semanas
  const radar = useMemo(() => {
    const monday = startOfWeek(new Date());
    const weeks: { date: string; count: number; isToday: boolean }[][] = [];
    for (let w = 0; w < 4; w++) {
      const row: { date: string; count: number; isToday: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const dateIso = iso(addDays(monday, w * 7 + d));
        const count =
          tasks.filter((t) => !t.done && t.due === dateIso).length +
          subjects.flatMap((s) => s.assessments).filter((a) => a.grade == null && a.date === dateIso).length * 2;
        row.push({ date: dateIso, count, isToday: dateIso === today });
      }
      weeks.push(row);
    }
    return weeks;
  }, [tasks, subjects, today]);

  const weekStart = iso(startOfWeek(new Date()));
  const weekMinutes = sessions
    .filter((s) => s.date >= weekStart && s.date <= today)
    .reduce((acc, s) => acc + s.minutes, 0);

  const suggestion = useMemo(
    () => estudaRespond("como estou no semestre?", { subjects, tasks }),
    [subjects, tasks]
  );

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      {/* Hoje */}
      <section className="nk-card nk-reveal p-6 lg:col-span-2">
        <h3 className="mb-1 font-display text-lg text-ink-high">Hoje</h3>
        <p className="mb-4 text-xs text-ink-low">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
        {todayClasses.length > 0 && (
          <div className="mb-4 space-y-1.5">
            {todayClasses.map(({ s, c }, i) => (
              <Link
                key={i}
                href={`/disciplinas/${s.id}`}
                className="flex items-center gap-3 rounded-(--radius-sm) px-2 py-1.5 text-sm transition-colors hover:bg-raised/60"
              >
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-ink-mid">
                  {c.start}–{c.end}
                </span>
                <span className="text-ink-high">{s.name}</span>
                <span className="text-xs text-ink-low">{s.room}</span>
              </Link>
            ))}
          </div>
        )}
        {todayTasks.length === 0 ? (
          <p className="rounded-(--radius-md) bg-raised/40 px-4 py-6 text-center text-sm text-ink-mid">
            Nada com prazo para hoje. Respira — ou adianta algo da semana. ☕
          </p>
        ) : (
          <div className="space-y-0.5">
            {todayTasks.map((t) => (
              <TaskRow key={t.id} task={t} />
            ))}
          </div>
        )}
        <Link
          href="/tarefas"
          className="mt-4 inline-block text-xs text-ink-low transition-colors hover:text-amber"
        >
          ver todas as tarefas →
        </Link>
      </section>

      {/* Sugestão da Estuda */}
      <section className="nk-reveal nk-reveal-1 rounded-(--radius-md) border border-lavender/30 bg-lavender/5 p-6">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-lavender">
          🪻 A Estuda reparou
        </h3>
        <div className="space-y-2 text-sm leading-relaxed text-ink-mid">
          {(suggestion.artifact?.items ?? [suggestion.text]).slice(0, 2).map((t, i) => (
            <p key={i}>{t.replace(/\*\*/g, "")}</p>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-low">uma observação por dia, no máximo — sem alarme</p>
      </section>

      {/* Próximas entregas */}
      <section className="nk-card nk-reveal nk-reveal-2 p-6">
        <h3 className="mb-4 font-display text-lg text-ink-high">Próximas avaliações</h3>
        <div className="space-y-3">
          {upcoming.map(({ s, a }) => (
            <Link
              key={a.id}
              href={`/disciplinas/${s.id}`}
              className="flex items-center justify-between gap-3 rounded-(--radius-sm) px-2 py-1.5 transition-colors hover:bg-raised/60"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-ink-high">{a.title}</p>
                <p className="text-xs" style={{ color: s.color }}>
                  {s.name}
                </p>
              </div>
              <span
                className={`shrink-0 text-xs ${
                  daysBetween(todayIso(), a.date) <= 3 ? "font-semibold text-clay" : "text-ink-low"
                }`}
              >
                {relativeDay(a.date)}
              </span>
            </Link>
          ))}
          {upcoming.length === 0 && (
            <p className="text-sm text-ink-low">Nenhuma avaliação em aberto. 🌙</p>
          )}
        </div>
      </section>

      {/* Radar de carga */}
      <section className="nk-card nk-reveal nk-reveal-3 p-6">
        <h3 className="mb-1 font-display text-lg text-ink-high">Radar de carga</h3>
        <p className="mb-4 text-xs text-ink-low">próximas 4 semanas — quanto mais quente, mais cheio o dia</p>
        <div className="space-y-1.5">
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAYS_SHORT.slice(1).concat(WEEKDAYS_SHORT[0]).map((d) => (
              <span key={d} className="text-center text-[10px] text-ink-low">
                {d}
              </span>
            ))}
          </div>
          {radar.map((week, w) => (
            <div key={w} className="grid grid-cols-7 gap-1.5">
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${fmtShort(day.date)}: ${day.count === 0 ? "livre" : `carga ${day.count}`}`}
                  className="flex h-8 items-center justify-center rounded-md text-[10px]"
                  style={{
                    background:
                      day.count === 0
                        ? "#1e2433"
                        : day.count === 1
                          ? "#e8a87c33"
                          : day.count === 2
                            ? "#e8a87c66"
                            : "#c97b63aa",
                    boxShadow: day.isToday ? "0 0 0 1.5px #e8a87c" : undefined,
                    color: day.count > 0 ? "#e8e4da" : "#3d4150",
                  }}
                >
                  {day.count > 0 ? day.count : ""}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* Semana em horas */}
      <section className="nk-card nk-reveal nk-reveal-4 p-6">
        <h3 className="mb-4 font-display text-lg text-ink-high">Sua semana</h3>
        <p className="font-display text-4xl text-amber">{minutesToHuman(weekMinutes)}</p>
        <p className="mt-1 text-sm text-ink-mid">de foco desde segunda</p>
        <div className="mt-5 space-y-2 text-sm text-ink-mid">
          <p>
            {tasks.filter((t) => t.done).length} tarefas concluídas no total ·{" "}
            {tasks.filter((t) => !t.done).length} em aberto
          </p>
          <Link href="/estatisticas" className="inline-block text-xs text-ink-low transition-colors hover:text-amber">
            ver estatísticas completas →
          </Link>
        </div>
      </section>
    </div>
  );
}
