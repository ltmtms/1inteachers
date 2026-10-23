import { mpsSalary } from './constants'
import type { GameState, Judgment, Rank, StatDelta } from './types'

export function clampStat(n: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, Math.round(n)))
}

export function createInitialState(seed?: number): GameState {
  const s = seed ?? Math.floor(Math.random() * 1_000_000_000)
  return {
    phase: 'menu',
    turn: 0,
    seed: s,
    origin: null,
    jumpLevel: null,
    schools: [],
    currentSchoolIndex: 0,
    interviewSchool: null,
    rank: '待業',
    mpsPoint: 0,
    salary: 0,
    schoolName: '—',
    schoolType: '—',
    passion: 70,
    san: 85,
    principal: 40,
    colleague: 50,
    renewPerm: 15,
    careerTurns: 0,
    yearsAtSchool: 0,
    functionalGroup: null,
    functionalGroupOptOut: false,
    adminInviteResolved: false,
    lastJudgment: null,
    lastJudgmentText: '',
    currentTurn: null,
    ending: null,
    endingTitle: '',
    endingNarrative: '',
    history: [],
    customActionUsed: false,
    interviewPanelResult: null,
    interviewMicroResult: null,
  }
}

export function applyDelta(state: GameState, delta: StatDelta): GameState {
  const next = { ...state }
  if (delta.passion != null) next.passion = clampStat(next.passion + delta.passion)
  if (delta.san != null) next.san = clampStat(next.san + delta.san)
  if (delta.principal != null)
    next.principal = clampStat(next.principal + delta.principal)
  if (delta.colleague != null)
    next.colleague = clampStat(next.colleague + delta.colleague)
  if (delta.renewPerm != null)
    next.renewPerm = clampStat(next.renewPerm + delta.renewPerm, 0, 99)
  return next
}

export function setContractJob(
  state: GameState,
  schoolName: string,
  schoolType: string,
  band: number,
): GameState {
  const mps = band === 1 ? 18 : band === 2 ? 16 : 14
  const baseRenew = band === 1 ? 22 : band === 2 ? 35 : 48
  return {
    ...state,
    rank: '合約教席',
    mpsPoint: mps,
    salary: mpsSalary(mps),
    schoolName,
    schoolType,
    renewPerm: baseRenew,
    passion: clampStat(state.passion + 5),
  }
}

export function setTAJob(state: GameState): GameState {
  return {
    ...state,
    rank: 'TA',
    mpsPoint: 0,
    salary: mpsSalary(0),
    schoolName: '某 Band 2 津貼中學',
    schoolType: 'Band 2 津貼',
    renewPerm: 8,
    passion: clampStat(state.passion - 15),
    san: clampStat(state.san - 10),
  }
}

export function judgeOutcome(successRate: number, roll: number): Judgment {
  const adj = successRate
  if (roll <= adj * 0.35) return '大成功'
  if (roll <= adj) return '成功'
  if (roll <= adj + 28) return '失敗'
  return '大失敗'
}

export function rankLabel(rank: Rank): string {
  switch (rank) {
    case '待業':
      return '待業'
    case 'TA':
      return 'TA'
    case '合約教席':
      return '合約教席 (Contract GM/APSM)'
    case '常額位':
      return '常額位 (Perm)'
  }
}

export function serialize(state: GameState): string {
  return JSON.stringify(state)
}

export function deserialize(raw: string): GameState | null {
  try {
    const parsed = JSON.parse(raw) as GameState
    return migrateGameState(parsed)
  } catch {
    return null
  }
}

/** 舊存檔補齊功能組欄位，並用 careerTurns 估算在校年資 */
export function migrateGameState(state: GameState): GameState {
  const yearsAtSchool =
    state.yearsAtSchool ??
    (state.phase === 'career' ? Math.max(0, state.careerTurns) : 0)
  return {
    ...state,
    yearsAtSchool,
    functionalGroup: state.functionalGroup ?? null,
    functionalGroupOptOut: state.functionalGroupOptOut ?? false,
    adminInviteResolved: state.adminInviteResolved ?? false,
  }
}
