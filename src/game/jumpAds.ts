import { PRIMARY_SCHOOLS, SECONDARY_SCHOOLS, schoolTypeLabel } from './constants'
import type { School } from './types'
import { pickOne, randomInt } from './rng'

/** Static sample postings for in-game 跳跳網 (inspired by jump.hk); not fetched at runtime. */
export type JumpAd = {
  id: string
  school: School
  subject: string
  contract: string
  postedDaysAgo: number
  applicantsNote: string
}

const SUBJECTS_SEC = [
  '中文',
  '英文',
  '數學',
  '通識／公社科',
  '科學',
  '體育',
  '資訊及通訊科技',
  '視覺藝術',
]
const SUBJECTS_PRI = ['常識', '中文', '英文', '數學', '音樂', '體育', '視藝']

function makeAd(
  school: School,
  level: '小學' | '中學',
  rng: () => number,
  idx: number,
): JumpAd {
  const subject = pickOne(
    rng,
    level === '小學' ? SUBJECTS_PRI : SUBJECTS_SEC,
  )
  const contract = pickOne(rng, [
    '合約教席（一年可續）',
    '合約教席（按需要）',
    '常額教席（罕有）',
    '代課（學期）',
  ])
  return {
    id: `jump-${level}-${idx}-${school.name.slice(0, 4)}`,
    school,
    subject,
    contract,
    postedDaysAgo: randomInt(rng, 1, 21),
    applicantsNote: pickOne(rng, [
      '校方註明：須經 second in 面試',
      '需試教 15–20 分鐘',
      '歡迎具 PGDE 或修讀中',
      '請附教學影片連結（如有）',
      'TA 亦可申請（須通過 second in）',
    ]),
  }
}

export function drawJumpAds(
  level: '小學' | '中學',
  rng: () => number,
  count = 5,
): JumpAd[] {
  const pool = [...(level === '小學' ? PRIMARY_SCHOOLS : SECONDARY_SCHOOLS)]
  const ads: JumpAd[] = []
  for (let i = 0; i < count && pool.length; i++) {
    const j = Math.floor(rng() * pool.length)
    const school = pool.splice(j, 1)[0]
    ads.push(makeAd(school, level, rng, i))
  }
  return ads
}

export function formatJumpAdLine(ad: JumpAd): string {
  const s = ad.school
  const profile = s.profileNote ? ` · ${s.profileNote}` : ''
  return `【${ad.subject}】${s.name}（${s.district}）｜${schoolTypeLabel(s)}｜${ad.contract}｜${ad.postedDaysAgo} 日前刊登｜${ad.applicantsNote}${profile}`
}
