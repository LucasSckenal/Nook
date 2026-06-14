"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMounted } from "@/components/useMounted";
import {
  addDays,
  iso,
  minutesToHuman,
  startOfWeek,
  todayIso,
  WEEKDAYS_SHORT,
} from "@/lib/dates";
import { useNook } from "@/lib/store";

export default function EstatisticasPage() {
  const mounted = useMounted();
  const sessions = useNook((s) => s.sessions);
  const subjects = useNook((s) => s.subjects);
  const tasks = useNook((s) => s.tasks);
  const today = todayIso();

  const week = useMemo(() => {
    const monday = startOfWeek(new Date());
    return Array.from({ length: 7 }, (_, i) => {
      const dIso = iso(addDays(monday, i));
      const mins = sessions
        .filter((s) => s.date === dIso)
        .reduce((a, s) => a + s.minutes, 0);
      return { date: dIso, mins, label: WEEKDAYS_SHORT[addDays(monday, i).getDay()] };
    });
  }, [sessions]);

  const weekTotal = week.reduce((a, d) => a + d.mins, 0);
  const maxDay = Math.max(60, ...week.map((d) => d.mins));

  const bySubject = useMemo(() => {
    const last14 = iso(addDays(new Date(), -14));
    const map = new Map<string, number>();
    for (const s of sessions.filter((s) => s.date >= last14)) {
      const key = s.subjectId ?? "livre";
      map.set(key, (map.get(key) ?? 0) + s.minutes);
    }
    const total = [...map.values()].reduce((a, b) => a + b, 0) || 1;
    return subjects
      .map((sub) => ({
        sub,
        mins: map.get(sub.id) ?? 0,
        pct: ((map.get(sub.id) ?? 0) / total) * 100,
      }))
      .sort((a, b) => b.mins - a.mins);
  }, [sessions, subjects]);

  // constância gentil: dias com alguma sessão nos últimos 14
  const activeDays = useMemo(() => {
    const set = new Set(sessions.map((s) => s.date));
    return Array.from({ length: 14 }, (_, i) => {
      const dIso = iso(addDays(new Date(), i - 13));
      return { date: dIso, active: set.has(dIso), isToday: dIso === today };
    });
  }, [sessions, today]);
  const activeCount = activeDays.filter((d) => d.active).length;

  const doneThisWeek = tasks.filter(
    (t) => t.done && t.doneAt && t.doneAt >= iso(startOfWeek(new Date()))
  ).length;

  const moods = sessions.filter((s) => s.mood).slice(-10);
  const moodCounts = {
    leve: moods.filter((m) => m.mood === "leve").length,
    ok: moods.filter((m) => m.mood === "ok").length,
    pesado: moods.filter((m) => m.mood === "pesado").length,
  };

  if (!mounted) return <div className="nk-skeleton h-[60vh] w-full" />;

  // ainda não estudou nada por aqui — a caneca não tem folhas para segurar
  if (sessions.length === 0) {
    return (
      <div className="mx-auto max-w-[560px] py-16 text-center">
        <p className="mb-3 text-4xl" aria-hidden>☕</p>
        <h2 className="font-display text-xl text-ink-high">
          A caneca ainda não tem folhas para segurar.
        </h2>
        <p className="mx-auto mt-3 max-w-[440px] text-sm leading-relaxed text-ink-mid">
          Aqui vão aparecer suas horas de estudo, o equilíbrio entre as disciplinas
          e a sua constância — tudo a partir das suas sessões de foco. Faça a
          primeira e volte para ver o esforço tomar forma.
        </p>
        <Link
          href="/?open=foco"
          className="mt-7 inline-block rounded-(--radius-md) bg-amber px-5 py-3 text-sm font-medium text-void shadow-[0_0_32px_#e8a87c30] transition-transform hover:scale-[1.02]"
        >
          começar uma sessão de foco
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[900px]">
      <p className="nk-reveal mb-5 text-sm text-ink-mid">
        as folhas que a caneca estava segurando — seu esforço, com carinho. ☕
      </p>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {/* totais da semana — a folha com a marca da caneca */}
        <section className="nk-sheet nk-reveal p-6" style={{ rotate: "-0.7deg" }}>
          <span className="nk-coffee-ring -right-3 -top-4" aria-hidden />
          <h3 className="mb-1 text-sm text-ink-mid">esta semana</h3>
          <p className="font-display text-4xl text-amber">{minutesToHuman(weekTotal)}</p>
          <p className="mt-1 text-sm text-ink-mid">de estudo focado</p>
          <p className="mt-4 text-sm text-ink-mid">
            {doneThisWeek} tarefa{doneThisWeek !== 1 ? "s" : ""} concluída{doneThisWeek !== 1 ? "s" : ""}
          </p>
        </section>

        {/* barras da semana */}
        <section className="nk-sheet nk-reveal nk-reveal-1 p-6 md:col-span-2" style={{ rotate: "0.4deg" }}>
          <h3 className="mb-4 text-sm text-ink-mid">distribuição da semana</h3>
          <div className="flex h-32 items-end justify-between gap-2">
            {week.map((d) => (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-1.5">
                <span className="text-[10px] text-ink-low">
                  {d.mins > 0 ? minutesToHuman(d.mins) : ""}
                </span>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${Math.max(4, (d.mins / maxDay) * 96)}px`,
                    background:
                      d.date === today
                        ? "#e8a87c"
                        : d.mins > 0
                          ? "#e8a87c66"
                          : "#1e2433",
                  }}
                />
                <span
                  className={`text-[10px] ${d.date === today ? "text-amber" : "text-ink-low"}`}
                >
                  {d.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* equilíbrio por disciplina */}
        <section className="nk-sheet nk-reveal nk-reveal-2 p-6 md:col-span-2" style={{ rotate: "-0.35deg" }}>
          <h3 className="mb-1 text-sm text-ink-mid">equilíbrio por disciplina</h3>
          <p className="mb-4 text-xs text-ink-low">últimos 14 dias — onde sua atenção esteve</p>
          <div className="space-y-3">
            {bySubject.map(({ sub, mins, pct }) => (
              <div key={sub.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-ink-mid">{sub.name}</span>
                  <span className="text-ink-low">{mins > 0 ? minutesToHuman(mins) : "—"}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-raised">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: sub.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          {bySubject[0] && bySubject[0].pct > 50 && (
            <p className="mt-4 text-xs text-ink-low">
              🪻 mais da metade do seu foco foi para {bySubject[0].sub.name} — as outras
              disciplinas agradecem uma visita.
            </p>
          )}
        </section>

        {/* constância gentil */}
        <section className="nk-sheet nk-reveal nk-reveal-3 p-6" style={{ rotate: "0.6deg" }}>
          <h3 className="mb-1 text-sm text-ink-mid">constância</h3>
          <p className="mb-4 text-xs text-ink-low">sem streaks que punem — só presença</p>
          <div className="grid grid-cols-7 gap-1.5">
            {activeDays.map((d) => (
              <div
                key={d.date}
                title={d.date}
                className="h-6 rounded-md"
                style={{
                  background: d.active ? "#9caf88" : "#1e2433",
                  opacity: d.active ? 0.9 : 1,
                  boxShadow: d.isToday ? "0 0 0 1.5px #e8a87c" : undefined,
                }}
              />
            ))}
          </div>
          <p className="mt-3 text-sm text-ink-mid">
            você esteve aqui em <span className="text-moss">{activeCount} dos últimos 14 dias</span>.
            {activeCount >= 8 ? " Que ritmo bom. 🌱" : " Cada volta conta."}
          </p>
        </section>

        {/* humor das sessões */}
        <section className="nk-sheet nk-reveal nk-reveal-4 p-6 md:col-span-3" style={{ rotate: "-0.25deg" }}>
          <h3 className="mb-3 text-sm text-ink-mid">como as últimas sessões terminaram</h3>
          <div className="flex flex-wrap gap-6 text-sm">
            <span className="text-ink-mid">
              🌤 leve <strong className="text-ink-high">{moodCounts.leve}</strong>
            </span>
            <span className="text-ink-mid">
              ⛅ ok <strong className="text-ink-high">{moodCounts.ok}</strong>
            </span>
            <span className="text-ink-mid">
              🌧 pesado <strong className="text-ink-high">{moodCounts.pesado}</strong>
            </span>
            <span className="text-xs text-ink-low self-center">
              — dias pesados também contam como estudo. Talvez até mais.
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
