import type { School } from './types'

/**
 * School pool for JUMP / jump.hk-style job hunt and TA placement.
 *
 * Names, districts (地區), funding (津貼/資助 or 直資 DSS), and short profile notes
 * are aligned with the Education Bureau / CHSC School Profiles (學校概覽).
 * Reference band (中學) or gameplay tier (小學) still uses StarSchools-style tiers
 * for interview difficulty — not an official EDB label.
 *
 * @see https://www.chsc.hk/
 * @see https://www.chsc.hk/secondary/en/index.aspx
 * @see https://www.chsc.hk/primary/en/index.aspx
 * @see https://starschools.hk/admission/banding
 */

function sec(
  name: string,
  district: string,
  band: 1 | 2 | 3,
  funding: School['funding'],
  difficulty: number,
  profileNote: string,
): School {
  return { name, district, band, funding, difficulty, profileNote }
}

/** Secondary schools: DSS or aided (資助) only — no private, international, or government. */
export const SECONDARY_SCHOOLS: School[] = [
  sec('高主教書院', '中西區', 1, '津貼/資助', 89, '天主教男女校 · 英中'),
  sec('拔萃男書院', '九龍城區', 1, '直資 (DSS)', 92, '直資男校 · 英中'),
  sec('聖保羅男女中學', '中西區', 1, '直資 (DSS)', 93, '直資男女校 · 英中'),
  sec('喇沙書院', '九龍城區', 1, '津貼/資助', 88, '天主教男校 · 英中'),
  sec('嘉諾撒聖家書院', '九龍城區', 1, '津貼/資助', 86, '天主教女校 · 英中'),
  sec('華仁書院(九龍)', '深水埗區', 1, '津貼/資助', 84, '天主教男校 · 英中'),
  sec('聖保羅書院', '中西區', 1, '直資 (DSS)', 91, '直資男校 · 英中'),
  sec('協恩中學', '九龍城區', 1, '直資 (DSS)', 87, '直資女校 · 英中'),
  sec('培僑書院', '沙田區', 1, '直資 (DSS)', 82, '直資男女校 · 中英並重'),
  sec('播道書院', '西貢區', 1, '直資 (DSS)', 78, '直資男女校 · 英中'),
  sec('旅港開平商會中學', '黃大仙區', 1, '津貼/資助', 81, '津貼男女校 · 中中'),
  sec('迦密主恩中學', '西貢區', 1, '津貼/資助', 79, '基督教男女校 · 英中'),
  sec('將軍澳香島中學', '西貢區', 2, '直資 (DSS)', 58, '直資男女校 · 中中'),
  sec('保良局第一張永慶中學', '葵青區', 2, '津貼/資助', 60, '津貼男女校 · 英中'),
  sec('文理書院(九龍)', '黃大仙區', 2, '津貼/資助', 57, '津貼男女校 · 英中'),
  sec('五旬節中學', '觀塘區', 2, '津貼/資助', 55, '基督教男女校 · 英中'),
  sec('皇仁舊生會中學', '元朗區', 2, '津貼/資助', 52, '津貼男女校 · 英中'),
  sec('東華三院馮黃鳳亭中學', '沙田區', 2, '津貼/資助', 54, '津貼男女校 · 中中'),
  sec('馬鞍山崇真中學', '沙田區', 2, '津貼/資助', 56, '基督教男女校 · 英中'),
  sec('創知中學', '深水埗區', 2, '直資 (DSS)', 59, '直資男女校 · 英中'),
  sec('基督教中國佈道會聖道迦南書院', '黃大仙區', 2, '直資 (DSS)', 57, '直資男女校 · 英中'),
  sec('鄧鏡波學校', '灣仔區', 2, '津貼/資助', 53, '天主教男女校 · 中中'),
  sec('明愛屯門馬登基金中學', '屯門區', 3, '津貼/資助', 36, '津貼男女校 · 中中'),
  sec('東華三院甲寅年總理中學', '元朗區', 3, '津貼/資助', 38, '津貼男女校 · 中中'),
  sec('仁濟醫院董之英紀念中學', '沙田區', 3, '津貼/資助', 34, '津貼男女校 · 中中'),
  sec('天水圍香島中學', '元朗區', 3, '直資 (DSS)', 40, '直資男女校 · 中中'),
  sec('聖公會蔡功譜中學', '深水埗區', 3, '津貼/資助', 42, '聖公會男女校 · 英中'),
  sec('明愛元朗陳震夏中學', '元朗區', 3, '津貼/資助', 33, '津貼男女校 · 中中'),
  sec('聖公會聖匠中學', '九龍城區', 3, '津貼/資助', 35, '聖公會男女校 · 英中'),
  sec('萬鈞伯裘書院', '元朗區', 3, '直資 (DSS)', 37, '直資男女校 · 中中'),
]

function pri(
  name: string,
  district: string,
  tier: 1 | 2 | 3,
  funding: School['funding'],
  difficulty: number,
  profileNote: string,
): School {
  return { name, district, band: tier, funding, difficulty, profileNote }
}

/**
 * Primary schools: aided or DSS via POA (統一派位) — no private or international stream.
 */
export const PRIMARY_SCHOOLS: School[] = [
  pri('拔萃女小學', '油尖旺區', 1, '直資 (DSS)', 82, '直資女校 · 英小'),
  pri('喇沙小學', '九龍城區', 1, '津貼/資助', 78, '津貼男校 · 英小'),
  pri('聖公會聖馬太小學', '中西區', 1, '津貼/資助', 72, '聖公會男女校 · 英小'),
  pri('嘉諾撒聖心學校', '中西區', 1, '津貼/資助', 74, '天主教女校 · 英小'),
  pri('聖士提反女子中學附屬小學', '灣仔區', 1, '津貼/資助', 70, '津貼女校 · 英小'),
  pri('浸信會沙田圍呂明才小學', '沙田區', 2, '津貼/資助', 50, '基督教男女校 · 中小'),
  pri('北角循道學校', '東區', 2, '津貼/資助', 52, '基督教男女校 · 英小'),
  pri('元朗商會小學', '元朗區', 2, '津貼/資助', 48, '津貼男女校 · 中小'),
  pri('聖博德天主教小學', '黃大仙區', 3, '津貼/資助', 40, '天主教男女校 · 中小'),
  pri('天主教總堂區學校', '中西區', 2, '津貼/資助', 46, '天主教男女校 · 中小'),
  pri('英皇書院同學會小學', '中西區', 2, '津貼/資助', 44, '津貼男女校 · 英小'),
  pri('聖公會聖彼得小學', '中西區', 3, '津貼/資助', 38, '聖公會男女校 · 英小'),
]

export function schoolTypeLabel(school: School): string {
  if (school.band === 0) return school.funding
  return `Band ${school.band} · ${school.funding}`
}

export function schoolLocationLabel(school: School): string {
  return `${school.name}（${school.district}）`
}
