"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMounted } from "@/components/useMounted";
import {
  addDays,
  fmtShort,
  iso,
  startOfWeek,
  todayIso,
  WEEKDAYS_SHORT,
} from "@/lib/dates";
import { useNook } from "@/lib/store";

const HOUR_START = 7;
const HOUR_END = 23;
const PX_PER_HOUR = 44;

function toMin(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export default function CalendarioPage() {
  const mounted = useMounted();
  const subjects = useNook((s) => s.subjects);
  const tasks = useNook((s) => s.tasks);
  const [offset, setOffset] = useState(0); // semanas a partir da atual

  const monday = useMemo(
    () => startOfWeek(addDays(new Date(), offset * 7)),
    [offset]
  );
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(monday, i)),
    [monday]
  );
  const today = todayIso();

  if (!mounted) return <div className="nk-skeleton h-[70vh] w-full" />;

  const gridHeight = (HOUR_END - HOUR_START) * PX_PER_HOUR;

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOffset((o) => o - 1)}
            className="rounded-(--radius-sm) bg-surface px-3 py-1.5 text-sm text-ink-mid hover:text-ink-high"
            aria-label="Semana anterior"
          >
            ←
          </button>
          <button
            onClick={() => setOffset(0)}
            className={`rounded-(--radius-sm) px-3 py-1.5 text-sm ${
              offset === 0 ? "bg-amber/20 text-amber" : "bg-surface text-ink-mid hover:text-ink-high"
            }`}
          >
            hoje
          </button>
          <button
            onClick={() => setOffset((o) => o + 1)}
            className="rounded-(--radius-sm) bg-surface px-3 py-1.5 text-sm text-ink-mid hover:text-ink-high"
            aria-label="Próxima semana"
          >
            →
          </button>
        </div>
        <h2 className="font-display text-lg text-ink-high">
          {fmtShort(iso(days[0]))} — {fmtShort(iso(days[6]))}
        </h2>
        <div className="flex gap-3 text-xs text-ink-low">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-clay" /> prova
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-mist" /> entrega
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-ink-faint" /> aula
          </span>
        </div>
      </div>

      <div className="nk-card nk-reveal overflow-x-auto">
        <div className="min-w-[860px]">
          {/* cabeçalho dos dias + faixa de dia inteiro */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)] border-b border-ink-faint/30">
            <div />
            {days.map((d) => {
              const dIso = iso(d);
              const isToday = dIso === today;
              const exams = subjects.flatMap((s) =>
                s.assessments
                  .filter((a) => a.date === dIso)
                  .map((a) => ({ s, a }))
              );
              const dueTasks = tasks.filter((t) => !t.done && t.due === dIso);
              return (
                <div key={dIso} className="border-l border-ink-faint/20 px-2 py-2">
                  <p
                    className={`text-center text-xs ${
                      isToday ? "font-semibold text-amber" : "text-ink-low"
                    }`}
                  >
                    {WEEKDAYS_SHORT[d.getDay()]}{" "}
                    <span className={isToday ? "" : "text-ink-mid"}>{d.getDate()}</span>
                  </p>
                  <div className="mt-1.5 space-y-1">
                    {exams.map(({ s, a }) => (
                      <Link
                        key={a.id}
                        href={`/disciplinas/${s.id}`}
                        className="block truncate rounded-md px-1.5 py-0.5 text-[11px]"
                        style={{
                          background: a.kind === "prova" ? "#c97b6333" : "#8fa8bf2e",
                          color: a.kind === "prova" ? "#c97b63" : "#8fa8bf",
                        }}
                        title={`${a.title} · ${s.name}`}
                      >
                        {a.kind === "prova" ? "◉" : "◍"} {a.title}
                      </Link>
                    ))}
                    {dueTasks.map((t) => (
                      <Link
                        key={t.id}
                        href="/tarefas"
                        className="block truncate rounded-md bg-raised px-1.5 py-0.5 text-[11px] text-ink-mid"
                        title={t.title}
                      >
                        ☐ {t.title}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* grade horária */}
          <div className="grid grid-cols-[56px_repeat(7,1fr)]">
            {/* coluna das horas */}
            <div className="relative" style={{ height: gridHeight }}>
              {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => (
                <span
                  key={i}
                  className="absolute right-2 -translate-y-1/2 text-[10px] text-ink-low"
                  style={{ top: i * PX_PER_HOUR }}
                >
                  {i === 0 ? "" : `${HOUR_START + i}h`}
                </span>
              ))}
            </div>
            {days.map((d) => {
              const dIso = iso(d);
              const isToday = dIso === today;
              const slots = subjects.flatMap((s) =>
                s.schedule
                  .filter((c) => c.weekday === d.getDay())
                  .map((c) => ({ s, c }))
              );
              const now = new Date();
              const nowTop =
                ((now.getHours() * 60 + now.getMinutes()) / 60 - HOUR_START) *
                PX_PER_HOUR;
              return (
                <div
                  key={dIso}
                  className={`relative border-l border-ink-faint/20 ${
                    isToday ? "bg-amber/[0.03]" : ""
                  }`}
                  style={{ height: gridHeight }}
                >
                  {/* linhas de hora */}
                  {Array.from({ length: HOUR_END - HOUR_START }, (_, i) => (
                    <div
                      key={i}
                      className="absolute inset-x-0 border-t border-ink-faint/15"
                      style={{ top: i * PX_PER_HOUR }}
                    />
                  ))}
                  {/* aulas */}
                  {slots.map(({ s, c }, i) => {
                    const top = ((toMin(c.start) / 60 - HOUR_START) * PX_PER_HOUR);
                    const h = ((toMin(c.end) - toMin(c.start)) / 60) * PX_PER_HOUR;
                    return (
                      <Link
                        key={i}
                        href={`/disciplinas/${s.id}`}
                        className="absolute inset-x-1 overflow-hidden rounded-md px-2 py-1 text-[11px] leading-tight transition-opacity hover:opacity-90"
                        style={{
                          top,
                          height: h - 2,
                          background: `${s.color}26`,
                          borderLeft: `2.5px solid ${s.color}`,
                          color: s.color,
                        }}
                        title={`${s.name} · ${c.start}–${c.end} · ${s.room ?? ""}`}
                      >
                        <span className="font-medium">{s.name}</span>
                        <br />
                        <span className="opacity-75">
                          {c.start}–{c.end}
                        </span>
                      </Link>
                    );
                  })}
                  {/* agulha do agora */}
                  {isToday && nowTop > 0 && nowTop < gridHeight && (
                    <div
                      className="absolute inset-x-0 z-10 border-t border-amber"
                      style={{ top: nowTop }}
                    >
                      <span className="absolute -left-0.5 -top-[3px] h-1.5 w-1.5 rounded-full bg-amber" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-ink-low">
        visão mês chega na v1.1 — a semana é onde a vida acontece
      </p>
    </div>
  );
}
