import { censusDataset, type CensusDataset } from "@/data/census-2010"

export interface CensusDataSource {
  load(): Promise<CensusDataset>
}

export const staticDataSource: CensusDataSource = {
  load: async () => censusDataset,
}

/**
 * IBGE SIDRA public API, table 3425 (Censo 2010, tipo de deficiência):
 * country, regions and states at every disability variable. Documented here
 * for version 0.0.2; nothing is requested yet.
 */
export const SIDRA_ENDPOINT =
  "https://apisidra.ibge.gov.br/values/t/3425/n1/all/n2/all/n3/all/v/allxp/p/last"

export const SIDRA_UNAVAILABLE_MESSAGE =
  "A fonte de dados da API do IBGE (SIDRA) ainda não está disponível nesta versão. Mostrando dados estáticos."

export const sidraDataSource: CensusDataSource = {
  // TODO versão 0.0.2: chamar SIDRA_ENDPOINT e transformar a resposta.
  // Fails before any network request while the mapping does not exist.
  load: async () => {
    throw new Error(SIDRA_UNAVAILABLE_MESSAGE)
  },
}

export function getDataSource(): CensusDataSource {
  return import.meta.env.VITE_DATA_SOURCE === "sidra"
    ? sidraDataSource
    : staticDataSource
}
