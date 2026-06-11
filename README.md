# 🏠 Nook — Ambiente Digital de Estudos

> *"Não é mais uma ferramenta de produtividade. É o lugar onde você gosta de estudar."*

Nook é um ambiente digital de estudos para universitários: um quarto virtual aconchegante, inspirado na cultura LoFi e Study With Me, onde cada objeto do cenário é uma porta de entrada para o sistema acadêmico — disciplinas, tarefas, provas, calendário, IA e modo foco.

## A tese do produto

Ferramentas acadêmicas atuais resolvem o problema **funcional** (organizar) e ignoram o problema **emocional** (querer voltar). O Nook trata o estado emocional do estudante como requisito de produto: se o ambiente é acolhedor, o estudante volta; se ele volta, a organização acontece como consequência.

**Organização é a feature. Aconchego é o produto.**

## Documentação

| # | Documento | Conteúdo |
|---|-----------|----------|
| 01 | [Pesquisa do Problema](docs/01-pesquisa.md) | Contexto, dados, dores, hipóteses, JTBD |
| 02 | [Personas](docs/02-personas.md) | 4 personas + anti-persona |
| 03 | [Benchmark](docs/03-benchmark.md) | Análise competitiva e posicionamento |
| 04 | [Arquitetura de Informação & Sitemap](docs/04-arquitetura-informacao.md) | Modelo mental, hierarquia, sitemap completo |
| 05 | [Fluxos de Usuário](docs/05-fluxos-usuario.md) | Onboarding, fluxos críticos, estados de erro |
| 06 | [Wireframes & Estrutura de Telas](docs/06-wireframes-e-telas.md) | Wireframes textuais de todas as telas |
| 07 | [Design System](docs/07-design-system.md) | Tokens, cores, tipografia, componentes, motion |
| 08 | [Banco de Dados & Modelagem](docs/08-banco-de-dados.md) | Firestore, entidades, regras de segurança |
| 09 | [Estrutura da IA](docs/09-ia.md) | Arquitetura, contexto, ferramentas, prompts |
| 10 | [MVP & Roadmap](docs/10-mvp-roadmap.md) | Escopo do MVP, fases, métricas |
| 11 | [Funcionalidades Inovadoras](docs/11-inovacao.md) | Diferenciais que nenhum concorrente tem |
| 12 | [Estratégia de Apresentação](docs/12-apresentacao.md) | Pitch, narrativa, demo |

## Protótipo (Next.js)

O repositório contém um protótipo navegável e funcional do MVP, construído com **Next.js 15 (App Router) + React 19 + Tailwind CSS 4 + Zustand**.

```bash
npm install
npm run dev   # abre em http://localhost:3000
```

O que já funciona nesta versão:

- **O Quarto** — cena 2.5D em SVG com parallax de mouse, ciclo dia/noite pela hora real, chuva na janela (clique nela), gato que respira, post-it de urgência no monitor e zoom de câmera (600ms) ao clicar em cada objeto
- **Dashboard** (💻) — hoje, próximas avaliações, radar de carga de 4 semanas, horas da semana e a aba da **Estuda** (IA em modo demo local: planos de estudo, panorama de risco e flashcards gerados a partir dos dados reais do semestre)
- **Tarefas** (📝) — captura rápida, filtros hoje/semana/tudo/feitas, checkbox com traço de caneta, "▶ focar" por tarefa
- **Calendário** (📅) — visão semana com aulas recorrentes, provas/entregas na faixa de dia inteiro e agulha do "agora"
- **Disciplinas** (📚) — estante com lombadas, detalhe com avaliações, **simulador de média** ("e se eu tirar X?"), materiais e tarefas
- **Modo Foco** (🎯) — pomodoro 25/50/livre, objetivo vinculável a tarefa, registro de sessão com humor
- **Rádio** (📻) — 5 estações **sintetizadas no navegador** via Web Audio API (zero arquivos de áudio), camada de chuva mixável, timer de som e mini-player persistente na dock
- **Estatísticas** (☕) — semana em barras, equilíbrio por disciplina, constância gentil, humor das sessões
- **Navegação global** — `Ctrl+K` (busca + criação de tarefa por texto livre), atalhos `G+D/T/C/E/R/S`, `F` para foco, `Esc` recua um nível, dock discreta

Os dados são de demonstração (semestre fictício com datas relativas a hoje) e persistem em `localStorage`. A integração Firebase (doc 08) e a API Claude real (doc 09) entram na fase Alpha — os contratos do store e da Estuda já foram desenhados para essa troca.

## O conceito em 30 segundos

Você entra num quarto virtual à meia-luz. Chuva fina na janela. Um lo-fi tocando baixo no rádio da mesa.

- 💻 **Computador** → Dashboard e IA
- 📝 **Caderno** → Tarefas e anotações
- 📅 **Calendário** → Agenda e provas
- 📻 **Rádio** → LoFi e sons ambientes
- 📚 **Estante** → Disciplinas
- ☕ **Caneca** → Estatísticas pessoais

A câmera se aproxima suavemente do objeto que você toca. Nenhum menu. Nenhuma sidebar fria. O quarto **é** a navegação.
