# 12 — Estratégia de Apresentação do Projeto

Como apresentar o Nook — para banca acadêmica, investidores ou demo day. A regra de ouro: **o Nook não se explica, se sente**. A apresentação inteira é desenhada para reproduzir no público a emoção que o produto entrega.

## 1. A narrativa (espinha dorsal)

Estrutura em 3 atos, ~10 minutos:

### Ato 1 — A dor que ninguém nomeia (2 min)
Abrir **sem slide de capa**. Tela preta, depois:

> "São 22h de uma terça-feira. Marina tem prova sábado, trabalho quarta, e as informações disso estão em 6 lugares diferentes. Ela abre o Notion que montou no domingo… e fecha. Abre o YouTube e digita: *study with me*."

Então o dado: milhões de estudantes assistem outras pessoas estudando. **Pergunta-pivô ao público:** "Por que alguém assiste um vídeo de 2 horas de uma pessoa estudando em silêncio?" — pausa — "Porque as ferramentas resolveram a organização e esqueceram a *vontade de estudar*."

### Ato 2 — O lugar (5 min, demo ao vivo)
Não descrever o produto. **Entrar nele.**

Roteiro da demo (ensaiada, com dados realistas da persona Marina, à noite, com chuva):

1. **Entrada no quarto** — 5 segundos de silêncio proposital. Deixar o público *olhar*. O rádio toca baixo. (O som da apresentação importa: caixas boas, LoFi audível.)
2. **Leitura ambiente** — "Sem clicar em nada, Marina já sabe: post-it no monitor, prova em 2 dias. Caneca sem vapor: ainda não estudou hoje."
3. **Momento uau nº 1: ingestão** — arrastar um plano de ensino real em PDF → semestre montado em 30s, com pesos de nota e datas. "Isso no Notion são 2 horas. Aqui foi um arquivo."
4. **Momento uau nº 2: a Estuda** — "me ajuda com a prova de sábado?" → plano dia a dia que respeita as aulas e o horário noturno dela → 1 clique, calendário preenchido com blocos fantasma.
5. **Momento uau nº 3: foco em um clique** — tecla `F`: luz baixa, timer Fraunces gigante, chuva + LoFi. Deixar 8 segundos rolando em silêncio. **Este é o slide mais importante e não é um slide.**
6. **Fechamento da demo** — fim da sessão: vapor sobe da caneca, o abajur aquece. "O esforço dela mudou o quarto. Isso é o Nook."

### Ato 3 — Por que isso é um negócio (3 min)
- O quadrante vazio do [benchmark](03-benchmark.md): gestão forte × experiência acolhedora.
- A tese mensurável: aconchego → retorno → consistência → **retenção W4 ≥ 35%** (mostrar as métricas norte).
- Modelo freemium calmo + custo de IA sob controle (roteamento de modelos).
- Roadmap em 1 slide: Alpha Q3 → Beta com 3 universidades Q4 → lançamento no início do semestre 2027.
- Fechar com a frase-tese: **"Organização é a feature. Aconchego é o produto."**

## 2. Kit de materiais

| Material | Conteúdo | Uso |
|---|---|---|
| **Deck (12 slides)** | dor → insight → demo → mercado → tese/métricas → modelo → roadmap → time → ask | apresentação principal |
| **Protótipo navegável** | T01, T02, T03, T08 + rádio funcionais (Figma ou build real) | demo ao vivo + mesa de testes |
| **Vídeo de 60s** | entrada no quarto → foco → caneca com vapor, sem narração, só som ambiente | redes, e-mail de follow-up |
| **One-pager** | posicionamento, quadrante, métricas, contato | deixar com a banca/investidor |
| **Trilha sonora da sala** | LoFi do produto tocando baixo *antes* da apresentação começar | priming emocional |

Direção de arte do deck: as próprias cores do Lanterna (`#11151F`, tinta `#E8E4DA`, acento âmbar), Fraunces nos títulos, 1 ideia por slide, screenshots reais — o deck *parece* o produto.

## 3. Plano B e detalhes de palco

- **Demo gravada como fallback** (vídeo idêntico ao roteiro) caso wifi/build falhem; quem apresenta narra por cima.
- Dados da demo: semestre realista de Psicologia (nomes de disciplinas verossímeis), relógio do app travado em 21h40 com chuva — o estado mais bonito do produto.
- Ensaiar as 3 pausas de silêncio (entrada, foco, vapor). Silêncio é o efeito especial da apresentação.
- Modo apresentação no app: cursor maior, animações 20% mais lentas.

## 4. Perguntas difíceis — respostas prontas

| Pergunta | Resposta |
|---|---|
| "Isso não é só um skin bonito em cima de um to-do?" | O quarto é interface informacional (dashboard ambiente) e a IA tem contexto estruturado que to-dos não têm: fórmula de nota, carga, ritmo. O skin é a porta; o moat é o contexto. |
| "E quando a novidade do quarto passar?" | Por isso atalhos e dock existem desde o dia 1 e medimos `Ctrl+K` vs. cliques na cena. A hipótese não é "3D vende", é "lugar retém" — e W4 decide. |
| "Notion/Google podem copiar?" | Podem copiar telas; não podem copiar posicionamento sem canibalizar o próprio ("ferramenta séria de trabalho"). Nossa anti-persona é o usuário deles. |
| "Custo de IA?" | Heurística antes de LLM, Haiku para lotes, Sonnet só para planejamento, cotas por plano. Alvo: < US$ 0,40/usuário free/mês. |
| "Por que estudantes pagariam?" | Não precisam: gestão é grátis para sempre. Pagam por profundidade de IA e estética — o mesmo perfil que paga Forest e Flocus, agora com utilidade real. |

## 5. Estratégia de lançamento público (além do palco)

1. **Beta fechado com embaixadores**: 200 vagas via criadores de studygram/studytok BR — o produto é nativamente "instagramável" (quarto + wrapped).
2. **Timing**: lançamento na semana de volta às aulas (fev/2027) — o momento anual de "este semestre vai ser diferente".
3. **Loop orgânico**: retrospectiva compartilhável + "monte seu quarto" como conteúdo.
4. **Parcerias**: atléticas, centros acadêmicos e produtores LoFi independentes (estações com curadoria nomeada).

---

> Encerramento sugerido da apresentação, com o modo foco rodando atrás e a chuva no áudio:
>
> *"Toda geração de estudantes teve um lugar para estudar — a escrivaninha, a biblioteca, o café. Esta geração estuda numa aba do navegador, sozinha. O Nook devolve o lugar."*
