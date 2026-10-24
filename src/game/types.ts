import type { TeacherSalaryTrack } from './salaryScale'

export type Judgment = '大成功' | '成功' | '失敗' | '大失敗'

export type Rank = '待業' | 'TA' | '合約教席' | '常額位'

export type GamePhase =
  | 'menu'
  | 'origin'
  | 'jump'
  | 'jump_browse'
  | 'jump_waiting'
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

/** 學校功能組別（津貼／直資中小學常見編制） */
export type FunctionalGroupId =
  | 'admin'
  | 'it'
  | 'academic'
  | 'discipline'
  | 'eca'
  | 'counselling'

export type SchoolFunding = '津貼/資助' | '直資 (DSS)'

export interface School {
  name: string
  /** 18 區／地區（CHSC 學校概覽） */
  district: string
  /** 中學：CHSC 派位組別參考；小學：聯繫／校風 gameplay tier */
  band: 1 | 2 | 3 | 0
  funding: SchoolFunding
  difficulty: number
  /** 辦學宗旨或校訓（CHSC 學校概覽摘錄） */
  profileNote?: string
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
  salaryTrack: TeacherSalaryTrack | null
  schoolName: string
  schoolDistrict: string
  schoolType: string
  /** TA 任職學校（完整資料，供原校升教席等） */
  taSchool: School | null
  /** 本輪面試是否為原校 TA 重新 second in */
  interviewIsReInterview: boolean
  jumpAds: string[]
  passion: number
  san: number
  principal: number
  colleague: number
  renewPerm: number
  careerTurns: number
  /** 在現任學校累積年資（每完成一個職場回合 +1） */
  yearsAtSchool: number
  /** 所屬功能組；null 表示尚未加入或曾選擇暫不加入 */
  functionalGroup: FunctionalGroupId | null
  /** 玩家曾明確選擇暫不加入功能組 */
  functionalGroupOptOut: boolean
  /** 已處理過行政組邀請（接受、婉拒或押後） */
  adminInviteResolved: boolean
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

export const SAVE_KEY = 'hk-teacher-life-save-v2'
