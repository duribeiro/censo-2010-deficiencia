import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { RegionToggle } from "@/components/chart-area-interactive"
import {
  DISABILITY_TYPES,
  findRow,
  getTypeMeta,
  statePercents,
  typeTotal,
  type CensusRow,
} from "@/data/census-2010"
import { formatPercent, share } from "@/lib/format"
import { useFilters } from "@/lib/filters"

interface Series {
  key: string
  label: string
  color: string
}

/** Same hue, weaker alpha for the milder severity levels. */
const SEVERITY_ALPHA = ["", "99", "4d"]

const OVERLAP_DESCRIPTION =
  "Percentual da população de cada estado com cada tipo de deficiência. Uma pessoa pode ter mais de um tipo, por isso as áreas se sobrepõem em vez de somar."

export function ChartTypesByState({ rows }: { rows: CensusRow[] }) {
  const { region, type, setRegion, setStateId } = useFilters()
  const meta = type ? getTypeMeta(type) : null

  const series: Series[] = meta
    ? meta.severities.length
      ? meta.severities.map((level, index) => ({
          key: String(level.key),
          label: level.label,
          color: `${meta.color}${SEVERITY_ALPHA[index]}`,
        }))
      : [{ key: String(meta.totalKey), label: meta.label, color: meta.color }]
    : DISABILITY_TYPES.map((item) => ({
        key: item.id,
        label: item.label,
        color: item.color,
      }))

  const order = statePercents(rows, region, type)
  const chartData = order.map((entry) => {
    const row = findRow(rows, entry.id)!
    const point: Record<string, string | number> = { id: row.id, name: row.name }
    for (const item of series) {
      const raw = meta
        ? (row[item.key as keyof CensusRow] as number)
        : typeTotal(row, item.key as (typeof DISABILITY_TYPES)[number]["id"])
      point[item.key] = share(raw, row.totalPopulation)
    }
    return point
  })

  // Severity levels of one type are disjoint, so they stack. The four types
  // are not: a person can have more than one, so they overlap instead.
  const stacked = Boolean(meta) && series.length > 1
  const title = meta
    ? `Deficiência ${meta.label.toLowerCase()} por ${stacked ? "grau" : "estado"}`
    : "Tipos de deficiência por estado"
  const subtitle = stacked
    ? "Percentual da população de cada estado, empilhado por grau de dificuldade"
    : meta
      ? "Percentual da população de cada estado, grau único declarado no Censo"
      : OVERLAP_DESCRIPTION

  const chartConfig: ChartConfig = Object.fromEntries(
    series.map((item) => [item.key, { label: item.label, color: item.color }])
  )

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">{subtitle}</span>
          <span className="@[540px]/card:hidden">Percentual por estado</span>
        </CardDescription>
        <CardAction>
          <RegionToggle region={region} onRegionChange={setRegion} />
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart
            data={chartData}
            onClick={(state) => {
              if (state.activeLabel) setStateId(String(state.activeLabel))
            }}
          >
            {stacked ? null : (
              <defs>
                {series.map((item) => (
                  <linearGradient
                    key={item.key}
                    id={`fillType-${item.key}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={item.color} stopOpacity={0.5} />
                    <stop offset="95%" stopColor={item.color} stopOpacity={0.05} />
                  </linearGradient>
                ))}
              </defs>
            )}
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="id"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval="preserveStartEnd"
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(_, payload) =>
                    String(payload?.[0]?.payload?.name ?? "")
                  }
                  formatter={(value, name) => (
                    <div className="flex flex-1 items-center justify-between gap-4 leading-none">
                      <span className="text-muted-foreground">
                        {chartConfig[String(name)]?.label ?? String(name)}
                      </span>
                      <span className="font-mono font-medium text-foreground tabular-nums">
                        {formatPercent(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {series.map((item) => (
              <Area
                key={item.key}
                dataKey={item.key}
                type="natural"
                stackId={stacked ? "a" : undefined}
                fill={
                  stacked
                    ? `var(--color-${item.key})`
                    : `url(#fillType-${item.key})`
                }
                fillOpacity={stacked ? 1 : 0.8}
                stroke={`var(--color-${item.key})`}
                strokeWidth={2}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
