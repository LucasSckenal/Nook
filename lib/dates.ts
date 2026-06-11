export const WEEKDAYS_SHORT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
export const WEEKDAYS_LONG = [
  "domingo",
  "segunda",
  "terça",
  "quarta",
  "quinta",
  "sexta",
  "sábado",
];
export const MONTHS_SHORT = [
  "jan",
  "fev",
  "mar",
  "abr",
  "mai",
  "jun",
  "jul",
  "ago",
  "set",
  "out",
  "nov",
  "dez",
];

export function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromIso(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayIso(): string {
  return iso(new Date());
}

export function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

export function addDaysIso(n: number): string {
  return iso(addDays(new Date(), n));
}

/** segunda-feira da semana da data */
export function startOfWeek(d: Date): Date {
  const r = new Date(d);
  const diff = (r.getDay() + 6) % 7; // seg = 0
  r.setDate(r.getDate() - diff);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function daysBetween(aIso: string, bIso: string): number {
  const a = fromIso(aIso).getTime();
  const b = fromIso(bIso).getTime();
  return Math.round((b - a) / 86400000);
}

/** "em 9 dias" / "amanhã" / "hoje" / "há 2 dias" — contagem regressiva serena */
export function relativeDay(dateIso: string): string {
  const n = daysBetween(todayIso(), dateIso);
  if (n === 0) return "hoje";
  if (n === 1) return "amanhã";
  if (n === -1) return "ontem";
  if (n > 1) return `em ${n} dias`;
  return `há ${-n} dias`;
}

export function fmtShort(dateIso: string): string {
  const d = fromIso(dateIso);
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]}`;
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 5) return "Boa madrugada";
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function minutesToHuman(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h${String(m).padStart(2, "0")}`;
}
