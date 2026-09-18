import * as React from "react"

import { censusDataset, type CensusDataset } from "@/data/census-2010"
import { getDataSource } from "@/lib/data-source"

export interface CensusDataState {
  data: CensusDataset | null
  loading: boolean
  /** Blocks the dashboard: there is nothing to show. */
  error: string | null
  /** Does not block: the static dataset is shown instead. */
  warning: string | null
}

export function useCensusData(): CensusDataState {
  const [state, setState] = React.useState<CensusDataState>({
    data: null,
    loading: true,
    error: null,
    warning: null,
  })

  React.useEffect(() => {
    let active = true
    getDataSource()
      .load()
      .then((data) => {
        if (active) {
          setState({ data, loading: false, error: null, warning: null })
        }
      })
      .catch((cause: unknown) => {
        if (!active) return
        const message =
          cause instanceof Error ? cause.message : "Falha ao carregar os dados."
        // The static dataset is always available, so a failed source degrades
        // to a notice instead of an empty dashboard.
        setState({
          data: censusDataset,
          loading: false,
          error: null,
          warning: message,
        })
      })
    return () => {
      active = false
    }
  }, [])

  return state
}
