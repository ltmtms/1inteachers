import type { School } from './types'

/**
 * School pool for the JUMP interview draw.
 *
 * Names, reference Band (1/2/3), and funding category (津貼/資助、直資 DSS、官立)
 * are aligned with StarSchools' curated secondary/primary directories (Oct 2026).
 * StarSchools notes that banding is reference-only—not an official EDB school label.
 *
 * @see https://starschools.hk/admission/banding
 * @see https://starschools.hk/schools/directory/secondary
 * @see https://starschools.hk/schools/directory/primary
 */

function sec(
  name: string,
  band: 1 | 2 | 3,
  funding: School['funding'],
  difficulty: number,
): School {
  return { name, band, funding, difficulty }
}

/** Secondary schools: DSS, aided (資助), or government (官立) only — no private / international. */
export const SECONDARY_SCHOOLS: School[] = [
  // Band 1
  sec('皇仁書院', 1, '官立', 90),
  sec('拔萃男書院', 1, '直資 (DSS)', 92),
  sec('聖保羅男女中學', 1, '直資 (DSS)', 93),
  sec('喇沙書院', 1, '津貼/資助', 88),
  sec('嘉諾撒聖家書院', 1, '津貼/資助', 86),
  sec('華仁書院(九龍)', 1, '津貼/資助', 84),
  sec('聖保羅書院', 1, '直資 (DSS)', 91),
  sec('協恩中學', 1, '直資 (DSS)', 87),
  sec('培僑書院', 1, '直資 (DSS)', 82),
  sec('播道書院', 1, '直資 (DSS)', 78),
  sec('將軍澳官立中學', 1, '官立', 80),
  sec('迦密主恩中學', 1, '津貼/資助', 79),
  // Band 2
  sec('將軍澳香島中學', 2, '直資 (DSS)', 58),
  sec('保良局第一張永慶中學', 2, '津貼/資助', 60),
  sec('文理書院(九龍)', 2, '津貼/資助', 57),
  sec('何文田官立中學', 2, '官立', 55),
  sec('皇仁舊生會中學', 2, '津貼/資助', 52),
  sec('東華三院馮黃鳳亭中學', 2, '津貼/資助', 54),
  sec('馬鞍山崇真中學', 2, '津貼/資助', 56),
  sec('創知中學', 2, '直資 (DSS)', 59),
  sec('基督教中國佈道會聖道迦南書院', 2, '直資 (DSS)', 57),
  sec('金文泰中學', 2, '官立', 53),
  // Band 3
  sec('明愛屯門馬登基金中學', 3, '津貼/資助', 36),
  sec('東華三院甲寅年總理中學', 3, '津貼/資助', 38),
  sec('仁濟醫院董之英紀念中學', 3, '津貼/資助', 34),
  sec('天水圍香島中學', 3, '直資 (DSS)', 40),
  sec('賽馬會官立中學', 3, '官立', 42),
  sec('明愛元朗陳震夏中學', 3, '津貼/資助', 33),
  sec('聖公會聖匠中學', 3, '津貼/資助', 35),
  sec('萬鈞伯裘書院', 3, '直資 (DSS)', 37),
]

function pri(
  name: string,
  tier: 1 | 2 | 3,
  funding: School['funding'],
  difficulty: number,
): School {
  return { name, band: tier, funding, difficulty }
}

/**
 * Primary schools: aided / DSS / government via POA (統一派位) — no private international stream.
 * Primary "band" here is a gameplay tier (校風／升中聯繫難度)，not SSPA band.
 */
export const PRIMARY_SCHOOLS: School[] = [
  pri('拔萃女小學', 1, '直資 (DSS)', 82),
  pri('喇沙小學', 1, '津貼/資助', 78),
  pri('聖公會聖馬太小學', 1, '津貼/資助', 72),
  pri('嘉諾撒聖心學校', 1, '津貼/資助', 74),
  pri('九龍塘官立小學', 1, '官立', 70),
  pri('浸信會沙田圍呂明才小學', 2, '津貼/資助', 50),
  pri('北角循道學校', 2, '津貼/資助', 52),
  pri('元朗商會小學', 2, '津貼/資助', 48),
  pri('聖博德天主教小學', 3, '津貼/資助', 40),
  pri('天主教總堂區學校', 2, '津貼/資助', 46),
  pri('般咸道官立小學', 2, '官立', 44),
  pri('聖公會聖彼得小學', 3, '津貼/資助', 38),
]

export function schoolTypeLabel(school: School): string {
  if (school.band === 0) return school.funding
  return `Band ${school.band} · ${school.funding}`
}
