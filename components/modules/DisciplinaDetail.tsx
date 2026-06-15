"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SlotEditor } from "@/components/SlotEditor";
import { EmojiPicker, subjectGlyph } from "@/components/modules/DisciplinasModule";
import { TaskRow } from "@/components/TaskRow";
import { useMounted } from "@/components/useMounted";
import { fmtShort, relativeDay, todayIso, WEEKDAYS_LONG } from "@/lib/dates";
import { gradeOutlook, useNook } from "@/lib/store";
import { useToasts } from "@/lib/toast";
import type { Assessment } from "@/lib/types";

/** formulário de nova avaliação (prova/trabalho) */
function NewAssessmentForm({ subjectId, onClose }: { subjectId: string; onClose: () => void }) {
  const addAssessment = useNook((s) => s.addAssessment);
  const push = useToasts((s) => s.push);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<Assessment["kind"]>("prova");
  const [date, setDate] = useState("");
  const [weight, setWeight] = useState(30);

  function save() {
    if (!title.trim() || !date) return;
    addAssessment(subjectId, {
      title: title.trim(),
      kind,
      date,
      weight: Math.min(100, Math.max(1, weight)) / 100,
    });
    push({ message: `${title.trim()} anotada. O Nook vigia o prazo. 🌙` });
    onClose();
  }

  return (
    <div className="mt-3 rounded-(--radius-md) bg-raised/60 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && save()}
          placeholder="título — ex.: Prova 2"
          className="min-w-[180px] flex-1 rounded-(--radius-sm) bg-surface px-3 py-2 text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
          aria-label="Título da avaliação"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as Assessment["kind"])}
          className="rounded-(--radius-sm) bg-surface px-2 py-2 text-sm text-ink-mid focus:outline-none"
          aria-label="Tipo"
        >
          <option value="prova">prova</option>
          <option value="trabalho">trabalho</option>
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-(--radius-sm) bg-surface px-2 py-2 text-sm text-ink-mid focus:outline-none"
          aria-label="Data"
        />
        <label className="flex items-center gap-1.5 text-sm text-ink-mid">
          <input
            type="number"
            min={1}
            max={100}
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            className="w-16 rounded-(--radius-sm) bg-surface px-2 py-2 text-center text-sm text-ink-high focus:outline-none"
            aria-label="Peso (%)"
          />
          % do semestre
        </label>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button
          onClick={onClose}
          className="rounded-(--radius-sm) px-3 py-1.5 text-xs text-ink-mid transition-colors hover:text-ink-high"
        >
          cancelar
        </button>
        <button
          onClick={save}
          disabled={!title.trim() || !date}
          className="rounded-(--radius-sm) bg-amber px-3 py-1.5 text-xs font-medium text-void transition-opacity hover:opacity-90 disabled:opacity-30"
        >
          anotar avaliação
        </button>
      </div>
    </div>
  );
}

/** guardar um link de material na disciplina (arquivos chegam com o Storage) */
function MaterialAdder({ subjectId }: { subjectId: string }) {
  const addMaterial = useNook((s) => s.addMaterial);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");

  function save() {
    const t = title.trim();
    if (!t) return;
    let u = url.trim();
    if (u && !/^https?:\/\//i.test(u)) u = `https://${u}`;
    addMaterial(subjectId, { title: t, kind: "link", url: u || undefined });
    setTitle("");
    setUrl("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-3 text-xs text-amber transition-colors hover:underline"
      >
        + guardar um link
      </button>
    );
  }

  return (
    <div className="mt-3 space-y-2 rounded-(--radius-md) bg-raised/50 p-3">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="título — ex.: Slides da aula 3"
        className="w-full rounded-(--radius-sm) bg-surface px-3 py-2 text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
        aria-label="Título do material"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && save()}
        placeholder="https://…"
        className="w-full rounded-(--radius-sm) bg-surface px-3 py-2 font-mono text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
        aria-label="Endereço do link"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            setOpen(false);
            setTitle("");
            setUrl("");
          }}
          className="rounded-(--radius-sm) px-3 py-1.5 text-xs text-ink-mid transition-colors hover:text-ink-high"
        >
          cancelar
        </button>
        <button
          onClick={save}
          disabled={!title.trim()}
          className="rounded-(--radius-sm) bg-amber px-3 py-1.5 text-xs font-medium text-void transition-opacity hover:opacity-90 disabled:opacity-30"
        >
          guardar
        </button>
      </div>
    </div>
  );
}

/** Detalhe de uma disciplina — usado dentro da estante (overlay do quarto). */
export function DisciplinaDetail({ id }: { id: string }) {
  const router = useRouter();
  const mounted = useMounted();
  const subjects = useNook((s) => s.subjects);
  const tasks = useNook((s) => s.tasks);
  const setGrade = useNook((s) => s.setGrade);
  const removeSubject = useNook((s) => s.removeSubject);
  const restoreSubject = useNook((s) => s.restoreSubject);
  const removeAssessment = useNook((s) => s.removeAssessment);
  const removeMaterial = useNook((s) => s.removeMaterial);
  const push = useToasts((s) => s.push);
  const updateSubject = useNook((s) => s.updateSubject);
  const sub = subjects.find((s) => s.id === id);
  const [addingAssessment, setAddingAssessment] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(false);
  const [editingEmoji, setEditingEmoji] = useState(false);

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
        <Link href="/?open=disciplinas" className="mt-3 inline-block text-sm text-amber">
          ← voltar à estante
        </Link>
      </div>
    );
  }

  const outlook = gradeOutlook(sub);
  const subTasks = tasks.filter((t) => t.subjectId === sub.id && !t.done);
  const today = todayIso();

  // frequência (regra dos 75%): pode faltar até 25% das aulas do semestre
  const absences = sub.absences ?? 0;
  const totalClasses = sub.totalClasses ?? 0;
  const maxAbsences = totalClasses > 0 ? Math.floor(totalClasses * 0.25) : null;
  const absencesLeft = maxAbsences != null ? maxAbsences - absences : null;
  const freqColor =
    absencesLeft == null
      ? "#9caf88"
      : absencesLeft <= 0
        ? "#c97b63"
        : absencesLeft <= 2
          ? "#e8a87c"
          : "#9caf88";

  return (
    <div className="mx-auto max-w-[900px]">
      <Link
        href="/?open=disciplinas"
        className="nk-reveal mb-4 inline-flex items-center gap-1.5 text-sm text-ink-mid transition-colors hover:text-amber"
      >
        <span aria-hidden>←</span> estante
      </Link>

      {/* cabeçalho */}
      <header
        className="nk-reveal relative mb-6 rounded-(--radius-lg) p-6"
        style={{
          background: `linear-gradient(135deg, ${sub.color}24, transparent 60%)`,
          boxShadow: "0 0 0 1px #ffffff08",
        }}
      >
        <p className="text-xs uppercase tracking-wider text-ink-low">{sub.code}</p>
        <div className="mt-1 flex items-center gap-3">
          <button
            onClick={() => setEditingEmoji((v) => !v)}
            title="Trocar o símbolo da disciplina"
            aria-label="Trocar o símbolo da disciplina"
            className="grid h-12 w-12 shrink-0 place-items-center rounded-(--radius-md) text-3xl transition-colors hover:bg-raised/60"
            style={{ background: `color-mix(in srgb, ${sub.color} 20%, transparent)` }}
          >
            {sub.emoji || subjectGlyph(sub.name)}
          </button>
          <h2 className="font-display text-3xl text-ink-high">{sub.name}</h2>
        </div>
        {editingEmoji && (
          <div className="mt-3 max-w-[420px] rounded-(--radius-md) bg-raised/50 p-3">
            <EmojiPicker
              value={sub.emoji ?? ""}
              onChange={(v) => updateSubject(sub.id, { emoji: v || undefined })}
              fallback={subjectGlyph(sub.name)}
            />
          </div>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-ink-mid">
          {sub.professor && <span>{sub.professor}</span>}
          {sub.room && <span>{sub.room}</span>}
          {sub.schedule.map((c, i) => (
            <span key={i}>
              {WEEKDAYS_LONG[c.weekday]} {c.start}–{c.end}
            </span>
          ))}
          <button
            onClick={() => setEditingSchedule((v) => !v)}
            className="rounded-(--radius-sm) px-1.5 py-0.5 text-xs text-amber transition-colors hover:bg-amber/10"
          >
            {editingSchedule ? "fechar" : sub.schedule.length === 0 ? "+ horários de aula" : "editar horários ✎"}
          </button>
        </div>
        {editingSchedule && (
          <div className="mt-3 rounded-(--radius-md) bg-raised/50 p-3">
            <SlotEditor
              slots={sub.schedule}
              onChange={(next) => updateSubject(sub.id, { schedule: next })}
            />
          </div>
        )}
        <button
          onClick={() => {
            const snapshot = sub;
            removeSubject(sub.id);
            push({
              message: `${sub.name} saiu da estante.`,
              undoLabel: "desfazer",
              onUndo: () => restoreSubject(snapshot),
            });
            router.push("/?open=disciplinas");
          }}
          className="absolute right-4 top-4 rounded-(--radius-sm) px-2 py-1 text-xs text-ink-low transition-colors hover:text-clay"
          title="Tirar disciplina da estante"
        >
          tirar da estante ✕
        </button>
      </header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* provas, notas e simulador */}
        <section className="nk-card nk-reveal nk-reveal-1 p-6 md:col-span-2">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-3">
              <h3 className="font-display text-lg text-ink-high">Avaliações & notas</h3>
              <button
                onClick={() => setAddingAssessment(true)}
                className="rounded-(--radius-sm) px-2 py-0.5 text-xs text-amber transition-colors hover:bg-amber/10"
              >
                + adicionar
              </button>
            </div>
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
                  precisa de {outlook.neededAvg.toFixed(1)} no que falta p/ fechar em {outlook.target.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {sub.assessments.length === 0 && !addingAssessment && (
            <button
              onClick={() => setAddingAssessment(true)}
              className="w-full rounded-(--radius-md) border border-dashed border-ink-faint/70 px-4 py-6 text-center text-sm text-ink-low transition-colors hover:border-amber/50 hover:text-amber"
            >
              Nenhuma prova ou trabalho anotado ainda. + adicionar a primeira
            </button>
          )}

          <div className="space-y-2">
            {sub.assessments
              .slice()
              .sort((a, b) => a.date.localeCompare(b.date))
              .map((a) => (
                <div
                  key={a.id}
                  className="group/item flex flex-wrap items-center gap-3 rounded-(--radius-md) bg-raised/50 px-4 py-3"
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
                  <button
                    onClick={() => removeAssessment(sub.id, a.id)}
                    className="text-ink-faint opacity-0 transition-all hover:text-clay group-hover/item:opacity-100"
                    title="Remover avaliação"
                    aria-label={`Remover ${a.title}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
          </div>

          {addingAssessment && (
            <NewAssessmentForm subjectId={sub.id} onClose={() => setAddingAssessment(false)} />
          )}

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

        {/* meta de nota, créditos e frequência (75%) */}
        <section className="nk-card nk-reveal nk-reveal-2 p-6 md:col-span-2">
          <h3 className="mb-4 font-display text-lg text-ink-high">Meta & frequência</h3>
          <div className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {/* meta + créditos */}
            <div className="space-y-3">
              <label className="flex items-center justify-between gap-3 text-sm text-ink-mid">
                <span>meta de nota p/ fechar</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.5}
                  value={sub.targetGrade ?? 6}
                  onChange={(e) =>
                    updateSubject(sub.id, { targetGrade: Math.min(10, Math.max(0, Number(e.target.value))) })
                  }
                  className="w-20 rounded-(--radius-sm) bg-surface px-2 py-1.5 text-center text-sm text-ink-high focus:outline-none"
                  aria-label="Meta de nota"
                />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm text-ink-mid">
                <span>
                  créditos <span className="text-ink-low">(peso no CR)</span>
                </span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={1}
                  value={sub.credits ?? ""}
                  placeholder="—"
                  onChange={(e) =>
                    updateSubject(sub.id, {
                      credits: e.target.value ? Math.max(0, Number(e.target.value)) : undefined,
                    })
                  }
                  className="w-20 rounded-(--radius-sm) bg-surface px-2 py-1.5 text-center text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
                  aria-label="Créditos da disciplina"
                />
              </label>
            </div>

            {/* faltas / frequência */}
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3 text-sm text-ink-mid">
                <span>faltas</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateSubject(sub.id, { absences: Math.max(0, absences - 1) })}
                    aria-label="Menos uma falta"
                    className="grid h-7 w-7 place-items-center rounded-(--radius-sm) bg-surface text-ink-mid transition-colors hover:text-ink-high"
                  >
                    −
                  </button>
                  <span className="w-7 text-center font-display text-lg tabular-nums text-ink-high">{absences}</span>
                  <button
                    onClick={() => updateSubject(sub.id, { absences: absences + 1 })}
                    aria-label="Mais uma falta"
                    className="grid h-7 w-7 place-items-center rounded-(--radius-sm) bg-surface text-ink-mid transition-colors hover:text-ink-high"
                  >
                    +
                  </button>
                </div>
              </div>
              <label className="flex items-center justify-between gap-3 text-sm text-ink-mid">
                <span>total de aulas no semestre</span>
                <input
                  type="number"
                  min={0}
                  value={sub.totalClasses ?? ""}
                  placeholder="—"
                  onChange={(e) =>
                    updateSubject(sub.id, {
                      totalClasses: e.target.value ? Math.max(0, Number(e.target.value)) : undefined,
                    })
                  }
                  className="w-20 rounded-(--radius-sm) bg-surface px-2 py-1.5 text-center text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
                  aria-label="Total de aulas no semestre"
                />
              </label>
              {maxAbsences != null ? (
                <div>
                  <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-raised">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (absences / Math.max(1, maxAbsences)) * 100)}%`, background: freqColor }}
                    />
                  </div>
                  <p className="text-xs" style={{ color: freqColor }}>
                    {absencesLeft! > 0
                      ? `pode faltar mais ${absencesLeft} (limite ${maxAbsences}, 25%)`
                      : absencesLeft === 0
                        ? `no limite — ${maxAbsences} faltas (25%)`
                        : `${-absencesLeft!} além do limite — risco de reprovar por falta`}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-ink-low">informe o total de aulas para ver o limite dos 75%</p>
              )}
            </div>
          </div>
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
            <ul className="space-y-1">
              {sub.materials.map((m) => (
                <li key={m.id} className="group/mat flex items-center gap-1">
                  <a
                    href={m.url ?? "#"}
                    target={m.url ? "_blank" : undefined}
                    rel="noreferrer"
                    className="flex min-w-0 flex-1 items-center gap-2.5 rounded-(--radius-sm) px-2 py-1.5 text-sm text-ink-mid transition-colors hover:bg-raised/60 hover:text-ink-high"
                  >
                    <span className="shrink-0 text-ink-low">{m.kind === "arquivo" ? "📄" : "🔗"}</span>
                    <span className="truncate">{m.title}</span>
                  </a>
                  <button
                    onClick={() => removeMaterial(sub.id, m.id)}
                    className="shrink-0 px-1.5 text-ink-faint opacity-0 transition-all hover:text-clay group-hover/mat:opacity-100"
                    title="Remover material"
                    aria-label={`Remover ${m.title}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          <MaterialAdder subjectId={sub.id} />
          <p className="mt-3 text-xs text-ink-low">
            por enquanto, links — upload de arquivos chega com o Storage
          </p>
        </section>
      </div>
    </div>
  );
}
