"use client";

import type { ClassSlot, Weekday } from "@/lib/types";

const DIAS: { v: Weekday; label: string }[] = [
  { v: 1, label: "segunda" },
  { v: 2, label: "terça" },
  { v: 3, label: "quarta" },
  { v: 4, label: "quinta" },
  { v: 5, label: "sexta" },
  { v: 6, label: "sábado" },
  { v: 0, label: "domingo" },
];

/** editor compacto de horários de aula (dia da semana + início + fim) */
export function SlotEditor({
  slots,
  onChange,
}: {
  slots: ClassSlot[];
  onChange: (next: ClassSlot[]) => void;
}) {
  function patch(i: number, p: Partial<ClassSlot>) {
    onChange(slots.map((s, j) => (j === i ? { ...s, ...p } : s)));
  }

  return (
    <div className="space-y-2">
      {slots.map((s, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2">
          <select
            value={s.weekday}
            onChange={(e) => patch(i, { weekday: Number(e.target.value) as Weekday })}
            className="rounded-(--radius-sm) bg-surface px-2 py-2 text-sm text-ink-mid focus:outline-none"
            aria-label="Dia da semana"
          >
            {DIAS.map((d) => (
              <option key={d.v} value={d.v}>
                {d.label}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={s.start}
            onChange={(e) => patch(i, { start: e.target.value })}
            className="rounded-(--radius-sm) bg-surface px-2 py-1.5 text-sm text-ink-high focus:outline-none"
            aria-label="Início da aula"
          />
          <span className="text-xs text-ink-low">até</span>
          <input
            type="time"
            value={s.end}
            onChange={(e) => patch(i, { end: e.target.value })}
            className="rounded-(--radius-sm) bg-surface px-2 py-1.5 text-sm text-ink-high focus:outline-none"
            aria-label="Fim da aula"
          />
          <button
            onClick={() => onChange(slots.filter((_, j) => j !== i))}
            className="px-1 text-ink-faint transition-colors hover:text-clay"
            aria-label="Remover horário"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={() =>
          onChange([...slots, { weekday: 1, start: "08:00", end: "10:00" }])
        }
        className="rounded-(--radius-sm) px-2 py-1 text-xs text-amber transition-colors hover:bg-amber/10"
      >
        + horário de aula
      </button>
    </div>
  );
}
