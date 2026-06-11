# 06 — Wireframes Textuais & Estrutura Completa de Telas

Wireframes em ASCII + especificação de cada tela. Resolução-base: desktop 1440×900 (web-first); notas de adaptação mobile ao final.

---

## T01 — O Quarto (hub)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                      22:41  ☾    │
│   ┌─────────┐                                                    │
│   │ JANELA  │   ╔════════════╗        ┌──────────┐               │
│   │ chuva   │   ║ 📚 ESTANTE ║        │📅 CALEND.│               │
│   │ cidade  │   ║ ▌▌▌▌▌▌     ║        │  parede  │               │
│   │ à noite │   ║ ▌▌▌ (1 ⤵)  ║        │  ◦ 14    │               │
│   └─────────┘   ╚════════════╝        └──────────┘               │
│                                                                  │
│        ┌────────────────────────────────────────────┐            │
│        │              MESA DE ESTUDOS               │            │
│        │  ┌──────────┐                              │            │
│        │  │💻 monitor│  📝caderno   📻rádio  ☕caneca│            │
│        │  │ post-it! │   (aberto)   (LED on) (vapor)│            │
│        │  └──────────┘                              │            │
│        └────────────────────────────────────────────┘            │
│   🛋️ pufe + luminária                                            │
│                                                                  │
│              [ ▶ Focar ]            ⌘K para tudo                 │
└──────────────────────────────────────────────────────────────────┘
```

**Especificação:**
- Cena 2.5D ilustrada (camadas com parallax sutil ao mover o mouse, ~6px de amplitude).
- **Hora real** define a luz: manhã (âmbar frio), tarde (neutra), noite (azul profundo + abajur). Clima opcional sincroniza com o real ou fica fixo em "chuva" (preferência).
- Objetos interativos têm *hover*: brilho suave + label minimalista ("Estante — Disciplinas").
- **Post-its no monitor** = urgências (máx. 2). Clique = deep-link.
- Estados ambientes (caneca com vapor, caderno aberto, livro deitado na estante) comunicam status sem números — ver [AI](04-arquitetura-informacao.md).
- Único CTA explícito: `▶ Focar`. O resto é exploração.
- Acessibilidade: `Tab` percorre objetos em ordem fixa; leitor de tela anuncia "Estante: 6 disciplinas, 1 com pendência"; **modo "navegação simples"** substitui o quarto por menu vertical (configurável — essencial para baixa visão e para quem prefere velocidade).

---

## T02 — Dashboard (no computador)

```
┌──────────────────────────────────────────────────────────────────┐
│ ← quarto      💻  Boa noite, Marina            ⌘K   📻 ♪ lofi    │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  HOJE · quinta, 11 jun                       RADAR DE CARGA      │
│  ┌─────────────────────────────┐   ┌───────────────────────────┐ │
│  │ ◉ Ler cap. 5 — Bioquímica   │   │ sem 24  ▂▂   leve         │ │
│  │   50min · plano da prova    │   │ sem 25  ▄▄▄  moderada     │ │
│  │ ○ Exercícios 3.1–3.8 Cálc.  │   │ sem 26  ███  pesada ⚠     │ │
│  │ ○ Revisar fichamento Socio. │   │ sem 27  ▂    leve         │ │
│  │            [ ▶ Focar nisso ]│   └───────────────────────────┘ │
│  └─────────────────────────────┘                                 │
│                                                                  │
│  PRÓXIMAS                            ESTUDA ✨                   │
│  ┌─────────────────────────────┐   ┌───────────────────────────┐ │
│  │ 🔴 Prova Anatomia   sáb 13  │   │ "A semana 26 está pesada. │ │
│  │ 🟡 Entrega Física   qua 17  │   │  Quer que eu antecipe o   │ │
│  │ 🟢 Seminário Socio. seg 22  │   │  seminário de Sociologia?"│ │
│  └─────────────────────────────┘   │   [ Ver plano ] [ Agora   │ │
│                                    │                  não ]    │ │
│  DISCIPLINAS (resumo) ───────────  └───────────────────────────┘ │
│  Anatomia ▓▓▓▓▓░ 78% · risco ok        Cálculo ▓▓▓░░░ 54% ⚠      │
└──────────────────────────────────────────────────────────────────┘
```

**Especificação:**
- Grid 12 col; cards com elevação por contraste (sem bordas duras).
- "Hoje" é priorizado pela IA (prazo + peso da avaliação + esforço estimado).
- Radar de carga: heatmap horizontal de 4 semanas; clique expande (T02a).
- Card da Estuda: no máximo **uma** sugestão por vez. IA propõe, nunca executa sozinha.
- Semáforo de proximidade usa pontos pequenos, saturação baixa (nada grita).

---

## T03 — Chat IA "Estuda"

```
┌──────────────────────────────────────────────────────────────────┐
│ ← dashboard   ✨ Estuda                                          │
├──────────────────────────────────────────────────────────────────┤
│              ┌─────────────────────────────────────────────┐     │
│              │ me ajuda a estudar pra prova de anatomia?   │ você│
│              └─────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────────┐      │
│  │ Claro! A prova é sábado e cobre 3 capítulos. Você tem  │      │
│  │ ~4h livres até lá, considerando suas aulas. Proposta:  │      │
│  │ ┌────────────────────────────────────────────────┐     │      │
│  │ │ 📋 PLANO · Prova de Anatomia · 3 dias           │     │      │
│  │ │ qui 20h  Sistema nervoso (50min) ▶              │     │      │
│  │ │ sex 19h  Membros + flashcards (50min) ▶         │     │      │
│  │ │ sáb 9h   Revisão geral (25min) ▶                │     │      │
│  │ │      [ ✓ Adicionar ao calendário ]  [ ajustar ] │     │      │
│  │ └────────────────────────────────────────────────┘     │      │
│  └────────────────────────────────────────────────────────┘      │
│  sugestões:  [gerar flashcards] [resumir cap. 7] [meu risco?]    │
│  ┌────────────────────────────────────────────────────┐ [enviar] │
└──────────────────────────────────────────────────────────────────┘
```

**Especificação:**
- Respostas com **artefatos acionáveis** (plano, deck, resumo) em cards estruturados — nunca só texto.
- Toda ação tem botão de confirmação explícito (princípio: IA propõe, usuário dispõe).
- Chips de sugestão contextuais à tela de origem.

---

## T04 — Caderno: Tarefas

```
┌──────────────────────────────────────────────────────────────────┐
│ ← quarto   📝 Caderno      [Tarefas] [Anotações]      + nova (N) │
├──────────────────────────────────────────────────────────────────┤
│  ‹ Lista ›  ‹ Kanban ›             filtros: disciplina ▾  prazo ▾ │
│                                                                  │
│  HOJE                                                            │
│  ◉ Ler cap. 5 — Bioquímica            50min ▶focar    qui        │
│  ○ Exercícios 3.1–3.8 — Cálculo       1h            qui        │
│                                                                  │
│  ESTA SEMANA                                                     │
│  ○ Fichamento Durkheim — Sociologia    2h            sex        │
│  ○ Relatório lab — Física  ⠿ 2 subtarefas            qua 17     │
│                                                                  │
│  MAIS TARDE ▸ (8)                                                │
│                                                                  │
│  ✓ FEITAS HOJE (2) ▸                          🌱 boa, já são 2!  │
└──────────────────────────────────────────────────────────────────┘
```

**Especificação:**
- Linhas estilo papel pautado sutil (textura a 4% de opacidade) — remete a caderno sem kitsch.
- Concluir: checkbox anima como **traço de caneta** + micro-som opcional de lápis.
- Cada tarefa tem `▶ focar` inline → modo foco com essa tarefa como objetivo.
- Tarefas atrasadas entram em "Hoje" com tag âmbar `reagendada` — não existe seção "atrasadas" (decisão anti-culpa).
- Kanban: 3 colunas fixas (a fazer / fazendo / feito), arrastar com inércia física.

## T04b — Caderno: Anotações

- Lista lateral por disciplina + "notas soltas"; editor central markdown com blocos (texto, lista, imagem, código).
- Ação na seleção de texto: `✨ resumir` / `✨ virar flashcards` (envia à Estuda).
- Autosave contínuo, indicador "salvo 🌿" discreto.

---

## T05 — Calendário

```
┌──────────────────────────────────────────────────────────────────┐
│ ← quarto  📅 Junho 2026     [Dia] [Semana] [Mês]    ‹ hoje ›     │
├──────────────────────────────────────────────────────────────────┤
│        seg 8     ter 9     qua 10   ▌qui 11   sex 12    sáb 13   │
│  8h   ┌Anatomia┐                    ▌┌Anatomia┐          ┌PROVA┐  │
│  10h  └────────┘ ┌Cálculo┐          ▌└────────┘          │ 🔴  │  │
│  12h             └───────┘          ▌                    └─────┘  │
│  14h  ┌Física──┐            ┌Socio┐ ▌┌Física──┐                   │
│  19h  └────────┘            └─────┘ ▌└────────┘ ░plano░           │
│  20h            ░plano bioq░        ▌░bioq 50m░ ░rev.░            │
│  ────────────────────────────────────────────────────────────────│
│  carga da semana: ▄▄▄▄▄▄▄░░░ 7,5h planejadas · 9h disponíveis     │
└──────────────────────────────────────────────────────────────────┘
```

**Especificação:**
- Tipos visuais: **aula** (bloco sólido, cor da disciplina dessaturada), **prova** (contorno forte + ponto), **entrega** (marcador no topo do dia), **sessão planejada** (bloco tracejado "fantasma" — vira sólido quando cumprida).
- Provas "irradiam": os 3 dias anteriores recebem um degradê sutil da cor da disciplina (percepção de preparação).
- Rodapé com **carga da semana**: planejado vs. disponível (disponível = vagas fora das aulas e do sono configurado).
- Arrastar para reagendar; `Shift+arrastar` duplica sessão.

---

## T06 — Estante / Disciplinas

```
┌──────────────────────────────────────────────────────────────────┐
│ ← quarto   📚 Estante — 2026.1                    + disciplina   │
├──────────────────────────────────────────────────────────────────┤
│   ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐      ← lombadas (cor própria)    │
│   │AN│ │CA│ │FI│ │SO│ │BQ│ │EP│                                  │
│   │AT│ │LC│ │SI│ │CI│ │UI│ │ED│                                  │
│   └──┘ └──┘ └──┘ └──┘ └──┘ └──┘                                  │
│    78%   54%⚠  70%   81%   62%   90%   ← progresso do semestre   │
└──────────────────────────────────────────────────────────────────┘
          ↓ clique abre o "livro" (T06a)
┌──────────────────────────────────────────────────────────────────┐
│ ← estante   📕 Cálculo II — Prof. Almeida        ter/qui 10h     │
├──────────────────────────────────────────────────────────────────┤
│ [Visão geral] [Tarefas] [Provas & notas] [Materiais] [Anotações] │
│                                                                  │
│  média parcial 6,2 ── meta 7,0     ⚠ risco moderado              │
│  "para fechar em 7,0 você precisa de ≥ 7,4 na P2 (28 jun)"       │
│                                                                  │
│  PRÓXIMO: Lista 4 · entrega sex   |  P2 em 17 dias               │
│  esforço vs. média das disciplinas: ▓▓░░░ abaixo — a Estuda      │
│  sugere +2 sessões/semana                            [ver plano] │
└──────────────────────────────────────────────────────────────────┘
```

**Especificação:**
- Abertura do livro: transição de página (300ms) — única skeumorfia permitida fora do quarto.
- Aba **Provas & notas** inclui o simulador de média (fórmula de pesos importada do plano de ensino).
- **Materiais**: upload (Firebase Storage) + links; preview inline de PDF.

---

## T07 — Rádio (close)

```
┌──────────────────────────────────────────────────────────────────┐
│                          (câmera fechada na mesa)                │
│      ┌────────────────────────────────────────────┐              │
│      │   ⌁⌁⌁  N O O K   R A D I O  ⌁⌁⌁    ● on    │              │
│      │                                            │              │
│      │   LoFi   Chuva   Bibl.   Café   White      │              │
│      │    ▲                                       │              │
│      │ ───┴────────────────────────── dial        │              │
│      │                                            │              │
│      │   volume ◌──────●───◌     mix: +chuva 30%  │              │
│      │   ⏾ desligar em: — / 25m / 1h / fim sessão │              │
│      └────────────────────────────────────────────┘              │
│                     Esc para voltar · som continua               │
└──────────────────────────────────────────────────────────────────┘
```

**Especificação:**
- Dial com física (inércia + snap por estação); estática analógica 300ms na troca.
- **Mix**: 1 estação musical + 1 camada ambiente com volumes independentes (ex.: LoFi 70% + chuva 30%).
- Áudio: streams próprios/licenciados + loops locais para offline. Crossfade 2s.
- Mini-player persistente na dock em qualquer módulo.

---

## T08 — Modo Foco (overlay)

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│                          (tudo escurece)                         │
│                                                                  │
│                            24:18                                 │
│                                                                  │
│                  Ler cap. 5 — Bioquímica                         │
│                  ▰▰▰▰▰▰▱▱▱▱  ciclo 1 de 2                        │
│                                                                  │
│              ⏸ pausar      ✓ concluir      ✕ sair                │
│                                                                  │
│   ♪ lofi + chuva ▁▂▃▂▁                       🌧 janela ao fundo   │
└──────────────────────────────────────────────────────────────────┘
```

**Especificação:**
- O quarto não some — fica desfocado e escurecido ao fundo (continuidade de lugar).
- Timer tipográfico gigante (peso leve). Sem segundos piscando: o tempo *escoa*, não tiquetaqueia.
- Ao concluir ciclo: pausa guiada de 5min com microtexto ("alonga, hidrata").
- Encerramento: registro automático de tempo + humor opcional em 1 toque.
- Modo "ultra": `Shift+F` esconde até o timer — só você, o som e a chuva.

---

## T09 — Estatísticas (caneca)

```
┌──────────────────────────────────────────────────────────────────┐
│ ← quarto   ☕ Suas estatísticas       [semana] [semestre]         │
├──────────────────────────────────────────────────────────────────┤
│  ESTA SEMANA                                                     │
│  7h32 estudadas · 11 sessões · 9 tarefas concluídas              │
│  s t q q s s d                                                   │
│  ▃ ▅ ▂ ▆ _ _ _   ← seu ritmo (sem cobrança de fim de semana)     │
│                                                                  │
│  EQUILÍBRIO POR DISCIPLINA          CONSTÂNCIA                   │
│  Anatomia    ▓▓▓▓▓▓ 2h40            🌱 5 dias presentes esta     │
│  Bioquímica  ▓▓▓▓ 1h50                 semana — seu recorde      │
│  Cálculo     ▓▓ 0h50 ⚠ P2 próxima       é 6.                     │
│  Sociologia  ▓▓▓ 1h12                                            │
│                                                                  │
│  "Você rende mais entre 20h e 22h. Quer que eu                   │
│   priorize seus planos nesse horário?"  [sim] [não]              │
└──────────────────────────────────────────────────────────────────┘
```

**Especificação:**
- Linguagem **gentil e descritiva**, nunca comparativa com outros usuários.
- Sem streaks que zeram: "constância" conta presenças, não pune ausências.
- Insight acionável da IA no rodapé (1 por visita, no máximo).

---

## T10 — Ajustes (resumo)

Seções: Perfil · Semestres (arquivar/criar) · **Aparência do quarto** (tema de cor, clima fixo/real, itens desbloqueados, densidade de animação, modo navegação simples) · Notificações (e-mail/push; horários de silêncio) · Integrações (Google Calendar) · Privacidade (exportar/excluir dados — LGPD).

---

## Adaptação mobile (princípios)

- O quarto vira **cena vertical** com os mesmos objetos reorganizados (mesa em primeiro plano).
- Dock inferior fixa: Quarto · Tarefas · ▶Focar (central, destacado) · Calendário · Rádio.
- Captura rápida por long-press no ícone do app (atalho de sistema).
- Modo foco bloqueia notificações via Focus APIs do SO quando permitido.

## Inventário de telas (checklist de build)

| ID | Tela | Módulo | Prioridade |
|----|------|--------|------------|
| T00a–d | Landing, Auth, Onboarding (4 passos), Tour | Entrada | MVP |
| T01 | Quarto | Hub | MVP |
| T02, T02a | Dashboard, Radar expandido | Computador | MVP |
| T03 | Chat Estuda | Computador | MVP |
| T04, T04a, T04b | Tarefas lista, kanban, anotações | Caderno | MVP (kanban: v1.1) |
| T05 | Calendário dia/semana/mês | Calendário | MVP (dia/semana); mês v1.1 |
| T06, T06a | Estante, Disciplina detalhe | Estante | MVP |
| T07 | Rádio close | Rádio | MVP |
| T08 | Modo foco + encerramento | Foco | MVP |
| T09 | Estatísticas | Caneca | MVP (semana); semestre v1.1 |
| T10 | Ajustes | Sistema | MVP parcial |
| T11 | Retrospectiva de semestre | Cerimônia | v1.2 |
