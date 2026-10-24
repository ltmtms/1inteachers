export {
  PRIMARY_SCHOOLS,
  SECONDARY_SCHOOLS,
  schoolLocationLabel,
  schoolTypeLabel,
} from './schools'

export const UNIVERSITIES = [
  '香港大學 (HKU)',
  '中文大學 (CUHK)',
  '科技大學 (HKUST)',
  '教育大學 (EdUHK)',
  '理工大學 (PolyU)',
  '城市大學 (CityU)',
  '浸會大學 (HKBU)',
  '海外名校（G5 / Ivy）',
  '海外普通院校',
  '本地自資學士',
]

export const MAJORS = [
  'ICT／資訊科技',
  '數學',
  '英文',
  '中文',
  '科學／STEM',
  '公社科',
]

export function mpsSalary(point: number): number {
  const table: Record<number, number> = {
    0: 17000,
    14: 28405,
    16: 31070,
    18: 33990,
    20: 37170,
    24: 44110,
    28: 52360,
    32: 62150,
    34: 68960,
  }
  if (table[point]) return table[point]
  if (point < 14) return 17000
  return 68960 + (point - 34) * 2200
}

export const PGDE_RATE_TEXT = '全日制 PGDE 錄取率：約 5%–12%（視學科與面試表現）'
