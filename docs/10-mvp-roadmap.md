# 10 — MVP & Roadmap

## 1. Tese a validar com o MVP

> Um ambiente acolhedor + setup sem fricção (IA) + foco em um clique geram **retenção** que ferramentas frias não conseguem.

O MVP precisa validar as duas pernas da tese ao mesmo tempo — emoção (quarto, rádio, foco) e gestão (disciplinas, tarefas, calendário) — porque o produto **é** a combinação. Cortar uma perna invalida o teste.

## 2. Escopo do MVP (v1.0 — "O Quarto")

### Entra

| Pilar | Funcionalidades |
|---|---|
| **Quarto** | Cena 2.5D com 6 objetos navegáveis, ciclo dia/noite por hora real, chuva, post-its de urgência, gato 🐈, command palette `Ctrl+K`, modo navegação simples (a11y) |
| **Onboarding** | Auth (Google/Apple/e-mail), perfil rápido, **ingestão de plano de ensino por IA** + caminho manual + modo demonstração |
| **Disciplinas** | Estante, detalhe com avaliações, notas e simulador de média, materiais (upload), horários de aula |
| **Tarefas** | Lista (hoje/semana/tudo), captura rápida com NLP via `Ctrl+K`, subtarefas, reagendamento gentil |
| **Calendário** | Visões dia e semana, aulas recorrentes, provas com "irradiação", sessões fantasma, carga da semana |
| **Modo Foco** | 1 clique (`F`), pomodoro 25/50/livre, objetivo vinculado a tarefa, registro de tempo + humor |
| **Rádio** | 5 estações + mix com camada ambiente, mini-player persistente, timer de som |
| **IA Estuda** | Chat contextual, criação de cronogramas de prova (propose→confirm), resumo de anotações, alerta de risco (1/dia) |
| **Estatísticas** | Visão semanal (horas, sessões, equilíbrio por disciplina, constância gentil) |
| **Dashboard** | Hoje priorizado, próximas entregas, radar de carga 4 semanas, 1 sugestão da Estuda |

### Fica de fora (e por quê)

| Cortado | Motivo | Quando |
|---|---|---|
| Kanban de tarefas | lista valida o mesmo job | v1.1 |
| Visão mês do calendário | semana é o uso dominante | v1.1 |
| Flashcards + SRS | alto valor, mas não testa a tese central | v1.1 |
| Anotações ricas (blocos) | MVP usa markdown simples | v1.1 |
| Estatísticas de semestre | exige semanas de dados de qualquer forma | v1.1 |
| Personalização do quarto / temas desbloqueáveis | retenção de médio prazo, não de validação | v1.2 |
| Retrospectiva/Cerimônia de fim de semestre | só faz sentido ao fim do ciclo | v1.2 |
| Mobile nativo | web responsiva primeiro; PWA instala | v2 |
| Salas compartilhadas (study together) | multiplayer = complexidade 10× | v2 |
| Integração Google Calendar | nice-to-have; export .ics simples entra na v1.1 | v1.1 |

## 3. Stack de implementação

- **Front:** Next.js 15 (App Router) + React + TypeScript · Tailwind CSS 4 (tokens do Lanterna via `@theme`) · cena do quarto em camadas SVG com transições CSS (`ease-room`); WebGL leve (PixiJS) só se o parallax exigir · Zustand (+ TanStack Query quando o Firestore entrar) · PWA — *protótipo funcional já implementado na raiz do repositório*
- **Back:** Firebase (Auth, Firestore, Storage, Functions, FCM, App Check) — ver [doc 08](08-banco-de-dados.md)
- **IA:** API Claude via `aiGateway` — ver [doc 09](09-ia.md)
- **Áudio:** Web Audio API, loops licenciados + crossfade; cache offline
- **Telemetria:** eventos próprios em BigQuery export (Firebase Analytics) — métricas abaixo

## 4. Roadmap

```
2026 Q3 ─ ALPHA (8 semanas de build)
  s1–2  fundação: auth, modelo Firestore, design tokens, shell do quarto
  s3–4  disciplinas + tarefas + calendário semana
  s5    modo foco + rádio
  s6    aiGateway + ingestão de plano de ensino + chat
  s7    dashboard + radar + estatísticas semana
  s8    polimento, sons, a11y, beta fechado

2026 Q4 ─ BETA fechado (200 estudantes, 3 universidades)
  · medir: retenção W4, sessões de foco/sem, aceitação de planos da IA
  · v1.1: kanban, flashcards+SRS, visão mês, export .ics, anotações em blocos

2027 Q1 ─ LANÇAMENTO público (timing: início do semestre letivo BR)
  · v1.2: personalização do quarto, temas desbloqueáveis, retrospectiva,
    Nook Plus (assinatura)

2027 Q2–Q3 ─ CRESCIMENTO
  · v2.0: apps móveis, salas de estudo compartilhadas (body doubling),
    integração Google Calendar bidirecional, widgets de sistema

2027 Q4 ─ ECOSSISTEMA
  · marketplace de ambientes (criadores LoFi), API para AVAs/Moodle,
    Nook para instituições (dashboards agregados anônimos)
```

## 5. Monetização (freemium calmo)

| | Free | **Nook Plus** (~R$ 14,90/mês, anual com desconto) |
|---|---|---|
| Gestão acadêmica completa | ✓ | ✓ |
| Modo foco + rádio (5 estações) | ✓ | ✓ + estações extras e mixes salvos |
| IA Estuda | 20 interações/dia, 3 ingestões/mês | generoso |
| Flashcards | 3 decks | ilimitado |
| Temas do quarto | desbloqueáveis por uso | todos + sazonais |
| Estatísticas | semana | semestre + insights profundos |

Princípio: **nunca colocar a organização básica atrás do paywall** — a confiança do estudante é o ativo. Paga-se por profundidade de IA e por estética.

## 6. Métricas norte

| Métrica | Meta v1 | Por quê |
|---|---|---|
| **Retenção W4** | ≥ 35% | mata ou valida a tese do aconchego |
| Sessões de foco / usuário ativo / semana | ≥ 3 | proxy do valor central |
| Time-to-semester (onboarding) | < 15 min | mata o "problema Notion" |
| DAU/WAU | ≥ 50% | hábito, não ferramenta de domingo |
| % tarefas vencidas sem interação | < 5% | eficácia da gestão |
| Aceitação de propostas da IA | > 60% | qualidade do contexto |
| NPS pergunta única: "o Nook parece um lugar seu?" | > 8/10 | a métrica da alma |

## 7. Riscos e mitigações

| Risco | Mitigação |
|---|---|
| O quarto vira gimmick (encanta 1 semana, cansa depois) | atalhos/dock desde o dia 1; o quarto informa (estados ambiente), não só decora; medir uso de `Ctrl+K` vs. cliques na cena |
| Custo de IA explode | roteamento Haiku/Sonnet, cache de contexto, cotas, heurística antes de LLM no risco |
| Ingestão de plano de ensino falha em PDFs ruins | fallback conversacional + manual sempre visível; medir taxa de sucesso por instituição |
| Licenciamento de música | começar com produtores LoFi independentes (licença direta, barata) + loops próprios; jamais YouTube embed |
| Performance da cena em máquinas fracas | camadas estáticas + partículas 12fps, modo "animação mínima" automático abaixo de 30fps |
| Sazonalidade acadêmica (férias = churn) | "modo férias" do quarto (luz de verão, metas pessoais leves) + reativação no início do semestre |
