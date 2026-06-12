"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CommandPalette } from "./CommandPalette";
import { ToastHost } from "./ToastHost";
import { Onboarding } from "./Onboarding";
import { useMounted } from "./useMounted";
import { useNook } from "@/lib/store";
import {
  audioPlayStation,
  audioSetRainLayer,
  audioSetVolume,
  audioStopStation,
} from "@/lib/audio";

function isTyping(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    (el as HTMLElement).isContentEditable
  );
}

/** Aplica tema do quarto e movimento calmo no <html>/<body>. */
function PreferencesSync() {
  const theme = useNook((s) => s.theme);
  const calmMotion = useNook((s) => s.calmMotion);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle("nk-calm", calmMotion);
  }, [calmMotion]);

  return null;
}

/** Sincroniza o estado do rádio (store) com o motor de áudio, em qualquer rota. */
function RadioSync() {
  const radio = useNook((s) => s.radio);
  const setRadio = useNook((s) => s.setRadio);

  useEffect(() => {
    if (radio.playing) audioPlayStation(radio.station);
    else audioStopStation();
  }, [radio.playing, radio.station]);

  useEffect(() => {
    audioSetVolume(radio.volume);
  }, [radio.volume]);

  useEffect(() => {
    if (radio.playing) audioSetRainLayer(radio.rainLayer, radio.rainVolume);
    else audioSetRainLayer(false, 0);
  }, [radio.rainLayer, radio.rainVolume, radio.playing]);

  // timer de som: desligar após X minutos
  useEffect(() => {
    if (!radio.playing || radio.sleepMinutes == null) return;
    const t = window.setTimeout(
      () => setRadio({ playing: false, sleepMinutes: null }),
      radio.sleepMinutes * 60000
    );
    return () => window.clearTimeout(t);
  }, [radio.playing, radio.sleepMinutes, setRadio]);

  return null;
}

export function GlobalChrome() {
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useMounted();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const chord = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (isTyping() || paletteOpen) return;

      const k = e.key.toLowerCase();
      const now = Date.now();

      if (chord.current?.key === "g" && now - chord.current.at < 900) {
        const map: Record<string, string> = {
          d: "/?open=dashboard",
          c: "/?open=calendario",
          t: "/?open=tarefas",
          e: "/?open=disciplinas",
          r: "/?open=radio",
          s: "/?open=estatisticas",
        };
        if (map[k]) {
          e.preventDefault();
          router.push(map[k]);
          chord.current = null;
          return;
        }
        chord.current = null;
      }

      if (k === "g") {
        chord.current = { key: "g", at: now };
        return;
      }
      if (k === "f") {
        e.preventDefault();
        router.push("/foco");
        return;
      }
      if (k === "escape" && pathname !== "/" && pathname !== "/foco") {
        // recua um nível: detalhe → módulo → quarto
        const parts = pathname.split("/").filter(Boolean);
        router.push(parts.length > 1 ? `/${parts[0]}` : "/");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router, pathname, paletteOpen]);

  return (
    <>
      <PreferencesSync />
      <RadioSync />
      <ToastHost />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      {mounted && pathname === "/" && <Onboarding />}
    </>
  );
}
