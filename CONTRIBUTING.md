# Como contribuir

Obrigado por considerar contribuir com o painel do Censo 2010 sobre pessoas com deficiência. Toda contribuição é bem-vinda: código, dados, documentação, testes, tradução ou acessibilidade.

## Abrindo uma issue

Antes de codar, abra uma issue descrevendo o problema ou a melhoria. Use os templates de bug ou de sugestão. Issues em branco não são aceitas: escolha o template que combina com o seu caso.

## Fluxo de contribuição

1. Faça um fork do repositório.
2. Crie uma branch a partir de `main` com um nome descritivo, por exemplo `feat/filtro-por-tipo` ou `fix/tabela-ordenacao`.
3. Faça as mudanças e confirme que passam localmente:
   ```bash
   npm run lint
   npm run build
   ```
4. Abra um pull request para `main` usando o template do repositório.
5. Aguarde a revisão de um mantenedor.

## Convenções de código

- Identificadores (variáveis, funções, componentes, arquivos) em inglês.
- Textos visíveis na interface em português.
- Nunca usar travessão ((U+2014)) ou traço médio ((U+2013)) em nenhum texto, código, commit ou documento. Use vírgula, ponto, dois-pontos ou parênteses.
- `npm run lint` e `npm run build` precisam passar antes de abrir o pull request.

## Mensagens de commit

Este projeto segue [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/):

```
feat: adiciona filtro por tipo de deficiência
fix: corrige ordenação da tabela por coluna numérica
docs: atualiza instruções de instalação
```

Tipos comuns: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`.

## Política de revisão

- Todo pull request precisa de pelo menos uma aprovação de um mantenedor antes de ser mesclado.
- O CI precisa estar verde (lint e build passando).
- Não há merge automático para pull requests de pessoas: toda mesclagem é feita manualmente por um mantenedor após revisão humana. A única exceção é a atualização pequena do Dependabot, descrita na seção abaixo, e mesmo essa só mescla depois da aprovação exigida.

## Revisão automática

Todo pull request recebe um comentário de revisão automática, feito por uma inteligência artificial. Ela aponta bugs, problemas de segurança e código complexo demais, mas nunca aprova nem mescla o pull request sozinha: essa decisão continua sendo de um mantenedor.

Qualquer pessoa pode pedir ajuda a qualquer momento escrevendo `@claude` em um comentário do pull request ou da issue.

Atualizações pequenas do Dependabot (patch e minor) entram sozinhas no repositório, mas só depois da aprovação do mantenedor e do CI passando. Saltos de versão maior (major) nunca entram sozinhos: continuam exigindo revisão manual.

## Boas primeiras tarefas

Se você quer começar mas não sabe por onde, veja estas frentes:

- Completar os estados que faltam no conjunto de dados (RJ, SP, PR, SC, RS, MS, MT, GO, DF).
- Integrar a API pública do IBGE (SIDRA) para a versão 0.0.2.
- Escrever testes para os componentes e para a lógica de filtros.
- Melhorar acessibilidade (leitor de tela, navegação por teclado, contraste).
- Traduzir a interface para outros idiomas.
