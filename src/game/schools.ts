import secondaryData from './data/secondary-schools.json'
import primaryData from './data/primary-schools.json'
import type { School } from './types'

/**
 * School pool for JUMP / jump.hk-style job hunt and TA placement.
 *
 * Full lists imported from CHSC 學校概覽 (linked from EDB school-info hub).
 * @see https://www.edb.gov.hk/tc/student-parents/sch-info/about-sch-info/index.html
 * @see https://www.chsc.hk/ssp2025/ (中學)
 * @see https://www.chsc.hk/psp2026/ (小學)
 */

export const SCHOOL_DATA_META = {
  retrievedAt: secondaryData.meta.retrievedAt,
  sources: secondaryData.meta.sources,
  filters: secondaryData.meta.filters,
  counts: {
    secondary: secondaryData.schools.length,
    primary: primaryData.schools.length,
  },
}

function toSchool(raw: (typeof secondaryData.schools)[number]): School {
  return {
    name: raw.name,
    district: raw.district,
    band: raw.band as School['band'],
    funding: raw.funding as School['funding'],
    difficulty: raw.difficulty,
    profileNote: raw.profileNote || undefined,
  }
}

/** 中學：CHSC 學校概覽（SSP 2025）— 津貼／資助、按位津貼、直資（DSS） */
export const SECONDARY_SCHOOLS: School[] = secondaryData.schools.map(toSchool)

/** 小學：CHSC 學校概覽（PSP 2026）— 津貼／資助、直資（DSS） */
export const PRIMARY_SCHOOLS: School[] = primaryData.schools.map(toSchool)

export function schoolTypeLabel(school: School): string {
  const bandPart =
    school.band === 0
      ? school.funding
      : `Band ${school.band} · ${school.funding}`
  return `${school.district} · ${bandPart}`
}

export function schoolDisplayName(school: School): string {
  return `${school.name}（${school.district}）`
}

export function schoolLocationLabel(school: School): string {
  return `${school.name}（${school.district}）`
}
