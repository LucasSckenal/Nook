"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useNook } from "@/lib/store";
import { addDaysIso, relativeDay } from "@/lib/dates";
import { useFocusTrap } from "./useFocusTrap";

interface Item {
  id: string;
  label: string;
  hint?: string;
  group:
    | "Navegação"
    | "Tarefas"
    | "Disciplinas"
    | "Anotações"
    | "Avaliações"
    | "Materiais"
    | "Ajuda"
    | "Criar";
  search?: string; // texto extra p/ casar na busca (ex.: conteúdo da nota)
  answer?: string; // se presente, é um tópico de ajuda: expande a resposta inline
  run: () => void; // ação principal — nos tópicos de ajuda, leva ao lugar certo
}

/** Central de ajuda pesquisável (Nielsen #10): dúvidas conceituais de "como
 * faço X", buscáveis pela pergunta e pela resposta, com atalho para o lugar. */
const HELP: { q: string; a: string; path?: string }[] = [
  { q: "Como adiciono uma disciplina?", a: "Abra a estante e toque em “+ guardar na estante”. Cada disciplina vira uma lombada com notas, faltas e materiais.", path: "/?open=disciplinas" },
  { q: "Como marco uma falta?", a: "Abra a disciplina → seção “Meta & frequência” → use o + ao lado de “faltas”. O medidor avisa quando você se aproxima do limite de 25%.", path: "/?open=disciplinas" },
  { q: "Como defino a meta de nota de uma disciplina?", a: "Na disciplina, em “Meta & frequência”, ajuste “meta de nota p/ fechar”. A projeção passa a calcular quanto você ainda precisa.", path: "/?open=disciplinas" },
  { q: "Onde vejo o CR do semestre?", a: "Na estante, a plaqueta de latão mostra o coeficiente do semestre (CR), ponderado pelos créditos de cada disciplina.", path: "/?open=disciplinas" },
  { q: "Como entro no modo foco?", a: "Tecle F em qualquer lugar, ou toque na xícara de café no quarto. A luz baixa e só o relógio fica.", path: "/?open=foco" },
  { q: "Como crio uma tarefa rápido?", a: "Aqui mesmo: digite o que precisa fazer e escolha “Criar tarefa”. Escrever “hoje” ou “amanhã” já vira prazo.", path: "/?open=tarefas" },
  { q: "Como mudo o tema do quarto?", a: "Em Ajustes, escolha entre os temas (entardecer, madrugada, lampião…). Mudam só a luz — tudo continua no lugar.", path: "/?open=ajustes" },
  { q: "Como reduzo as animações?", a: "Em Ajustes, ligue “movimento calmo”. O quarto também respeita o “reduzir movimento” do seu sistema automaticamente.", path: "/?open=ajustes" },
  { q: "Como faço backup dos meus dados?", a: "Em Ajustes, use exportar/importar (JSON). Tudo fica salvo neste aparelho; o backup leva seus dados para outro.", path: "/?open=ajustes" },
  { q: "Como reorganizo os objetos do quarto?", a: "No quarto, use o atalho “organizar o quarto” (ou abra /?edit=1): arraste os objetos e use o scroll para redimensionar.", path: "/?edit=1" },
];

export function CommandPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [openHelp, setOpenHelp] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const trapRef = useRef<HTMLDivElement>(null);
  useFocusTrap(trapRef, open);
  const subjects = useNook((s) => s.subjects);
  const tasks = useNook((s) => s.tasks);
  const notes = useNook((s) => s.notes);
  const addTask = useNook((s) => s.addTask);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      setOpenHelp(null);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  /** tópicos de ajuda expandem a resposta inline; o resto executa direto */
  function activate(item: Item) {
    if (item.answer) setOpenHelp((id) => (id === item.id ? null : item.id));
    else item.run();
  }

  const { base, all } = useMemo(() => {
    const go = (path: string) => () => {
      router.push(path);
      onClose();
    };
    const subName = (id?: string) => subjects.find((s) => s.id === id)?.name;

    const nav: Item[] = [
      { id: "n-home", label: "Voltar ao quarto", hint: "Esc", group: "Navegação", run: go("/") },
      { id: "n-dash", label: "Abrir dashboard", hint: "G D", group: "Navegação", run: go("/?open=dashboard") },
      { id: "n-tar", label: "Abrir tarefas", hint: "G T", group: "Navegação", run: go("/?open=tarefas") },
      { id: "n-cal", label: "Abrir calendário", hint: "G C", group: "Navegação", run: go("/?open=calendario") },
      { id: "n-dis", label: "Abrir estante de disciplinas", hint: "G E", group: "Navegação", run: go("/?open=disciplinas") },
      { id: "n-rad", label: "Abrir rádio", hint: "G R", group: "Navegação", run: go("/?open=radio") },
      { id: "n-est", label: "Abrir estatísticas", hint: "G S", group: "Navegação", run: go("/?open=estatisticas") },
      { id: "n-foco", label: "Iniciar sessão de foco", hint: "F", group: "Navegação", run: go("/?open=foco") },
      { id: "n-ajustes", label: "Abrir ajustes", hint: "tema · perfil", group: "Navegação", run: go("/?open=ajustes") },
      { id: "n-proc", label: "Ver processo de design", hint: "Etapa 1", group: "Navegação", run: go("/processo") },
      { id: "n-demo", label: "Preparar modo demonstração", hint: "reseta p/ apresentar", group: "Navegação", run: go("/demo") },
    ];
    const subItems: Item[] = subjects.map((s) => ({
      id: `s-${s.id}`,
      label: s.name,
      hint: s.code || "disciplina",
      group: "Disciplinas",
      run: go(`/?open=disciplinas&id=${s.id}`),
    }));
    // resumo quando não há busca: poucas tarefas abertas
    const recentTasks: Item[] = tasks
      .filter((t) => !t.done)
      .slice(0, 8)
      .map((t) => ({
        id: `t-${t.id}`,
        label: t.title,
        hint: t.due ? relativeDay(t.due) : undefined,
        group: "Tarefas",
        run: go(`/?open=tarefas&task=${t.id}`),
      }));

    // universo buscável: todas as tarefas, notas, avaliações e materiais
    const allTasks: Item[] = tasks.map((t) => ({
      id: `t-${t.id}`,
      label: t.title,
      hint: t.done ? "concluída" : t.due ? relativeDay(t.due) : "sem prazo",
      group: "Tarefas",
      search: t.notes,
      run: go(`/?open=tarefas&task=${t.id}`),
    }));
    const noteItems: Item[] = notes.map((n) => ({
      id: `nt-${n.id}`,
      label: n.title.trim() || "Sem título",
      hint: subName(n.subjectId) ?? "anotação",
      group: "Anotações",
      search: n.content,
      run: go(`/?open=tarefas&pane=anotacoes&note=${n.id}`),
    }));
    const assessItems: Item[] = subjects.flatMap((s) =>
      s.assessments.map((a) => ({
        id: `a-${a.id}`,
        label: a.title,
        hint: `${s.name} · ${a.kind}`,
        group: "Avaliações" as const,
        run: go(`/?open=disciplinas&id=${s.id}`),
      }))
    );
    const materialItems: Item[] = subjects.flatMap((s) =>
      s.materials.map((m) => ({
        id: `m-${m.id}`,
        label: m.title,
        hint: s.name,
        group: "Materiais" as const,
        run: go(`/?open=disciplinas&id=${s.id}`),
      }))
    );

    const helpItems: Item[] = HELP.map((h, i) => ({
      id: `help-${i}`,
      label: h.q,
      hint: "ajuda",
      group: "Ajuda",
      search: `${h.a} ajuda dúvida como faço`,
      answer: h.a,
      run: h.path ? go(h.path) : onClose,
    }));

    return {
      base: [...nav, ...subItems, ...recentTasks],
      all: [...nav, ...subItems, ...allTasks, ...noteItems, ...assessItems, ...materialItems, ...helpItems],
    };
  }, [subjects, tasks, notes, router, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return base;
    const hits = all
      .filter((i) => i.label.toLowerCase().includes(q) || (i.search?.toLowerCase().includes(q) ?? false))
      .slice(0, 40);
    // captura rápida: texto livre vira tarefa ("amanhã"/"hoje" viram prazo)
    if (q.length > 2) {
      let due: string | undefined;
      let title = query.trim();
      if (/\bamanhã\b/i.test(title)) {
        due = addDaysIso(1);
        title = title.replace(/\bamanhã\b/gi, "").trim();
      } else if (/\bhoje\b/i.test(title)) {
        due = addDaysIso(0);
        title = title.replace(/\bhoje\b/gi, "").trim();
      }
      hits.push({
        id: "create-task",
        label: `Criar tarefa: “${title}”`,
        hint: due ? relativeDay(due) : "sem prazo",
        group: "Criar",
        run: () => {
          addTask({ title, due });
          onClose();
        },
      });
    }
    return hits;
  }, [query, base, all, addTask, onClose]);

  useEffect(() => setActive(0), [query]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh]"
      style={{ background: "var(--nk-overlay)", backdropFilter: "blur(24px)" }}
      onClick={onClose}
    >
      <div
        ref={trapRef}
        role="dialog"
        aria-modal="true"
        aria-label="Buscar e navegar"
        className="nk-raised w-[min(560px,92vw)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, filtered.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, 0));
            } else if (e.key === "Enter") {
              const it = filtered[active];
              if (it) activate(it);
            } else if (e.key === "Escape") {
              onClose();
            }
          }}
          placeholder="Buscar, navegar, criar tarefa ou pedir ajuda…"
          className="w-full bg-transparent px-5 py-4 text-ink-high placeholder:text-ink-low focus:outline-none"
          style={{ boxShadow: "none" }}
        />
        <div className="max-h-[320px] overflow-y-auto border-t border-ink-faint/40 p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-6 text-center text-sm text-ink-low">
              Nada por aqui. Tente outro termo.
            </p>
          )}
          {filtered.map((item, i) => {
            const expanded = item.answer != null && openHelp === item.id;
            return (
              <div key={item.id}>
                <button
                  onClick={() => activate(item)}
                  onMouseEnter={() => setActive(i)}
                  aria-expanded={item.answer != null ? expanded : undefined}
                  className={`flex w-full items-center justify-between rounded-(--radius-sm) px-3 py-2.5 text-left text-sm transition-colors ${
                    i === active ? "bg-raised text-ink-high" : "text-ink-mid"
                  }`}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {item.answer != null && (
                      <span className="shrink-0 text-ink-low" aria-hidden>
                        {expanded ? "▾" : "?"}
                      </span>
                    )}
                    <span className="truncate">{item.label}</span>
                  </span>
                  <span className="ml-4 shrink-0 text-xs text-ink-low">
                    {item.hint ?? item.group}
                  </span>
                </button>
                {expanded && (
                  <div className="mb-1 ml-3 mr-2 rounded-(--radius-sm) border-l-2 border-amber/50 bg-surface/60 px-3 py-2.5">
                    <p className="text-sm leading-relaxed text-ink-mid">{item.answer}</p>
                    <button
                      onClick={item.run}
                      className="mt-2 text-xs font-medium text-amber transition-opacity hover:opacity-80"
                    >
                      ir até lá →
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 border-t border-ink-faint/40 px-5 py-2.5 text-xs text-ink-low">
          <span>↑↓ navegar</span>
          <span>↵ abrir</span>
          <span>esc fechar</span>
        </div>
      </div>
    </div>
  );
}
