import type { FunctionalGroupId, GameState } from '../../game/types'

export type PixelSceneVariant =
  | 'school-yard'
  | 'classroom'
  | 'sports-day'
  | 'swimming-gala'
  | 'graduation'
  | 'jump-net'
  | 'ta-desk'
  | 'staff-room'
  | 'func-discipline'
  | 'func-eca'
  | 'func-counselling'
  | 'func-it'
  | 'func-admin'
  | 'family-dating'
  | 'family-wedding'
  | 'family-child'
  | 'family-bereavement'
  | 'promotion'
  | 'retirement'

export type ResolvedPixelScene = {
  variant: PixelSceneVariant
  /** 課室學科色調 */
  subject?: string
}

const SWIM_RE = /游泳|泳池|水運|泳館|泳隊|泳線/
const SPORT_RE = /運動會|體育|帶比賽|田徑|運動場|校外比賽|課外活動|學界/
const CLASS_RE =
  /出卷|SBA|試教|課堂|查簿|睇堂|教學|教案|Micro-teaching|Staff Meeting|TDD|作文|面試 II|面試 I|CPD|數碼|面試/
const STAFF_RE = /通宵|改卷|夜|教員室|出卷修羅場|PGDE 之夜|Part-time PGDE/
const DISCIPLINE_RE = /訓導|紀律|欺凌|停課|違規/
const ECA_RE = /課外|交流團|帶隊|學會|比賽|ECA/
const COUNSELL_RE = /輔導|傾談|社工|情緒|危機/
const IT_RE = /資訊科技|Wi‑Fi|IT |電腦|碳粉|伺服器|系統|數碼 CPD|校本 AI/

const FG_TO_VARIANT: Partial<Record<FunctionalGroupId, PixelSceneVariant>> = {
  discipline: 'func-discipline',
  eca: 'func-eca',
  counselling: 'func-counselling',
  it: 'func-it',
  admin: 'func-admin',
  academic: 'func-admin',
}

function turnText(state: GameState): string {
  return `${state.currentTurn?.title ?? ''} ${state.currentTurn?.narrative ?? ''}`
}

function teachingSubject(state: GameState): string | undefined {
  return (
    state.interviewVacancySubject ??
    state.jumpAppliedAds[0]?.subject ??
    state.origin?.major
  )
}

export function resolvePixelScene(state: GameState): ResolvedPixelScene {
  const text = turnText(state)
  const subject = teachingSubject(state)

  if (state.phase === 'ending') {
    if (state.ending === 'retirement') return { variant: 'retirement' }
    if (state.ending === 'perm_win' || state.leadershipRank)
      return { variant: 'promotion' }
    if (state.ending === 'burnout') return { variant: 'staff-room' }
    return { variant: 'school-yard' }
  }

  if (/拍拖/.test(text)) return { variant: 'family-dating' }
  if (/結婚/.test(text)) return { variant: 'family-wedding' }
  if (/生仔|生女/.test(text)) return { variant: 'family-child' }
  if (/離世|思念/.test(text)) return { variant: 'family-bereavement' }
  if (/晉升遴選|晉升|SGM|PGM|校長/.test(text)) return { variant: 'promotion' }

  if (DISCIPLINE_RE.test(text)) return { variant: 'func-discipline' }
  if (ECA_RE.test(text)) return { variant: 'func-eca' }
  if (COUNSELL_RE.test(text)) return { variant: 'func-counselling' }
  if (IT_RE.test(text)) return { variant: 'func-it' }
  if (/行政組|行政會議|校政/.test(text)) return { variant: 'func-admin' }

  if (state.functionalGroup && !DISCIPLINE_RE.test(text)) {
    const fromFg = FG_TO_VARIANT[state.functionalGroup]
    if (fromFg && state.phase === 'career' && /組|會議|跟進/.test(text)) {
      return { variant: fromFg }
    }
  }

  switch (state.phase) {
    case 'origin':
    case 'pgde_apply':
      return { variant: 'graduation' }
    case 'jump':
    case 'jump_browse':
    case 'jump_waiting':
      return { variant: 'jump-net' }
    case 'school_pick':
      return { variant: 'jump-net' }
    case 'interview_panel':
    case 'interview_micro':
    case 'interview_principal':
      return { variant: 'classroom', subject }
    default:
      break
  }

  if (state.rank === 'TA' && state.phase === 'career' && !CLASS_RE.test(text)) {
    return { variant: 'ta-desk' }
  }

  if (STAFF_RE.test(text)) return { variant: 'staff-room' }

  if (SWIM_RE.test(text)) return { variant: 'swimming-gala' }
  if (SPORT_RE.test(text)) return { variant: 'sports-day' }
  if (CLASS_RE.test(text)) {
    return { variant: 'classroom', subject }
  }

  if (state.rank === '合約教席' || state.rank === '常額位') {
    if (state.phase === 'career' && CLASS_RE.test(text)) {
      return { variant: 'classroom', subject }
    }
  }

  if (state.age >= 58 && state.phase === 'career') {
    return { variant: 'retirement' }
  }

  return { variant: 'school-yard' }
}

/** @deprecated use resolvePixelScene */
export function resolvePixelSceneVariant(state: GameState): PixelSceneVariant {
  return resolvePixelScene(state).variant
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
    graduation: 'graduation',
    jump: 'jump-net',
    'jump-net': 'jump-net',
    ta: 'ta-desk',
    'ta-desk': 'ta-desk',
    staff: 'staff-room',
    'staff-room': 'staff-room',
    promo: 'promotion',
    promotion: 'promotion',
    retire: 'retirement',
    retirement: 'retirement',
    dating: 'family-dating',
    wedding: 'family-wedding',
    family: 'family-child',
  }
  return map[raw.toLowerCase()] ?? null
}

export const PIXEL_SCENE_LABELS: Record<PixelSceneVariant, string> = {
  'school-yard': '校舍',
  classroom: '課室',
  'sports-day': '運動會',
  'swimming-gala': '游泳',
  graduation: '畢業',
  'jump-net': '跳跳網',
  'ta-desk': 'TA',
  'staff-room': '教員室',
  'func-discipline': '訓導',
  'func-eca': '課外活動',
  'func-counselling': '輔導',
  'func-it': 'IT',
  'func-admin': '行政',
  'family-dating': '拍拖',
  'family-wedding': '結婚',
  'family-child': '家庭',
  'family-bereavement': '思念',
  promotion: '晉升',
  retirement: '退休',
}
