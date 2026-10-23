import {
  MAJORS,
  PGDE_RATE_TEXT,
  PRIMARY_SCHOOLS,
  SECONDARY_SCHOOLS,
  schoolTypeLabel,
  UNIVERSITIES,
} from './constants'
import { createRng, percentile, pickOne, randomInt } from './rng'
import {
  buildJumpTurn,
  buildMicroTeaching,
  buildOriginTurn,
  buildPanelInterview,
  buildPrincipalInterview,
  buildSchoolPickTurn,
  customActionChoice,
  pickCareerEvent,
} from './scenarios'
import {
  assignGroupFromChoiceId,
  isIctMajor,
} from './functionalGroups'
import {
  applyDelta,
  clampStat,
  createInitialState,
  judgeOutcome,
  setContractJob,
  setTAJob,
} from './state'
import type { Choice, GameState, Origin, School } from './types'

function rollOrigin(rng: () => number): Origin {
  const examRoll = rng()
  const exam = examRoll > 0.35 ? 'HKDSE' : 'HKALE'
  const examLabel =
    exam === 'HKDSE'
      ? `DSE 最佳 5 科 ${randomInt(rng, 18, 32)} 分`
      : `ALE ${randomInt(rng, 2, 4)}A${randomInt(rng, 0, 2)}B`
  const pct =
    exam === 'HKDSE'
      ? percentile(rng, 55, 96)
      : percentile(rng, 45, 92)
  return {
    university: pickOne(rng, UNIVERSITIES),
    exam,
    examLabel,
    percentile: pct,
    major: pickOne(rng, MAJORS),
    pgdeNote: PGDE_RATE_TEXT,
  }
}

function drawSchools(level: '小學' | '中學', rng: () => number): School[] {
  const pool = level === '小學' ? [...PRIMARY_SCHOOLS] : [...SECONDARY_SCHOOLS]
  const picked: School[] = []
  while (picked.length < 3 && pool.length) {
    const i = Math.floor(rng() * pool.length)
    picked.push(pool.splice(i, 1)[0])
  }
  return picked
}

function interviewPass(
  school: School,
  judgments: (string | null)[],
  rng: () => number,
): boolean {
  let score = 0
  for (const j of judgments) {
    if (j === '大成功') score += 3
    else if (j === '成功') score += 2
    else if (j === '失敗') score += 0
    else if (j === '大失敗') score -= 2
  }
  const threshold = school.difficulty / 15
  const roll = rng() * 100
  return score >= threshold && roll < 55 + score * 8 - school.difficulty * 0.2
}

export function startNewGame(seed?: number): GameState {
  const base = createInitialState(seed)
  const rng = createRng(base.seed)
  const origin = rollOrigin(rng)
  const state: GameState = {
    ...base,
    phase: 'origin',
    turn: 1,
    origin,
    currentTurn: null,
  }
  state.currentTurn = buildOriginTurn(state)
  return state
}

function withJudgment(
  state: GameState,
  choice: Choice,
  rng: () => number,
  customText?: string,
): GameState {
  const roll = rng() * 100
  const judgment = judgeOutcome(choice.successRate, roll)
  let next = applyDelta(state, choice.effects[judgment])
  const detail = customText ? `（自訂行動：${customText}）` : ''
  next = {
    ...next,
    lastJudgment: judgment,
    lastJudgmentText: `【判定：${judgment}】${detail}（骰值 ${roll.toFixed(1)}／成功率 ${choice.successRate}%）`,
    history: [...next.history, next.lastJudgmentText],
  }
  return next
}

function checkSanEnding(state: GameState): GameState {
  if (state.san <= 0 && state.phase !== 'ending') {
    return {
      ...state,
      phase: 'ending',
      ending: 'burnout',
      endingTitle: '結局：SAN 歸零 — 精神崩潰',
      endingNarrative:
        '你在教員室洗手間對住鏡喊到失聲，校工敲門問「老師 OK 嗎」。校長批准病假兩星期，但人事部暗示「可能唔適合繼續任教」。你辭職信同醫生紙一齊交上——香港教師生涯模擬器，Game Over。轉行做瑜伽導師？先睡足四十八小時再講。',
      currentTurn: null,
    }
  }
  return state
}

function finalizeCareer(state: GameState, rng: () => number): GameState {
  let s = state
  if (s.careerTurns >= 10 || (s.careerTurns >= 6 && rng() < 0.35)) {
    if (s.rank === '常額位') return s
    const roll = rng() * 100
    if (s.renewPerm >= 72 && roll < s.renewPerm) {
      return {
        ...s,
        phase: 'ending',
        ending: 'perm_win',
        rank: '常額位',
        mpsPoint: clampStat(s.mpsPoint + 4, 14, 34),
        endingTitle: '結局：常額位 (Perm) — 1 in 80 Billion 的贏家',
        endingNarrative: `經過多年合約奴工、TDD 與家長電郵，${s.schoolName} 終於批出常額位。月薪跳升，教員室有人恭喜、有人酸「內定」。你望住 MPS 表，唔知應該開心定繼續驚下個學年又有新改革。至少——你贏咗一場機率遊戲。`,
        currentTurn: null,
      }
    }
    if (roll > s.renewPerm + 25) {
      return {
        ...s,
        phase: 'ending',
        ending: 'unemployed',
        rank: '待業',
        salary: 0,
        endingTitle: '結局：不續約 — 失業',
        endingNarrative:
          '暑假一封短訊：「感謝你過去嘅貢獻，合約不予續約。」JUMP 又要重新登入，TA 職位竟爭激烈過以前。你開始懷疑「全人教育」係咪淨係口號。',
        currentTurn: null,
      }
    }
  }
  return s
}

export function resolveChoice(
  state: GameState,
  choiceId: string,
  customText?: string,
): GameState {
  if (state.phase === 'ending' || !state.currentTurn) return state
  const rng = createRng(state.seed + state.turn * 9973)
  let choice = state.currentTurn.choices.find((c) => c.id === choiceId)
  if (!choice && choiceId === 'custom' && customText) {
    choice = customActionChoice(customText)
  }
  if (!choice) return state

  let next = withJudgment(state, choice, rng, customText)
  next = { ...next, turn: next.turn + 1 }

  switch (state.phase) {
    case 'origin':
      if (choiceId === 'continue' || choice.successRate === 100) {
        next.phase = 'jump'
        next.currentTurn = buildJumpTurn()
      }
      break

    case 'jump': {
      let level: '小學' | '中學' | null = null
      if (choiceId === 'pri') level = '小學'
      else if (choiceId === 'sec') level = '中學'
      else if (choiceId === 'both') {
        level = rng() > 0.5 ? '中學' : '小學'
        next.san = clampStat(next.san - 3)
      } else if (choiceId === 'custom' && customText) {
        level = customText.includes('小') ? '小學' : '中學'
      }
      if (level) {
        next.jumpLevel = level
        next.schools = drawSchools(level, createRng(next.seed + 42))
        next.currentSchoolIndex = 0
        next.phase = 'school_pick'
        next.currentTurn = buildSchoolPickTurn(next.schools, 0)
      }
      break
    }

    case 'school_pick': {
      const school = next.schools[next.currentSchoolIndex]
      if (choiceId === 'skip') {
        if (next.currentSchoolIndex < next.schools.length - 1) {
          next.currentSchoolIndex += 1
          next.currentTurn = buildSchoolPickTurn(
            next.schools,
            next.currentSchoolIndex,
          )
        } else {
          next = setTAJob(next)
          next.phase = 'career'
          next.careerTurns = 0
          next.currentTurn = {
            title: '全軍覆沒 — 強制 TA',
            narrative:
              '三間學校都無你份，或者你選擇放棄。人事部安排你做教學助理：月薪 $17,000，日常印卷、整水機、維護學校網頁。科主任話「做熟咗可以推薦你再報教席」——聽落似係無限輪迴的開場白。',
            percentileLines: ['TA 晉升教席機率：全港約 12%–18%'],
            choices: [
              {
                id: 'ta_start',
                label: '接受現實，開始校園修羅場',
                description: '進入職場事件池',
                successRate: 100,
                costs: '無',
                effects: {
                  大成功: {},
                  成功: {},
                  失敗: {},
                  大失敗: {},
                },
              },
            ],
            allowCustom: false,
          }
        }
      } else if (choiceId === 'research') {
        next.currentTurn = buildSchoolPickTurn(next.schools, next.currentSchoolIndex)
      } else if (choiceId === 'apply') {
        next.interviewSchool = school
        next.phase = 'interview_panel'
        next.currentTurn = buildPanelInterview(school, createRng(next.seed + next.turn))
      }
      break
    }

    case 'interview_panel':
      next.phase = 'interview_micro'
      next.currentTurn = buildMicroTeaching(
        next.interviewSchool!,
        createRng(next.seed + next.turn),
      )
      next.interviewPanelResult = next.lastJudgment
      break

    case 'interview_micro':
      next.phase = 'interview_principal'
      next.currentTurn = buildPrincipalInterview(next.interviewSchool!)
      next.interviewMicroResult = next.lastJudgment
      break

    case 'interview_principal': {
      const school = next.interviewSchool!
      const panel = next.interviewPanelResult
      const micro = next.interviewMicroResult
      const principal = next.lastJudgment
      const passed = interviewPass(
        school,
        [panel ?? null, micro ?? null, principal],
        createRng(next.seed + next.turn * 3),
      )
      if (passed) {
        next = setContractJob(
          next,
          school.name,
          schoolTypeLabel(school),
          school.band,
        )
        next.phase = 'career'
        next.careerTurns = 0
        next.currentTurn = {
          title: '錄取！合約教席',
          narrative: `恭喜（或者同情）——${school.name} 向你發出合約教席聘書。月薪 MPS Pt. ${next.mpsPoint}（$${next.salary.toLocaleString()}）。校長握手時話「期待你全情投入」。你微笑，心入面計緊還幾年學貸。校園修羅場正式開始。`,
          percentileLines: [
            `你的錄取排名約勝過全港 ${percentile(createRng(next.seed), 60, 92)}% 同期申請者`,
          ],
          choices: [
            {
              id: 'career_go',
              label: '簽約，開始第一學年',
              description: '進入事件池',
              successRate: 100,
              costs: 'SAN -5（現實感）',
              effects: {
                大成功: { passion: 5 },
                成功: { san: -3 },
                失敗: { san: -5 },
                大失敗: { san: -8 },
              },
            },
          ],
          allowCustom: false,
        }
      } else if (next.currentSchoolIndex < next.schools.length - 1) {
        next.currentSchoolIndex += 1
        next.phase = 'school_pick'
        next.interviewSchool = null
        next.currentTurn = buildSchoolPickTurn(
          next.schools,
          next.currentSchoolIndex,
        )
      } else {
        next = setTAJob(next)
        next.phase = 'career'
        next.careerTurns = 0
        next.currentTurn = {
          title: '面試全滅 — TA 之路',
          narrative:
            '三部曲面試後，人事部禮貌回覆「會保留履歷」。你成為 TA，月薪 $17,000，專業技能包括：換碳粉、修投影機、幫科主任貼標籤。',
          choices: [
            {
              id: 'ta_go',
              label: '繼續生存',
              description: '進入事件池',
              successRate: 100,
              costs: '無',
              effects: {
                大成功: {},
                成功: {},
                失敗: {},
                大失敗: {},
              },
            },
          ],
          allowCustom: false,
        }
      }
      break
    }

    case 'career': {
      const isCareerIntro =
        choiceId === 'ta_start' ||
        choiceId === 'ta_go' ||
        choiceId === 'career_go'

      if (isCareerIntro) {
        next.careerTurns = 0
        next.yearsAtSchool = 0
      } else {
        next.careerTurns += 1
        const skipTenureYear =
          choiceId.startsWith('fg_assign_') || choiceId === 'fg_decline'
        if (!skipTenureYear) {
          next.yearsAtSchool += 1
        }
      }

      if (choiceId === 'fg_decline') {
        next.functionalGroupOptOut = true
      }
      const assigned = assignGroupFromChoiceId(choiceId)
      if (assigned) {
        next.functionalGroup = assigned
        next.functionalGroupOptOut = false
      }
      if (choiceId === 'fg_join_admin' || choiceId === 'fg_decline_admin') {
        next.adminInviteResolved = true
      }
      if (
        choiceId === 'fg_decline' &&
        isIctMajor(next.origin?.major) &&
        createRng(next.seed + next.turn * 31)() < 0.38
      ) {
        next.functionalGroup = 'it'
        next.functionalGroupOptOut = false
        next.lastJudgmentText =
          `${next.lastJudgmentText} 【校務：ICT 教師缺人，副校已將你列入資訊科技組名單。】`
      }

      if (choiceId === 'exit' && choice.effects) {
        const j = next.lastJudgment
        if (j === '大成功' || j === '成功') {
          next = {
            ...next,
            phase: 'ending',
            ending: 'career_change',
            endingTitle: '結局：轉行 — 離開教壇',
            endingNarrative:
              '你報讀 UX 設計／企業培訓／公關寫手課程，教員室群組設為靜音。偶爾夢見 SBA 截止日，驚醒後發現唔使再改卷——呢份自由，用三年 SAN 換返來。',
            currentTurn: null,
          }
          break
        }
      }

      if (
        choiceId === 'perm' &&
        (next.lastJudgment === '大成功' || next.lastJudgment === '成功') &&
        next.renewPerm >= 55
      ) {
        next = {
          ...next,
          phase: 'ending',
          ending: 'perm_win',
          rank: '常額位',
          endingTitle: '結局：爭 Perm 成功',
          endingNarrative: `校政會議後，你收到 Perm 確認。${next.schoolName} 教員室有人拍你膊頭，有人默默刪走你嘅 WhatsApp。`,
          currentTurn: null,
        }
        break
      }

      next = checkSanEnding(next)
      if (next.phase === 'ending') break

      next = finalizeCareer(next, createRng(next.seed + next.turn))
      if (next.phase === 'ending') break

      next.currentTurn = pickCareerEvent(
        next,
        createRng(next.seed + next.turn * 17),
      )
      break
    }
  }

  next = checkSanEnding(next)
  return next
}
