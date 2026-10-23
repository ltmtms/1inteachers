import type { GameState } from '../../game/types'

export type PixelSceneVariant = 'school-yard' | 'classroom' | 'sports-day' | 'swimming-gala'

const SWIM_RE = /游泳|泳池|水運|泳館|泳隊|泳線/
const SPORT_RE = /運動會|體育|帶比賽|田徑|運動場|校外比賽|課外活動/
const CLASS_RE =
  /出卷|SBA|試教|課堂|查簿|睇堂|教學|教案|Micro-teaching|Staff Meeting|TDD|PGDE|作文|AI|面試 II|CPD|數碼/

export function resolvePixelSceneVariant(state: GameState): PixelSceneVariant {
  const turnText = `${state.currentTurn?.title ?? ''} ${state.currentTurn?.narrative ?? ''}`

  if (SWIM_RE.test(turnText)) return 'swimming-gala'
  if (SPORT_RE.test(turnText)) return 'sports-day'
  if (state.phase === 'interview_micro' || CLASS_RE.test(turnText)) return 'classroom'

  return 'school-yard'
}

export function parsePixelSceneOverride(search: string): PixelSceneVariant | null {
  const raw = new URLSearchParams(search).get('pixelScene')
  if (!raw) return null
  const map: Record<string, PixelSceneVariant> = {
    school: 'school-yard',
    'school-yard': 'school-yard',
    classroom: 'classroom',
    sports: 'sports-day',
    'sports-day': 'sports-day',
    swim: 'swimming-gala',
    swimming: 'swimming-gala',
    'swimming-gala': 'swimming-gala',
  }
  return map[raw.toLowerCase()] ?? null
}

export const PIXEL_SCENE_LABELS: Record<PixelSceneVariant, string> = {
  'school-yard': '校舍',
  classroom: '課室',
  'sports-day': '運動會',
  'swimming-gala': '游泳',
}
