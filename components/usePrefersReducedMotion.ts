"use client";

import { useEffect, useState } from "react";

/**
 * `true` quando o sistema do usuário pede menos movimento
 * (`prefers-reduced-motion: reduce`). O CSS já congela as animações por
 * media query; este hook existe para o que o CSS não alcança — como pausar
 * o <video> de fundo do quarto e trocá-lo pelo still.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
}
