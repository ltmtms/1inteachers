export type Judgment = '大成功' | '成功' | '失敗' | '大失敗'

export type Rank = '待業' | 'TA' | '合約教席' | '常額位'

export type GamePhase =
  | 'menu'
  | 'origin'
  | 'jump'
  | 'school_pick'
  | 'interview_panel'
  | 'interview_micro'
  | 'interview_principal'
  | 'career'
  | 'ending'

export type EndingType =
  | 'burnout'
  | 'unemployed'
  | 'perm_win'
  | 'career_change'
  | null

export type SchoolFunding = '津貼/資助' | '直資 (DSS)' | '官立'

export interface School {
  name: string
  /** Reference band (中學) or gameplay tier (小學). */
  band: 1 | 2 | 3 | 0
  funding: SchoolFunding
  difficulty: number
}

export interface Origin {
  university: string
  exam: 'HKDSE' | 'HKALE'
  examLabel: string
  percentile: number
  major: string
  pgdeNote: string
}

export interface StatDelta {
  passion?: number
  san?: number
  principal?: number
  colleague?: number
  renewPerm?: number
}

export interface Choice {
  id: string
  label: string
  description: string
  successRate: number
  costs: string
  effects: Record<Judgment, StatDelta>
}

export interface TurnContent {
  title?: string
  narrative: string
  percentileLines?: string[]
  choices: Choice[]
  allowCustom?: boolean
}

export interface GameState {
  phase: GamePhase
  turn: number
  seed: number
  origin: Origin | null
  jumpLevel: '小學' | '中學' | null
  schools: School[]
  currentSchoolIndex: number
  interviewSchool: School | null
  rank: Rank
  mpsPoint: number
  salary: number
  schoolName: string
  schoolType: string
  passion: number
  san: number
  principal: number
  colleague: number
  renewPerm: number
  careerTurns: number
  lastJudgment: Judgment | null
  lastJudgmentText: string
  currentTurn: TurnContent | null
  ending: EndingType
  endingTitle: string
  endingNarrative: string
  history: string[]
  customActionUsed: boolean
  interviewPanelResult: Judgment | null
  interviewMicroResult: Judgment | null
}

export const SAVE_KEY = 'hk-teacher-life-save-v1'
