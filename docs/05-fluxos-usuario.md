# 05 — Fluxos de Usuário

Fluxos críticos detalhados, com estados de exceção. Notação: `[tela]`, `(decisão)`, `→` transição, `✦` momento de deleite intencional.

---

## Fluxo 1 — Onboarding: do cadastro ao semestre montado

**Meta de design:** semestre completo em **menos de 15 minutos**, com sensação de "uau, já está pronto". Mata o problema nº 1 do Notion (setup infinito).

```
[Landing] → CTA "Entrar no Nook"
→ [Auth] Google / Apple / e-mail (Firebase Auth)
→ ✦ [Entrada cinematográfica] porta se abre, câmera entra no quarto
   à meia-luz, chuva na janela, rádio liga sozinho em volume baixo
→ [Perfil rápido] curso, semestre atual, turno
   (3 campos, 20 segundos)
→ (Como adicionar disciplinas?)
   ├── A. "Tenho o plano de ensino" → upload PDF/foto/texto
   │      → IA extrai: nome, professor, horários, avaliações, pesos, datas
   │      → [Confirmação] cards editáveis, lado a lado com o documento
   │      → ✦ "Seu semestre está montado. 6 disciplinas, 14 avaliações mapeadas."
   ├── B. "Vou adicionar manualmente" → form mínimo por disciplina
   │      (nome + horário; resto é progressivo)
   └── C. "Quero só explorar" → quarto com dados de demonstração
          marcados como exemplo, substituíveis depois
→ [Tour do quarto] 30s: objetos pulsam suavemente um a um,
   tooltip de uma linha cada (pulável com Esc)
→ [Quarto] estado inicial: post-it no monitor "começa por aqui 🌱"
```

**Exceções:**
- IA não consegue ler o documento → fallback gracioso: "Não consegui ler tudo — me conta os nomes das disciplinas que eu monto o resto com você" (conversa, não formulário de erro).
- Usuário abandona no meio → tudo que foi confirmado persiste; volta onde parou.

---

## Fluxo 2 — Ritual matinal: "o que importa hoje?"

**Meta:** clareza em 5 segundos, zero cliques.

```
[Quarto] (manhã — luz âmbar entra pela janela)
→ Leitura ambiente imediata, sem interação:
   • Monitor aceso: "3 coisas hoje"
   • Post-it amarelo: "Prova de Anatomia em 2 dias"
   • Caderno aberto: tarefa em andamento de ontem
   • Caneca sem vapor: ainda não estudou hoje
→ (usuário decide)
   ├── Clica no monitor → [Dashboard] lista do dia priorizada pela IA
   ├── Clica no post-it → [Disciplina: Anatomia] direto na prova
   └── Ignora tudo e clica no rádio → ok também. O quarto não cobra. ✦
```

---

## Fluxo 3 — Iniciar sessão de foco (o fluxo mais importante do produto)

**Meta:** da intenção ao foco em **um clique** (caminho rápido) ou 3 toques (caminho completo).

```
CAMINHO RÁPIDO (1 clique):
[Qualquer lugar] → tecla F ou botão "▶ Focar"
→ ✦ luzes do quarto baixam, câmera fecha na mesa,
   rádio continua de onde estava, timer 25:00 inicia
→ objetivo sugerido automaticamente = tarefa nº 1 do dia

CAMINHO COMPLETO (3 interações):
[Quarto] → clica na luminária/pufe
→ [Setup de foco]
   1. "No que vamos trabalhar?" → sugestões da IA (tarefas de hoje) ou livre
   2. Duração: 25 / 50 / livre
   3. Som: manter atual / trocar estação / silêncio
→ [Sessão]
   • Tela limpa: timer grande, objetivo atual, vinil girando discreto
   • Notificações do sistema silenciadas (se permitido)
   • Pausa de 5min ao fim do ciclo: ✦ a chuva aumenta um pouco,
     "estica as pernas, pega uma água"
→ [Encerramento]
   • "Como foi?" → 😮‍💨 difícil / 🙂 ok / 🔥 rendeu  (1 toque, opcional)
   • Tempo registrado na tarefa e na disciplina
   • ✦ a caneca no quarto ganha vapor; o abajur fica um tom mais quente
   • Sugestão: "continuar +25min" / "concluir tarefa" / "voltar ao quarto"
```

**Exceções:**
- Usuário abandona a sessão no meio → registra o tempo parcial sem comentário negativo. **Nunca** "você falhou". Apenas: "18 minutos registrados".
- Fecha o navegador → sessão recuperada na volta ("quer retomar?").

---

## Fluxo 4 — Adicionar tarefa (captura rápida)

```
DE QUALQUER LUGAR:
Ctrl+K → digita "entregar relatório de física sexta"
→ IA interpreta: título="Entregar relatório", disciplina=Física (match),
  prazo=sexta-feira
→ [Toast de confirmação] com undo — não abre tela nenhuma ✦

DO CADERNO:
[Caderno] → "+ tarefa" → linha inline (título, enter)
→ detalhes opcionais expandem sob demanda (prazo, disciplina,
  esforço estimado, subtarefas)
```

---

## Fluxo 5 — IA cria um cronograma de prova

```
[Dashboard] alerta da Estuda: "A prova de Bioquímica é em 9 dias
e vocês ainda têm 4 capítulos. Quero montar um plano?"
→ (aceita)
→ [Chat IA] Estuda propõe plano dia a dia:
   seg: cap. 5 (50min) · ter: cap. 6 (50min) · qua: revisão+flashcards …
   — considera: aulas existentes, outras entregas, horário em que o
   usuário costuma estudar, sessões de foco médias dele
→ (usuário ajusta conversando: "quarta não posso")
→ IA redistribui → [Preview no calendário] blocos fantasma
→ "Confirmar plano" → sessões criadas no calendário,
   vinculadas à disciplina ✦
→ Cada sessão do plano vira um "▶ Focar" de um clique no dia certo
```

**Exceção:** usuário fura o plano 2 dias seguidos → a Estuda **replaneja silenciosamente** e avisa com gentileza: "Reorganizei o plano de Bioquímica pra caber no tempo que falta. Ainda dá tranquilo." Culpa zero, agência preservada.

---

## Fluxo 6 — Lançar nota e simular média

```
[Estante] → [Disciplina] → aba Provas & Notas
→ prova realizada pede nota (campo inline)
→ digita 6,5 → sistema recalcula média parcial
→ ✦ [Simulador] "para fechar com 7,0 você precisa de ≥ 7,4 na P2"
→ (risco detectado?) média projetada < corte
   → Estuda sugere: plano de revisão reforçado + mais sessões para
     essa disciplina no radar de carga
```

---

## Fluxo 7 — Interagir com o rádio

```
[Quarto] → clica no rádio (a câmera aproxima da mesa ✦)
→ [Rádio em close] interface skeumórfica mínima:
   dial de estações: LoFi · Chuva · Biblioteca · Cafeteria · White Noise
   knob de volume · botão de mix ("LoFi 70% + chuva 30%")
→ gira o dial → ✦ ruído de estática de 300ms entre estações (analógico)
→ Esc → câmera recua, música continua em todo o app
→ mini-controle persistente na dock (play/pause/estação)
```

---

## Fluxo 8 — Semana de sobrecarga (fluxo do Lucas)

```
[Dashboard] radar de carga mostra semana 14 em âmbar:
"3 entregas + 1 prova na mesma semana"
→ clica na semana → [Visão expandida] itens empilhados por dia,
  horas estimadas vs. horas disponíveis (calculadas da grade de aulas)
→ Estuda: "Se você adiantar o seminário de Sociologia para a semana 13,
  a 14 fica viável. Te mostro como?"
→ (aceita) → preview da redistribuição → confirma
→ ✦ radar reanima para verde-suave; post-it de alerta sai do monitor
```

---

## Fluxo 9 — Fim de semestre

```
Última prova lançada → ✦ [Cerimônia de encerramento]
→ "Retrospectiva do semestre" estilo wrapped:
   horas totais, disciplina mais estudada, melhor sequência,
   evolução de notas, momento mais difícil superado
→ compartilhável (imagem) — orgânico para aquisição
→ "Arquivar semestre e preparar o próximo?"
→ semestre arquivado vira livro guardado na estante de cima ✦
```

---

## Estados de erro e vazio (transversais)

| Situação | Tratamento |
|---|---|
| Sem tarefas hoje | "Hoje está livre. Aproveita — ou adianta algo da semana." (nunca tela vazia crua) |
| Sem conexão | Modo offline: leitura + captura local (sync depois). O rádio cai para sons baixados. |
| IA indisponível | Módulos funcionam 100% sem IA; chat mostra "A Estuda volta já" |
| Tarefa atrasada | Cinza-âmbar, nunca vermelho. "Reagendar para hoje?" em um clique |
| Primeira visita do dia após dias fora | "Bom te ver de volta 🌧️" + resumo do que mudou — jamais lista de culpas |
