"use client";

import { useEffect, type RefObject } from "react";

/**
 * Prende o foco do teclado dentro de um contêiner enquanto ele está ativo
 * (B&S: acessibilidade; Nielsen #3: controle do usuário). Foca o primeiro
 * elemento ao abrir, cicla com Tab/Shift+Tab e devolve o foco ao fechar.
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useFocusTrap(
  ref: RefObject<HTMLElement | null>,
  active: boolean
) {
  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const items = () =>
      Array.from(el.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (x) => x.offsetParent !== null
      );

    items()[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const list = items();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    el.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("keydown", onKey);
      previouslyFocused?.focus?.();
    };
  }, [ref, active]);
}
