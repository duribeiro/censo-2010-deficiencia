import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  DISABILITY_TYPES,
  scopeRow,
  statesOf,
  type CensusRow,
  type DisabilityTypeId,
} from "@/data/census-2010"
import { useFilters } from "@/lib/filters"
import { MoonIcon, SunIcon } from "lucide-react"

const THEME_STORAGE_KEY = "theme"

function readStoredTheme(): string | null {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY)
  } catch {
    return null
  }
}

function useDarkMode() {
  const [dark, setDark] = React.useState(() => {
    const stored = readStoredTheme()
    if (stored) return stored === "dark"
    return window.matchMedia("(prefers-color-scheme: dark)").matches
  })

  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, dark ? "dark" : "light")
    } catch {
      // Storage can be blocked: the theme still applies for this session.
    }
  }, [dark])

  return { dark, toggle: () => setDark((value) => !value) }
}

export function SiteHeader({ rows }: { rows: CensusRow[] }) {
  const { region, stateId, type, setStateId, setType, reset } = useFilters()
  const { dark, toggle } = useDarkMode()

  const title = rows.length ? scopeRow(rows, region, stateId).name : "Visão geral"
  const states = statesOf(rows, region)

  // Base UI needs the value to label map to render the trigger text.
  const stateItems: Record<string, string> = { "": "Todos os estados" }
  for (const state of states) stateItems[state.id] = state.name
  const typeItems: Record<string, string> = { "": "Todos os tipos" }
  for (const item of DISABILITY_TYPES) typeItems[item.id] = item.label

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Select
            items={stateItems}
            value={stateId}
            onValueChange={(value) => {
              if (typeof value === "string") setStateId(value)
            }}
          >
            <SelectTrigger
              size="sm"
              className="hidden w-36 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate sm:flex"
              aria-label="Selecionar estado"
            >
              <SelectValue placeholder="Todos os estados" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="" className="rounded-lg">
                Todos os estados
              </SelectItem>
              {states.map((state) => (
                <SelectItem key={state.id} value={state.id} className="rounded-lg">
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            items={typeItems}
            value={type}
            onValueChange={(value) => {
              if (typeof value === "string") setType(value as DisabilityTypeId | "")
            }}
          >
            <SelectTrigger
              size="sm"
              className="hidden w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate sm:flex"
              aria-label="Selecionar tipo de deficiência"
            >
              <SelectValue placeholder="Todos os tipos" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="" className="rounded-lg">
                Todos os tipos
              </SelectItem>
              {DISABILITY_TYPES.map((item) => (
                <SelectItem key={item.id} value={item.id} className="rounded-lg">
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={reset}>
            Limpar
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={toggle}
            aria-label={dark ? "Usar tema claro" : "Usar tema escuro"}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </Button>
        </div>
      </div>
    </header>
  )
}
