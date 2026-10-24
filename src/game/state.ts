import {
  entryMpsPoint,
  mpsMonthlySalary,
  TA_MONTHLY_SALARY,
  type TeacherSalaryTrack,
} from './salaryScale'
import { schoolLocationLabel, schoolTypeLabel } from './schools'
import type { GameState, Judgment, Rank, School, StatDelta } from './types'

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
    salaryTrack: null,
    schoolName: '—',
    schoolDistrict: '—',
    schoolType: '—',
    taSchool: null,
    interviewIsReInterview: false,
    jumpAds: [],
    jumpCurrentAds: [],
    jumpSelectedAdIds: [],
    jumpAppliedSchools: [],
    coverLetterStyle: null,
    jumpReplySummary: [],
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

function salaryTrackForLevel(level: GameState['jumpLevel']): TeacherSalaryTrack {
  return level === '小學' ? 'APSM' : 'GM'
}

export function setContractJob(state: GameState, school: School): GameState {
  const track = salaryTrackForLevel(state.jumpLevel)
  const mps = entryMpsPoint(track)
  const baseRenew =
    school.band === 1 ? 22 : school.band === 2 ? 35 : 48
  return {
    ...state,
    rank: '合約教席',
    salaryTrack: track,
    mpsPoint: mps,
    salary: mpsMonthlySalary(mps),
    schoolName: school.name,
    schoolDistrict: school.district,
    schoolType: schoolTypeLabel(school),
    taSchool: null,
    renewPerm: baseRenew,
    passion: clampStat(state.passion + 5),
  }
}

export function setTAJob(state: GameState, school: School): GameState {
  return {
    ...state,
    rank: 'TA',
    salaryTrack: null,
    mpsPoint: 0,
    salary: TA_MONTHLY_SALARY,
    schoolName: school.name,
    schoolDistrict: school.district,
    schoolType: schoolTypeLabel(school),
    taSchool: school,
    renewPerm: 8,
    passion: clampStat(state.passion - 15),
    san: clampStat(state.san - 10),
  }
}

export function formatSchoolStatus(state: GameState): string {
  if (state.schoolName === '—') return '—'
  const loc = schoolLocationLabel({
    name: state.schoolName,
    district: state.schoolDistrict,
    band: 0,
    funding: '津貼/資助',
    difficulty: 0,
  })
  return `${loc} · ${state.schoolType}`
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
  const schoolDistrict =
    state.schoolDistrict ??
    (state.taSchool?.district ?? '—')
  const track =
    state.salaryTrack ??
    (state.jumpLevel === '小學'
      ? 'APSM'
      : state.rank === 'TA'
        ? null
        : 'GM')
  return {
    ...state,
    yearsAtSchool,
    schoolDistrict,
    salaryTrack: track,
    taSchool: state.taSchool ?? null,
    interviewIsReInterview: state.interviewIsReInterview ?? false,
    jumpAds: state.jumpAds ?? [],
    jumpCurrentAds: state.jumpCurrentAds ?? [],
    jumpSelectedAdIds: state.jumpSelectedAdIds ?? [],
    jumpAppliedSchools: state.jumpAppliedSchools ?? [],
    coverLetterStyle: state.coverLetterStyle ?? null,
    jumpReplySummary: state.jumpReplySummary ?? [],
    functionalGroup: state.functionalGroup ?? null,
    functionalGroupOptOut: state.functionalGroupOptOut ?? false,
    adminInviteResolved: state.adminInviteResolved ?? false,
  }
}
