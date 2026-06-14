"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMounted } from "@/components/useMounted";
import { useNook } from "@/lib/store";
import { iso, minutesToHuman, startOfWeek, todayIso } from "@/lib/dates";
import type { Mood } from "@/lib/types";

const MOOD_EMOJI: Record<Mood, string> = { leve: "🌤", ok: "⛅", pesado: "🌧" };

type Phase = "setup" | "sessao" | "pausa" | "fim";

function fmtClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Sessão de foco — vive DENTRO do quarto: a luz apaga, só a luminária fica,
 * e o relógio flutua na cena. Nunca saímos do quarto.
 */
export default function FocoModule() {
  const router = useRouter();
  const params = useSearchParams();
  const mounted = useMounted();

  const tasks = useNook((s) => s.tasks);
  const subjects = useNook((s) => s.subjects);
  const sessions = useNook((s) => s.sessions);
  const addSession = useNook((s) => s.addSession);
  const toggleTask = useNook((s) => s.toggleTask);
  const radio = useNook((s) => s.radio);
  const setRadio = useNook((s) => s.setRadio);

  const linkedTask = tasks.find((t) => t.id === params.get("task"));

  // histórico real: o foco se lembra do que você já fez
  const history = useMemo(() => {
    const today = todayIso();
    const weekStart = iso(startOfWeek(new Date()));
    let todayMin = 0;
    let weekMin = 0;
    for (const s of sessions) {
      if (s.date === today) todayMin += s.minutes;
      if (s.date >= weekStart) weekMin += s.minutes;
    }
    const recent = [...sessions]
      .reverse()
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 4);
    return { todayMin, weekMin, recent };
  }, [sessions]);

  const [phase, setPhase] = useState<Phase>("setup");
  const [duration, setDuration] = useState<number | null>(25); // null = livre
  const [goal, setGoal] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [elapsed, setElapsed] = useState(0); // segundos
  const [taskDone, setTaskDone] = useState(false);
  const tick = useRef<number | null>(null);

  useEffect(() => {
    if (linkedTask) {
      setGoal(linkedTask.title);
      if (linkedTask.subjectId) setSubjectId(linkedTask.subjectId);
    }
  }, [linkedTask]);

  // relógio
  useEffect(() => {
    if (phase !== "sessao") return;
    tick.current = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => {
      if (tick.current) window.clearInterval(tick.current);
    };
  }, [phase]);

  // fim automático do pomodoro
  useEffect(() => {
    if (phase === "sessao" && duration != null && elapsed >= duration * 60) {
      setPhase("fim");
    }
  }, [elapsed, phase, duration]);

  function finish(mood: Mood) {
    const minutes = Math.max(1, Math.round(elapsed / 60));
    addSession({
      minutes,
      goal: goal || undefined,
      subjectId: subjectId || undefined,
      taskId: linkedTask?.id,
      mood,
    });
    if (taskDone && linkedTask && !linkedTask.done) toggleTask(linkedTask.id);
    router.push("/");
  }

  if (!mounted) return null;

  const remaining = duration != null ? Math.max(0, duration * 60 - elapsed) : elapsed;
  const sub = subjects.find((s) => s.id === subjectId);

  return (
    <div className="relative flex min-h-full flex-col items-center justify-center px-6 py-12">
      {phase === "setup" && (
        <div className="nk-reveal w-full max-w-[440px]">
          <h1 className="mb-1 text-center font-display text-3xl text-ink-high">
            Sessão de foco
          </h1>
          <p className="mb-5 text-center text-sm text-ink-mid">
            uma coisa de cada vez — o resto do quarto espera
          </p>

          {/* histórico real: quanto você já focou */}
          {history.weekMin > 0 && (
            <div className="mb-7 flex justify-center gap-2 text-center">
              <div className="flex-1 rounded-(--radius-md) bg-surface px-3 py-2">
                <p className="font-display text-lg text-amber">
                  {history.todayMin > 0 ? minutesToHuman(history.todayMin) : "—"}
                </p>
                <p className="text-[11px] text-ink-low">hoje</p>
              </div>
              <div className="flex-1 rounded-(--radius-md) bg-surface px-3 py-2">
                <p className="font-display text-lg text-ink-high">
                  {minutesToHuman(history.weekMin)}
                </p>
                <p className="text-[11px] text-ink-low">esta semana</p>
              </div>
            </div>
          )}

          <label className="mb-2 block text-xs text-ink-low">no que vamos focar?</label>
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="ex.: lista 7 de Cálculo"
            className="mb-4 w-full rounded-(--radius-md) bg-surface px-4 py-3 text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
          />

          <label className="mb-2 block text-xs text-ink-low">disciplina (opcional)</label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="mb-5 w-full rounded-(--radius-md) bg-surface px-4 py-3 text-sm text-ink-mid focus:outline-none"
          >
            <option value="">estudo livre</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <label className="mb-2 block text-xs text-ink-low">duração</label>
          <div className="mb-6 grid grid-cols-3 gap-2">
            {[
              { v: 25 as number | null, label: "25min", hint: "pomodoro" },
              { v: 50 as number | null, label: "50min", hint: "mergulho" },
              { v: null, label: "livre", hint: "sem relógio" },
            ].map((o) => (
              <button
                key={o.label}
                onClick={() => setDuration(o.v)}
                className={`rounded-(--radius-md) px-3 py-3 text-center transition-all ${
                  duration === o.v
                    ? "bg-amber/15 shadow-[0_0_0_1.5px_#e8a87c80]"
                    : "bg-surface hover:bg-raised"
                }`}
              >
                <p className={`text-sm ${duration === o.v ? "text-amber" : "text-ink-high"}`}>
                  {o.label}
                </p>
                <p className="text-[11px] text-ink-low">{o.hint}</p>
              </button>
            ))}
          </div>

          {!radio.playing && (
            <button
              onClick={() => setRadio({ playing: true })}
              className="mb-6 w-full rounded-(--radius-md) bg-surface px-4 py-2.5 text-sm text-ink-mid transition-colors hover:text-ink-high"
            >
              📻 ligar o rádio junto ({radio.station})
            </button>
          )}

          <button
            onClick={() => {
              setElapsed(0);
              setPhase("sessao");
            }}
            className="w-full rounded-(--radius-md) bg-amber py-3.5 font-medium text-void shadow-[0_0_32px_#e8a87c30] transition-transform hover:scale-[1.01]"
          >
            começar
          </button>
          <Link
            href="/"
            className="mt-4 block text-center text-xs text-ink-low transition-colors hover:text-ink-mid"
          >
            voltar ao quarto
          </Link>

          {/* últimas sessões — o ciclo foco → histórico, visível aqui */}
          {history.recent.length > 0 && (
            <div className="mt-8 border-t border-ink-faint/20 pt-5">
              <p className="mb-3 text-xs text-ink-low">últimas sessões</p>
              <div className="space-y-1.5">
                {history.recent.map((s) => {
                  const sub = subjects.find((x) => x.id === s.subjectId);
                  return (
                    <div key={s.id} className="flex items-center gap-2.5 text-sm">
                      <span className="shrink-0" aria-hidden>
                        {s.mood ? MOOD_EMOJI[s.mood] : "🕯"}
                      </span>
                      <span className="tabular-nums text-ink-mid">
                        {minutesToHuman(s.minutes)}
                      </span>
                      <span className="truncate text-ink-high">
                        {s.goal || (sub ? sub.name : "estudo livre")}
                      </span>
                      {sub && (
                        <span
                          className="ml-auto shrink-0 rounded-full px-2 py-0.5 text-[10px]"
                          style={{ background: `${sub.color}22`, color: sub.color }}
                        >
                          {sub.name}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {(phase === "sessao" || phase === "pausa") && (
        <div className="nk-reveal flex flex-col items-center">
          {sub && (
            <span
              className="mb-3 rounded-full px-3 py-1 text-xs"
              style={{ background: `${sub.color}22`, color: sub.color }}
            >
              {sub.name}
            </span>
          )}
          <p className="mb-2 max-w-md text-center text-sm text-ink-mid">
            {goal || "estudo livre"}
          </p>
          <p
            className="font-display text-[clamp(72px,16vw,128px)] font-light leading-none text-ink-high tabular-nums"
            style={{
              opacity: phase === "pausa" ? 0.45 : 1,
              transition: "opacity 400ms",
              textShadow: "0 0 60px #e8a87c30",
            }}
          >
            {fmtClock(remaining)}
          </p>
          <p className="mt-2 text-xs text-ink-low">
            {duration == null
              ? "tempo livre — pare quando fizer sentido"
              : phase === "pausa"
                ? "em pausa — a água também descansa"
                : "no ritmo"}
          </p>

          <div className="mt-10 flex items-center gap-3">
            <button
              onClick={() => setPhase(phase === "pausa" ? "sessao" : "pausa")}
              className="rounded-(--radius-md) bg-surface px-5 py-2.5 text-sm text-ink-mid transition-colors hover:text-ink-high"
            >
              {phase === "pausa" ? "retomar" : "pausar"}
            </button>
            <button
              onClick={() => setPhase("fim")}
              className="rounded-(--radius-md) bg-amber/15 px-5 py-2.5 text-sm text-amber shadow-[0_0_0_1px_#e8a87c50] transition-colors hover:bg-amber/25"
            >
              encerrar
            </button>
          </div>
        </div>
      )}

      {phase === "fim" && (
        <div className="nk-reveal w-full max-w-[420px] text-center">
          <p className="mb-2 text-3xl">🕯</p>
          <h2 className="mb-1 font-display text-2xl text-ink-high">Boa sessão.</h2>
          <p className="mb-8 text-sm text-ink-mid">
            {(() => {
              const min = Math.max(1, Math.round(elapsed / 60));
              return `${min} minuto${min !== 1 ? "s" : ""} de presença`;
            })()}
            {goal ? ` em “${goal}”` : ""}.
          </p>

          {linkedTask && !linkedTask.done && (
            <label className="mb-6 flex items-center justify-center gap-2.5 text-sm text-ink-mid">
              <input
                type="checkbox"
                checked={taskDone}
                onChange={(e) => setTaskDone(e.target.checked)}
                className="h-4 w-4 accent-(--color-moss)"
              />
              terminei a tarefa “{linkedTask.title}”
            </label>
          )}

          <p className="mb-3 text-xs text-ink-low">como foi?</p>
          <div className="flex justify-center gap-3">
            {(
              [
                { mood: "leve" as Mood, emoji: "🌤", label: "leve" },
                { mood: "ok" as Mood, emoji: "⛅", label: "ok" },
                { mood: "pesado" as Mood, emoji: "🌧", label: "pesado" },
              ]
            ).map((o) => (
              <button
                key={o.mood}
                onClick={() => finish(o.mood)}
                className="flex w-24 flex-col items-center gap-1 rounded-(--radius-md) bg-surface py-4 transition-all hover:bg-raised hover:shadow-[0_0_0_1.5px_#e8a87c60]"
              >
                <span className="text-2xl">{o.emoji}</span>
                <span className="text-xs text-ink-mid">{o.label}</span>
              </button>
            ))}
          </div>
          <p className="mt-6 text-xs text-ink-low">
            qualquer resposta registra a sessão — até as pesadas valem
          </p>
        </div>
      )}
    </div>
  );
}
