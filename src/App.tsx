import * as React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { TooltipProvider } from "@/components/ui/tooltip"
import {
  findRow,
  SOURCE_NOTE,
  type CensusRow,
  type DisabilityTypeId,
} from "@/data/census-2010"
import { useCensusData } from "@/hooks/use-census-data"
import { FiltersContext, type FiltersState } from "@/lib/filters"
import { TriangleAlertIcon } from "lucide-react"

// Lazy so Recharts lands in its own chunk instead of the initial bundle.
const ChartAreaInteractive = React.lazy(() =>
  import("@/components/chart-area-interactive").then((module) => ({
    default: module.ChartAreaInteractive,
  }))
)
const ChartTypesByState = React.lazy(() =>
  import("@/components/chart-types-by-state").then((module) => ({
    default: module.ChartTypesByState,
  }))
)

const INITIAL_FILTERS: FiltersState = { region: "", stateId: "", type: "" }

function FiltersProvider({
  rows,
  children,
}: {
  rows: CensusRow[]
  children: React.ReactNode
}) {
  const [filters, setFilters] = React.useState<FiltersState>(INITIAL_FILTERS)

  const value = React.useMemo(
    () => ({
      ...filters,
      // Changing region drops the selected state: it may not belong to it.
      setRegion: (region: string) =>
        setFilters((current) => ({ ...current, region, stateId: "" })),
      // Picking a state moves the region filter to that state's region, so
      // sidebar, toggle and tabs keep showing where the state lives. Clearing
      // the state keeps the region that is already selected.
      setStateId: (stateId: string) =>
        setFilters((current) => ({
          ...current,
          stateId,
          region: stateId
            ? (findRow(rows, stateId)?.regionId ?? current.region)
            : current.region,
        })),
      setType: (type: DisabilityTypeId | "") =>
        setFilters((current) => ({ ...current, type })),
      reset: () => setFilters(INITIAL_FILTERS),
    }),
    [filters, rows]
  )

  return (
    <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
  )
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-lg border p-3 text-sm text-muted-foreground">
      <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </div>
  )
}

function ChartFallback() {
  return <Skeleton className="h-[380px] w-full" />
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
        <Skeleton className="h-36" />
      </div>
      <Skeleton className="h-80" />
      <Skeleton className="h-80" />
    </div>
  )
}

function DashboardShell() {
  const { data, loading, error, warning } = useCensusData()
  const rows = data?.rows ?? []

  return (
    <FiltersProvider rows={rows}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader rows={rows} />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              {loading ? (
                <DashboardSkeleton />
              ) : error || !data ? (
                <div className="px-4 py-6 lg:px-6">
                  <Notice>
                    {error ?? "Não foi possível carregar os dados."}
                  </Notice>
                </div>
              ) : (
                <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                  {warning ? (
                    <div className="px-4 lg:px-6">
                      <Notice>{warning}</Notice>
                    </div>
                  ) : null}
                  {data.isPartial ? (
                    <div className="px-4 lg:px-6">
                      <Notice>{data.notice}</Notice>
                    </div>
                  ) : null}
                  <div id="overview">
                    <SectionCards rows={rows} />
                  </div>
                  <div id="states" className="px-4 lg:px-6">
                    <React.Suspense fallback={<ChartFallback />}>
                      <ChartAreaInteractive rows={rows} />
                    </React.Suspense>
                  </div>
                  <div id="types" className="px-4 lg:px-6">
                    <React.Suspense fallback={<ChartFallback />}>
                      <ChartTypesByState rows={rows} />
                    </React.Suspense>
                  </div>
                  <div id="table">
                    <DataTable rows={rows} />
                  </div>
                  <p className="px-4 text-xs text-muted-foreground lg:px-6">
                    {SOURCE_NOTE}
                  </p>
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </FiltersProvider>
  )
}

export default function App() {
  return (
    <TooltipProvider>
      <DashboardShell />
    </TooltipProvider>
  )
}
