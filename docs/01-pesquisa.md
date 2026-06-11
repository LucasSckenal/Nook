# 01 — Pesquisa do Problema

## 1. Contexto

O estudante universitário brasileiro (e global) vive uma rotina fragmentada: 5–8 disciplinas simultâneas, cada uma com seu próprio ritmo de entregas, provas, trabalhos em grupo e materiais espalhados entre Moodle/AVA, WhatsApp, Google Drive, e-mail e papel. A carga cognitiva de **lembrar o que existe** muitas vezes supera a carga de **fazer o que precisa ser feito**.

Paralelamente, cresceu uma cultura inteira em torno do *ato* de estudar como experiência: vídeos "Study With Me" com milhões de visualizações, a LoFi Girl com audiências simultâneas na casa das dezenas de milhares, apps de som ambiente, cafés virtuais no Discord. Essa cultura revela algo que nenhuma ferramenta de produtividade endereçou: **estudantes não buscam apenas eficiência — buscam companhia, atmosfera e ritual.**

## 2. O problema em camadas

### Camada funcional (o que as ferramentas atuais resolvem)
- Organizar disciplinas, tarefas e provas
- Visualizar agenda
- Controlar entregas

### Camada comportamental (o que resolvem mal)
- **Consistência**: 70%+ dos sistemas de organização pessoal são abandonados nas primeiras semanas (efeito "setup perfeito, uso zero" — clássico em usuários de Notion)
- **Procrastinação**: a ferramenta mostra a lista, mas não ajuda a *começar*
- **Visão de carga**: o estudante não percebe que a semana 12 do semestre vai esmagá-lo até estar dentro dela

### Camada emocional (o que nenhuma resolve)
- Ferramentas de produtividade são **frias**: grids, tabelas, branco clínico ou dark mode corporativo
- Abrir a ferramenta gera **ansiedade** (lista de pendências = lista de culpas)
- Não existe **senso de lugar**: o estudante não "vai" estudar em lugar nenhum, ele abre uma aba
- Falta **recompensa intrínseca**: nada no uso da ferramenta é agradável em si

## 3. Evidências e sinais de mercado

| Sinal | O que indica |
|---|---|
| LoFi Girl: 14M+ inscritos, streams 24/7 com dezenas de milhares de pessoas simultâneas | Demanda massiva por *atmosfera de estudo compartilhada* |
| "Study With Me" é um gênero consolidado no YouTube/Twitch (vídeos de 2–12h) | Estudantes pagam atenção por *companhia ambiente*, não conteúdo |
| Forest (app de foco gamificado) passou de 10M downloads pagos | Disposição a pagar por foco com camada emocional |
| Notion é massivamente adotado e massivamente abandonado por estudantes | Flexibilidade demais = fricção; falta opinião de produto |
| Crescimento de apps como Flocus, Lifeat, Study Together | Categoria "ambiente virtual de foco" emergindo, mas sem camada de *gestão acadêmica* |
| Pesquisas sobre saúde mental universitária apontam ansiedade e burnout como queixas dominantes | Produtividade "agressiva" (streaks punitivos, vermelho de atraso) agrava o problema que diz resolver |

**A lacuna:** existem ferramentas de organização sem atmosfera, e ferramentas de atmosfera sem organização. Ninguém uniu as duas com IA contextual em cima.

## 4. Dores priorizadas (da pesquisa com estudantes)

Síntese de dores recorrentes em entrevistas/fóruns (r/GetStudying, r/college, comunidades BR de estudo):

1. **"Eu esqueço que a entrega existe até a véspera"** → falta de visão antecipada de carga
2. **"Eu organizo tudo no domingo e abandono na quarta"** → fricção de manutenção do sistema
3. **"Sentar pra estudar é a parte mais difícil"** → custo de iniciação alto
4. **"Não sei se estou estudando o suficiente"** → ausência de feedback sobre esforço
5. **"Minhas coisas estão em 6 lugares diferentes"** → fragmentação
6. **"Apps de produtividade me dão ansiedade"** → estética e tom punitivos
7. **"Estudar sozinho é solitário"** → ausência de companhia/ritual

## 5. Jobs To Be Done

> **JTBD principal:** "Quando preciso dar conta do semestre, quero um lugar único que organize tudo por mim e me receba bem, para que eu estude com consistência sem me sentir esmagado."

Jobs secundários:
- *Quando abro a ferramenta de manhã*, quero saber em 5 segundos o que importa hoje, *para não gastar energia decidindo*.
- *Quando vou começar a estudar*, quero entrar num ritual que reduza a fricção de iniciar, *para vencer a procrastinação*.
- *Quando o semestre aperta*, quero ser avisado **antes** da semana crítica, *para redistribuir esforço a tempo*.
- *Quando termino uma sessão*, quero ver meu esforço reconhecido, *para sentir progresso mesmo sem nota*.

## 6. Hipóteses de produto

| # | Hipótese | Métrica de validação |
|---|---|---|
| H1 | Um ambiente acolhedor aumenta a frequência de retorno vs. ferramenta neutra | DAU/WAU ≥ 50% após semana 4 |
| H2 | Reduzir a fricção de iniciar sessão (1 clique → modo foco com som) aumenta horas estudadas | ≥ 3 sessões de foco/semana por usuário ativo |
| H3 | IA que ingere o plano de ensino elimina o custo de setup que mata o Notion | ≥ 80% dos usuários com disciplinas criadas em < 10 min |
| H4 | Alertas antecipados de carga reduzem entregas perdidas | < 5% de tarefas vencidas sem interação |
| H5 | Estatísticas gentis (sem streak punitivo) sustentam motivação melhor que gamificação agressiva | Retenção M2 ≥ 40% |

## 7. Princípios de produto (decorrentes da pesquisa)

1. **Calma é feature.** Nada pisca, nada grita, nada culpa. Atraso é informado com serenidade, nunca com vermelho-alarme.
2. **Cinco segundos para clareza.** Ao entrar, o usuário sabe o que importa hoje sem clicar em nada.
3. **Começar deve custar um clique.** Do quarto ao modo foco com música: uma interação.
4. **A IA faz o trabalho chato.** Setup, cronogramas, redistribuição de carga — o estudante decide, a IA executa.
5. **Progresso visível, culpa invisível.** Celebramos o que foi feito; o que não foi feito apenas se reorganiza.
6. **O quarto é seu.** Personalização gradual cria vínculo emocional e senso de posse.
