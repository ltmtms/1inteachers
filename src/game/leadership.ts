import type { Choice, GameState, TurnContent } from './types'

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

/** 晉升管理線成功率（符合資歷時嘗試） */
export const PROMOTION_RATES = {
  SGM: 40,
  PGM: 8,
  校長: 2,
} as const

/** 合約／常額教席，在校年資與管理線門檻（簡化） */
export function leadershipEligible(state: GameState): boolean {
  if (state.rank !== '合約教席' && state.rank !== '常額位') return false
  if (state.yearsAtSchool < 6) return false
  if (state.principal < 45) return false
  return true
}

export function buildLeadershipPromotionTurn(state: GameState): TurnContent {
  const target =
    state.leadershipRank === null
      ? 'SGM'
      : state.leadershipRank === 'SGM'
        ? 'PGM'
        : '校長'
  const rate = PROMOTION_RATES[target]
  return {
    title: `晉升遴選 · ${target}`,
    narrative: `校政會議後，人事部通知你符合提名資格：年資 ${state.yearsAtSchool} 年、校長評語尚可。遴選委員會話「公開、公平」——你知道名額稀少。今次晉升 ${target} 的通過率約 ${rate}%（遊戲設定）。`,
    percentileLines: [
      `SGM 約 ${PROMOTION_RATES.SGM}% · PGM 約 ${PROMOTION_RATES.PGM}% · 校長約 ${PROMOTION_RATES.校長}%`,
      '門檻：任教滿 6 年、管理層好感 ≥ 45',
    ],
    choices: [
      choice(
        `promo_${target}`,
        `[申請] 衝 ${target}`,
        '擲骰決定',
        rate,
        '精神健康 -8',
        {
          大成功: { principal: 15, passion: 10, san: -5 },
          成功: { principal: 8, san: -8 },
          失敗: { san: -15, principal: -5 },
          大失敗: { san: -22, principal: -12, colleague: -8 },
        },
      ),
      choice('promo_skip', '[放棄] 專心教班', '維持現職', 100, '無', {
        大成功: { san: 8 },
        成功: { san: 4 },
        失敗: {},
        大失敗: { principal: -5 },
      }),
    ],
    allowCustom: false,
  }
}
