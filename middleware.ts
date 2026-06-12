import { NextResponse, type NextRequest } from "next/server";

/**
 * Filosofia do Nook: nenhuma tela aparece "do nada" — todo módulo nasce do
 * quarto. Links diretos para um módulo são redirecionados para o quarto com
 * o módulo aberto (`/?open=...`), para que ele emerja do objeto.
 */

const MODULES = new Set([
  "dashboard",
  "tarefas",
  "calendario",
  "disciplinas",
  "radio",
  "estatisticas",
  "foco",
]);

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const seg = pathname.split("/").filter(Boolean);

  if (seg.length >= 1 && MODULES.has(seg[0])) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    url.searchParams.set("open", seg[0]);
    // /disciplinas/:id → abre a estante já no detalhe
    if (seg[0] === "disciplinas" && seg[1]) {
      url.searchParams.set("id", seg[1]);
    }
    // demais query params (ex.: /foco?task=x) são preservados pelo clone
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/tarefas",
    "/calendario",
    "/disciplinas",
    "/disciplinas/:id*",
    "/radio",
    "/estatisticas",
    "/foco",
  ],
};
