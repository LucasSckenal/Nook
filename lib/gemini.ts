import type { FocusSession, Subject, Task } from "./types";
import { gradeOutlook } from "./store";
import { relativeDay, todayIso } from "./dates";

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

function buildContext(data: { subjects: Subject[]; tasks: Task[]; sessions: FocusSession[] }): string {
  const today = todayIso();
  const subs = data.subjects
    .map((s) => {
      const o = gradeOutlook(s);
      const provas = s.assessments
        .filter((a) => a.grade == null)
        .map((a) => `${a.title} (${a.kind}, ${a.date}, peso ${Math.round(a.weight * 100)}%)`)
        .join("; ");
      const media = o.current != null ? `média parcial ${o.current.toFixed(1)}` : "sem notas ainda";
      return `- ${s.name}${s.code ? ` [${s.code}]` : ""}: ${media}. Avaliações em aberto: ${provas || "nenhuma"}.`;
    })
    .join("\n");

  const openTasks = data.tasks
    .filter((t) => !t.done)
    .slice(0, 20)
    .map((t) => `- ${t.title}${t.due ? ` (prazo ${t.due}, ${relativeDay(t.due)})` : ""}`)
    .join("\n");

  const weekMin = data.sessions
    .filter((s) => s.date >= today.slice(0, 8) + "01")
    .reduce((a, s) => a + s.minutes, 0);

  return `HOJE: ${today}.
DISCIPLINAS:
${subs || "(nenhuma cadastrada)"}

TAREFAS EM ABERTO:
${openTasks || "(nenhuma)"}

FOCO RECENTE: ~${weekMin} min registrados no mês.`;
}

export interface GeminiTurn {
  role: "user" | "estuda";
  text: string;
}

export async function estudaGemini(
  key: string,
  history: GeminiTurn[],
  question: string,
  data: { subjects: Subject[]; tasks: Task[]; sessions: FocusSession[] }
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
