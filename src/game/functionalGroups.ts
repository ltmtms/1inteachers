import type { Choice, FunctionalGroupId, GameState, TurnContent } from './types'
import { randomInt } from './rng'

export const ADMIN_TENURE_YEARS = 5

export const FUNCTIONAL_GROUP_LABELS: Record<FunctionalGroupId, string> = {
  admin: '行政組',
  it: '資訊科技組',
  academic: '學務組',
  discipline: '訓導組',
  eca: '課外活動組',
  counselling: '輔導組',
}

const emptyEffects = {
  大成功: {},
  成功: {},
  失敗: {},
  大失敗: {},
}

function choice(
  id: string,
  label: string,
  description: string,
  successRate: number,
  costs: string,
  effects: Choice['effects'],
): Choice {
  return { id, label, description, successRate, costs, effects }
}

export function isIctMajor(major: string | undefined): boolean {
  if (!major) return false
  return /ICT|資訊科技|電腦/i.test(major)
}

export function functionalGroupLabel(
  id: FunctionalGroupId | null | undefined,
): string {
  if (!id) return '未加入功能組'
  return FUNCTIONAL_GROUP_LABELS[id]
}

export function canJoinAdminGroup(state: GameState): boolean {
  return state.yearsAtSchool >= ADMIN_TENURE_YEARS
}

export function needsFunctionalGroupAssignment(state: GameState): boolean {
  return (
    state.phase === 'career' &&
    state.functionalGroup === null &&
    !state.functionalGroupOptOut
  )
}

export function shouldOfferAdminInvite(
  state: GameState,
  rng: () => number,
): boolean {
  if (state.functionalGroup === 'admin') return false
  if (!canJoinAdminGroup(state)) return false
  if (state.adminInviteResolved) return false
  return rng() < 0.22
}

export function buildFunctionalGroupAssignmentTurn(
  state: GameState,
  rng: () => number,
): TurnContent {
  const ict = isIctMajor(state.origin?.major)
  const hodLine = ict
    ? `科主任拍你膊頭：「你教${state.origin?.major}，資訊科技組缺人——Wi‑Fi 死、Google Classroom 又改版，副校話『非你莫屬』。」你可以接受命運，或者揀其他組別表態。`
    : `學年開始，副校在 Staff Meeting 公佈「功能組別」名單。各組都缺做嘢的人；你可以主動請纏，或者暫時專心教書。`

  const choices: Choice[] = [
    choice(
      'fg_assign_it',
      ict ? '【推薦】加入資訊科技組' : '加入資訊科技組',
      ict ? '校內預設 IT 支援（常加班）' : '系統、帳號、eLearning、教師 tech support',
      100,
      ict ? 'SAN -5 起；校長好感 +' : '體力 -1；非 ICT 較吃力',
      {
        大成功: { principal: 8, colleague: 5 },
        成功: { principal: 4, san: -3 },
        失敗: { san: -6 },
        大失敗: { san: -10, passion: -5 },
      },
    ),
    choice(
      'fg_assign_academic',
      '加入學務組',
      '升留班、考評、成績表、分班編制',
      100,
      'SAN -8；續約率視表現',
      {
        大成功: { principal: 10, renewPerm: 5 },
        成功: { principal: 5, san: -5 },
        失敗: { san: -8 },
        大失敗: { principal: -5, san: -12 },
      },
    ),
    choice(
      'fg_assign_discipline',
      '加入訓導組',
      '紀律、見家長、夜間會面',
      100,
      'SAN -10；好夜走',
      {
        大成功: { principal: 12 },
        成功: { principal: 6, san: -6 },
        失敗: { san: -10 },
        大失敗: { san: -16, colleague: -5 },
      },
    ),
    choice(
      'fg_assign_eca',
      '加入課外活動組',
      '比賽、交流團、周末外出',
      100,
      'SAN -12；校長最愛',
      {
        大成功: { principal: 14, renewPerm: 6 },
        成功: { principal: 8, san: -8 },
        失敗: { san: -12 },
        大失敗: { san: -18, passion: -6 },
      },
    ),
    choice(
      'fg_assign_counselling',
      '加入輔導組',
      '個別輔導、協調社工、情緒勞動',
      100,
      'SAN -8；熱誠 ±',
      {
        大成功: { passion: 12, colleague: 8 },
        成功: { passion: 5, san: -5 },
        失敗: { san: -10, passion: -5 },
        大失敗: { san: -16, passion: -10 },
      },
    ),
    choice(
      'fg_decline',
      '暫不加入任何功能組',
      '專心教書，但升遷曝光較低',
      100,
      '無組別專屬事件加成',
      emptyEffects,
    ),
  ]

  return {
    title: '學校功能組別',
    narrative: `${state.schoolName} 新學年人事編排：行政組、資訊科技組、學務組、訓導組、課外活動組、輔導組——六大功能組別分擔校政與學生支援。${hodLine} 行政組傳聞要「在校五年以上」才會被邀請，你目前在校約 ${state.yearsAtSchool} 年。`,
    percentileLines: [
      ict
        ? `ICT 教師被編入資訊科技組比例：全港約 ${randomInt(rng, 62, 88)}%`
        : `自願加入資訊科技組的非 ICT 教師：約 ${randomInt(rng, 8, 18)}%`,
    ],
    choices,
    allowCustom: false,
  }
}

export function buildAdminGroupInviteTurn(state: GameState): TurnContent {
  return {
    title: '行政組邀請',
    narrative: `你在 ${state.schoolName} 已任教滿 ${state.yearsAtSchool} 年。校長透過副校傳話：行政組開會缺「懂校內實務」的人手，邀請你加入行政組——從此要固定出席行政會議，參與編制、政策與人事討論。這是晉升管理線的伏線，也是 SAN 黑洞：會議可以從放學開到九點，而且「會後還有會」。`,
    percentileLines: [`行政組成員平均在校年資：高於全港 ${state.yearsAtSchool >= 7 ? 70 : 55}% 教師`],
    choices: [
      choice(
        'fg_join_admin',
        '接受加入行政組',
        '行政會議、校政決策、晉升曝光',
        100,
        'SAN -10 起；續約／Perm +',
        {
          大成功: { principal: 18, renewPerm: 12, san: -5 },
          成功: { principal: 10, renewPerm: 6, san: -8 },
          失敗: { san: -12 },
          大失敗: { san: -18, principal: -5 },
        },
      ),
      choice(
        'fg_decline_admin',
        '婉拒，留在現有組別',
        '保持教學主業',
        100,
        '無',
        {
          大成功: { passion: 8, san: 5 },
          成功: { passion: 4 },
          失敗: { principal: -6 },
          大失敗: { principal: -12 },
        },
      ),
      choice(
        'fg_delay_admin',
        '「再考慮」——下學年再講',
        '保留選項',
        68,
        '校長 視結果',
        {
          大成功: { principal: 5 },
          成功: {},
          失敗: { principal: -8 },
          大失敗: { principal: -14 },
        },
      ),
    ],
    allowCustom: false,
  }
}

export function assignGroupFromChoiceId(choiceId: string): FunctionalGroupId | null {
  const map: Record<string, FunctionalGroupId> = {
    fg_assign_admin: 'admin',
    fg_assign_it: 'it',
    fg_assign_academic: 'academic',
    fg_assign_discipline: 'discipline',
    fg_assign_eca: 'eca',
    fg_assign_counselling: 'counselling',
    fg_join_admin: 'admin',
  }
  return map[choiceId] ?? null
}
