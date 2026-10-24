/**
 * 教師薪級表（MPS）— 香港教育工作者聯會（教聯會）
 * 官立及津貼學校適用，2026年4月1日生效。
 *
 * @see https://hkfew.org.hk/en/%E6%AC%8A%E7%9B%8A/%E8%96%AA%E6%B4%A5-%E5%85%AC%E7%A9%8D%E9%87%91/item/12540-%E6%95%99%E5%B8%AB%E8%96%AA%E7%B4%9A%E8%A1%A8-2026%E5%B9%B44%E6%9C%881%E6%97%A5%E7%94%9F%E6%95%88
 */

export const HKFEW_SALARY_EFFECTIVE = '2026-04-01'

/** 教學助理（非 MPS；遊戲內 TA 路線參考市場常見月薪） */
export const TA_MONTHLY_SALARY = 17_000

export type TeacherSalaryTrack = 'GM' | 'APSM'

/** 薪級點 → 月薪（港元），2026-04-01 生效 */
export const MPS_MONTHLY_HKD: Record<number, number> = {
  12: 30_595,
  13: 32_430,
  14: 34_075,
  15: 35_760,
  16: 37_585,
  17: 39_490,
  18: 41_430,
  19: 43_495,
  20: 45_660,
  21: 47_950,
  22: 50_215,
  23: 52_575,
  24: 55_060,
  25: 57_560,
  26: 60_290,
  27: 63_100,
  28: 66_075,
  29: 69_205,
  30: 72_430,
  31: 75_830,
  32: 79_410,
  33: 81_140,
  34: 82_975,
  35: 84_815,
  36: 86_835,
  37: 90_955,
  38: 95_120,
  39: 99_525,
  40: 103_810,
  41: 108_280,
  42: 112_955,
  43: 117_805,
  44: 122_045,
  45: 130_255,
  46: 134_920,
  47: 139_825,
  48: 144_850,
  49: 150_070,
}

export function mpsMonthlySalary(point: number): number {
  if (MPS_MONTHLY_HKD[point]) return MPS_MONTHLY_HKD[point]
  const keys = Object.keys(MPS_MONTHLY_HKD)
    .map(Number)
    .sort((a, b) => a - b)
  if (point < keys[0]) return MPS_MONTHLY_HKD[keys[0]]
  if (point > keys[keys.length - 1]) return MPS_MONTHLY_HKD[keys[keys.length - 1]]
  let lo = keys[0]
  for (const k of keys) {
    if (k <= point) lo = k
    else break
  }
  return MPS_MONTHLY_HKD[lo]
}

/** 2010/10/01 後入職、已修 PGDE 的學位教師起薪點 +2（無關限） */
export function entryMpsPoint(_track: TeacherSalaryTrack): number {
  const base = 15
  const pgdeBonus = 2
  return base + pgdeBonus
}

/** 合約教席在職期間的薪點上限（簡化：GM／APSM 主薪級 33 點） */
export function contractMpsCap(): number {
  return 33
}

export function salaryGradeLabel(
  track: TeacherSalaryTrack,
  point: number,
  rank: '合約教席' | '常額位',
): string {
  if (rank === '常額位' && point >= 34) {
    return track === 'GM' ? '高級學位教師 (SGM)' : '小學學位教師 (PSM)'
  }
  if (point >= 30 && point <= 33) {
    return track === 'GM' ? '學位教師 (GM)' : '助理小學學位教師 (APSM)'
  }
  return track === 'GM' ? '學位教師 (GM)' : '助理小學學位教師 (APSM)'
}

export function formatSalaryStatus(
  rank: string,
  track: TeacherSalaryTrack | null,
  mpsPoint: number,
  salary: number,
): string {
  if (rank === 'TA') return `月薪 $${TA_MONTHLY_SALARY.toLocaleString()}（教學助理，非 MPS）`
  if (mpsPoint <= 0 || salary <= 0) return '—'
  const grade =
    track && (rank === '合約教席' || rank === '常額位')
      ? salaryGradeLabel(track, mpsPoint, rank as '合約教席' | '常額位')
      : 'MPS'
  return `${grade} · 薪點 ${mpsPoint}（$${salary.toLocaleString()}）`
}

/** 每兩個職場回合自動增薪一點（簡化年資遞增，直至合約教席上限） */
export function tickSalaryProgression(
  mpsPoint: number,
  yearsAtSchool: number,
  rank: '合約教席' | '常額位',
): number {
  const cap = rank === '常額位' ? 36 : contractMpsCap()
  const target = entryMpsPoint('GM') + Math.floor(yearsAtSchool / 2)
  return Math.min(cap, Math.max(mpsPoint, target))
}
