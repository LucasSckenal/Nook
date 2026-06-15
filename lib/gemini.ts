import type { FocusSession, Note, Subject, Task } from "./types";
import { gradeOutlook } from "./store";
import { addDays, iso, relativeDay, todayIso } from "./dates";

/**
 * Estuda com IA real (Google Gemini). A chave é do próprio usuário, guardada
 * só no localStorage do navegador; a chamada vai direto do cliente para a API
 * do Gemini (sem servidor). Em produção, isso passaria por um backend.
 */

const MODEL = "gemini-2.0-flash";
const ENDPOINT = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`;

const SYSTEM = `Você é a "Estuda", a assistente de estudos do app Nook — um quarto virtual de estudos acolhedor, à meia-luz, com lo-fi tocando.
Sua personalidade: calorosa, calma, encorajadora, nunca alarmista nem culpabilizadora. Fala português do Brasil, em tom de colega gentil. Respostas curtas e úteis (no máximo ~6 linhas), com **negrito** em pontos-chave. Use no máximo 1 emoji, com parcimônia. Nunca invente notas, prazos ou disciplinas que não estejam no contexto. Quando sugerir um plano, seja concreto e realista com o tempo do estudante. Dias pesados também valem — reforce presença, não perfeição.`;

function buildContext(data: {
  subjects: Subject[];
  tasks: Task[];
  sessions: FocusSession[];
  notes: Note[];
}): string {
  const today = todayIso();
  const subName = (id?: string) => data.subjects.find((s) => s.id === id)?.name;

  const subs = data.subjects
    .map((s) => {
      const o = gradeOutlook(s);
      const provas = s.assessments
        .filter((a) => a.grade == null)
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((a) => `${a.title} (${a.kind}, ${a.date} — ${relativeDay(a.date)}, peso ${Math.round(a.weight * 100)}%)`)
        .join("; ");
      const media = o.current != null ? `média parcial ${o.current.toFixed(1)}` : "sem notas ainda";
      return `- ${s.name}${s.code ? ` [${s.code}]` : ""}: ${media}. Avaliações em aberto: ${provas || "nenhuma"}.`;
    })
    .join("\n");

  // próximas avaliações de todas as disciplinas, por proximidade
  const upcoming = data.subjects
    .flatMap((s) => s.assessments.filter((a) => a.grade == null && a.date >= today).map((a) => ({ s, a })))
    .sort((x, y) => x.a.date.localeCompare(y.a.date))
    .slice(0, 3)
    .map(({ s, a }) => `${a.title} de ${s.name} (${relativeDay(a.date)})`)
    .join("; ");

  const openTasks = data.tasks
    .filter((t) => !t.done)
    .sort((a, b) => (a.due || "9999").localeCompare(b.due || "9999"))
    .slice(0, 20)
    .map(
      (t) =>
        `- ${t.title}${t.due ? ` (prazo ${t.due}, ${relativeDay(t.due)})` : ""}${
          subName(t.subjectId) ? ` [${subName(t.subjectId)}]` : ""
        }`
    )
    .join("\n");

  // foco do mês + equilíbrio por disciplina (14 dias) + humor recente
  const monthStart = today.slice(0, 8) + "01";
  const since14 = iso(addDays(new Date(), -14));
  const minBy = new Map<string, number>();
  let weekMin = 0;
  for (const s of data.sessions) {
    if (s.date >= monthStart) weekMin += s.minutes;
    if (s.date >= since14 && s.subjectId) minBy.set(s.subjectId, (minBy.get(s.subjectId) || 0) + s.minutes);
  }
  const balance = data.subjects.map((s) => `${s.name}: ${minBy.get(s.id) || 0}min`).join("; ");
  const recentMoods = data.sessions.filter((s) => s.mood).slice(-8);
  const mood = {
    leve: recentMoods.filter((m) => m.mood === "leve").length,
    ok: recentMoods.filter((m) => m.mood === "ok").length,
    pesado: recentMoods.filter((m) => m.mood === "pesado").length,
  };

  const notes = data.notes
    .slice(0, 12)
    .map((n) => `- ${n.title || "(sem título)"}${subName(n.subjectId) ? ` [${subName(n.subjectId)}]` : ""}`)
    .join("\n");

  return `HOJE: ${today}.
DISCIPLINAS:
${subs || "(nenhuma cadastrada)"}

PRÓXIMAS AVALIAÇÕES: ${upcoming || "(nenhuma à vista)"}.

TAREFAS EM ABERTO:
${openTasks || "(nenhuma)"}

FOCO: ~${weekMin} min no mês. Equilíbrio (14 dias) — ${balance || "sem sessões"}.
HUMOR recente das sessões: leve ${mood.leve}, ok ${mood.ok}, pesado ${mood.pesado}.

ANOTAÇÕES NO CADERNO (títulos):
${notes || "(nenhuma)"}`;
}

export interface GeminiTurn {
  role: "user" | "estuda";
  text: string;
}

export async function estudaGemini(
  key: string,
  history: GeminiTurn[],
  question: string,
  data: { subjects: Subject[]; tasks: Task[]; sessions: FocusSession[]; notes: Note[] }
): Promise<string> {
  const contents = [
    // contexto + instrução como primeira fala do usuário, respondida pela modelo
    { role: "user", parts: [{ text: `${SYSTEM}\n\nCONTEXTO DO SEMESTRE:\n${buildContext(data)}` }] },
    { role: "model", parts: [{ text: "Entendi o contexto. Pode perguntar. 🪻" }] },
    ...history.map((h) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }],
    })),
    { role: "user", parts: [{ text: question }] },
  ];

  const res = await fetch(ENDPOINT(key), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 400 },
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    if (res.status === 400 || res.status === 403) {
      throw new Error("chave inválida ou sem permissão para o Gemini");
    }
    if (res.status === 429) throw new Error("limite da API atingido — tente em instantes");
    throw new Error(`erro ${res.status} da API${detail ? `: ${detail.slice(0, 120)}` : ""}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join("") ?? "";
  if (!text.trim()) throw new Error("a Estuda ficou sem palavras — tente reformular");
  return text.trim();
}
