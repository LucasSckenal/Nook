"use client";

import Link from "next/link";
import { useState } from "react";
import { SlotEditor } from "@/components/SlotEditor";
import { useMounted } from "@/components/useMounted";
import { daysBetween, relativeDay, todayIso } from "@/lib/dates";
import { gradeOutlook, useNook } from "@/lib/store";
import { useToasts } from "@/lib/toast";
import { audioUiTick } from "@/lib/audio";
import type { ClassSlot } from "@/lib/types";

/** paleta de lombadas — tons do design system Lanterna */
const SPINE_COLORS = [
  "#8fa8bf",
  "#a99bc4",
  "#d98c98",
  "#9caf88",
  "#c9b79c",
  "#c97b63",
  "#e8a87c",
  "#a0c9c2",
];

function NewSubjectForm({ onClose }: { onClose: () => void }) {
  const addSubject = useNook((s) => s.addSubject);
  const uiSounds = useNook((s) => s.uiSounds);
  const push = useToasts((s) => s.push);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState(SPINE_COLORS[0]);
  const [professor, setProfessor] = useState("");
  const [room, setRoom] = useState("");
  const [slots, setSlots] = useState<ClassSlot[]>([]);

  function save() {
    if (!name.trim()) return;
    addSubject({
      name: name.trim(),
      code: code.trim() || undefined,
      color,
      professor: professor.trim() || undefined,
      room: room.trim() || undefined,
      schedule: slots.filter((s) => s.start && s.end),
    });
    if (uiSounds) audioUiTick();
    push({ message: `${name.trim()} entrou na estante. 📚` });
    onClose();
  }

  return (
    <div className="nk-card nk-reveal mt-4 max-w-[560px] p-5">
      <p className="mb-4 font-display text-lg text-ink-high">Nova disciplina</p>
      <div className="space-y-3">
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="nome — ex.: Cálculo II"
          className="w-full rounded-(--radius-sm) bg-raised px-3 py-2.5 text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
          aria-label="Nome da disciplina"
        />
        <div className="flex gap-3">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="código (opcional)"
            className="w-36 rounded-(--radius-sm) bg-raised px-3 py-2.5 text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
            aria-label="Código da disciplina"
          />
          <input
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
            placeholder="professor(a) (opcional)"
            className="min-w-0 flex-1 rounded-(--radius-sm) bg-raised px-3 py-2.5 text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
            aria-label="Professor"
          />
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="sala (opcional)"
            className="w-32 rounded-(--radius-sm) bg-raised px-3 py-2.5 text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
            aria-label="Sala"
          />
        </div>
        <div>
          <p className="mb-2 text-xs text-ink-low">horários de aula (aparecem no calendário)</p>
          <SlotEditor slots={slots} onChange={setSlots} />
        </div>
        <div className="flex items-center gap-2" role="radiogroup" aria-label="Cor da lombada">
          <span className="mr-1 text-xs text-ink-low">cor da lombada</span>
          {SPINE_COLORS.map((c) => (
            <button
              key={c}
              role="radio"
              aria-checked={color === c}
              aria-label={`Cor ${c}`}
              onClick={() => setColor(c)}
              className="h-7 w-5 rounded-[4px] transition-transform hover:scale-110"
              style={{
                background: c,
                boxShadow: color === c ? `0 0 0 2px var(--color-room), 0 0 0 4px ${c}` : "none",
              }}
            />
          ))}
        </div>
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="rounded-(--radius-sm) px-3 py-2 text-sm text-ink-mid transition-colors hover:text-ink-high"
          >
            cancelar
          </button>
          <button
            onClick={save}
            disabled={!name.trim()}
            className="rounded-(--radius-sm) bg-amber px-4 py-2 text-sm font-medium text-void transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            guardar na estante
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DisciplinasPage() {
  const mounted = useMounted();
  const subjects = useNook((s) => s.subjects);
  const tasks = useNook((s) => s.tasks);
  const [adding, setAdding] = useState(false);
  const today = todayIso();

  if (!mounted) return <div className="nk-skeleton h-[60vh] w-full" />;

  const empty = subjects.length === 0;

  return (
    <div>
      <p className="nk-reveal mb-6 text-sm text-ink-mid">
        {empty
          ? "A estante está esperando os seus livros."
          : `${subjects.length} disciplina${subjects.length > 1 ? "s" : ""} neste semestre. Cada lombada é uma porta.`}
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
              href={`/?open=disciplinas&id=${s.id}`}
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

        {/* lombada vazia: adicionar disciplina */}
        <button
          onClick={() => setAdding(true)}
          className="group flex w-[120px] flex-col items-center justify-center gap-2 rounded-t-(--radius-md) border-2 border-dashed border-ink-faint/70 px-4 pb-5 pt-4 text-ink-low transition-all duration-(--nk-dur-quick) hover:-translate-y-2 hover:border-amber/60 hover:text-amber"
          style={{ height: empty ? 240 : 218 }}
          aria-label="Adicionar disciplina"
        >
          <span className="text-2xl leading-none">+</span>
          <span className="text-xs">{empty ? "primeira disciplina" : "nova disciplina"}</span>
        </button>

        {/* base da prateleira */}
        <div className="-mx-6 mt-0 h-3 w-[calc(100%+48px)] rounded-b-(--radius-lg) bg-raised" />
      </div>

      {adding && <NewSubjectForm onClose={() => setAdding(false)} />}

      {/* primeira vez: um empurrãozinho gentil */}
      {empty && !adding && (
        <div className="nk-reveal nk-reveal-2 mt-8 max-w-[480px] rounded-(--radius-md) border border-amber/20 bg-amber/5 p-5 text-sm leading-relaxed text-ink-mid">
          <p>
            Comece guardando uma disciplina na estante — nome e cor bastam. Depois,
            dentro dela, você cadastra as provas e trabalhos do semestre, e o Nook
            passa a vigiar os prazos por você. 🌙
          </p>
        </div>
      )}

      {/* resumo de notas */}
      {!empty && (
        <div className="nk-reveal nk-reveal-2 mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((s) => {
            const o = gradeOutlook(s);
            return (
              <Link key={s.id} href={`/?open=disciplinas&id=${s.id}`} className="nk-card p-5 transition-colors hover:bg-raised/60">
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
      )}
    </div>
  );
}
