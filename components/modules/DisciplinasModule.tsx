"use client";

import Link from "next/link";
import { useState } from "react";
import { SlotEditor } from "@/components/SlotEditor";
import { useMounted } from "@/components/useMounted";
import { gradeOutlook, semesterGPA, useNook } from "@/lib/store";
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

/** sugestões de emoji por área (o usuário também pode digitar/colar o seu) */
const EMOJI_SUGGEST = [
  "📖", "📐", "∫", "∑", "⚛", "🧪", "🧬", "🗄", "💻", "🌐",
  "⚙️", "🎨", "🏛️", "⚖️", "🩺", "🧠", "🎭", "🎵", "📊", "🌱",
];

/** escolha de símbolo da disciplina — campo livre + sugestões */
export function EmojiPicker({
  value,
  onChange,
  fallback,
}: {
  value: string;
  onChange: (v: string) => void;
  fallback: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span
          className="grid h-9 w-9 shrink-0 place-items-center rounded-(--radius-sm) bg-raised text-xl"
          aria-hidden
        >
          {value || fallback}
        </span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, 8))}
          placeholder="emoji (opcional)"
          className="w-36 rounded-(--radius-sm) bg-raised px-3 py-2 text-sm text-ink-high placeholder:text-ink-low focus:outline-none"
          aria-label="Emoji da disciplina"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-ink-low transition-colors hover:text-clay"
          >
            usar automático
          </button>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {EMOJI_SUGGEST.map((e) => (
          <button
            key={e}
            type="button"
            onClick={() => onChange(e)}
            aria-label={`Usar ${e}`}
            className={`grid h-8 w-8 place-items-center rounded-(--radius-sm) text-lg transition-colors hover:bg-surface ${
              value === e ? "bg-surface ring-1 ring-amber/50" : ""
            }`}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  );
}

function NewSubjectForm({ onClose }: { onClose: () => void }) {
  const addSubject = useNook((s) => s.addSubject);
  const uiSounds = useNook((s) => s.uiSounds);
  const push = useToasts((s) => s.push);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [color, setColor] = useState(SPINE_COLORS[0]);
  const [emoji, setEmoji] = useState("");
  const [professor, setProfessor] = useState("");
  const [room, setRoom] = useState("");
  const [slots, setSlots] = useState<ClassSlot[]>([]);

  function save() {
    if (!name.trim()) return;
    addSubject({
      name: name.trim(),
      code: code.trim() || undefined,
      color,
      emoji: emoji.trim() || undefined,
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
        <div>
          <p className="mb-2 text-xs text-ink-low">símbolo da disciplina</p>
          <EmojiPicker value={emoji} onChange={setEmoji} fallback={subjectGlyph(name)} />
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
export function subjectGlyph(name: string): string {
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

/** hash estável p/ dar variedade (largura/altura) por disciplina */
function hashStr(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** uma lombada de livro 3D na prateleira (couro, folhas no topo, nota e fita) */
function BookSpine({ subject }: { subject: Subject }) {
  const c = subject.color;
  const o = gradeOutlook(subject);
  const glyph = subject.emoji || subjectGlyph(subject.name);
  const gradeColor = o.current == null ? "#cbb78f" : o.current >= 6 ? "#9caf88" : "#e0917a";
  const pct = Math.round(o.weightDone * 100);

  // variedade estável por disciplina — cada livro tem porte próprio
  const h = hashStr(subject.id || subject.name);
  const width = 104 + (h % 3) * 9; // 104 / 113 / 122
  const height = 240 + ((h >> 3) % 4) * 15; // 240..285

  return (
    <Link
      href={`/?open=disciplinas&id=${subject.id}`}
      className="group relative flex shrink-0 origin-bottom flex-col items-center rounded-t-[7px] px-2.5 pb-3 pt-5 text-center transition-transform duration-(--nk-dur-quick) hover:-translate-y-3 hover:rotate-[-1.5deg]"
      style={{
        width,
        height,
        background: `linear-gradient(96deg, color-mix(in srgb, ${c} 80%, #fff) 0%, ${c} 14%, color-mix(in srgb, ${c} 55%, #000) 92%)`,
        boxShadow:
          "inset 9px 0 14px -8px #ffffff70, inset -14px 0 18px -8px #00000099, 0 10px 20px #00000060",
      }}
      title={subject.name}
    >
      {/* folhas — o corte superior do livro */}
      <span
        className="pointer-events-none absolute inset-x-[3px] top-[3px] h-[6px] rounded-[2px]"
        style={{
          background:
            "repeating-linear-gradient(90deg,#f1e7cf 0,#f1e7cf 1px,#d5c4a1 1px,#d5c4a1 2px)",
          boxShadow: "0 1px 2px #00000055",
        }}
        aria-hidden
      />
      {/* grão de couro + brilho da capa */}
      <span
        className="pointer-events-none absolute inset-0 rounded-t-[7px]"
        style={{
          background:
            "repeating-linear-gradient(180deg,#ffffff0a 0 1px,transparent 1px 3px), radial-gradient(130% 55% at 26% 4%, #ffffff26, transparent 60%)",
          mixBlendMode: "soft-light",
        }}
        aria-hidden
      />

      {/* filete dourado (nervura inferior, acima da nota) */}
      <span className="pointer-events-none absolute inset-x-3 bottom-12 h-px bg-[#e8c98a]/30" />
      <span className="mb-1 text-[10px] tracking-widest text-[#e8c98a]/60" aria-hidden>✦</span>

      {/* nome */}
      <p
        className="line-clamp-3 font-display text-[13px] font-medium leading-tight"
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
        <p className="mt-1 text-[9px] text-white/65">{pct}% do semestre</p>
        <div className="mx-auto mt-1.5 h-1 w-12 overflow-hidden rounded-full bg-black/30">
          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "#e8c98a" }} />
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
      {/* downlights quentes batendo nas lombadas */}
      <div className="pointer-events-none absolute inset-x-4 -top-1 z-10 flex justify-around" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="h-32 w-28"
            style={{ background: "radial-gradient(ellipse 60% 90% at 50% 0%, #ffcf9426, transparent 70%)" }}
          />
        ))}
      </div>
      <div className="relative flex items-end gap-2.5 overflow-x-auto px-4 pb-3 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
      {/* tábua de madeira com veios */}
      <div
        className="h-4 rounded-[2px]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg,#00000018 0 2px,transparent 2px 7px), linear-gradient(180deg,#7a5e44,#3e2f20)",
          boxShadow: "inset 0 2px 0 #9a7b58, inset 0 -1px 0 #1c140d, 0 7px 18px #00000080",
        }}
      />
    </div>
  );
}

/** uma gaveta de fichário (madeira) — o resumo da disciplina vira a etiqueta */
function Drawer({ subject }: { subject: Subject }) {
  const o = gradeOutlook(subject);
  const glyph = subject.emoji || subjectGlyph(subject.name);
  const gradeColor = o.current == null ? "#cbb78f" : o.current >= 6 ? "#9caf88" : "#e0917a";
  return (
    <Link
      href={`/?open=disciplinas&id=${subject.id}`}
      className="group relative flex items-center gap-3 overflow-hidden rounded-[5px] px-3 py-3 transition-transform duration-(--nk-dur-quick) hover:translate-y-[2px]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg,#00000012 0 2px,transparent 2px 9px), linear-gradient(180deg,#6a5238,#4a3826)",
        boxShadow: "inset 0 1px 0 #9a7b5866, inset 0 -3px 6px #00000070, 0 4px 10px #00000055",
        borderLeft: `4px solid ${subject.color}`,
      }}
      title={subject.name}
    >
      {/* etiqueta (porta-etiqueta) com o símbolo */}
      <span
        className="grid h-9 w-9 shrink-0 place-items-center rounded-[4px] text-lg"
        style={{
          background: `color-mix(in srgb, ${subject.color} 28%, #efe4cb)`,
          boxShadow: "inset 0 0 0 1px #00000025",
        }}
        aria-hidden
      >
        {glyph}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[#f1e7cf]">{subject.name}</p>
        {o.current != null ? (
          <p className="text-xs text-[#cdbfa3]">
            média{" "}
            <span className="font-display text-base" style={{ color: gradeColor }}>
              {o.current.toFixed(1)}
            </span>
            <span className="ml-1 text-[10px] text-[#a08e6f]">· {Math.round(o.weightDone * 100)}%</span>
          </p>
        ) : (
          <p className="text-xs text-[#a08e6f]">sem notas ainda</p>
        )}
      </div>
      {/* puxador de latão */}
      <span
        className="h-2.5 w-6 shrink-0 rounded-full transition-transform group-hover:translate-y-0.5"
        style={{
          background: "linear-gradient(180deg,#e8c98a,#9c7c44)",
          boxShadow: "inset 0 1px 0 #fff3d0, 0 2px 3px #00000070",
        }}
        aria-hidden
      />
    </Link>
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

      {/* o armário das disciplinas: prateleiras de livros em cima,
          placa do CR e gavetas (resumo) embaixo — um móvel só */}
      <div
        className="nk-reveal nk-reveal-1 rounded-(--radius-lg) p-2"
        style={{
          backgroundImage:
            "linear-gradient(90deg,#2a1f15,#3a2c1f 3%,#241a11 9%,#241a11 91%,#3a2c1f 97%,#2a1f15)",
          boxShadow: "0 18px 44px #00000060, inset 0 0 0 1px #00000060, inset 0 0 60px #00000050",
        }}
      >
        {/* cornija superior do armário */}
        <div
          className="mb-1.5 h-3 rounded-[3px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg,#00000018 0 2px,transparent 2px 8px), linear-gradient(180deg,#6a5238,#3e2f20)",
            boxShadow: "inset 0 2px 0 #9a7b58, 0 3px 8px #00000060",
          }}
          aria-hidden
        />

        {/* corpo do armário (fundo escuro com leve veio) */}
        <div
          className="rounded-(--radius-md) p-1"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg,#00000026 0 1px,transparent 1px 26px), linear-gradient(90deg, #3a2c1f, #2a1f14 4%, #1c140d 12%, #1c140d 88%, #2a1f14 96%, #3a2c1f)",
          }}
        >
          {/* prateleiras com os livros */}
          <div className="relative space-y-5 px-1 py-2">
            <span
              className="pointer-events-none absolute inset-x-0 -top-1 z-10 h-24"
              style={{ background: "radial-gradient(70% 100% at 50% 0%, #ffcf941c, transparent 70%)" }}
              aria-hidden
            />
            {rows.map((row, ri) => (
              <Shelf key={ri}>
                {row.map((s) => (
                  <BookSpine key={s.id} subject={s} />
                ))}
                {/* o "+" mora na última prateleira */}
                {ri === rows.length - 1 && addSlot}
              </Shelf>
            ))}
          </div>

          {/* divisória + placa de latão (CR) + gavetas (resumo das disciplinas) */}
          {!empty && (
            <div className="mt-2 border-t-2 border-[#1c140d] pt-3">
              {(() => {
                const { cr, counted } = semesterGPA(subjects);
                if (cr == null) return null;
                return (
                  <div
                    className="mx-1 mb-3 flex items-center gap-4 rounded-[4px] px-4 py-2.5"
                    style={{
                      backgroundImage: "linear-gradient(180deg,#d8b463,#9c7c44)",
                      boxShadow: "inset 0 1px 0 #fff3d0aa, inset 0 -2px 5px #00000055, 0 3px 8px #00000055",
                    }}
                  >
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#3a2c14]">
                        coeficiente do semestre
                      </span>
                      <span className="text-[10px] text-[#5a4622]">
                        média de {counted} disciplina{counted > 1 ? "s" : ""} com nota
                        {subjects.some((s) => s.credits) ? " · ponderada por créditos" : ""}
                      </span>
                    </div>
                    <span className="ml-auto font-display text-3xl text-[#241a0c]">{cr.toFixed(1)}</span>
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 gap-2.5 px-1 pb-2 sm:grid-cols-2 lg:grid-cols-3">
                {subjects.map((s) => (
                  <Drawer key={s.id} subject={s} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* base do armário */}
        <div
          className="mt-1.5 h-3 rounded-[3px]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg,#00000018 0 2px,transparent 2px 8px), linear-gradient(180deg,#4a3826,#241a11)",
            boxShadow: "inset 0 1px 0 #6a513a, 0 6px 14px #00000070",
          }}
          aria-hidden
        />
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

    </div>
  );
}
