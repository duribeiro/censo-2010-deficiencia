# Dados

Fonte: IBGE, Censo Demográfico 2010, tabela "População residente por tipo de deficiência, segundo as Grandes Regiões e as Unidades da Federação".

A versão 0.0.1 usa um conjunto de dados estático e parcial. Os estados RJ, SP, PR, SC, RS, MS, MT, GO e DF não aparecem porque a tabela recebida como fonte já vinha cortada, sem essas linhas. A versão 0.0.2 vai buscar os números pela API pública do IBGE (SIDRA).

## Colunas

| Coluna | Significado |
|---|---|
| `totalPopulation` | População residente total do estado ou região. |
| `atLeastOne` | Pessoas com pelo menos um tipo de deficiência (visual, auditiva, motora ou mental/intelectual). |
| `visualCannot` | Pessoas que não conseguem enxergar de modo algum. Grau mais severo. |
| `visualSevere` | Pessoas com grande dificuldade permanente de enxergar. |
| `visualSome` | Pessoas com alguma dificuldade permanente de enxergar. |
| `hearingCannot` | Pessoas que não conseguem ouvir de modo algum. Grau mais severo. |
| `hearingSevere` | Pessoas com grande dificuldade permanente de ouvir. |
| `hearingSome` | Pessoas com alguma dificuldade permanente de ouvir. |
| `motorCannot` | Pessoas que não conseguem caminhar ou subir escadas de modo algum. Grau mais severo. |
| `motorSevere` | Pessoas com grande dificuldade permanente de caminhar ou subir escadas. |
| `motorSome` | Pessoas com alguma dificuldade permanente de caminhar ou subir escadas. |
| `mentalIntellectual` | Pessoas com deficiência mental ou intelectual. |
| `noDisability` | Pessoas que não declararam nenhuma dessas deficiências. |

## Notas da tabela original

- O total (`totalPopulation`) inclui pessoas sem declaração de deficiência.
- A contagem "pelo menos uma" (`atLeastOne`) soma pessoas com um ou mais tipos de deficiência, sem duplicar quem tem mais de um tipo.
- Os três graus de cada tipo (`Cannot`, `Severe`, `Some`) são conjuntos separados: somá-los dá o total daquele tipo.
- Tipos diferentes se sobrepõem: a mesma pessoa pode aparecer na deficiência visual e na motora. Somar os quatro tipos conta essa pessoa mais de uma vez.
- A deficiência mental ou intelectual (`mentalIntellectual`) não tem grau de severidade na tabela do IBGE: é uma contagem única, diferente das deficiências visual, auditiva e motora.
- Norte, mental/intelectual: a fonte traz 183.859 e a soma dos sete estados dá 183.869; o valor da fonte foi mantido até conferência com a tabela original do IBGE.
