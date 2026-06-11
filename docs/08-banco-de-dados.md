# 08 — Banco de Dados Firebase & Modelagem de Entidades

Stack: **Firebase Auth + Cloud Firestore + Cloud Storage + Cloud Functions + FCM**. Modelagem orientada às leituras reais do app (Firestore cobra por documento lido — o modelo abaixo otimiza para as telas).

## 1. Diagrama de entidades

```
User 1──N Semester 1──N Subject 1──N Assessment (prova/trabalho)
                            │ 1──N ClassSchedule (horários de aula)
                            │ 1──N Material
                            │
User 1──N Task    N──1 Subject (opcional)
User 1──N Note    N──1 Subject (opcional)
User 1──N FocusSession N──1 Task (opcional), N──1 Subject (opcional)
User 1──N Deck 1──N Flashcard
User 1──N AIThread 1──N AIMessage
User 1──1 RoomState (preferências do quarto)
User 1──N StatsDaily (agregados pré-computados)
```

## 2. Estrutura Firestore (coleções e documentos)

```
users/{userId}
├── (campos do perfil)
├── semesters/{semesterId}
├── subjects/{subjectId}            ← subcoleção direta do user (não do semestre)*
├── tasks/{taskId}
├── notes/{noteId}
├── focusSessions/{sessionId}
├── decks/{deckId}/cards/{cardId}
├── aiThreads/{threadId}/messages/{messageId}
├── statsDaily/{YYYY-MM-DD}
└── roomState (doc único: users/{userId}/meta/roomState)
```

\* `subjects` referencia `semesterId` por campo, não por aninhamento — permite consultar "todas as disciplinas ativas" sem saber o semestre, e arquivar semestre é um update de status, não uma migração.

### 2.1 `users/{userId}`

```jsonc
{
  "displayName": "Marina Souza",
  "email": "marina@...",
  "photoURL": null,
  "institution": "UFMG",
  "course": "Psicologia",
  "currentSemesterId": "sem_2026_1",
  "timezone": "America/Sao_Paulo",
  "studyWindow": { "start": "19:00", "end": "23:00" },   // janela típica, alimenta a IA
  "plan": "free",                                        // free | nook_plus
  "onboardingDone": true,
  "createdAt": <Timestamp>
}
```

### 2.2 `semesters/{semesterId}`

```jsonc
{
  "label": "2026.1",
  "startDate": <Timestamp>,
  "endDate": <Timestamp>,
  "status": "active",          // active | archived
  "retrospective": null        // preenchido pela Cerimônia de fim (v1.2)
}
```

### 2.3 `subjects/{subjectId}`

```jsonc
{
  "semesterId": "sem_2026_1",
  "name": "Cálculo II",
  "professor": "Prof. Almeida",
  "color": "anil",                          // chave da paleta de 10
  "targetGrade": 7.0,
  "gradeFormula": {                          // importada do plano de ensino
    "type": "weighted",
    "components": [
      { "assessmentId": "as_p1", "weight": 0.35 },
      { "assessmentId": "as_p2", "weight": 0.35 },
      { "assessmentId": "as_listas", "weight": 0.30 }
    ]
  },
  "schedule": [                              // ClassSchedule embutido (lê-se sempre junto)
    { "weekday": 2, "start": "10:00", "end": "11:40", "location": "Sala 204" },
    { "weekday": 4, "start": "10:00", "end": "11:40", "location": "Sala 204" }
  ],
  "assessments": [                           // embutido: poucas (<20) e lidas sempre juntas
    {
      "id": "as_p1", "type": "exam",         // exam | assignment | seminar | quiz
      "title": "P1", "date": <Timestamp>,
      "grade": 6.2, "maxGrade": 10, "status": "graded"   // upcoming|done|graded
    }
  ],
  "syllabusRaw": "gs://nook/.../plano.pdf",  // referência ao Storage
  "riskScore": 0.42,                         // 0–1, recalculado por Cloud Function
  "riskFactors": ["grade_below_target", "low_study_time"],
  "stats": { "totalFocusMinutes": 540, "openTasks": 3 },   // denormalizado p/ estante
  "status": "active",
  "createdAt": <Timestamp>, "updatedAt": <Timestamp>
}
```

**Decisão:** horários e avaliações são **arrays embutidos** (sempre lidos com a disciplina, baixa cardinalidade, edição rara) — 1 leitura renderiza a tela da disciplina inteira.

### 2.4 `tasks/{taskId}`

```jsonc
{
  "title": "Exercícios 3.1–3.8",
  "subjectId": "sub_calc2",            // null = tarefa solta
  "assessmentId": null,                 // vincula a uma entrega, se for o caso
  "dueDate": <Timestamp> | null,
  "scheduledFor": <Timestamp> | null,   // dia em que o usuário planeja fazer
  "estimatedMinutes": 60,
  "actualMinutes": 38,                  // somado das focusSessions
  "status": "todo",                     // todo | doing | done
  "subtasks": [ { "title": "...", "done": false } ],
  "source": "user",                     // user | ai_plan | syllabus_import
  "planId": "plan_bioq_p2",             // agrupa tarefas de um plano da IA
  "completedAt": null,
  "createdAt": <Timestamp>, "updatedAt": <Timestamp>
}
```

### 2.5 `focusSessions/{sessionId}`

```jsonc
{
  "startedAt": <Timestamp>, "endedAt": <Timestamp>,
  "plannedMinutes": 25, "actualMinutes": 25,
  "taskId": "task_abc" | null,
  "subjectId": "sub_calc2" | null,
  "completedCycle": true,
  "mood": "flow",                       // hard | ok | flow | null
  "soundscape": { "station": "lofi", "ambientLayer": "rain", "mix": 0.3 }
}
```

### 2.6 `notes/{noteId}`

```jsonc
{
  "title": "Aula 12 — Durkheim",
  "subjectId": "sub_socio" | null,
  "content": "<markdown>",
  "aiArtifacts": [ { "type": "summary", "threadId": "th_x", "createdAt": <ts> } ],
  "updatedAt": <Timestamp>
}
```

### 2.7 `decks/{deckId}` e `cards/{cardId}`

```jsonc
// deck
{ "title": "Anatomia — Sistema nervoso", "subjectId": "sub_anat",
  "source": "ai",  "cardCount": 24 }

// card  (repetição espaçada SM-2 simplificado)
{ "front": "...", "back": "...",
  "srs": { "interval": 3, "ease": 2.5, "due": <Timestamp>, "reps": 2 } }
```

### 2.8 `aiThreads/{threadId}` e `messages/{messageId}`

```jsonc
// thread
{ "title": "Plano P2 Bioquímica", "context": "subject:sub_bioq",
  "lastMessageAt": <Timestamp> }

// message
{ "role": "user" | "assistant",
  "content": "<texto>",
  "artifact": {                         // quando a resposta gera ação
    "type": "study_plan",               // study_plan | summary | deck | risk_report
    "payload": { ... },
    "applied": true                     // usuário confirmou?
  },
  "createdAt": <Timestamp> }
```

### 2.9 `statsDaily/{YYYY-MM-DD}` (agregado pré-computado)

```jsonc
{ "focusMinutes": 92, "sessions": 3, "tasksCompleted": 4,
  "bySubject": { "sub_calc2": 50, "sub_anat": 42 },
  "presence": true }
```

Mantido por **Cloud Function** (trigger em `focusSessions` e `tasks`). A tela de estatísticas lê 7 docs (semana) ou ~120 (semestre) em vez de varrer sessões — custo e latência previsíveis.

### 2.10 `meta/roomState`

```jsonc
{ "theme": "midnight", "weather": "real" | "rain" | "clear",
  "radioDefault": { "station": "lofi", "volume": 0.6, "ambientLayer": "rain", "mix": 0.3 },
  "unlocked": ["theme_dusk"], "catSpot": "shelf",
  "uiSounds": true, "motionDensity": "full", "simpleNav": false }
```

## 3. Índices compostos necessários

| Coleção | Índice | Serve a tela |
|---|---|---|
| tasks | `status ASC, dueDate ASC` | Caderno (lista) |
| tasks | `subjectId ASC, status ASC, dueDate ASC` | Disciplina → tarefas |
| tasks | `scheduledFor ASC, status ASC` | Dashboard "Hoje" / Calendário |
| focusSessions | `startedAt DESC` | histórico |
| subjects | `semesterId ASC, status ASC` | Estante |
| decks/cards (CG) | `srs.due ASC` | revisões do dia |

## 4. Security Rules (essência)

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      match /{collection}/{docId=**} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }

      // statsDaily é escrito só por Cloud Functions
      match /statsDaily/{day} {
        allow read: if request.auth.uid == uid;
        allow write: if false;
      }
    }
  }
}
```

Princípios: **isolamento total por usuário** (não há dados compartilhados no MVP); agregados e `riskScore` só escritos pelo backend (Admin SDK ignora rules); validação de schema nas Functions, não nas rules (rules = autorização).

Storage: `materials/{uid}/{subjectId}/{file}` com regra equivalente (`request.auth.uid == uid`), limite 20MB/arquivo no plano free.

## 5. Cloud Functions (inventário)

| Function | Trigger | Faz |
|---|---|---|
| `onFocusSessionWrite` | Firestore trigger | atualiza `statsDaily`, `subject.stats`, `task.actualMinutes` |
| `onTaskWrite` | Firestore trigger | atualiza contadores e `statsDaily.tasksCompleted` |
| `recalcRisk` | schedule (diário, por usuário ativo) | recalcula `riskScore` por disciplina (nota parcial vs. meta, carga futura, esforço recente) |
| `digestNotifications` | schedule (manhã, tz do usuário) | FCM/e-mail: resumo gentil do dia (1/dia no máx.) |
| `aiGateway` | HTTPS callable | única porta para o LLM — monta contexto, chama o modelo, valida artefatos (ver [doc 09](09-ia.md)) |
| `syllabusIngest` | HTTPS callable (upload) | OCR/parse do plano de ensino → proposta de Subject+Assessments |
| `archiveSemester` | HTTPS callable | status flip + gera retrospectiva |

## 6. Offline & sync

- Firestore persistence ligada (IndexedDB) → leitura e captura offline nativas.
- `focusSessions` em andamento vivem em `localStorage` até o fim (evita docs órfãos) e gravam no encerramento.
- Áudio: loops base de cada estação no Cache Storage (~2MB/estação) para o rádio sobreviver offline.

## 7. Estimativa de custo por usuário ativo/dia (sanidade)

~60 leituras (dashboard 10, caderno 15, calendário 20, estante 8, stats 7) + ~25 escritas. A 30 dias: ~1.8k reads + 750 writes/usuário/mês → bem dentro da economia de um plano free com margem (free tier do Firestore: 50k reads/dia no projeto). O custo dominante será o LLM, não o banco — por isso o `aiGateway` tem cache e cotas por plano.
