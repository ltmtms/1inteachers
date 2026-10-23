import type { School } from './types'

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

export const SECONDARY_SCHOOLS: School[] = [
  { name: '皇仁書院', type: 'Band 1 津貼', band: 1, difficulty: 88 },
  { name: '拔萃男書院', type: 'Band 1 津貼', band: 1, difficulty: 90 },
  { name: '聖保羅男女中學', type: 'Band 1 津貼', band: 1, difficulty: 92 },
  { name: '喇沙書院', type: 'Band 1 津貼', band: 1, difficulty: 85 },
  { name: '華仁書院（旺角）', type: 'Band 2 津貼', band: 2, difficulty: 62 },
  { name: '保良局第一張永慶中學', type: 'Band 2 津貼', band: 2, difficulty: 58 },
  { name: '明愛屯門馬登基金中學', type: 'Band 3 津貼', band: 3, difficulty: 38 },
  { name: '東華三院甲寅年總理中學', type: 'Band 3 津貼', band: 3, difficulty: 35 },
  { name: '播道書院', type: '直資', band: 1, difficulty: 70 },
  { name: '漢基國際學校', type: '私立', band: 0, difficulty: 75 },
  { name: '將軍澳官立中學', type: 'Band 2 津貼', band: 2, difficulty: 55 },
  { name: '仁濟醫院董之英紀念中學', type: 'Band 3 津貼', band: 3, difficulty: 32 },
]

export const PRIMARY_SCHOOLS: School[] = [
  { name: '聖公會聖馬太小學', type: '小學', band: 1, difficulty: 72 },
  { name: '喇沙小學', type: '小學', band: 1, difficulty: 78 },
  { name: '拔萃女小學', type: '小學', band: 1, difficulty: 80 },
  { name: '九龍塘官立小學', type: '小學', band: 2, difficulty: 55 },
  { name: '浸信會沙田圍呂明才小學', type: '小學', band: 2, difficulty: 48 },
  { name: '元朗商會小學', type: '小學', band: 3, difficulty: 40 },
  { name: '北角循道學校', type: '小學', band: 2, difficulty: 52 },
  { name: '聖博德天主教小學', type: '小學', band: 3, difficulty: 38 },
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
