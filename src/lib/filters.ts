import * as React from "react"

import type { DisabilityTypeId } from "@/data/census-2010"

/** "" means no filter: all regions, all states, all disability types. */
export interface FiltersState {
  region: string
  stateId: string
  type: DisabilityTypeId | ""
}

export interface FiltersContextValue extends FiltersState {
  setRegion: (region: string) => void
  setStateId: (stateId: string) => void
  setType: (type: DisabilityTypeId | "") => void
  reset: () => void
}

/** The four scopes the region filter can take. "" is the whole country. */
export const REGION_OPTIONS = [
  { id: "", label: "Brasil" },
  { id: "NORTE", label: "Norte" },
  { id: "NORDESTE", label: "Nordeste" },
  { id: "SUDESTE", label: "Sudeste" },
]

export const FiltersContext = React.createContext<FiltersContextValue | null>(
  null
)

export function useFilters(): FiltersContextValue {
  const value = React.useContext(FiltersContext)
  if (!value) throw new Error("useFilters requires FiltersProvider")
  return value
}
