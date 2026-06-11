"use client";

import { useEffect, useState } from "react";

/** Evita mismatch de hidratação para conteúdo que depende de localStorage/hora. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
