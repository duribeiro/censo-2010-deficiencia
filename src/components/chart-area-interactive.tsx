import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis } from "recharts"

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
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  countryRow,
  getTypeMeta,
  statePercents,
  typeTotal,
  type CensusRow,
} from "@/data/census-2010"
import { formatPercent, share } from "@/lib/format"
import { REGION_OPTIONS, useFilters } from "@/lib/filters"

const REGION_LABELS: Record<string, string> = Object.fromEntries(
  REGION_OPTIONS.map((option) => [option.id, option.label])
)

export function RegionToggle({
  region,
  onRegionChange,
}: {
  region: string
  onRegionChange: (region: string) => void
}) {
  return (
    <>
      <ToggleGroup
        multiple={false}
        value={[region]}
        onValueChange={(value) => onRegionChange(String(value[0] ?? ""))}
        variant="outline"
        className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
      >
        {REGION_OPTIONS.map((option) => (
          <ToggleGroupItem key={option.label} value={option.id}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      <Select
        items={REGION_LABELS}
        value={region}
        onValueChange={(value) => {
          if (typeof value === "string") onRegionChange(value)
        }}
      >
        <SelectTrigger
          className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
          size="sm"
          aria-label="Selecionar região"
        >
          <SelectValue placeholder="Brasil" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {REGION_OPTIONS.map((option) => (
            <SelectItem key={option.label} value={option.id} className="rounded-lg">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}

export function ChartAreaInteractive({ rows }: { rows: CensusRow[] }) {
  const { region, type, setRegion, setStateId } = useFilters()
  const meta = type ? getTypeMeta(type) : null
  const color = meta ? meta.color : "#60a5fa"

  const chartData = statePercents(rows, region, type)
  const country = countryRow(rows)
  const countryValue = share(
    type ? typeTotal(country, type) : country.atLeastOne,
    country.totalPopulation
  )

  const chartConfig: ChartConfig = {
    value: {
      label: meta ? `Deficiência ${meta.label.toLowerCase()}` : "Pelo menos uma",
      color,
    },
  }

  const title = meta
    ? `Deficiência ${meta.label.toLowerCase()} por estado`
    : "Pelo menos uma deficiência por estado"

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Percentual da população de cada estado, do maior para o menor
          </span>
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
            <defs>
              <linearGradient id="fillStateValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.8} />
                <stop offset="95%" stopColor={color} stopOpacity={0.1} />
              </linearGradient>
            </defs>
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
                  formatter={(value) => (
                    <div className="flex flex-1 items-center justify-between gap-4 leading-none">
                      <span className="text-muted-foreground">
                        {chartConfig.value.label}
                      </span>
                      <span className="font-mono font-medium text-foreground tabular-nums">
                        {formatPercent(Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <ReferenceLine
              y={countryValue}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              label={{
                value: `Brasil ${formatPercent(countryValue)}`,
                position: "insideTopLeft",
                fill: "var(--muted-foreground)",
                fontSize: 12,
              }}
            />
            <Area
              dataKey="value"
              type="natural"
              fill="url(#fillStateValue)"
              stroke={color}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
