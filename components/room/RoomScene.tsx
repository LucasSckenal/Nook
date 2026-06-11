"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useNook } from "@/lib/store";
import { daysBetween, relativeDay, todayIso } from "@/lib/dates";

/**
 * O Quarto — hub espacial do Nook.
 * Cena 2.5D em SVG com 3 planos de parallax, hotspots navegáveis,
 * zoom de câmera (600ms, ease-room), ciclo dia/noite pela hora real,
 * chuva opcional na janela e estados ambientais (post-it, vapor, LED).
 */

interface Hotspot {
  id: string;
  label: string;
  href?: string;
  cx: number; // centro para o zoom da câmera
  cy: number;
}

const HOTSPOTS: Record<string, Hotspot> = {
  computador: { id: "computador", label: "Computador · Dashboard e Estuda", href: "/dashboard", cx: 810, cy: 510 },
  caderno: { id: "caderno", label: "Caderno · Tarefas", href: "/tarefas", cx: 555, cy: 625 },
  calendario: { id: "calendario", label: "Calendário · Agenda", href: "/calendario", cx: 605, cy: 255 },
  estante: { id: "estante", label: "Estante · Disciplinas", href: "/disciplinas", cx: 1365, cy: 350 },
  radio: { id: "radio", label: "Rádio · Sons do quarto", href: "/radio", cx: 1095, cy: 590 },
  caneca: { id: "caneca", label: "Caneca · Estatísticas", href: "/estatisticas", cx: 985, cy: 600 },
  luminaria: { id: "luminaria", label: "Luminária · Modo foco", href: "/foco", cx: 280, cy: 560 },
};

type Phase = "noite" | "manhã" | "tarde" | "entardecer";

function phaseOf(h: number): Phase {
  if (h >= 5 && h < 11) return "manhã";
  if (h >= 11 && h < 17) return "tarde";
  if (h >= 17 && h < 19) return "entardecer";
  return "noite";
}

const SKY: Record<Phase, { top: string; bottom: string; stars: boolean }> = {
  noite: { top: "#0a0f1e", bottom: "#1b2438", stars: true },
  manhã: { top: "#6f8fa8", bottom: "#c9b79c", stars: false },
  tarde: { top: "#7fa3bf", bottom: "#a8c0d0", stars: false },
  entardecer: { top: "#3d3a5c", bottom: "#c97b63", stars: false },
};

export function RoomScene() {
  const router = useRouter();
  const subjects = useNook((s) => s.subjects);
  const sessions = useNook((s) => s.sessions);
  const tasks = useNook((s) => s.tasks);
  const rainVisual = useNook((s) => s.rainVisual);
  const setRainVisual = useNook((s) => s.setRainVisual);
  const radioPlaying = useNook((s) => s.radio.playing);

  const [zoom, setZoom] = useState<Hotspot | null>(null);
  const bgRef = useRef<SVGGElement>(null);
  const midRef = useRef<SVGGElement>(null);
  const frontRef = useRef<SVGGElement>(null);

  const phase = phaseOf(new Date().getHours());
  const sky = SKY[phase];

  const today = todayIso();
  const steamToday = sessions.some((s) => s.date === today);
  const urgent = useMemo(() => {
    const all = subjects
      .flatMap((s) => s.assessments.map((a) => ({ s, a })))
      .filter(
        ({ a }) =>
          a.grade == null &&
          daysBetween(today, a.date) >= 0 &&
          daysBetween(today, a.date) <= 2
      )
      .sort((x, y) => x.a.date.localeCompare(y.a.date));
    return all[0] ?? null;
  }, [subjects, today]);
  const screenOn = tasks.some((t) => !t.done && t.due && t.due <= today);
  const pendingBySubject = useMemo(
    () =>
      new Set(
        tasks.filter((t) => !t.done && t.subjectId).map((t) => t.subjectId!)
      ),
    [tasks]
  );

  function go(h: Hotspot) {
    if (!h.href) return;
    setZoom(h);
    window.setTimeout(() => router.push(h.href!), 560);
  }

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    if (bgRef.current) bgRef.current.style.transform = `translate(${nx * -4}px, ${ny * -2}px)`;
    if (midRef.current) midRef.current.style.transform = `translate(${nx * -9}px, ${ny * -4}px)`;
    if (frontRef.current) frontRef.current.style.transform = `translate(${nx * -15}px, ${ny * -7}px)`;
  }

  const camStyle: React.CSSProperties = zoom
    ? {
        transform: "scale(2.4)",
        transformOrigin: `${(zoom.cx / 1600) * 100}% ${(zoom.cy / 1000) * 100}%`,
        transition: "transform 600ms var(--nk-ease-room)",
      }
    : { transform: "scale(1)", transition: "transform 600ms var(--nk-ease-room)" };

  const spineColors = subjects.map((s) => s.color);

  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-void"
      onMouseMove={onMove}
    >
      <div className="h-full w-full" style={camStyle}>
        <svg
          viewBox="0 0 1600 1000"
          className="h-full w-full"
          preserveAspectRatio="xMidYMid slice"
          aria-label="Quarto de estudos do Nook"
        >
          <defs>
            <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={sky.top} />
              <stop offset="1" stopColor={sky.bottom} />
            </linearGradient>
            <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" style={{ stopColor: "var(--color-surface)" }} />
              <stop offset="1" style={{ stopColor: "var(--color-room)" }} />
            </linearGradient>
            <radialGradient id="lampGlow" cx="0.5" cy="0.35" r="0.65">
              <stop offset="0" stopColor="#e8a87c" stopOpacity="0.5" />
              <stop offset="1" stopColor="#e8a87c" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="windowGlow" cx="0.5" cy="0.4" r="0.7">
              <stop offset="0" stopColor={phase === "noite" ? "#8fa8bf" : "#e8e4da"} stopOpacity="0.16" />
              <stop offset="1" stopColor="#8fa8bf" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="screenGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#1c2840" />
              <stop offset="1" stopColor="#16203a" />
            </linearGradient>
            <clipPath id="windowClip">
              <rect x="128" y="138" width="264" height="364" rx="10" />
            </clipPath>
          </defs>

          {/* ── plano de fundo: parede, janela, glow ───────────────── */}
          <g ref={bgRef} style={{ transition: "transform 400ms ease-out" }}>
            <rect x="-40" y="-40" width="1680" height="830" fill="url(#wallGrad)" />
            {/* rodapé / piso */}
            <rect x="-40" y="780" width="1680" height="260" fill="#0e1119" />
            <rect x="-40" y="776" width="1680" height="6" fill="#1b2030" />
            {/* tapete */}
            <ellipse cx="300" cy="888" rx="215" ry="62" fill="#181d2b" />
            <ellipse cx="300" cy="888" rx="170" ry="46" fill="none" stroke="#222840" strokeWidth="2" />

            {/* janela */}
            <g>
              <rect x="116" y="126" width="288" height="388" rx="14" fill="#1c2230" />
              <rect x="128" y="138" width="264" height="364" rx="10" fill="url(#skyGrad)" />
              <g clipPath="url(#windowClip)">
                {sky.stars && (
                  <g fill="#e8e4da">
                    <circle cx="170" cy="190" r="1.6" opacity="0.9" />
                    <circle cx="230" cy="160" r="1.2" opacity="0.6" />
                    <circle cx="305" cy="210" r="1.4" opacity="0.8" />
                    <circle cx="350" cy="170" r="1.1" opacity="0.5" />
                    <circle cx="195" cy="260" r="1.2" opacity="0.7" />
                    <circle cx="338" cy="282" r="1.5" opacity="0.6" />
                    <circle cx="262" cy="232" r="1" opacity="0.5" />
                    <circle cx="160" cy="330" r="1.2" opacity="0.55" />
                  </g>
                )}
                {sky.stars && <circle cx="318" cy="208" r="26" fill="#e8e4da" opacity="0.85" />}
                {sky.stars && <circle cx="308" cy="200" r="24" fill={sky.top} opacity="0.92" />}
                {/* silhueta da cidade */}
                <g fill={phase === "noite" ? "#10141f" : "#3d4150"} opacity="0.85">
                  <rect x="128" y="400" width="46" height="102" />
                  <rect x="182" y="372" width="34" height="130" />
                  <rect x="224" y="412" width="52" height="90" />
                  <rect x="286" y="386" width="30" height="116" />
                  <rect x="324" y="420" width="68" height="82" />
                </g>
                {phase === "noite" && (
                  <g fill="#e8a87c" opacity="0.5">
                    <rect x="190" y="386" width="5" height="6" />
                    <rect x="202" y="402" width="5" height="6" />
                    <rect x="236" y="424" width="5" height="6" />
                    <rect x="294" y="398" width="5" height="6" />
                    <rect x="340" y="432" width="5" height="6" />
                  </g>
                )}
                {/* chuva — 12fps de propósito */}
                {rainVisual && (
                  <g className="nk-rain-layer" stroke="#8fa8bf" strokeWidth="1.4" opacity="0.5">
                    {Array.from({ length: 18 }).map((_, i) => (
                      <line
                        key={i}
                        x1={134 + i * 15}
                        y1={-280 + ((i * 53) % 160)}
                        x2={130 + i * 15}
                        y2={-258 + ((i * 53) % 160)}
                      />
                    ))}
                  </g>
                )}
              </g>
              {/* caixilho */}
              <line x1="260" y1="138" x2="260" y2="502" stroke="#1c2230" strokeWidth="10" />
              <line x1="128" y1="320" x2="392" y2="320" stroke="#1c2230" strokeWidth="10" />
              {/* peitoril + plantinha */}
              <rect x="104" y="510" width="312" height="16" rx="6" fill="#242b3d" />
              <g>
                <rect x="150" y="478" width="26" height="32" rx="4" fill="#2a3146" />
                <path d="M163 478 C150 458 152 446 163 438 C174 446 176 458 163 478Z" fill="#5a705a" />
                <path d="M163 478 C176 462 186 458 194 462 C190 472 178 478 163 478Z" fill="#4c5f4c" />
              </g>
              {/* luz da janela no chão */}
              <ellipse cx="260" cy="760" rx="240" ry="70" fill="url(#windowGlow)" />
            </g>

            {/* clique na janela alterna a chuva */}
            <g
              className="nk-hotspot"
              role="button"
              tabIndex={0}
              aria-label={rainVisual ? "Parar a chuva" : "Deixar chover"}
              onClick={() => setRainVisual(!rainVisual)}
              onKeyDown={(e) => e.key === "Enter" && setRainVisual(!rainVisual)}
            >
              <rect x="116" y="126" width="288" height="388" rx="14" fill="transparent" />
              <rect className="nk-halo" x="110" y="120" width="300" height="400" rx="16" fill="none" stroke="#e8a87c" strokeOpacity="0.45" strokeWidth="2" />
              <g className="nk-label">
                <rect x="150" y="80" width="222" height="30" rx="15" fill="#1e2433" />
                <text x="261" y="100" textAnchor="middle" fill="#e8e4da" fontSize="14">
                  {rainVisual ? "Parar a chuva 🌙" : "Deixar chover 🌧"}
                </text>
              </g>
            </g>

            {/* pôster na parede */}
            <g opacity="0.9">
              <rect x="760" y="150" width="120" height="160" rx="6" fill="#1a1f2e" />
              <rect x="772" y="162" width="96" height="136" rx="3" fill="#222a3f" />
              <circle cx="820" cy="212" r="26" fill="#e8a87c" opacity="0.55" />
              <path d="M780 286 q22 -30 44 -12 q24 18 40 -8" stroke="#8fa8bf" strokeWidth="3" fill="none" opacity="0.7" />
            </g>
          </g>

          {/* ── plano médio: estante, calendário, luminária ─────────── */}
          <g ref={midRef} style={{ transition: "transform 400ms ease-out" }}>
            {/* calendário de parede */}
            <g
              className="nk-hotspot"
              role="button"
              tabIndex={0}
              aria-label="Abrir calendário"
              onClick={() => go(HOTSPOTS.calendario)}
              onKeyDown={(e) => e.key === "Enter" && go(HOTSPOTS.calendario)}
            >
              <rect x="540" y="178" width="132" height="158" rx="8" fill="#20263a" />
              <rect x="540" y="178" width="132" height="34" rx="8" fill="#2a3148" />
              <circle cx="606" cy="178" r="5" fill="#3d4150" />
              <text x="606" y="201" textAnchor="middle" fill="#a8a49a" fontSize="13" fontWeight="600">
                {new Date().toLocaleDateString("pt-BR", { month: "long" })}
              </text>
              {/* grade de dias */}
              <g fill="#3d4150">
                {Array.from({ length: 28 }).map((_, i) => (
                  <rect
                    key={i}
                    x={552 + (i % 7) * 16.5}
                    y={222 + Math.floor(i / 7) * 24}
                    width="10"
                    height="10"
                    rx="2"
                  />
                ))}
              </g>
              {/* hoje */}
              <rect
                x={552 + ((new Date().getDay() + 6) % 7) * 16.5 - 2}
                y={244}
                width="14"
                height="14"
                rx="3"
                fill="none"
                stroke="#e8a87c"
                strokeWidth="1.6"
              />
              {/* prova próxima: círculo terracota sereno */}
              {urgent && (
                <circle cx={552 + 5 + (((new Date().getDay() + 6) % 7) + daysBetween(today, urgent.a.date)) % 7 * 16.5} cy={273} r="9" fill="none" stroke="#c97b63" strokeWidth="1.8" />
              )}
              <rect className="nk-halo" x="534" y="172" width="144" height="170" rx="10" fill="none" stroke="#e8a87c" strokeOpacity="0.45" strokeWidth="2" />
              <g className="nk-label">
                <rect x="528" y="134" width="156" height="30" rx="15" fill="#1e2433" />
                <text x="606" y="154" textAnchor="middle" fill="#e8e4da" fontSize="14">
                  📅 Calendário
                </text>
              </g>
            </g>

            {/* estante */}
            <g
              className="nk-hotspot"
              role="button"
              tabIndex={0}
              aria-label="Abrir disciplinas"
              onClick={() => go(HOTSPOTS.estante)}
              onKeyDown={(e) => e.key === "Enter" && go(HOTSPOTS.estante)}
            >
              <rect x="1235" y="140" width="16" height="430" rx="4" fill="#262c3e" />
              <rect x="1490" y="140" width="16" height="430" rx="4" fill="#262c3e" />
              {[212, 342, 472].map((y) => (
                <rect key={y} x="1235" y={y} width="271" height="12" rx="3" fill="#262c3e" />
              ))}
              {/* livros — lombadas nas cores das disciplinas */}
              {spineColors.map((c, i) => (
                <rect
                  key={`a${i}`}
                  x={1262 + i * 30}
                  y={212 - 54 - (i % 3) * 6}
                  width="22"
                  height={54 + (i % 3) * 6}
                  rx="3"
                  fill={c}
                  opacity="0.85"
                />
              ))}
              {spineColors.map((c, i) => (
                <rect
                  key={`b${i}`}
                  x={1268 + i * 32}
                  y={342 - 50 - ((i + 1) % 3) * 7}
                  width="24"
                  height={50 + ((i + 1) % 3) * 7}
                  rx="3"
                  fill={c}
                  opacity="0.6"
                />
              ))}
              {/* livro deitado = disciplina com pendência */}
              {pendingBySubject.size > 0 && (
                <rect x="1280" y="452" width="64" height="16" rx="3" fill={subjects.find((s) => pendingBySubject.has(s.id))?.color ?? "#A0B8C9"} opacity="0.9" />
              )}
              <rect x="1356" y="412" width="22" height="60" rx="3" fill="#A0C9C2" opacity="0.7" />
              <rect x="1384" y="420" width="20" height="52" rx="3" fill="#C9ADA0" opacity="0.7" />
              {/* vaso no topo */}
              <g>
                <rect x="1430" y="166" width="30" height="40" rx="5" fill="#2a3146" />
                <path d="M1445 168 C1430 144 1434 130 1445 122 C1456 130 1460 144 1445 168Z" fill="#5a705a" />
              </g>
              <rect className="nk-halo" x="1228" y="118" width="286" height="460" rx="12" fill="none" stroke="#e8a87c" strokeOpacity="0.45" strokeWidth="2" />
              <g className="nk-label">
                <rect x="1288" y="78" width="166" height="30" rx="15" fill="#1e2433" />
                <text x="1371" y="98" textAnchor="middle" fill="#e8e4da" fontSize="14">
                  📚 Disciplinas
                </text>
              </g>
            </g>

            {/* luminária de chão — entrada do modo foco */}
            <g
              className="nk-hotspot"
              role="button"
              tabIndex={0}
              aria-label="Iniciar modo foco"
              onClick={() => go(HOTSPOTS.luminaria)}
              onKeyDown={(e) => e.key === "Enter" && go(HOTSPOTS.luminaria)}
            >
              <ellipse cx="282" cy="668" rx="120" ry="120" fill="url(#lampGlow)" />
              <rect x="276" y="600" width="8" height="250" rx="4" fill="#2a3146" />
              <ellipse cx="280" cy="852" rx="42" ry="10" fill="#232a3c" />
              <path d="M240 600 L320 600 L300 548 L260 548 Z" fill="#caa06a" />
              <ellipse cx="280" cy="600" rx="40" ry="9" fill="#e8a87c" opacity="0.9" />
              <rect className="nk-halo" x="226" y="534" width="110" height="330" rx="14" fill="none" stroke="#e8a87c" strokeOpacity="0.45" strokeWidth="2" />
              <g className="nk-label">
                <rect x="216" y="494" width="146" height="30" rx="15" fill="#1e2433" />
                <text x="289" y="514" textAnchor="middle" fill="#e8e4da" fontSize="14">
                  🎯 Modo foco
                </text>
              </g>
            </g>
          </g>

          {/* ── plano frontal: mesa e objetos ───────────────────────── */}
          <g ref={frontRef} style={{ transition: "transform 400ms ease-out" }}>
            {/* mesa */}
            <rect x="418" y="648" width="772" height="26" rx="8" fill="#332b33" />
            <rect x="430" y="674" width="748" height="10" fill="#241f26" />
            <rect x="452" y="684" width="20" height="190" rx="6" fill="#2a242c" />
            <rect x="1134" y="684" width="20" height="190" rx="6" fill="#2a242c" />
            <rect x="452" y="700" width="200" height="140" rx="8" fill="#2a242c" opacity="0.55" />

            {/* monitor — dashboard */}
            <g
              className="nk-hotspot"
              role="button"
              tabIndex={0}
              aria-label="Abrir dashboard"
              onClick={() => go(HOTSPOTS.computador)}
              onKeyDown={(e) => e.key === "Enter" && go(HOTSPOTS.computador)}
            >
              <rect x="664" y="430" width="296" height="186" rx="12" fill="#0c0f17" />
              <rect x="672" y="438" width="280" height="170" rx="8" fill="url(#screenGrad)" />
              {screenOn && (
                <g opacity="0.95">
                  <rect x="688" y="456" width="120" height="10" rx="5" fill="#e8a87c" opacity="0.85" />
                  <rect x="688" y="478" width="200" height="7" rx="3.5" fill="#8fa8bf" opacity="0.6" />
                  <rect x="688" y="492" width="170" height="7" rx="3.5" fill="#8fa8bf" opacity="0.4" />
                  <rect x="688" y="514" width="80" height="46" rx="6" fill="#1e2840" />
                  <rect x="776" y="514" width="80" height="46" rx="6" fill="#1e2840" />
                  <rect x="864" y="514" width="72" height="46" rx="6" fill="#1e2840" />
                  <rect x="696" y="536" width="30" height="16" rx="3" fill="#9caf88" opacity="0.8" />
                  <rect x="784" y="536" width="44" height="16" rx="3" fill="#e8a87c" opacity="0.7" />
                  <rect x="872" y="536" width="24" height="16" rx="3" fill="#a99bc4" opacity="0.8" />
                  <rect x="688" y="574" width="248" height="6" rx="3" fill="#3d4150" />
                  <rect x="688" y="574" width="150" height="6" rx="3" fill="#9caf88" opacity="0.7" />
                </g>
              )}
              {!screenOn && (
                <text x="812" y="530" textAnchor="middle" fill="#3d4150" fontSize="15" fontFamily="var(--font-fraunces)">
                  zzz…
                </text>
              )}
              <rect x="796" y="616" width="32" height="26" fill="#0c0f17" />
              <rect x="756" y="640" width="112" height="10" rx="5" fill="#0c0f17" />
              {/* post-it de urgência */}
              {urgent && (
                <g transform="rotate(4 940 470)">
                  <rect x="918" y="446" width="64" height="58" rx="2" fill="#c9c2a0" />
                  <text x="950" y="470" textAnchor="middle" fill="#33302a" fontSize="11" fontWeight="700">
                    {urgent.a.kind === "prova" ? "PROVA" : "ENTREGA"}
                  </text>
                  <text x="950" y="486" textAnchor="middle" fill="#33302a" fontSize="10">
                    {relativeDay(urgent.a.date)}
                  </text>
                </g>
              )}
              <rect className="nk-halo" x="656" y="422" width="312" height="232" rx="14" fill="none" stroke="#e8a87c" strokeOpacity="0.45" strokeWidth="2" />
              <g className="nk-label">
                <rect x="700" y="384" width="226" height="30" rx="15" fill="#1e2433" />
                <text x="813" y="404" textAnchor="middle" fill="#e8e4da" fontSize="14">
                  💻 Dashboard &amp; Estuda
                </text>
              </g>
            </g>

            {/* caderno — tarefas */}
            <g
              className="nk-hotspot"
              role="button"
              tabIndex={0}
              aria-label="Abrir tarefas e anotações"
              onClick={() => go(HOTSPOTS.caderno)}
              onKeyDown={(e) => e.key === "Enter" && go(HOTSPOTS.caderno)}
            >
              <g transform="rotate(-6 560 630)">
                <rect x="476" y="600" width="168" height="58" rx="6" fill="#d8d2c4" />
                <rect x="476" y="600" width="84" height="58" rx="6" fill="#cfc8b8" />
                <line x1="560" y1="602" x2="560" y2="656" stroke="#a8a49a" strokeWidth="2" />
                {[612, 622, 632, 642].map((y) => (
                  <line key={y} x1="486" y1={y} x2="548" y2={y} stroke="#a8a49a" strokeWidth="1.4" opacity="0.7" />
                ))}
                {[612, 622, 632].map((y) => (
                  <line key={y} x1="572" y1={y} x2="634" y2={y} stroke="#a8a49a" strokeWidth="1.4" opacity="0.5" />
                ))}
                <circle cx="492" cy="612" r="2.6" fill="none" stroke="#9caf88" strokeWidth="1.4" />
                <circle cx="492" cy="622" r="2.6" fill="none" stroke="#6b6a66" strokeWidth="1.4" />
              </g>
              {/* caneta */}
              <g transform="rotate(18 600 668)">
                <rect x="566" y="664" width="70" height="7" rx="3.5" fill="#c97b63" />
                <path d="M636 664 L650 667.5 L636 671 Z" fill="#e8e4da" />
              </g>
              <rect className="nk-halo" x="462" y="582" width="200" height="100" rx="12" fill="none" stroke="#e8a87c" strokeOpacity="0.45" strokeWidth="2" />
              <g className="nk-label">
                <rect x="486" y="544" width="142" height="30" rx="15" fill="#1e2433" />
                <text x="557" y="564" textAnchor="middle" fill="#e8e4da" fontSize="14">
                  📝 Tarefas
                </text>
              </g>
            </g>

            {/* caneca — estatísticas */}
            <g
              className="nk-hotspot"
              role="button"
              tabIndex={0}
              aria-label="Abrir estatísticas"
              onClick={() => go(HOTSPOTS.caneca)}
              onKeyDown={(e) => e.key === "Enter" && go(HOTSPOTS.caneca)}
            >
              {steamToday && (
                <g stroke="#a8a49a" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7">
                  <path className="nk-steam" d="M978 588 q4 -8 0 -16 q-4 -8 0 -14" />
                  <path className="nk-steam" style={{ animationDelay: "1.1s" }} d="M992 588 q-4 -8 0 -16 q4 -8 0 -14" />
                </g>
              )}
              <rect x="966" y="592" width="40" height="50" rx="7" fill="#b3674f" />
              <path d="M1006 602 q18 4 0 26" stroke="#b3674f" strokeWidth="7" fill="none" />
              <ellipse cx="986" cy="594" rx="20" ry="5" fill="#2a1f1b" />
              <rect className="nk-halo" x="954" y="556" width="72" height="96" rx="12" fill="none" stroke="#e8a87c" strokeOpacity="0.45" strokeWidth="2" />
              <g className="nk-label">
                <rect x="908" y="520" width="160" height="30" rx="15" fill="#1e2433" />
                <text x="988" y="540" textAnchor="middle" fill="#e8e4da" fontSize="14">
                  ☕ Estatísticas
                </text>
              </g>
            </g>

            {/* rádio */}
            <g
              className="nk-hotspot"
              role="button"
              tabIndex={0}
              aria-label="Abrir rádio"
              onClick={() => go(HOTSPOTS.radio)}
              onKeyDown={(e) => e.key === "Enter" && go(HOTSPOTS.radio)}
            >
              <line x1="1148" y1="548" x2="1180" y2="496" stroke="#3d4150" strokeWidth="3" strokeLinecap="round" />
              <circle cx="1180" cy="496" r="3.5" fill="#3d4150" />
              <rect x="1036" y="566" width="140" height="78" rx="12" fill="#3a3340" />
              <rect x="1048" y="580" width="62" height="50" rx="6" fill="#2a242c" />
              {[586, 594, 602, 610, 618].map((y) => (
                <line key={y} x1="1052" y1={y} x2="1106" y2={y} stroke="#4a4452" strokeWidth="2.5" />
              ))}
              <circle cx="1138" cy="592" r="11" fill="#241f26" stroke="#caa06a" strokeWidth="2" />
              <line x1="1138" y1="592" x2="1144" y2="584" stroke="#caa06a" strokeWidth="2" strokeLinecap="round" />
              <circle cx="1138" cy="622" r="7" fill="#241f26" stroke="#6b6a66" strokeWidth="1.6" />
              <circle cx="1162" cy="576" r="3.4" fill={radioPlaying ? "#9caf88" : "#3d4150"} className={radioPlaying ? "nk-led-on" : undefined} />
              <rect className="nk-halo" x="1026" y="538" width="166" height="116" rx="14" fill="none" stroke="#e8a87c" strokeOpacity="0.45" strokeWidth="2" />
              <g className="nk-label">
                <rect x="1046" y="500" width="120" height="30" rx="15" fill="#1e2433" />
                <text x="1106" y="520" textAnchor="middle" fill="#e8e4da" fontSize="14">
                  📻 Rádio
                </text>
              </g>
            </g>

            {/* o gato 🐈 — dorme no tapete; só existe pra ser notado */}
            <g className="nk-cat" aria-hidden="true">
              <ellipse cx="312" cy="868" rx="52" ry="24" fill="#262c3e" />
              <circle cx="268" cy="858" r="20" fill="#262c3e" />
              <path d="M254 844 L258 826 L268 840 Z" fill="#262c3e" />
              <path d="M276 842 L284 826 L288 842 Z" fill="#262c3e" />
              <path d="M356 872 q26 -4 22 -28" stroke="#262c3e" strokeWidth="9" fill="none" strokeLinecap="round" />
              <path d="M258 860 q4 4 8 0 M270 860 q4 4 8 0" stroke="#11151f" strokeWidth="1.6" fill="none" strokeLinecap="round" />
            </g>
          </g>

          {/* vinheta cinematográfica */}
          <rect x="0" y="0" width="1600" height="1000" fill="url(#vignette)" pointerEvents="none" />
          <radialGradient id="vignette" cx="0.5" cy="0.46" r="0.75">
            <stop offset="0.62" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#06080d" stopOpacity="0.55" />
          </radialGradient>
        </svg>
      </div>

      {/* fade da transição de câmera */}
      <div
        className="pointer-events-none absolute inset-0 bg-void transition-opacity"
        style={{ opacity: zoom ? 1 : 0, transitionDuration: "600ms", transitionDelay: zoom ? "150ms" : "0ms" }}
      />
    </div>
  );
}
