# 04 — Arquitetura de Informação & Sitemap

## 1. Modelo mental: o quarto como mapa

A AI (arquitetura de informação) do Nook tem uma decisão central: **a navegação primária é espacial, não hierárquica**. O usuário não memoriza menus — memoriza *onde as coisas ficam no quarto*, como faz no quarto real. Isso usa memória espacial (mais durável que memória de rótulos) e transforma navegação em ritual.

### Princípios de AI

1. **Duas camadas, sempre.** Camada 1 = o quarto (hub espacial). Camada 2 = módulos (apps internos com UI convencional e densa). O quarto encanta; os módulos trabalham. Nunca sacrificar usabilidade do módulo pela metáfora.
2. **Toda metáfora tem atalho.** Usuários recorrentes navegam por command palette (`Ctrl+K`) e atalhos diretos. A metáfora nunca pode ser pedágio.
3. **Profundidade máxima: 3 níveis.** Quarto → Módulo → Detalhe. Nada além disso.
4. **A informação urgente fura a metáfora.** Prova amanhã aparece no quarto (post-it no monitor), sem exigir navegação.

## 2. Mapeamento objeto → módulo

| Objeto no quarto | Módulo | Conteúdo | Estado ambiente (sinalização passiva) |
|---|---|---|---|
| 💻 **Computador** | Dashboard + IA | Visão geral do dia, radar de carga, chat com a IA | Tela acesa = pendências hoje; post-it = urgência |
| 📝 **Caderno** | Tarefas & Anotações | Lista de tarefas, kanban, notas rápidas | Caderno aberto com caneta = tarefas em andamento |
| 📅 **Calendário** (parede) | Agenda | Dia / semana / mês, provas, aulas | Círculo vermelho suave na data de prova próxima |
| 📚 **Estante** | Disciplinas | Lombadas = disciplinas; abrir livro = detalhe | Livro deitado = disciplina com pendência |
| 📻 **Rádio** | Som ambiente | Estações, volume, mix | LED ligado + animação sutil quando tocando |
| ☕ **Caneca** | Estatísticas | Horas, constância, equilíbrio por disciplina | Vapor subindo = sessão de foco feita hoje |
| 🪟 **Janela** | Ambiente/clima | Ciclo dia/noite, chuva (estética + som) | Reflete hora real do usuário |
| 🛋️ *(pufe/luminária)* | Modo Foco | Entrada alternativa para sessão de foco | Luz baixa quando em foco |

A coluna "estado ambiente" é a inovação de AI: **o quarto é também um dashboard ambiente** — informação de status comunicada por mudanças sutis no cenário, sem números nem badges.

## 3. Sitemap completo

```
NOOK
│
├── 🚪 Onboarding
│   ├── Boas-vindas (entrada no quarto, primeira vez)
│   ├── Perfil acadêmico (curso, semestre, instituição)
│   ├── Importação de disciplinas (IA lê plano de ensino / manual)
│   ├── Confirmação do semestre montado
│   └── Tour pelo quarto (interativo, pulável)
│
├── 🏠 O Quarto (hub — rota raiz autenticada)
│   ├── Estados ambientais (manhã/tarde/noite, chuva, foco)
│   ├── Post-its de urgência (atalhos contextuais)
│   └── Command palette (Ctrl+K — busca e navegação global)
│
├── 💻 Computador
│   ├── Dashboard
│   │   ├── Hoje (tarefas, aulas, provas do dia)
│   │   ├── Radar de carga (próximas 4 semanas)
│   │   ├── Resumo por disciplina
│   │   └── Alertas da IA (riscos, sugestões)
│   └── Chat IA ("Estuda", a assistente)
│       ├── Conversa contextual
│       ├── Ações geradas (cronograma, resumo, flashcards)
│       └── Histórico
│
├── 📝 Caderno
│   ├── Tarefas
│   │   ├── Lista (hoje / semana / tudo)
│   │   ├── Kanban (a fazer / fazendo / feito)
│   │   └── Detalhe da tarefa
│   └── Anotações
│       ├── Por disciplina
│       ├── Notas rápidas (soltas)
│       └── Editor (markdown + blocos)
│
├── 📅 Calendário
│   ├── Visão Dia
│   ├── Visão Semana (default)
│   ├── Visão Mês
│   └── Detalhe de evento (aula / prova / entrega / sessão)
│
├── 📚 Estante (Disciplinas)
│   ├── Grade do semestre (todas as disciplinas)
│   └── Disciplina (detalhe)
│       ├── Visão geral (progresso, próximas entregas, risco)
│       ├── Tarefas & trabalhos
│       ├── Provas & notas (com simulador de média)
│       ├── Materiais (arquivos, links)
│       └── Anotações da disciplina
│
├── 📻 Rádio
│   ├── Estações (LoFi / Chuva / Biblioteca / Cafeteria / White Noise)
│   ├── Mixer (combinar estação + ambiente, volumes independentes)
│   └── Timer de som (desligar após X)
│
├── 🎯 Modo Foco (overlay full-screen, acessível de qualquer lugar)
│   ├── Setup (objetivo, duração, som)
│   ├── Sessão (pomodoro, objetivo atual, controles mínimos)
│   ├── Pausa
│   └── Encerramento (registro, sensação, próximo passo)
│
├── ☕ Caneca (Estatísticas)
│   ├── Esta semana (horas, sessões, equilíbrio)
│   ├── Semestre (tendências, constância)
│   ├── Por disciplina (distribuição de esforço)
│   └── Conquistas gentis (marcos, sem streaks punitivos)
│
└── ⚙️ Ajustes
    ├── Perfil & conta
    ├── Semestres (arquivar, criar novo)
    ├── Aparência do quarto (temas, itens, clima)
    ├── Notificações
    ├── Integrações (Google Calendar import/export)
    └── Privacidade & dados
```

## 4. Navegação global

| Mecanismo | Quando | Comportamento |
|---|---|---|
| **Clique no objeto** | descoberta, ritual | Câmera aproxima (600ms ease), módulo abre |
| **Command palette `Ctrl+K`** | usuário recorrente | Buscar tudo: "prova de cálculo", "ir para rádio", "iniciar foco" |
| **Atalhos** `G+D / G+C / G+T / F` | power users | Dashboard / Calendário / Tarefas / Foco |
| **Dock discreta** (hover na borda inferior) | dentro de módulos | Ícones minimalistas dos 6 objetos para troca lateral sem voltar ao quarto |
| **`Esc`** | sempre | Recua um nível (detalhe → módulo → quarto) |
| **Post-its no quarto** | urgência | Deep-link direto ao item (ex.: prova de amanhã) |

## 5. Modelo de objetos de informação (visão de AI)

```
Usuário ──┬── Semestre (ativo/arquivado)
          │      └── Disciplina
          │             ├── Aula (recorrência semanal)
          │             ├── Avaliação (prova/trabalho) ── Nota
          │             ├── Tarefa (pode existir sem disciplina)
          │             ├── Material (arquivo/link)
          │             └── Anotação
          ├── SessãoDeFoco (liga-se a Tarefa e/ou Disciplina)
          ├── ConversaIA ── AçõesGeradas (cronograma, resumo, flashcards)
          ├── Deck de Flashcards ── Cartões (estado de revisão)
          └── PreferênciasDoQuarto (tema, clima, rádio)
```

Regra de ouro relacional: **tudo aponta para Disciplina quando possível** — é o eixo que permite à IA raciocinar sobre carga, risco e equilíbrio, e às estatísticas mostrarem distribuição de esforço.

## 6. Taxonomia e vocabulário

| Termo no produto | Nunca usar | Por quê |
|---|---|---|
| Disciplina | "Projeto", "Matéria" (ok coloquial na IA) | Vocabulário acadêmico consistente |
| Entrega | "Deadline" | Tom humano, PT-BR |
| Prova | "Avaliação" (só interno) | Palavra que o aluno usa |
| Sessão de foco | "Pomodoro" (só como técnica) | Pomodoro é meio, não nome |
| Quarto | "Home", "Dashboard" | O lugar é o conceito central |
| Estuda (nome da IA) | "Assistente", "Bot" | Personalidade própria, gentil |
