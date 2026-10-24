/**
 * Build school JSON from CHSC 學校概覽 (linked from EDB school-info hub).
 * Run: node scripts/import-chsc-schools.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '../src/game/data')
const RETRIEVED_AT = '2026-10-24'
const CONCURRENCY = 12

const SEC_BASE = 'https://www.chsc.hk/ssp2025'
const PRI_BASE = 'https://www.chsc.hk/psp2026'

const DISTRICT_IDS = Array.from({ length: 18 }, (_, i) => i + 1)

function mapFunding(raw) {
  if (raw === '直資') return '直資 (DSS)'
  if (raw === '資助' || raw === '按位津貼') return '津貼/資助'
  return null
}

function hashName(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
  return h
}

function difficulty(band, funding, name) {
  const b = band === 0 ? 2 : band
  let d = b === 1 ? 78 : b === 2 ? 55 : 38
  if (funding === '直資 (DSS)') d += 4
  const jitter = hashName(name) % (b === 1 ? 12 : b === 2 ? 8 : 6)
  d += jitter
  return Math.min(96, Math.max(28, d))
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'hk-teacher-life-data-import/1.0' },
  })
  if (!res.ok) throw new Error(`${url} -> ${res.status}`)
  return res.text()
}

function parseSecondaryList(html) {
  const schools = []
  for (const part of html.split('<tr>')) {
    if (!part.includes('sch_detail.php')) continue
    const idM = part.match(/sch_id=(\d+)/)
    const nameM = part.match(/<br>([^<]+)<\/a>/)
    const bandM = part.match(/td-bgc(\d)\s+bb-\d/)
    const fundM = part.match(/bb-\d'>(官立|資助|直資|按位津貼)<\/td>/)
    const distM = part.match(/bb-\d'>([^<]{2,8}區)<\/td>/)
    if (!idM || !nameM || !fundM) continue
    const funding = mapFunding(fundM[1])
    if (!funding) continue
    let band = bandM ? Number(bandM[1]) : 3
    if (band > 3) band = 3
    if (band < 1) band = 2
    schools.push({
      chscId: idM[1],
      name: nameM[1].trim(),
      district: distM?.[1]?.trim() ?? '香港',
      funding,
      band,
    })
  }
  return schools
}

function parsePrimaryList(html, districtFallback) {
  const schools = []
  const header = html.match(/school-md-xxcon-tit[^>]*>([^<]+)/)
  const pageDistrict = header?.[1]?.trim() ?? districtFallback
  for (const part of html.split('<tr>')) {
    if (!part.includes('sch_detail.php')) continue
    const idM = part.match(/sch_id=(\d+)/)
    const nameM = part.match(/<br>([^<]+)<\/a>/)
    const fundM = part.match(/<td>(官立|資助|直資|按位津貼)<\/td>/)
    if (!idM || !nameM || !fundM) continue
    const funding = mapFunding(fundM[1])
    if (!funding) continue
    let tier = 2
    if (part.includes('md01_chi')) tier = 1
    else if (part.includes('md03_chi')) tier = 3
    schools.push({
      chscId: idM[1],
      name: nameM[1].trim(),
      district: pageDistrict,
      funding,
      band: tier,
    })
  }
  return schools
}

function extractProfileNote(html) {
  const mission = html.match(
    /辦學宗旨[\s\S]*?<td[^>]*colspan[^>]*>([\s\S]*?)<\/td>/i,
  )
  if (mission) {
    const text = mission[1]
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim()
    if (text.length > 10) return text.slice(0, 280)
  }
  const motto = html.match(/校訓[\s\S]*?<td[^>]*>([\s\S]*?)<\/td>/i)
  if (motto) {
    const text = motto[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    if (text.length > 2) return `校訓：${text}`.slice(0, 200)
  }
  return ''
}

async function mapPool(items, detailBase, level) {
  const byId = new Map()
  for (const s of items) byId.set(s.chscId, s)

  const list = [...byId.values()]
  const notes = new Map()
  let idx = 0

  async function worker() {
    while (idx < list.length) {
      const i = idx++
      const s = list[i]
      const url =
        level === 'secondary'
          ? `${detailBase}/sch_detail.php?li_id=2&lang_id=2&sch_id=${s.chscId}`
          : `${detailBase}/sch_detail.php?lang_id=2&sch_id=${s.chscId}`
      try {
        const html = await fetchText(url)
        const note = extractProfileNote(html)
        if (note) notes.set(s.chscId, note)
      } catch {
        /* keep empty profileNote */
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))

  return list
    .sort((a, b) => a.name.localeCompare(b.name, 'zh-Hant'))
    .map((s) => ({
      name: s.name,
      district: s.district,
      funding: s.funding,
      band: s.band,
      difficulty: difficulty(s.band, s.funding, s.name),
      profileNote: notes.get(s.chscId) ?? '',
      chscId: s.chscId,
    }))
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })

  const DISTRICT_NAMES = {
    1: '中西區',
    2: '香港東區',
    3: '離島區',
    4: '香港南區',
    5: '灣仔區',
    6: '九龍城區',
    7: '觀塘區',
    8: '西貢區',
    9: '深水埗區',
    10: '黃大仙區',
    11: '油尖旺區',
    12: '北區',
    13: '沙田區',
    14: '大埔區',
    15: '葵青區',
    16: '荃灣區',
    17: '屯門區',
    18: '元朗區',
  }

  const secRaw = []
  for (const d of DISTRICT_IDS) {
    const html = await fetchText(
      `${SEC_BASE}/sch_list.php?li_id=2&district_id=${d}&lang_id=2&frmMode=pagebreak`,
    )
    for (const s of parseSecondaryList(html)) {
      if (s.district === '香港' || !s.district.endsWith('區')) {
        s.district = DISTRICT_NAMES[d] ?? s.district
      }
      secRaw.push(s)
    }
    process.stdout.write(`secondary district ${d}\n`)
  }

  const priRaw = []
  for (const d of DISTRICT_IDS) {
    const html = await fetchText(
      `${PRI_BASE}/sch_list.php?district_id=${d}&lang_id=2&frmMode=pagebreak`,
    )
    priRaw.push(...parsePrimaryList(html, DISTRICT_NAMES[d] ?? '香港'))
    process.stdout.write(`primary district ${d}\n`)
  }

  process.stdout.write('fetching profile notes...\n')
  const secondary = await mapPool(secRaw, SEC_BASE, 'secondary')
  const primary = await mapPool(priRaw, PRI_BASE, 'primary')

  const meta = {
    retrievedAt: RETRIEVED_AT,
    sources: [
      'https://www.edb.gov.hk/tc/student-parents/sch-info/about-sch-info/index.html',
      'https://www.chsc.hk/ssp2025/ (中學概覽／SSP 2025)',
      'https://www.chsc.hk/psp2026/ (小學概覽／PSP 2026)',
    ],
    filters: '津貼／資助、按位津貼、直資（DSS）；不含官立',
  }

  writeFileSync(
    join(OUT_DIR, 'secondary-schools.json'),
    JSON.stringify({ meta, schools: secondary }, null, 0),
  )
  writeFileSync(
    join(OUT_DIR, 'primary-schools.json'),
    JSON.stringify({ meta, schools: primary }, null, 0),
  )

  console.log(`Wrote ${secondary.length} secondary, ${primary.length} primary schools`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
