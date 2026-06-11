"use client";

import Link from "next/link";
import { useMounted } from "@/components/useMounted";
import { daysBetween, relativeDay, todayIso } from "@/lib/dates";
import { gradeOutlook, useNook } from "@/lib/store";

export default function DisciplinasPage() {
  const mounted = useMounted();
  const subjects = useNook((s) => s.subjects);
  const tasks = useNook((s) => s.tasks);
  const today = todayIso();

  if (!mounted) return <div className="nk-skeleton h-[60vh] w-full" />;

  return (
    <div>
      <p className="nk-reveal mb-6 text-sm text-ink-mid">
        {subjects.length} disciplinas neste semestre. Cada lombada é uma porta.
      </p>

      {/* a estante: lombadas */}
      <div className="nk-reveal nk-reveal-1 flex flex-wrap items-end gap-3 rounded-(--radius-lg) bg-surface p-6 pb-0 shadow-[0_0_0_1px_#ffffff08]">
        {subjects.map((s, i) => {
          const pending = tasks.filter((t) => !t.done && t.subjectId === s.id).length;
          const next = s.assessments
            .filter((a) => a.grade == null && daysBetween(today, a.date) >= 0)
            .sort((a, b) => a.date.localeCompare(b.date))[0];
          return (
            <Link
              key={s.id}
              href={`/disciplinas/${s.id}`}
              className="group relative flex w-[120px] flex-col justify-between rounded-t-(--radius-md) px-4 pb-5 pt-4 transition-transform duration-(--nk-dur-quick) hover:-translate-y-2"
              style={{
                background: `linear-gradient(180deg, ${s.color}38, ${s.color}1f)`,
                borderTop: `3px solid ${s.color}`,
                height: 240 + (i % 3) * 22,
              }}
            >
              <div>
                <p className="text-[11px] uppercase tracking-wider text-ink-low">
                  {s.code}
                </p>
                <p className="mt-2 font-display text-base leading-snug text-ink-high">
                  {s.name}
                </p>
              </div>
              <div className="space-y-1 text-[11px] text-ink-mid">
                {next && (
                  <p>
                    <span style={{ color: next.kind === "prova" ? "#c97b63" : "#8fa8bf" }}>
                      {next.kind === "prova" ? "◉ prova" : "◍ entrega"}
                    </span>{" "}
                    {relativeDay(next.date)}
                  </p>
                )}
                {pending > 0 && <p>{pending} tarefa{pending > 1 ? "s" : ""} aberta{pending > 1 ? "s" : ""}</p>}
                {!next && pending === 0 && <p className="text-moss">em dia ✓</p>}
              </div>
            </Link>
          );
        })}
        {/* base da prateleira */}
        <div className="-mx-6 mt-0 h-3 w-[calc(100%+48px)] rounded-b-(--radius-lg) bg-raised" />
      </div>

      {/* resumo de notas */}
      <div className="nk-reveal nk-reveal-2 mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((s) => {
          const o = gradeOutlook(s);
          return (
            <Link key={s.id} href={`/disciplinas/${s.id}`} className="nk-card p-5 transition-colors hover:bg-raised/60">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                <p className="truncate text-sm font-medium text-ink-high">{s.name}</p>
              </div>
              {o.current != null ? (
                <p className="text-sm text-ink-mid">
                  média parcial{" "}
                  <span
                    className="font-display text-xl"
                    style={{ color: o.current >= 6 ? "#9caf88" : "#c97b63" }}
                  >
                    {o.current.toFixed(1)}
                  </span>{" "}
                  <span className="text-xs text-ink-low">
                    ({Math.round(o.weightDone * 100)}% do semestre avaliado)
                  </span>
                </p>
              ) : (
                <p className="text-sm text-ink-low">ainda sem notas lançadas</p>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
