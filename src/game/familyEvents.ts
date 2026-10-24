import type { Choice, GameState, TurnContent } from './types'
import { randomInt } from './rng'
import { HK_RESIDENTIAL_AREAS } from './data/hkResidence'
import { pickOne } from './rng'

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

export function tryPickFamilyEvent(state: GameState, rng: () => number): TurnContent | null {
  if (state.phase !== 'career') return null
  const roll = rng()
  if (state.relationship === 'single' && state.age >= 24 && roll < 0.12) {
    return {
      title: '拍拖',
      narrative: `放學後你同同事去觀塘食甜品，意外認識咗一位在 ${state.residence.split('·')[0]?.trim() ?? '港島'} 做設計的朋友。WhatsApp 由「晚安」變成「聽日見」——教師工時話唔定，但心入面多咗一個理由想準時收工。`,
      percentileLines: [`同齡教師拍拖率分位：約 ${randomInt(rng, 35, 62)}%`],
      choices: [
        choice('family_dating_yes', '[拍拖] 認真發展', '關係升級', 72, '家庭負擔 +5', {
          大成功: { passion: 10, familyBurden: 8, san: 5 },
          成功: { passion: 5, familyBurden: 5 },
          失敗: { san: -5, familyBurden: 3 },
          大失敗: { san: -10, familyBurden: 10 },
        }),
        choice('family_dating_no', '[觀望] 以工作為先', '保持單身', 100, '無', emptyEffects),
      ],
      allowCustom: false,
    }
  }
  if (state.relationship === 'dating' && state.age >= 27 && roll < 0.1) {
    return {
      title: '結婚',
      narrative: `長跑多年，雙方父母終於問「幾時擺酒」。酒席預算、供樓同教師年假撞期——你喺 ${state.residence} 附近睇樓，發現一間房嘅呎價等於你半年 MPS。戒指細細粒，負擔大大個。`,
      percentileLines: ['婚後可選擇「搬家」至香港其他地區（職場事件）'],
      choices: [
        choice('family_marry', '[結婚] 擺酒兼簽紙', '開啟家庭生活', 65, '儲蓄 -$80,000；家庭負擔 +20', {
          大成功: { passion: 8, familyBurden: 18, savings: -80_000, san: 5 },
          成功: { familyBurden: 22, savings: -80_000 },
          失敗: { san: -12, familyBurden: 25, savings: -60_000 },
          大失敗: { san: -18, familyBurden: 30, savings: -50_000 },
        }),
        choice('family_marry_delay', '[押後] 再儲多兩年', '穩陣', 100, '無', {
          大成功: { san: 5 },
          成功: {},
          失敗: { passion: -5 },
          大失敗: { passion: -8, san: -5 },
        }),
      ],
      allowCustom: false,
    }
  }
  if (state.relationship === 'married' && state.children < 2 && state.age >= 29 && roll < 0.11) {
    const label = rng() > 0.5 ? '生仔' : '生女'
    return {
      title: label,
      narrative: `產假、侍產假、奶粉同夜奶——${state.schoolName} 人事部遞上家庭友善政策文件，但科主任同時問「代課安排」。你抱著新生兒，手機仍響住家長群組通知。`,
      choices: [
        choice('family_child', `[迎接] ${label}`, '家庭升級', 70, '家庭負擔 +25；精神健康 -', {
          大成功: { passion: 10, familyBurden: 22, san: -5 },
          成功: { familyBurden: 28, san: -10 },
          失敗: { familyBurden: 32, san: -15 },
          大失敗: { familyBurden: 38, san: -22 },
        }),
        choice('family_child_later', '[計劃] 再等兩年', '押後', 100, '無', emptyEffects),
      ],
      allowCustom: false,
    }
  }
  if (state.age >= 32 && roll < 0.06) {
    return {
      title: '家人離世',
      narrative: '電話在早會期間響起——親人離世。請假、帛金、儀式與情緒，全部壓在兩星期內。學校批准 compassionate leave，但代課安排仍要你自己協調。',
      choices: [
        choice('family_bereave', '[告別] 處理身後事', '情緒衝擊', 100, '精神健康 -15；家庭負擔 +10', {
          大成功: { san: -8, familyBurden: 8 },
          成功: { san: -15, familyBurden: 12 },
          失敗: { san: -22, familyBurden: 15 },
          大失敗: { san: -30, familyBurden: 18 },
        }),
      ],
      allowCustom: false,
    }
  }
  if (state.relationship === 'married' && roll < 0.08) {
    const dest = pickOne(rng, HK_RESIDENTIAL_AREAS.filter((a) => a !== state.residence))
    return {
      title: '搬家',
      narrative: `婚後你一直想搬離 ${state.residence}——近岳父岳母、或者為小朋友學校網考慮。睇中 ${dest} 一個單位：搬運、雙租、裝修一次過。（系統備註：${dest}）`,
      choices: [
        choice('family_move_yes', `[搬去] ${dest}`, '改善居住', 58, '儲蓄 -$120,000；家庭負擔 -8；精神健康 -5', {
          大成功: { savings: -100_000, familyBurden: -12, san: 5 },
          成功: { savings: -120_000, familyBurden: -8, san: -5 },
          失敗: { savings: -140_000, san: -12 },
          大失敗: { savings: -160_000, familyBurden: 5, san: -18 },
        }),
        choice('family_stay', '[不搬] 慳錢先', '維持現址', 100, '無', emptyEffects),
      ],
      allowCustom: false,
    }
  }
  return null
}

export function applyFamilyChoiceEffects(
  state: GameState,
  choiceId: string,
  rng: () => number,
): GameState {
  let next = { ...state }
  if (choiceId === 'family_dating_yes') next.relationship = 'dating'
  if (choiceId === 'family_marry') next.relationship = 'married'
  if (choiceId === 'family_child') next.children += 1
  if (choiceId === 'family_move_yes') {
    const options = HK_RESIDENTIAL_AREAS.filter((a) => a !== state.residence)
    next.residence = pickOne(rng, options.length ? options : HK_RESIDENTIAL_AREAS)
  }
  return next
}
