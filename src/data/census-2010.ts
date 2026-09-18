import { share } from "@/lib/format"

// IBGE, Censo Demografico 2010: pessoas com deficiencia.
// Partial table: the received source stops at Espirito Santo.

export type DisabilityTypeId = "visual" | "hearing" | "motor" | "mental"

export type RowKind = "country" | "region" | "state"

export interface CensusRow {
  id: string
  name: string
  kind: RowKind
  /** "" for the country row, own id for a region, parent region id for a state. */
  regionId: string
  totalPopulation: number
  atLeastOne: number
  visualCannot: number
  visualSevere: number
  visualSome: number
  hearingCannot: number
  hearingSevere: number
  hearingSome: number
  motorCannot: number
  motorSevere: number
  motorSome: number
  mentalIntellectual: number
  noDisability: number
}

export interface CensusDataset {
  rows: CensusRow[]
  isPartial: boolean
  notice: string
}

export const PARTIAL_NOTICE =
  "Dados parciais. A tabela recebida termina no Espírito Santo. Faltam RJ, SP, Sul e Centro-Oeste na lista de estados. Os totais de Brasil e Sudeste vêm da fonte."

export const SOURCE_NOTE =
  'Fonte: IBGE, Censo Demográfico 2010. O total inclui pessoas sem declaração. "Pelo menos uma" conta pessoas com uma ou mais deficiências investigadas. Deficiência mental / intelectual não tem grau declarado no Censo.'

const RAW_ROWS = `BRASIL|Brasil|190755799|45623910|528624|6056684|29206180|347481|1799885|7574797|740456|3701790|8831723|2617025|145084578
NORTE|Norte|15864454|3655568|33025|541798|2409113|23290|123060|591034|44105|245566|674329|183859|12204854
RO|Rondônia|1562409|345411|2337|46247|232037|1782|11698|52907|3941|21705|58450|19063|1214668
AC|Acre|733559|165823|1481|25138|106731|1162|6140|26710|2132|11742|31428|12149|567597
AM|Amazonas|3483985|791162|8241|113281|530296|5492|24012|124737|9162|50573|149796|38509|2692764
RR|Roraima|450479|95774|1156|13683|62738|587|3390|15167|1165|5860|15596|4877|354705
PA|Pará|7581051|1791299|15771|271582|1169223|11501|59802|298060|21607|125891|344269|84580|5788273
AP|Amapá|669526|158749|1334|24749|106482|786|4757|22689|1930|9802|26027|6402|510763
TO|Tocantins|1383445|307350|2705|47118|201606|1980|13261|50764|4168|19993|48763|18289|1076084
NORDESTE|Nordeste|53081950|14133713|129465|2062990|9056632|89490|569256|2416254|210374|1160403|2755979|827079|38939411
MA|Maranhão|6574789|1641404|14132|267487|1054247|10157|64222|275558|21287|125261|314205|96452|4933180
PI|Piauí|3118360|860430|7866|139032|556477|4710|37399|143811|12305|69338|160307|50909|2257930
CE|Ceará|8452381|2340150|24659|349597|1497528|16291|99451|411096|36833|187527|458932|125407|6112001
RN|Rio Grande do Norte|3168027|882681|6943|128676|561746|4836|36856|150700|13592|72927|164571|51899|2284865
PB|Paraíba|3766528|1045631|8649|142371|671793|6518|41845|181646|16929|90365|213624|61996|2720445
PE|Pernambuco|8796448|2426106|20746|348111|1563657|14319|97585|411809|36606|210582|484795|139016|6369909
AL|Alagoas|3120494|859515|7194|135952|536248|5104|35742|146056|11986|84174|173545|59954|2260972
SE|Sergipe|2068017|518901|4126|75256|331453|3278|20108|88376|7699|41696|91559|29397|1548680
BA|Bahia|14016906|3558895|35150|476508|2283483|24277|136048|607202|53137|278533|694441|212049|10451429
SUDESTE|Sudeste|80364410|18506974|262122|2246465|11887099|160671|709572|2967683|330451|1503356|3583542|1056547|61828222
MG|Minas Gerais|19597330|4432456|47073|591179|2701621|32871|199386|769484|79603|404928|895009|301447|15162378
ES|Espírito Santo|3514952|824095|7662|113337|513841|5119|31243|132980|13676|72974|164462|47391|2690750`

const NUMERIC_KEYS = [
  "totalPopulation",
  "atLeastOne",
  "visualCannot",
  "visualSevere",
  "visualSome",
  "hearingCannot",
  "hearingSevere",
  "hearingSome",
  "motorCannot",
  "motorSevere",
  "motorSome",
  "mentalIntellectual",
  "noDisability",
] as const

function parseRows(raw: string): CensusRow[] {
  const rows: CensusRow[] = []
  let currentRegion = ""

  for (const line of raw.split("\n")) {
    const parts = line.split("|")
    if (parts.length !== NUMERIC_KEYS.length + 2) {
      throw new Error(`Malformed census row: ${line}`)
    }
    const [id, name, ...numbers] = parts
    const kind: RowKind =
      id === "BRASIL" ? "country" : id.length > 2 ? "region" : "state"
    if (kind === "region") currentRegion = id

    const row = { id, name, kind, regionId: kind === "country" ? "" : kind === "region" ? id : currentRegion } as CensusRow
    NUMERIC_KEYS.forEach((key, index) => {
      const value = Number(numbers[index])
      if (!Number.isFinite(value)) {
        throw new Error(`Invalid number "${numbers[index]}" in row ${id}`)
      }
      row[key] = value
    })
    rows.push(row)
  }
  return rows
}

export const censusDataset: CensusDataset = {
  rows: parseRows(RAW_ROWS),
  isPartial: true,
  notice: PARTIAL_NOTICE,
}

export interface DisabilityTypeMeta {
  id: DisabilityTypeId
  label: string
  color: string
  /** Severity columns, from "cannot do it at all" to "some difficulty". Empty for mental. */
  severities: { key: keyof CensusRow; label: string }[]
  /** Single column used when there are no severity levels. */
  totalKey?: keyof CensusRow
}

export const DISABILITY_TYPES: DisabilityTypeMeta[] = [
  {
    id: "visual",
    label: "Visual",
    color: "#60a5fa",
    severities: [
      { key: "visualCannot", label: "Não consegue de modo algum" },
      { key: "visualSevere", label: "Grande dificuldade" },
      { key: "visualSome", label: "Alguma dificuldade" },
    ],
  },
  {
    id: "hearing",
    label: "Auditiva",
    color: "#fb923c",
    severities: [
      { key: "hearingCannot", label: "Não consegue de modo algum" },
      { key: "hearingSevere", label: "Grande dificuldade" },
      { key: "hearingSome", label: "Alguma dificuldade" },
    ],
  },
  {
    id: "motor",
    label: "Motora",
    color: "#4ade80",
    severities: [
      { key: "motorCannot", label: "Não consegue de modo algum" },
      { key: "motorSevere", label: "Grande dificuldade" },
      { key: "motorSome", label: "Alguma dificuldade" },
    ],
  },
  {
    id: "mental",
    label: "Mental / intelectual",
    color: "#a78bfa",
    severities: [],
    totalKey: "mentalIntellectual",
  },
]

export function getTypeMeta(id: DisabilityTypeId): DisabilityTypeMeta {
  const meta = DISABILITY_TYPES.find((type) => type.id === id)
  if (!meta) throw new Error(`Unknown disability type: ${id}`)
  return meta
}

/** People counted for a disability type in a row. */
export function typeTotal(row: CensusRow, id: DisabilityTypeId): number {
  const meta = getTypeMeta(id)
  if (meta.totalKey) return row[meta.totalKey] as number
  return meta.severities.reduce((sum, level) => sum + (row[level.key] as number), 0)
}

/** Cases in the most severe level of the three types. Sets overlap: the same
 * person can be counted in more than one, so this is cases, not people. */
export function cannotAtAllTotal(row: CensusRow): number {
  return row.visualCannot + row.hearingCannot + row.motorCannot
}

export function findRow(rows: CensusRow[], id: string): CensusRow | undefined {
  return rows.find((row) => row.id === id)
}

export function countryRow(rows: CensusRow[]): CensusRow {
  const row = rows.find((item) => item.kind === "country")
  if (!row) throw new Error("Census dataset has no country row")
  return row
}

/** The row the current filters point at: state, else region, else country. */
export function scopeRow(
  rows: CensusRow[],
  region: string,
  stateId: string
): CensusRow {
  return (
    (stateId ? findRow(rows, stateId) : undefined) ??
    (region ? findRow(rows, region) : undefined) ??
    countryRow(rows)
  )
}

/** States of a region, or every state when region is "". */
export function statesOf(rows: CensusRow[], region: string): CensusRow[] {
  return rows.filter(
    (row) => row.kind === "state" && (!region || row.regionId === region)
  )
}

/** Percent of each state's population, for one type or for any disability. */
export function statePercents(
  rows: CensusRow[],
  region: string,
  type: DisabilityTypeId | ""
) {
  return statesOf(rows, region)
    .map((row) => ({
      id: row.id,
      name: row.name,
      value: share(
        type ? typeTotal(row, type) : row.atLeastOne,
        row.totalPopulation
      ),
    }))
    .sort((a, b) => b.value - a.value)
}

export function regionRows(rows: CensusRow[]): CensusRow[] {
  return rows.filter((row) => row.kind === "region")
}
