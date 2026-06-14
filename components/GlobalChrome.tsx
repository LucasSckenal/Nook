"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { CommandPalette } from "./CommandPalette";
import { ToastHost } from "./ToastHost";
import { Onboarding } from "./Onboarding";
import { ShortcutsHelp } from "./ShortcutsHelp";
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

  // PWA: registra o service worker só em produção (em dev ele serve chunks
  // antigos do cache e quebra o HMR). Em dev, garante que nenhum SW fique ativo.
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    } else {
      navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
      if (window.caches) caches.keys().then((ks) => ks.forEach((k) => caches.delete(k)));
    }
  }, []);

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
  const [helpOpen, setHelpOpen] = useState(false);
  const chord = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      // ajuda de atalhos (Nielsen #7/#10): "?" abre, Esc fecha
      if (helpOpen && e.key === "Escape") {
        e.preventDefault();
        setHelpOpen(false);
        return;
      }
      if (isTyping() || paletteOpen || helpOpen) return;
      if (e.key === "?") {
        e.preventDefault();
        setHelpOpen(true);
        return;
      }

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
        router.push("/?open=foco");
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
  }, [router, pathname, paletteOpen, helpOpen]);

  return (
    <>
      <PreferencesSync />
      <RadioSync />
      <ToastHost />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <ShortcutsHelp open={helpOpen} onClose={() => setHelpOpen(false)} />
      {mounted && pathname === "/" && <Onboarding />}
    </>
  );
}
