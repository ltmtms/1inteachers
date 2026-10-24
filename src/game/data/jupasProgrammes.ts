/**
 * JUPAS 學士課程名稱樣本（非醫科／臨床護理）。
 * 來源參考：香港大學聯招辦事處（JUPAS）及各大學課程概覽之常見學科分類；
 * 遊戲內嵌靜態列表，避免 runtime 抓取官網。
 *
 * 排除規則（非醫學相關）：
 * - 課程名稱含「醫學」「內外全科」「MBBS」「外科」「護理（臨床）」等關鍵字
 * - 明確列為醫科／牙醫／中醫全科等臨床執業課程
 */

export type JupasProgramme = {
  code: string
  name: string
  /** 遊戲內主修／教席學科對照 */
  teachingSubject: string
  university: string
}

const MEDICINE_FILTER =
  /醫學|內外全科|MBBS|外科醫學|牙科|牙醫|中醫學|護理學|Nursing|Medicine|臨床/i

export const JUPAS_PROGRAMMES: JupasProgramme[] = [
  { code: 'JS4276', name: '文學士（中國語言及文學）', teachingSubject: '中文', university: '香港中文大學 (CUHK)' },
  { code: 'JS4277', name: '文學士（英文研究）', teachingSubject: '英文', university: '香港中文大學 (CUHK)' },
  { code: 'JS4278', name: '理學士（數學）', teachingSubject: '數學', university: '香港中文大學 (CUHK)' },
  { code: 'JS4279', name: '理學士（物理）', teachingSubject: '科學／STEM', university: '香港中文大學 (CUHK)' },
  { code: 'JS4280', name: '理學士（化學）', teachingSubject: '科學／STEM', university: '香港中文大學 (CUHK)' },
  { code: 'JS4281', name: '理學士（計算機科學）', teachingSubject: 'ICT／資訊科技', university: '香港中文大學 (CUHK)' },
  { code: 'JS4282', name: '社會科學學士', teachingSubject: '公社科', university: '香港中文大學 (CUHK)' },
  { code: 'JS6004', name: '文學士（中國語文及文學）', teachingSubject: '中文', university: '香港大學 (HKU)' },
  { code: 'JS6005', name: '文學士（英語研究）', teachingSubject: '英文', university: '香港大學 (HKU)' },
  { code: 'JS6006', name: '理學士（數學）', teachingSubject: '數學', university: '香港大學 (HKU)' },
  { code: 'JS6007', name: '理學士（物理天文）', teachingSubject: '科學／STEM', university: '香港大學 (HKU)' },
  { code: 'JS6008', name: '理學士（計算機科學）', teachingSubject: 'ICT／資訊科技', university: '香港大學 (HKU)' },
  { code: 'JS6009', name: '社會科學學士', teachingSubject: '公社科', university: '香港大學 (HKU)' },
  { code: 'JS5101', name: '文學士（中國語文）', teachingSubject: '中文', university: '香港教育大學 (EdUHK)' },
  { code: 'JS5102', name: '文學士（英語教育）', teachingSubject: '英文', university: '香港教育大學 (EdUHK)' },
  { code: 'JS5103', name: '理學士（數學及資訊科技教育）', teachingSubject: '數學', university: '香港教育大學 (EdUHK)' },
  { code: 'JS5104', name: '理學士（科學教育）', teachingSubject: '科學／STEM', university: '香港教育大學 (EdUHK)' },
  { code: 'JS5201', name: '理學士（數學）', teachingSubject: '數學', university: '香港科技大學 (HKUST)' },
  { code: 'JS5202', name: '理學士（計算機科學）', teachingSubject: 'ICT／資訊科技', university: '香港科技大學 (HKUST)' },
  { code: 'JS5301', name: '文學士（中文）', teachingSubject: '中文', university: '香港城市大學 (CityU)' },
  { code: 'JS5302', name: '文學士（英文）', teachingSubject: '英文', university: '香港城市大學 (CityU)' },
  { code: 'JS5303', name: '理學士（資訊科技）', teachingSubject: 'ICT／資訊科技', university: '香港城市大學 (CityU)' },
  { code: 'JS5401', name: '文學士（中國語文）', teachingSubject: '中文', university: '香港浸會大學 (HKBU)' },
  { code: 'JS5402', name: '文學士（英語語言文學）', teachingSubject: '英文', university: '香港浸會大學 (HKBU)' },
  { code: 'JS5501', name: '理學士（數學）', teachingSubject: '數學', university: '香港理工大學 (PolyU)' },
  { code: 'JS5502', name: '理學士（資訊科技）', teachingSubject: 'ICT／資訊科技', university: '香港理工大學 (PolyU)' },
  { code: 'JS5503', name: '理學士（物理）', teachingSubject: '科學／STEM', university: '香港理工大學 (PolyU)' },
].filter((p) => !MEDICINE_FILTER.test(p.name))

export const HK_LOCAL_UNIVERSITIES = [
  '香港大學 (HKU)',
  '中文大學 (CUHK)',
  '科技大學 (HKUST)',
  '教育大學 (EdUHK)',
  '理工大學 (PolyU)',
  '城市大學 (CityU)',
  '浸會大學 (HKBU)',
]
