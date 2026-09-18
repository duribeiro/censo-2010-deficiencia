import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  cannotAtAllTotal,
  countryRow,
  DISABILITY_TYPES,
  getTypeMeta,
  scopeRow,
  typeTotal,
  type CensusRow,
  type DisabilityTypeId,
} from "@/data/census-2010"
import {
  formatCompact,
  formatNumber,
  formatPercent,
  formatPoints,
  share,
} from "@/lib/format"
import { useFilters } from "@/lib/filters"

interface CardData {
  description: string
  value: string
  badge?: string
  footerTitle: string
  footerNote: string
}

function buildCards(
  rows: CensusRow[],
  region: string,
  stateId: string,
  type: DisabilityTypeId | ""
): CardData[] {
  const scope = scopeRow(rows, region, stateId)
  const country = countryRow(rows)
  const isCountry = scope.id === country.id
  const population: CardData = {
    description: "População",
    value: formatCompact(scope.totalPopulation),
    badge: isCountry
      ? undefined
      : formatPercent(share(scope.totalPopulation, country.totalPopulation)),
    footerTitle: `${formatNumber(scope.totalPopulation)} pessoas`,
    footerNote: isCountry
      ? "População recenseada em 2010"
      : `Participação de ${scope.name} na população do país`,
  }

  if (type) {
    const meta = getTypeMeta(type)
    const total = typeTotal(scope, meta.id)
    const rest: CardData[] = meta.severities.length
      ? [
          {
            description: "Não conseguem de modo algum",
            value: formatCompact(scope[meta.severities[0].key] as number),
            footerTitle: formatPercent(
              share(scope[meta.severities[0].key] as number, scope.totalPopulation)
            ),
            footerNote: "Grau mais severo declarado no Censo",
          },
          {
            description: "Grande dificuldade",
            value: formatCompact(scope[meta.severities[1].key] as number),
            footerTitle: formatPercent(
              share(scope[meta.severities[1].key] as number, scope.totalPopulation)
            ),
            footerNote: "Grau intermediário declarado no Censo",
          },
        ]
      : [
          {
            description: "Sem nenhuma deficiência",
            value: formatCompact(scope.noDisability),
            footerTitle: formatPercent(
              share(scope.noDisability, scope.totalPopulation)
            ),
            footerNote: "Pessoas sem nenhuma das deficiências investigadas",
          },
          {
            description: "Pelo menos uma deficiência",
            value: formatPercent(share(scope.atLeastOne, scope.totalPopulation)),
            footerTitle: `${formatNumber(scope.atLeastOne)} pessoas`,
            footerNote: "Considerando todos os tipos investigados",
          },
        ]

    return [
      {
        description: `Deficiência ${meta.label.toLowerCase()}`,
        value: formatPercent(share(total, scope.totalPopulation)),
        badge: isCountry
          ? undefined
          : formatPoints(
              share(total, scope.totalPopulation) -
                share(typeTotal(country, meta.id), country.totalPopulation)
            ),
        footerTitle: `${formatNumber(total)} pessoas em ${scope.name}`,
        footerNote: meta.severities.length
          ? "Soma dos três graus de dificuldade declarados"
          : "Único grau declarado no Censo",
      },
      population,
      ...rest,
    ]
  }

  const scopeShare = share(scope.atLeastOne, scope.totalPopulation)
  const countryShare = share(country.atLeastOne, country.totalPopulation)
  const ranked = DISABILITY_TYPES.map((meta) => ({
    meta,
    total: typeTotal(scope, meta.id),
  })).sort((a, b) => b.total - a.total)
  const top = ranked[0]
  const cannot = cannotAtAllTotal(scope)

  return [
    {
      description: "Pelo menos uma deficiência",
      value: formatPercent(scopeShare),
      badge: isCountry ? undefined : formatPoints(scopeShare - countryShare),
      footerTitle: `${formatNumber(scope.atLeastOne)} pessoas em ${scope.name}`,
      footerNote:
        "Pessoas com uma ou mais deficiências visual, auditiva, motora ou mental / intelectual",
    },
    population,
    {
      description: "Tipo mais comum",
      value: top.meta.label,
      badge: formatPercent(share(top.total, scope.totalPopulation)),
      footerTitle: `${formatNumber(top.total)} pessoas`,
      footerNote: `Maior contagem entre os quatro tipos em ${scope.name}`,
    },
    {
      description: "Não conseguem ver, ouvir ou andar",
      value: formatCompact(cannot),
      badge: formatPercent(share(cannot, scope.totalPopulation)),
      footerTitle: `${formatNumber(cannot)} casos declarados nos três tipos`,
      footerNote: "Casos com grau mais severo",
    },
  ]
}

export function SectionCards({ rows }: { rows: CensusRow[] }) {
  const { region, stateId, type } = useFilters()
  const cards = buildCards(rows, region, stateId, type)

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {cards.map((card) => (
        <Card key={card.description} className="@container/card">
          <CardHeader>
            <CardDescription>{card.description}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.value}
            </CardTitle>
            {card.badge ? (
              <CardAction>
                <Badge variant="outline">{card.badge}</Badge>
              </CardAction>
            ) : null}
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {card.footerTitle}
            </div>
            <div className="text-muted-foreground">{card.footerNote}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
