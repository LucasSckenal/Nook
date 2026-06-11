# 07 — Design System "Lanterna"

> Nome interno do design system: **Lanterna** — a luz pequena e quente que torna o escuro acolhedor. Cada decisão visual responde a uma pergunta: *isso deixa o quarto mais calmo ou mais barulhento?*

## 1. Fundamentos conceituais

| Princípio | Significado prático |
|---|---|
| **Escuro é abrigo, não estilo** | O dark mode não é um tema alternativo — é o produto. Escuro como um quarto à noite, não como um IDE. |
| **Ma (間) — o vazio japonês** | Espaço negativo generoso. Cada tela respira. Densidade só onde o trabalho exige (calendário, listas). |
| **Luz como hierarquia** | Elevação por luminosidade e contraste, nunca por bordas ou sombras duras. O que importa "recebe luz". |
| **Wabi-sabi controlado** | Texturas sutis (grão de papel, ruído de filme a 2–4%) tiram o aspecto clínico do digital. |
| **Movimento com física, nunca com pressa** | Tudo se move como objetos reais: inércia, ease orgânico, nada "pula". |

## 2. Cor

### 2.1 Paleta-base (Noite no quarto)

```
FUNDOS (do mais profundo ao mais elevado)
--nk-bg-void:      #0B0E14   fundo absoluto (atrás do quarto)
--nk-bg-room:      #11151F   base da cena / canvas dos módulos
--nk-bg-surface:   #171C28   cards, painéis
--nk-bg-raised:    #1E2433   elementos elevados, modais, popovers
--nk-bg-overlay:   #11151FE6 overlays (90% alpha + blur 24px)

TINTAS (texto e ícones)
--nk-ink-high:     #E8E4DA   texto primário — branco-papel quente (nunca #FFF)
--nk-ink-mid:      #A8A49A   texto secundário
--nk-ink-low:      #6B6A66   terciário, placeholders
--nk-ink-faint:    #3D4150   divisores, desenhos de linha

LUZ (acentos — a lanterna)
--nk-amber:        #E8A87C   âmbar-lanterna: ações primárias, foco, calor
--nk-amber-glow:   #E8A87C33 halo de 20% para estados ativos
--nk-moss:         #9CAF88   verde-musgo: sucesso, conclusão, crescimento
--nk-mist:         #8FA8BF   azul-névoa: informação, links, calma
--nk-clay:         #C97B63   terracota: atenção, prazos próximos (NUNCA vermelho-alarme)
--nk-lavender:     #A99BC4   lavanda: IA / Estuda (tudo que a IA toca usa este tom)
```

**Regra inegociável:** não existe `#FF0000` nem vermelho saturado em lugar nenhum do produto. Urgência máxima = `--nk-clay` com peso tipográfico maior. A calma é sistêmica.

### 2.2 Cores de disciplina (paleta dessaturada de 10)

Atribuídas automaticamente, escolhíveis depois. Todas com a mesma luminância percebida (~65%) para nenhuma gritar:

`#C9A0A0 rosé · #A0B8C9 céu · #A8C9A0 folha · #C9C2A0 trigo · #B3A0C9 íris · #A0C9C2 lago · #C9ADA0 pêssego · #A0A8C9 anil · #BFC9A0 lima-suave · #C9A0BC malva`

Uso: lombadas na estante, blocos de aula no calendário (a 70% de saturação), tags.

### 2.3 Temas do quarto (variações ambientais)

| Tema | Mutação | Desbloqueio |
|---|---|---|
| **Meia-noite** (default) | paleta base | — |
| **Entardecer** | fundos puxam para #1A1620, âmbar mais rosado | 10 sessões de foco |
| **Madrugada de chuva** | fundos #0E1218 azulados, mist como acento | 25 sessões |
| **Lampião** | fundos #16130E acastanhados, âmbar intenso | fim de 1 semestre |

Temas mudam só as variáveis — componentes intactos (tudo via CSS custom properties).

## 3. Tipografia

| Papel | Fonte | Justificativa |
|---|---|---|
| **Display & números do timer** | *Fraunces* (serif soft, optical sizing) | Calor editorial; o timer do foco em Fraunces Light 96px é assinatura visual |
| **Interface** | *Inter* (variable) | Legibilidade utilitária impecável em densidade |
| **Anotações do usuário** | *Lora* (opcional, escolha do usuário) | Sensação de caderno |
| **Mono (notas de código)** | *JetBrains Mono* | — |

### Escala (base 16px, razão 1.25)

```
--nk-text-xs:   12px / 16px   metadados, timestamps
--nk-text-sm:   14px / 20px   secundário, labels
--nk-text-md:   16px / 24px   corpo padrão
--nk-text-lg:   20px / 28px   títulos de card
--nk-text-xl:   25px / 32px   títulos de módulo (Fraunces)
--nk-text-2xl:  31px / 38px   saudações, momentos ("Boa noite, Marina")
--nk-text-hero: 96px / 1      timer do foco (Fraunces Light)
```

Regras: corpo nunca abaixo de 14px; `--nk-ink-high` reservado a conteúdo que o usuário precisa ler agora; títulos em sentence case (nunca CAPS — caps gritam).

## 4. Espaçamento, grid e forma

- **Escala de 4**: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96. Padding interno de cards: 24. Respiro entre seções: 48.
- **Grid**: 12 colunas, gutter 24, máx. 1280px de conteúdo dentro dos módulos. O quarto é full-bleed.
- **Raios**: `--nk-radius-sm: 8px` (inputs, chips) · `--nk-radius-md: 12px` (cards) · `--nk-radius-lg: 20px` (modais, painéis) · `--nk-radius-full` (avatares, knobs). Nada de canto reto — cantos retos são mobília de escritório.
- **Elevação**: por cor de fundo + glow, não por drop-shadow preta:
  - nível 0: `--nk-bg-room`
  - nível 1: `--nk-bg-surface` + `box-shadow: 0 0 0 1px #FFFFFF08`
  - nível 2: `--nk-bg-raised` + `box-shadow: 0 8px 32px #00000040, 0 0 0 1px #FFFFFF0A`
  - foco/ativo: anel `--nk-amber-glow` de 3px (substitui o outline azul do browser)

## 5. Iconografia & ilustração

- **Ícones**: linha 1.5px, cantos arredondados, 20×20 padrão (Lucide como base, customizados onde a metáfora pede: caneca, rádio, estante).
- **Ilustração do quarto**: 2.5D em camadas (5–7 planos de parallax), estilo *flat com luz volumétrica* — referência: ilustrações de capa LoFi, Ghibli noturno, sem outline preto.
- **Mascote implícito**: um **gato** dorme em lugares variados do quarto. Não fala, não notifica, não atrapalha. Existe para ser notado — pequena alegria de quem repara. (No modo foco, ele dorme na mesa.)

## 6. Motion

| Token | Valor | Uso |
|---|---|---|
| `--nk-ease-room` | `cubic-bezier(0.22, 1, 0.36, 1)` | câmera do quarto, transições de cena |
| `--nk-ease-ui` | `cubic-bezier(0.4, 0, 0.2, 1)` | componentes |
| `--nk-dur-instant` | 120ms | hovers, toggles |
| `--nk-dur-quick` | 240ms | cards, dropdowns |
| `--nk-dur-scene` | 600ms | zoom de câmera quarto→módulo |
| `--nk-dur-ambient` | 2000ms+ | luz, clima, vapor da caneca |

Coreografias-assinatura:
1. **Zoom de câmera**: scale+translate na cena com leve blur de movimento; o módulo "revela" por cima com stagger de 60ms nos cards.
2. **Concluir tarefa**: checkbox desenha um traço de caneta (180ms), linha ganha tom musgo e *assenta* 2px para baixo — como papel.
3. **Fim de sessão de foco**: o âmbar do quarto aquece 5% por 3s; vapor sobe da caneca.
4. **Chuva**: partículas a 12fps de propósito (estética stop-motion, menos CPU).

**Acessibilidade**: `prefers-reduced-motion` troca zooms por crossfade 200ms e congela clima/partículas. Toggle interno "densidade de animação: cheia / reduzida / mínima".

## 7. Som (parte do design system)

| Evento | Som | Volume |
|---|---|---|
| Concluir tarefa | grafite riscando papel, 90ms | -28dB |
| Entrar no foco | acorde de fita cassete, 400ms | -24dB |
| Troca de estação | estática analógica, 300ms | -20dB |
| Notificação interna | toque único de marimba | -26dB |

Tudo desligável em um toggle só ("sons da interface"). Nunca tocar som de UI por cima de fala/aviso.

## 8. Componentes (inventário)

### Primitivos
`Button` (primary âmbar / ghost / quiet) · `Input` · `Textarea` · `Select` · `Checkbox` (traço de caneta) · `Radio` · `Switch` · `Chip/Tag` (cor de disciplina) · `Tooltip` · `Toast` (canto inferior, com undo) · `Modal` · `Popover` · `Tabs` · `Avatar` · `ProgressRing` · `Skeleton` (shimmer âmbar 8%)

### Compostos
`TaskRow` (checkbox + título + disciplina-tag + prazo + ▶focar) · `SubjectSpine` (lombada da estante) · `SubjectCard` · `ExamCard` (com contagem regressiva serena: "em 9 dias") · `LoadRadar` (heatmap 4 semanas) · `CalendarBlock` (aula/prova/entrega/fantasma) · `StatTile` · `AIMessage` + `AIArtifact` (plano/resumo/deck dentro do chat, sempre com borda lavanda 1px) · `RadioDial` · `VolumeKnob` · `FocusTimer` · `MoodPicker` (3 emojis) · `EmptyState` (sempre com ilustração + frase gentil + uma ação)

### Padrões
- **Confirmação destrutiva**: modal com a consequência escrita por extenso; botão destrutivo é ghost-clay, nunca preenchido.
- **Undo em tudo**: toda ação reversível mostra toast com undo por 6s (apagar, concluir, reagendar).
- **Loading**: skeletons sempre; nunca spinner de página inteira. A IA "pensando" = três pontos lavanda pulsando devagar.
- **Microcopy**: voz da interface = colega de quarto gentil. Sempre na primeira pessoa do plural quando há esforço conjunto ("vamos por aqui"), nunca imperativos secos ("FAÇA"). Proibido: "você falhou", "atrasado!" com exclamação, qualquer comparativo social.

## 9. Tokens — arquivo fonte

Tokens versionados em `tokens.json` (Style Dictionary) → exporta CSS vars, TS const e tema Tailwind. Nome de token sempre `nk-<categoria>-<papel>` (semântico), nunca `nk-blue-400` exposto a componente.

## 10. Governança

- Storybook com cena de fundo `--nk-bg-room` (componentes nunca avaliados sobre branco).
- Checklist de PR de UI: contraste AA mínimo (texto `ink-mid` sobre `surface` = 5.2:1 ✓), estados hover/focus/disabled/loading, reduced-motion, microcopy revisada contra a lista proibida.
