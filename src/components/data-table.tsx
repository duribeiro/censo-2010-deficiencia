import * as React from "react"

import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  countryRow,
  getTypeMeta,
  regionRows,
  statesOf,
  typeTotal,
  type CensusRow,
  type DisabilityTypeId,
} from "@/data/census-2010"
import { formatNumber, formatPercent, share } from "@/lib/format"
import { REGION_OPTIONS, useFilters } from "@/lib/filters"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

const COUNTRY_TAB = "BRASIL"

const TAB_OPTIONS = REGION_OPTIONS.map((option) => ({
  id: option.id || COUNTRY_TAB,
  region: option.id,
  label: option.label,
}))

interface SortState {
  key: string
  ascending: boolean
  type: DisabilityTypeId | ""
}

interface Column {
  key: string
  label: string
  group?: string
  get: (row: CensusRow) => number
  percent?: boolean
}

function buildColumns(type: DisabilityTypeId | ""): Column[] {
  const population: Column = {
    key: "totalPopulation",
    label: "População",
    get: (row) => row.totalPopulation,
  }

  if (type) {
    const meta = getTypeMeta(type)
    const total: Column = {
      key: `total-${meta.id}`,
      label: meta.label,
      get: (row) => typeTotal(row, meta.id),
    }
    const percent: Column = {
      key: `percent-${meta.id}`,
      label: "%",
      percent: true,
      get: (row) => share(typeTotal(row, meta.id), row.totalPopulation),
    }
    if (!meta.severities.length) {
      return [
        population,
        total,
        percent,
        {
          key: "noDisability",
          label: "Nenhuma",
          get: (row) => row.noDisability,
        },
      ]
    }
    return [
      population,
      total,
      percent,
      ...meta.severities.map((level, index) => ({
        key: String(level.key),
        group: meta.label,
        label: ["Não consegue", "Grande dif.", "Alguma dif."][index],
        get: (row: CensusRow) => row[level.key] as number,
      })),
    ]
  }

  const severityColumns = (["visual", "hearing", "motor"] as const).flatMap(
    (id) => {
      const meta = getTypeMeta(id)
      return meta.severities.map((level, index) => ({
        key: String(level.key),
        group: meta.label,
        label: ["Não consegue", "Grande dif.", "Alguma dif."][index],
        get: (row: CensusRow) => row[level.key] as number,
      }))
    }
  )

  return [
    population,
    {
      key: "atLeastOne",
      label: "Pelo menos uma",
      get: (row) => row.atLeastOne,
    },
    {
      key: "atLeastOnePercent",
      label: "%",
      percent: true,
      get: (row) => share(row.atLeastOne, row.totalPopulation),
    },
    ...severityColumns,
    {
      key: "mentalIntellectual",
      label: "Mental / intel.",
      get: (row) => row.mentalIntellectual,
    },
    { key: "noDisability", label: "Nenhuma", get: (row) => row.noDisability },
  ]
}

/** Consecutive columns sharing a group header, as [label, span] pairs. */
function groupSpans(columns: Column[]): { label: string; span: number }[] {
  const spans: { label: string; span: number }[] = []
  for (const column of columns) {
    const label = column.group ?? ""
    const last = spans[spans.length - 1]
    if (last && last.label === label) last.span += 1
    else spans.push({ label, span: 1 })
  }
  return spans
}

function SortButton({
  label,
  sorted,
  ascending,
  align = "start",
  onClick,
}: {
  label: string
  sorted: boolean
  ascending: boolean
  align?: "start" | "end"
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-1 px-2 py-2 select-none hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring ${
        align === "end" ? "justify-end" : "justify-start"
      }`}
    >
      {label}
      {sorted ? (
        ascending ? (
          <ChevronUpIcon className="size-3.5" />
        ) : (
          <ChevronDownIcon className="size-3.5" />
        )
      ) : null}
    </button>
  )
}

export function DataTable({ rows }: { rows: CensusRow[] }) {
  const { region, stateId, type, setRegion, setStateId } = useFilters()
  // The sort column belongs to one disability type: changing type drops it.
  const [sort, setSort] = React.useState<SortState>({
    key: "",
    ascending: false,
    type,
  })
  if (sort.type !== type) setSort({ key: "", ascending: false, type })
  const sortKey = sort.key
  const sortAscending = sort.ascending

  const columns = buildColumns(type)
  const spans = groupSpans(columns)
  const hasGroups = columns.some((column) => column.group)

  function toggleSort(key: string) {
    setSort((current) =>
      current.key === key
        ? { ...current, ascending: !current.ascending }
        : { key, ascending: false, type: current.type }
    )
  }

  function ariaSort(key: string) {
    if (sortKey !== key) return "none" as const
    return sortAscending ? ("ascending" as const) : ("descending" as const)
  }

  function sortStates(states: CensusRow[]): CensusRow[] {
    if (!sortKey) return states
    const column = columns.find((item) => item.key === sortKey)
    const sorted = [...states].sort((a, b) =>
      column ? column.get(a) - column.get(b) : a.name.localeCompare(b.name, "pt-BR")
    )
    return sortAscending ? sorted : sorted.reverse()
  }

  const visibleRegions = region
    ? regionRows(rows).filter((item) => item.id === region)
    : regionRows(rows)

  const table = (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted">
          {hasGroups ? (
            <TableRow>
              <TableHead className="sticky left-0 z-20 bg-muted" />
              {spans.map((span, index) => (
                <TableHead
                  key={`${span.label}-${index}`}
                  colSpan={span.span}
                  className="text-center"
                >
                  {span.label}
                </TableHead>
              ))}
            </TableRow>
          ) : null}
          <TableRow>
            <TableHead
              aria-sort={ariaSort("name")}
              className="sticky left-0 z-20 bg-muted p-0"
            >
              <SortButton
                label="Local"
                sorted={sortKey === "name"}
                ascending={sortAscending}
                onClick={() => toggleSort("name")}
              />
            </TableHead>
            {columns.map((column) => (
              <TableHead
                key={column.key}
                aria-sort={ariaSort(column.key)}
                className="p-0 text-right"
              >
                <SortButton
                  label={column.label}
                  align="end"
                  sorted={sortKey === column.key}
                  ascending={sortAscending}
                  onClick={() => toggleSort(column.key)}
                />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow className="font-medium">
            <TableCell className="sticky left-0 bg-background font-medium">
              {countryRow(rows).name}
            </TableCell>
            {columns.map((column) => (
              <TableCell
                key={column.key}
                className="text-right tabular-nums"
              >
                {column.percent
                  ? formatPercent(column.get(countryRow(rows)))
                  : formatNumber(column.get(countryRow(rows)))}
              </TableCell>
            ))}
          </TableRow>
          {visibleRegions.map((regionRow) => (
            <React.Fragment key={regionRow.id}>
              <TableRow className="bg-muted/50 font-medium">
                <TableCell className="sticky left-0 bg-muted font-medium">
                  {regionRow.name}
                </TableCell>
                {columns.map((column) => (
                  <TableCell key={column.key} className="text-right tabular-nums">
                    {column.percent
                      ? formatPercent(column.get(regionRow))
                      : formatNumber(column.get(regionRow))}
                  </TableCell>
                ))}
              </TableRow>
              {sortStates(statesOf(rows, regionRow.id)).map((state) => {
                const selected = stateId === state.id
                const select = () => setStateId(selected ? "" : state.id)
                return (
                <TableRow
                  key={state.id}
                  role="button"
                  tabIndex={0}
                  aria-selected={selected}
                  data-state={selected ? "selected" : undefined}
                  className="cursor-pointer focus-visible:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
                  onClick={select}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      select()
                    }
                  }}
                >
                  <TableCell className="sticky left-0 bg-background pl-6">
                    {state.name}
                  </TableCell>
                  {columns.map((column) => (
                    <TableCell key={column.key} className="text-right tabular-nums">
                      {column.percent
                        ? formatPercent(column.get(state))
                        : formatNumber(column.get(state))}
                    </TableCell>
                  ))}
                </TableRow>
                )
              })}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <Tabs
      value={region || COUNTRY_TAB}
      onValueChange={(value) => {
        const option = TAB_OPTIONS.find((item) => item.id === value)
        if (option) setRegion(option.region)
      }}
      className="w-full flex-col justify-start gap-6"
    >
      <div className="flex items-center justify-between px-4 lg:px-6">
        <TabsList className="**:data-[slot=badge]:size-5 **:data-[slot=badge]:rounded-full **:data-[slot=badge]:bg-muted-foreground/30 **:data-[slot=badge]:px-1">
          {TAB_OPTIONS.map((option) => (
            <TabsTrigger key={option.id} value={option.id}>
              {option.label}{" "}
              <Badge variant="secondary">
                {statesOf(rows, option.region).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
        {table}
      </div>
    </Tabs>
  )
}
