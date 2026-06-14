"use client";

import Link from "next/link";
import { useState } from "react";
import { SlotEditor } from "@/components/SlotEditor";
import { useMounted } from "@/components/useMounted";
import { gradeOutlook, useNook } from "@/lib/store";
import { useToasts } from "@/lib/toast";
import { audioUiTick } from "@/lib/audio";
import type { ClassSlot, Subject } from "@/lib/types";

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

/** símbolo da disciplina pela área (aproximação do mockup) */
function subjectGlyph(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("cálcul") || n.includes("calcul")) return "∫";
  if (n.includes("álgebra") || n.includes("algebra") || n.includes("linear")) return "∑";
  if (n.includes("algoritmo") || n.includes("estrutura")) return "🌳";
  if (n.includes("físic") || n.includes("fisic")) return "⚛";
  if (n.includes("banco") || n.includes("dados")) return "🗄";
  if (n.includes("engenharia") || n.includes("software")) return "⌘";
  if (n.includes("interface") || n.includes("ihc") || n.includes("design")) return "🎨";
  if (n.includes("redes")) return "🌐";
  if (n.includes("quím") || n.includes("quim")) return "⚗";
  return "📖";
}

/** uma lombada de livro 3D na prateleira (estilo couro com nota e fita) */
function BookSpine({ subject, height }: { subject: Subject; height: number }) {
  const c = subject.color;
  const o = gradeOutlook(subject);
  const glyph = subjectGlyph(subject.name);
  const gradeColor = o.current == null ? "#cbb78f" : o.current >= 6 ? "#9caf88" : "#e0917a";

  return (
    <Link
      href={`/?open=disciplinas&id=${subject.id}`}
      className="group relative flex shrink-0 origin-bottom flex-col items-center rounded-t-[6px] px-2.5 pb-3 pt-3 text-center transition-transform duration-(--nk-dur-quick) hover:-translate-y-3 hover:rotate-[-1.5deg]"
      style={{
        width: "clamp(96px, 13vw, 122px)",
        height,
        background: `linear-gradient(96deg, color-mix(in srgb, ${c} 80%, #fff) 0%, ${c} 14%, color-mix(in srgb, ${c} 55%, #000) 92%)`,
        boxShadow:
          "inset 8px 0 12px -7px #ffffff66, inset -12px 0 16px -7px #00000090, 0 8px 16px #00000055",
        borderTop: `3px solid color-mix(in srgb, ${c} 72%, #fff)`,
      }}
      title={subject.name}
    >
      {/* filetes dourados (nervuras da lombada) */}
      <span className="pointer-events-none absolute inset-x-2.5 top-9 h-px bg-[#e8c98a]/30" />
      <span className="pointer-events-none absolute inset-x-2.5 bottom-12 h-px bg-[#e8c98a]/30" />
      <span className="text-[10px] tracking-widest text-[#e8c98a]/60" aria-hidden>✦</span>

      {/* nome */}
      <p
        className="mt-1 line-clamp-3 font-display text-[13px] font-medium leading-tight"
        style={{ color: "color-mix(in srgb, " + c + " 12%, #fff)" }}
      >
        {subject.name}
      </p>

      {/* símbolo da disciplina */}
      <span
        className="my-auto text-3xl"
        style={{ color: "color-mix(in srgb, " + c + " 30%, #f0e6cf)", textShadow: "0 1px 2px #00000060" }}
        aria-hidden
      >
        {glyph}
      </span>

      {/* nota parcial + progresso do semestre */}
      <div className="w-full">
        {o.current != null ? (
          <p className="font-display text-2xl leading-none" style={{ color: gradeColor }}>
            {o.current.toFixed(1)}
          </p>
        ) : (
          <p className="text-[10px] leading-tight text-white/70">sem<br />notas</p>
        )}
        <p className="mt-1 text-[9px] text-white/65">{Math.round(o.weightDone * 100)}% do semestre</p>
        <div className="mx-auto mt-1.5 h-1 w-12 overflow-hidden rounded-full bg-black/30">
          <div className="h-full rounded-full" style={{ width: `${Math.round(o.weightDone * 100)}%`, background: "#e8c98a" }} />
        </div>
      </div>

      {/* fita-marcador */}
      <span
        className="absolute -bottom-2 left-1/2 h-6 w-3.5 -translate-x-1/2"
        style={{
          background: `linear-gradient(180deg, color-mix(in srgb, ${c} 78%, #fff), ${c})`,
          clipPath: "polygon(0 0, 100% 0, 100% 100%, 50% 72%, 0 100%)",
          boxShadow: "0 3px 5px #00000060",
        }}
        aria-hidden
      />
    </Link>
  );
}

/** uma prateleira (madeira) com holofotes e os livros em pé */
function Shelf({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* holofotes embutidos sobre a prateleira */}
      <div className="pointer-events-none absolute inset-x-6 top-0 flex justify-around" aria-hidden>
        {Array.from({ length: 4 }).map((_, i) => (
          <span
            key={i}
            className="h-24 w-24 rounded-full"
            style={{ background: "radial-gradient(circle at 50% 0%, #f0c08930, transparent 62%)" }}
          />
        ))}
      </div>
      <div className="relative flex items-end gap-2.5 overflow-x-auto px-4 pb-3 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      {/* tábua de madeira */}
      <div
        className="h-4 rounded-[2px]"
        style={{
          background: "linear-gradient(180deg, #6a513a, #3e2f20)",
          boxShadow: "inset 0 2px 0 #8a6e4f, 0 6px 16px #00000070",
        }}
      />
    </div>
  );
}

export default function DisciplinasPage() {
  const mounted = useMounted();
  const subjects = useNook((s) => s.subjects);
  const [adding, setAdding] = useState(false);

  if (!mounted) return <div className="nk-skeleton h-[60vh] w-full" />;

  const empty = subjects.length === 0;

  // o botão de adicionar entra como um "livro" a mais na última prateleira
  const addSlot = (
    <button
      onClick={() => setAdding(true)}
      className="group flex shrink-0 origin-bottom flex-col items-center justify-center gap-2 rounded-[6px] border-2 border-dashed px-3 text-ink-low transition-transform duration-(--nk-dur-quick) hover:-translate-y-3"
      style={{
        width: "clamp(96px, 13vw, 122px)",
        height: 250,
        borderColor: "#e8a87c50",
        background: "#ffffff06",
      }}
      aria-label="Adicionar disciplina"
    >
      <span className="text-3xl leading-none transition-colors group-hover:text-amber">+</span>
      <span className="text-center text-[11px] leading-tight transition-colors group-hover:text-amber">
        {empty ? "Adicionar\nprimeiro livro" : "Adicionar\nnovo livro"}
      </span>
    </button>
  );

  // distribui os livros em prateleiras de 6
  const PER_SHELF = 6;
  const rows: Subject[][] = [];
  for (let i = 0; i < subjects.length; i += PER_SHELF) rows.push(subjects.slice(i, i + PER_SHELF));
  if (rows.length === 0) rows.push([]); // estante vazia: uma prateleira só com o "+"

  return (
    <div>
      <p className="nk-reveal mb-6 text-sm text-ink-mid">
        {empty
          ? "A estante está esperando os seus livros."
          : `${subjects.length} disciplina${subjects.length > 1 ? "s" : ""} neste semestre. Cada lombada é uma porta.`}
      </p>

      {/* a estante de madeira */}
      <div
        className="nk-reveal nk-reveal-1 rounded-(--radius-lg) p-3"
        style={{
          background: "linear-gradient(180deg, #2c2118, #211911)",
          boxShadow: "0 18px 44px #00000060, inset 0 0 0 1px #00000060, inset 0 0 60px #00000050",
        }}
      >
        {/* moldura: laterais de madeira + fundo escuro */}
        <div
          className="flex gap-2 rounded-(--radius-md) p-1"
          style={{ background: "linear-gradient(90deg, #3a2c1f, #4a3826 4%, #1c140d 12%, #1c140d 88%, #4a3826 96%, #3a2c1f)" }}
        >
          <div className="flex-1 space-y-5 px-1 py-2">
            {rows.map((row, ri) => (
              <Shelf key={ri}>
                {row.map((s, i) => {
                  return (
                    <BookSpine
                      key={s.id}
                      subject={s}
                      height={244 + (i % 3) * 18}
                    />
                  );
                })}
                {/* o "+" mora na última prateleira */}
                {ri === rows.length - 1 && addSlot}
              </Shelf>
            ))}
          </div>
        </div>
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
