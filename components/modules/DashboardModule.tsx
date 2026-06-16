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
  const [tab, setTab] = useState<"hoje" | "visao" | "estuda">("hoje");
  const userName = useNook((s) => s.userName);

  if (!mounted)
    return (
      <div className="space-y-4">
        <div className="nk-skeleton h-9 w-full" />
        <div className="nk-skeleton h-10 w-72" />
        <div className="nk-skeleton h-64 w-full" />
      </div>
    );

  const openPalette = () =>
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true, bubbles: true }));

  return (
    <div className="relative">
      {/* papel de parede do desktop — preenche o módulo, com o céu respirando */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden rounded-(--radius-lg)" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, #2c2552 0%, #43406e 22%, #6a4f6e 40%, #2c2333 64%, #1a1422 100%)",
          }}
        />
        {/* véu suave só para os apps manterem contraste, sem apagar o céu */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, transparent 0%, #0b0e1455 46%, #0b0e14a0 100%)" }} />
      </div>

      {/* barra de título da janela (estilo mockup): semáforo · título · busca · abas */}
      <div className="relative z-[2] flex items-center justify-between gap-3 border-b border-white/[0.07] bg-void/35 px-4 py-2.5 backdrop-blur-md sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex items-center gap-2" aria-hidden>
            <Link
              href="/"
              aria-label="Voltar ao quarto"
              title="Voltar ao quarto (Esc)"
              className="group flex h-3.5 w-3.5 items-center justify-center rounded-full bg-clay/90 text-[9px] leading-none text-clay transition-colors hover:text-void/80"
            >
              ✕
            </Link>
            <span className="h-3.5 w-3.5 rounded-full bg-amber/85" />
            <span className="h-3.5 w-3.5 rounded-full bg-moss/85" />
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Icones/Monitor.png" alt="" aria-hidden draggable={false} className="h-6 w-6 select-none rounded-[6px] object-contain" />
          <h1 className="font-display text-base text-ink-high">Computador</h1>
          <span className="hidden text-xs text-ink-low sm:inline">dashboard &amp; Estuda</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openPalette}
            className="hidden items-center gap-2 rounded-full bg-void/60 px-3 py-1 text-xs text-ink-low shadow-[inset_0_0_0_1px_#ffffff12] transition-colors hover:text-ink-mid md:flex"
          >
            <span aria-hidden>🔍</span>
            <span>Buscar algo…</span>
            <kbd className="rounded bg-surface px-1.5 py-0.5 text-[10px]">Ctrl K</kbd>
          </button>
          <div className="flex gap-1 rounded-(--radius-md) bg-void/45 p-1 shadow-[0_0_0_1px_#ffffff14]">
            <button
              onClick={() => setTab("hoje")}
              className={`rounded-(--radius-sm) px-3 py-1 text-sm transition-colors ${
                tab === "hoje" ? "bg-raised text-ink-high" : "text-ink-mid hover:text-ink-high"
              }`}
            >
              📋 <span className="hidden sm:inline">Hoje</span>
            </button>
            <button
              onClick={() => setTab("visao")}
              className={`rounded-(--radius-sm) px-3 py-1 text-sm transition-colors ${
                tab === "visao" ? "bg-raised text-ink-high" : "text-ink-mid hover:text-ink-high"
              }`}
            >
              🗔 <span className="hidden sm:inline">Visão geral</span>
            </button>
            <button
              onClick={() => setTab("estuda")}
              className={`rounded-(--radius-sm) px-3 py-1 text-sm transition-colors ${
                tab === "estuda" ? "bg-raised text-lavender" : "text-ink-mid hover:text-ink-high"
              }`}
            >
              🪻 <span className="hidden sm:inline">Estuda</span>
            </button>
          </div>
        </div>
      </div>

      {/* corpo da janela */}
      <div className="px-5 py-5 sm:px-6">
      {/* hero: saudação + sol/nuvens à direita */}
      <div
        className="relative mb-5 overflow-hidden rounded-(--radius-lg) px-5 py-5 sm:px-6"
        style={{
          background: "linear-gradient(110deg, #2a2348 0%, #3c3a68 46%, #6a4a64 100%)",
          boxShadow: "0 0 0 1px #ffffff12, inset 0 1px 0 #ffffff16",
        }}
      >
        {/* sol nascendo + nuvens, à direita */}
        <svg
          className="pointer-events-none absolute right-0 top-0 h-full w-2/3"
          viewBox="0 0 320 150"
          preserveAspectRatio="xMaxYMid slice"
          aria-hidden
        >
          <defs>
            <radialGradient id="dashSun" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0" stopColor="#ffd9a0" />
              <stop offset="0.55" stopColor="#f0a86a" />
              <stop offset="1" stopColor="#c97b63" />
            </radialGradient>
          </defs>
          <circle cx="232" cy="138" r="92" fill="#e8a87c" opacity="0.16" />
          <circle cx="232" cy="138" r="60" fill="#e8a87c" opacity="0.22" />
          <circle cx="232" cy="140" r="38" fill="url(#dashSun)" />
          <g fill="#b49ac4" opacity="0.5">
            <ellipse cx="150" cy="60" rx="34" ry="11" />
            <ellipse cx="180" cy="54" rx="24" ry="9" />
            <ellipse cx="270" cy="46" rx="30" ry="10" />
          </g>
          <g fill="#e8c9d4" opacity="0.35">
            <ellipse cx="300" cy="92" rx="40" ry="10" />
          </g>
        </svg>

        <div className="relative flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-(--radius-md) text-2xl"
              style={{ background: "linear-gradient(160deg, #f0a86a, #c97b63)", boxShadow: "0 4px 14px #c97b6340" }}
              aria-hidden
            >
              ☀️
            </span>
            <div>
              <h2 className="font-display text-3xl text-ink-high" style={{ textShadow: "0 2px 18px #00000070" }}>
                {greeting()}, {userName}. <span className="align-middle">👋</span>
              </h2>
              <p className="mt-0.5 text-sm text-ink-mid" style={{ textShadow: "0 1px 8px #00000070" }}>
                Seu sistema de estudos está ligado.
              </p>
            </div>
          </div>
        </div>
      </div>

      {tab === "hoje" ? <Hoje /> : tab === "visao" ? <Overview /> : <EstudaChat />}
      </div>
    </div>
  );
}

/** uma "janela" de desktop: barra de título com semáforo + corpo de vidro */
function Win({
  title,
  icon,
  reveal,
  className = "",
  bodyClass = "p-5",
  children,
}: {
  title: string;
  icon?: string;
  reveal?: string;
  className?: string;
  bodyClass?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`nk-reveal ${reveal ?? ""} flex flex-col overflow-hidden rounded-(--radius-md) ${className}`}
      style={{
        background: "color-mix(in srgb, var(--color-surface) 80%, transparent)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: "0 12px 30px #00000055, 0 0 0 1px #ffffff12, inset 0 1px 0 #ffffff10",
      }}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-3 py-2">
        <span className="flex gap-1.5" aria-hidden>
          <span className="h-2.5 w-2.5 rounded-full bg-clay/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber/90" />
          <span className="h-2.5 w-2.5 rounded-full bg-moss/90" />
        </span>
        <p className="ml-1 flex items-center gap-1.5 text-xs text-ink-mid">
          {icon && <span aria-hidden>{icon}</span>}
          {title}
        </p>
      </div>
      <div className={`flex-1 ${bodyClass}`}>{children}</div>
    </section>
  );
}

/** uma seção da agenda do dia */
function DaySection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <section className="nk-card p-5">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-ink-high">
        <span aria-hidden>{icon}</span> {title}
      </h3>
      {children}
    </section>
  );
}

/** Hoje — a agenda do dia num lugar só: aulas, provas/entregas e tarefas. */
function Hoje() {
  const subjects = useNook((s) => s.subjects);
  const tasks = useNook((s) => s.tasks);
  const today = todayIso();
  const weekday = new Date().getDay();

  const classes = subjects
    .flatMap((s) => s.schedule.filter((c) => c.weekday === weekday).map((c) => ({ s, c })))
    .sort((a, b) => a.c.start.localeCompare(b.c.start));

  const exams = subjects.flatMap((s) =>
    s.assessments.filter((a) => a.grade == null && a.date === today).map((a) => ({ s, a }))
  );

  const dueTasks = tasks
    .filter((t) => !t.done && t.due && t.due <= today)
    .sort((a, b) => (a.due! < b.due! ? -1 : 1));

  const nothing = classes.length === 0 && exams.length === 0 && dueTasks.length === 0;

  return (
    <div className="mx-auto max-w-[680px]">
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="font-display text-2xl capitalize text-ink-high">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long" })}
        </h2>
        <span className="text-sm text-ink-low">
          {new Date().toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
        </span>
      </div>

      {nothing ? (
        <div className="nk-card p-10 text-center">
          <p className="mb-2 text-3xl" aria-hidden>
            🌿
          </p>
          <p className="text-sm text-ink-mid">Dia leve — sem aulas, provas ou prazos hoje.</p>
          <Link
            href="/?open=foco"
            className="mt-5 inline-block rounded-(--radius-md) bg-amber px-5 py-2.5 text-sm font-medium text-void transition-transform hover:scale-[1.02]"
          >
            adiantar algo da semana? entrar em foco
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {classes.length > 0 && (
            <DaySection title="Aulas" icon="🎓">
              <div className="space-y-1">
                {classes.map(({ s, c }, i) => (
                  <Link
                    key={i}
                    href={`/?open=disciplinas&id=${s.id}`}
                    className="flex items-center gap-3 rounded-(--radius-sm) px-2 py-2 text-sm transition-colors hover:bg-raised/60"
                  >
                    <span className="w-20 shrink-0 tabular-nums text-ink-mid">
                      {c.start}–{c.end}
                    </span>
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                    <span className="min-w-0 flex-1 truncate text-ink-high">{s.name}</span>
                    {s.room && <span className="shrink-0 text-xs text-ink-low">{s.room}</span>}
                  </Link>
                ))}
              </div>
            </DaySection>
          )}

          {exams.length > 0 && (
            <DaySection title="Provas & entregas de hoje" icon="📌">
              <div className="space-y-1">
                {exams.map(({ s, a }) => (
                  <Link
                    key={a.id}
                    href={`/?open=disciplinas&id=${s.id}`}
                    className="flex items-center gap-2.5 rounded-(--radius-sm) px-2 py-2 text-sm transition-colors hover:bg-raised/60"
                  >
                    <span style={{ color: s.color }}>{a.kind === "prova" ? "◉" : "◍"}</span>
                    <span className="min-w-0 flex-1 truncate text-ink-high">{a.title}</span>
                    <span className="shrink-0 text-xs" style={{ color: s.color }}>
                      {s.name}
                    </span>
                    <span className="shrink-0 rounded-full bg-clay/15 px-2 py-0.5 text-[10px] font-medium text-clay">
                      hoje
                    </span>
                  </Link>
                ))}
              </div>
            </DaySection>
          )}

          <DaySection title="Tarefas para hoje" icon="✓">
            {dueTasks.length === 0 ? (
              <p className="px-2 py-3 text-sm text-ink-low">Nenhuma tarefa com prazo para hoje. 🌙</p>
            ) : (
              <div className="space-y-0.5">
                {dueTasks.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </div>
            )}
          </DaySection>

          <div className="flex items-center justify-between gap-3 px-1">
            <Link
              href="/?open=calendario"
              className="text-xs text-ink-low transition-colors hover:text-amber"
            >
              ver a semana no calendário →
            </Link>
            <Link
              href="/?open=foco"
              className="rounded-(--radius-md) bg-amber px-5 py-2.5 text-sm font-medium text-void transition-transform hover:scale-[1.02]"
            >
              entrar em foco
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function Overview() {
  const subjects = useNook((s) => s.subjects);
  const tasks = useNook((s) => s.tasks);
  const sessions = useNook((s) => s.sessions);
  const today = todayIso();

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
    <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-3">
      {/* Sugestão da Estuda */}
      <Win title="A Estuda reparou" icon="🪻" className="lg:col-span-2" reveal="nk-reveal-1" bodyClass="p-6">
        <div className="space-y-2 text-sm leading-relaxed text-ink-mid">
          {(suggestion.artifact?.items ?? [suggestion.text]).slice(0, 2).map((t, i) => (
            <p key={i}>{t.replace(/\*\*/g, "")}</p>
          ))}
        </div>
        <p className="mt-4 text-xs text-ink-low">uma observação por dia, no máximo — sem alarme</p>
      </Win>

      {/* Próximas entregas */}
      <Win title="Próximas avaliações" icon="📅" reveal="nk-reveal-2" bodyClass="p-6">
        <div className="space-y-3">
          {upcoming.map(({ s, a }) => (
            <Link
              key={a.id}
              href={`/?open=disciplinas&id=${s.id}`}
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
      </Win>

      {/* Radar de carga */}
      <Win title="Radar de carga" icon="📊" reveal="nk-reveal-3" bodyClass="p-6">
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
      </Win>

      {/* Semana em horas */}
      <Win title="Sua semana" icon="⏱" reveal="nk-reveal-4" bodyClass="p-6">
        <p className="font-display text-4xl text-amber">{minutesToHuman(weekMinutes)}</p>
        <p className="mt-1 text-sm text-ink-mid">de foco desde segunda</p>
        <div className="mt-5 space-y-2 text-sm text-ink-mid">
          <p>
            {tasks.filter((t) => t.done).length} tarefas concluídas no total ·{" "}
            {tasks.filter((t) => !t.done).length} em aberto
          </p>
          <Link href="/?open=estatisticas" className="inline-block text-xs text-ink-low transition-colors hover:text-amber">
            ver o diário completo →
          </Link>
        </div>
      </Win>
    </div>
  );
}
