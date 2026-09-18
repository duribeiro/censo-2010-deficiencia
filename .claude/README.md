# Agentes gstack deste projeto

Os agentes em `agents/gstack-*.md` são adaptações fixas dos skills de revisão do
[gstack](https://github.com/garrytan/gstack), de Garry Tan. O gstack é distribuído
sob licença MIT (Copyright (c) 2026 Garry Tan). O texto de cada agente cita, em um
comentário no topo do arquivo, de qual skill do gstack ele foi adaptado.

Esses agentes são fixos no repositório, ao contrário dos agentes temporários do
gstack: qualquer colaborador do projeto já os tem disponíveis, sem instalar nada.

## Agentes disponíveis

| Nome | Baseado em | Faz o quê |
|---|---|---|
| `gstack-code-reviewer` | `review/SKILL.md` | Revisão de código: bugs, segurança, simplicidade |
| `gstack-qa` | `qa/SKILL.md` | QA do app rodando: fluxos, erros de console, regressões |
| `gstack-design-reviewer` | `design-review/SKILL.md` | Revisão visual: consistência com shadcn/ui e acessibilidade |
| `gstack-release-checker` | `ship/SKILL.md` (parte de pré-checagem) | Checklist antes de lançar: lint, build, regras do projeto |

Todos são apenas leitura: encontram problemas, não editam código.

## Como chamar um agente

Basta citar o nome dele no pedido, no Claude Code:

> "use o agente gstack-code-reviewer para revisar o diff"

> "chame o gstack-qa para testar o fluxo de login"

> "roda o gstack-release-checker antes de eu abrir o PR"

## Atribuição

Adaptado de https://github.com/garrytan/gstack, licença MIT.
