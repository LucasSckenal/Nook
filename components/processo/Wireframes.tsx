"use client";

/**
 * Wireframes lo-fi das telas principais (Etapa 3 — arquitetura & fluxos).
 * Estilo blueprint: papel claro + traço cinza, sem cor/identidade visual —
 * o objetivo é layout, hierarquia e fluxo, não acabamento.
 */

const S = "#6f685c"; // traço
const F = "#d8d0bf"; // preenchimento de placeholder
const A = "#c2914e"; // acento (elemento primário/interativo)
const T = "#8a8270"; // texto de anotação

function Frame({
  title,
  note,
  children,
}: {
  title: string;
  note: string;
  children: React.ReactNode;
}) {
  return (
    <div className="nk-card overflow-hidden p-0">
      <div
        className="p-3"
        style={{ background: "#efe9dd" }}
      >
        <svg viewBox="0 0 400 250" className="w-full" role="img" aria-label={`Wireframe: ${title}`}>
          {children}
        </svg>
      </div>
      <div className="p-4">
        <h4 className="text-sm font-medium text-ink-high">{title}</h4>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-low">{note}</p>
      </div>
    </div>
  );
}

const box = (x: number, y: number, w: number, h: number, extra: Record<string, unknown> = {}) => (
  <rect x={x} y={y} width={w} height={h} rx={4} fill="none" stroke={S} strokeWidth={1.4} {...extra} />
);
const fill = (x: number, y: number, w: number, h: number, c = F) => (
  <rect x={x} y={y} width={w} height={h} rx={2} fill={c} />
);
const label = (x: number, y: number, s: string, anchor: "start" | "middle" = "start") => (
  <text x={x} y={y} fontSize={8} fill={T} textAnchor={anchor} fontFamily="sans-serif">
    {s}
  </text>
);

/* ── 1. Quarto (hub) ─────────────────────────────────────────────────── */
function WfQuarto() {
  const objs = [
    [44, 150, "Rádio"],
    [104, 96, "Estante"],
    [168, 110, "Monitor"],
    [150, 158, "Caderno"],
    [250, 150, "Diário"],
    [300, 96, "Calendário"],
    [96, 150, "Café"],
  ] as const;
  return (
    <Frame
      title="Quarto (hub)"
      note="Raiz do sistema: cena 2.5D onde cada objeto é o hotspot de um módulo. Cabeçalho com marca/saudação e ações; dock inferior espelha os atalhos."
    >
      {fill(14, 12, 60, 9)}
      {fill(14, 26, 110, 5)}
      {[300, 322, 344, 366].map((x) => (
        <g key={x}>{box(x, 11, 16, 13)}</g>
      ))}
      {box(14, 44, 372, 150, { strokeDasharray: "4 4" })}
      {label(200, 58, "cena 2.5D — objetos clicáveis (hotspots)", "middle")}
      {objs.map(([x, y, n]) => (
        <g key={n as string}>
          {box(x as number, y as number, 46, 30)}
          {label((x as number) + 23, (y as number) + 18, n as string, "middle")}
        </g>
      ))}
      {box(120, 210, 160, 26, { stroke: A })}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <g key={i}>{box(128 + i * 21, 216, 14, 14)}</g>
      ))}
      {label(283, 226, "dock")}
    </Frame>
  );
}

/* ── 2. Dashboard (Computador) ───────────────────────────────────────── */
function WfDashboard() {
  return (
    <Frame
      title="Dashboard (Computador)"
      note="Janela estilo SO: barra de título, busca e abas. Grade de widgets (prazos, progresso) à esquerda; assistente Estuda à direita."
    >
      {box(14, 12, 372, 226)}
      {/* titlebar */}
      <line x1={14} y1={34} x2={386} y2={34} stroke={S} strokeWidth={1.2} />
      <circle cx={26} cy={23} r={3} fill={F} />
      <circle cx={36} cy={23} r={3} fill={F} />
      <circle cx={46} cy={23} r={3} fill={F} />
      {box(150, 16, 150, 14)}
      {label(158, 26, "buscar…")}
      {/* widgets */}
      {box(26, 48, 220, 84)}
      {label(34, 62, "prazos próximos")}
      {fill(34, 70, 150, 5)}
      {fill(34, 82, 180, 5)}
      {fill(34, 94, 120, 5)}
      {box(26, 142, 220, 84)}
      {label(34, 156, "progresso da semana")}
      {fill(34, 168, 200, 40, "#e6dcc6")}
      {/* estuda */}
      {box(258, 48, 116, 178, { stroke: A })}
      {label(266, 62, "Estuda (IA)")}
      {fill(266, 72, 90, 18, "#e6dcc6")}
      {fill(266, 96, 70, 14, "#e6dcc6")}
      {fill(290, 200, 76, 16, "#e6dcc6")}
    </Frame>
  );
}

/* ── 3. Tarefas (Caderno) ────────────────────────────────────────────── */
function WfTarefas() {
  return (
    <Frame
      title="Tarefas (Caderno)"
      note="Abas tarefas/anotações; captura rápida no topo; filtros (hoje/semana/tudo/feitas) e lista de itens com checkbox e detalhe."
    >
      {/* tabs */}
      {box(14, 14, 180, 20)}
      <line x1={104} y1={14} x2={104} y2={34} stroke={S} strokeWidth={1.2} />
      {label(40, 27, "Tarefas")}
      {label(128, 27, "Anotações")}
      {/* quick add */}
      {box(14, 44, 300, 22, { stroke: A })}
      {label(22, 58, "+ o que precisa ser feito?")}
      {box(320, 44, 66, 22)}
      {label(353, 58, "adicionar", "middle")}
      {/* filters */}
      {box(14, 74, 240, 18)}
      {["hoje", "semana", "tudo", "feitas"].map((f, i) => (
        <g key={f}>{label(28 + i * 60, 86, f)}</g>
      ))}
      {/* list */}
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          {box(14, 100 + i * 30, 372, 24)}
          {box(22, 106 + i * 30, 12, 12)}
          {fill(44, 110 + i * 30, 160 - i * 20, 5)}
          {fill(330, 110 + i * 30, 48, 5)}
        </g>
      ))}
    </Frame>
  );
}

/* ── 4. Calendário ───────────────────────────────────────────────────── */
function WfCalendario() {
  return (
    <Frame
      title="Calendário"
      note="Alternância mês ↔ grade de aulas; cabeçalho com navegação e mês. Grade 7×6: aulas (pontos), provas/entregas (etiquetas) e dias passados riscados."
    >
      {box(14, 12, 110, 18, { stroke: A })}
      {label(28, 24, "mês")}
      {label(70, 24, "grade")}
      {fill(170, 16, 90, 9)}
      {/* weekday header */}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <g key={i}>{label(34 + i * 53, 44, ["S", "T", "Q", "Q", "S", "S", "D"][i], "middle")}</g>
      ))}
      {/* grid */}
      {Array.from({ length: 30 }).map((_, i) => {
        const c = i % 7;
        const r = Math.floor(i / 7);
        const x = 16 + c * 53;
        const y = 50 + r * 38;
        const past = i < 11;
        return (
          <g key={i}>
            {box(x, y, 50, 36)}
            {label(x + 5, y + 12, String(i + 1))}
            {past && (
              <line x1={x + 8} y1={y + 8} x2={x + 42} y2={y + 30} stroke={A} strokeWidth={1} />
            )}
          </g>
        );
      })}
    </Frame>
  );
}

/* ── 5. Disciplinas (Estante / armário) ──────────────────────────────── */
function WfDisciplinas() {
  return (
    <Frame
      title="Disciplinas (Estante / armário)"
      note="Um móvel único: prateleira de livros (lombadas com nota), placa do coeficiente do semestre e gavetas com o resumo de cada disciplina."
    >
      {box(14, 12, 372, 226)}
      {/* prateleira / livros */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          {box(26 + i * 58, 28, 44, 86)}
          {fill(34 + i * 58, 92, 28, 5)}
        </g>
      ))}
      <line x1={20} y1={120} x2={380} y2={120} stroke={S} strokeWidth={2} />
      {/* placa CR */}
      {box(26, 128, 348, 22, { stroke: A })}
      {label(34, 142, "coeficiente do semestre (CR)")}
      {label(360, 142, "7.6", "middle")}
      {/* gavetas */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const c = i % 3;
        const r = Math.floor(i / 3);
        return (
          <g key={i}>
            {box(26 + c * 118, 158 + r * 34, 110, 28)}
            <circle cx={120 + c * 118} cy={172 + r * 34} r={3} fill={F} />
            {fill(36 + c * 118, 168 + r * 34, 60, 4)}
            {fill(36 + c * 118, 176 + r * 34, 36, 4)}
          </g>
        );
      })}
    </Frame>
  );
}

/* ── 6. Modo Foco ────────────────────────────────────────────────────── */
function WfFoco() {
  return (
    <Frame
      title="Modo Foco"
      note="A luz do quarto apaga; só o relógio fica. Meta e disciplina no topo, cronômetro central, controles de pausar/encerrar. Ao fim: humor + revisão."
    >
      {fill(16, 14, 80, 6)}
      {label(20, 36, "← acender a luz")}
      {fill(150, 70, 100, 5)}
      {/* relógio */}
      {box(120, 92, 160, 70, { stroke: A })}
      {label(200, 134, "25:00", "middle")}
      {/* controles */}
      {box(120, 176, 70, 22)}
      {label(155, 190, "pausar", "middle")}
      {box(210, 176, 70, 22)}
      {label(245, 190, "encerrar", "middle")}
      {label(200, 222, "ao terminar: humor + revisão (+2/+7 dias)", "middle")}
    </Frame>
  );
}

export function Wireframes() {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <WfQuarto />
      <WfDashboard />
      <WfTarefas />
      <WfCalendario />
      <WfDisciplinas />
      <WfFoco />
    </div>
  );
}
