import {
  formatSalaryStatus,
  mpsMonthlySalary,
  PGDE_RATE_TEXT,
  PRIMARY_SCHOOLS,
  SECONDARY_SCHOOLS,
} from './constants'
import { HK_RESIDENTIAL_AREAS } from './data/hkResidence'
import { JUPAS_PROGRAMMES } from './data/jupasProgrammes'
import { applyFamilyChoiceEffects } from './familyEvents'
import { PROMOTION_RATES } from './leadership'
import { tickSalaryProgression } from './salaryScale'
import { createRng, percentile, pickOne, randomInt } from './rng'
import {
  coverLetterStyleById,
  formatInviteReplyLines,
  rollInterviewInvites,
  type CoverLetterStyleId,
} from './coverLetter'
import { drawJumpAds, type JumpAd } from './jumpAds'
import {
  buildJumpApplyPickTurn,
  buildJumpBrowseTurn,
  buildJumpCoverLetterTurn,
  buildJumpNoInviteTurn,
  buildJumpTurn,
  buildJumpWaitingTurn,
  buildMicroTeaching,
  buildOriginTurn,
  buildPgdeApplyTurn,
  buildPanelInterview,
  buildPrincipalInterview,
  buildSchoolPickTurn,
  customActionChoice,
  MAX_JUMP_APPLICATIONS,
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
  isTaSchoolBlocked,
  judgeOutcome,
  setContractJob,
  setTAJob,
} from './state'
import type { Choice, GameState, Origin, School } from './types'

function rollOrigin(rng: () => number): Origin {
  const programme = pickOne(rng, JUPAS_PROGRAMMES)
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
    university: programme.university,
    exam,
    examLabel,
    percentile: pct,
    major: programme.teachingSubject,
    jupasProgramme: programme.name,
    jupasCode: programme.code,
    pgdeNote: PGDE_RATE_TEXT,
  }
}

function pickTAPlacementSchool(state: GameState, rng: () => number): School {
  if (state.interviewSchool) return state.interviewSchool
  const idxSchool = state.schools[state.currentSchoolIndex]
  if (idxSchool) return idxSchool
  if (state.taSchool) return state.taSchool
  if (state.jumpAppliedSchools.length) {
    return pickOne(rng, state.jumpAppliedSchools)
  }
  const pool =
    state.jumpLevel === '小學' ? [...PRIMARY_SCHOOLS] : [...SECONDARY_SCHOOLS]
  return pickOne(rng, pool)
}

function coverStyleFromChoice(choiceId: string, customText?: string): CoverLetterStyleId {
  if (choiceId.startsWith('cover_')) {
    return choiceId.slice('cover_'.length) as CoverLetterStyleId
  }
  if (customText?.includes('武')) return 'wuxia'
  if (customText?.includes('謙') || customText?.includes('溫')) return 'modest'
  if (customText?.includes('進取') || customText?.includes('積極')) return 'assertive'
  return 'pragmatic'
}

function appliedAdsFromSelection(state: GameState): JumpAd[] {
  const ids = new Set(state.jumpSelectedAdIds)
  return state.jumpAds.filter((ad) => ids.has(ad.id))
}

function appliedSchoolsFromSelection(state: GameState): School[] {
  return appliedAdsFromSelection(state).map((ad) => ad.school)
}

function vacancySubjectForSchool(state: GameState, school: School): string {
  const ad = state.jumpAppliedAds.find((a) => a.school.name === school.name)
  return ad?.subject ?? state.origin?.major ?? '公社科'
}

function checkRetirement(state: GameState): GameState {
  if (state.age >= 60 && state.phase !== 'ending') {
    return {
      ...state,
      phase: 'ending',
      ending: 'retirement',
      endingTitle: '結局：60 歲退休 — 告別教壇',
      endingNarrative:
        `你在 ${state.schoolName} 教到最後一個學年，校園廣播依然嘈，但你終於可以準時接孫仔放學。1 in 80K 嘅教師路，你用年資換來一張退休證——唔完美，但係你嘅版本。`,
      currentTurn: null,
    }
  }
  return state
}

function advanceCareerYear(state: GameState): GameState {
  return {
    ...state,
    careerTurns: state.careerTurns + 1,
    age: state.age + 1,
    savings: state.savings + Math.max(0, Math.round(state.salary * 0.15)),
  }
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
  const residence = pickOne(rng, HK_RESIDENTIAL_AREAS)
  const state: GameState = {
    ...base,
    phase: 'origin',
    turn: 1,
    origin,
    residence,
    age: 22,
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
      endingTitle: '結局：精神健康值歸零 — 精神崩潰',
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
        mpsPoint: clampStat(s.mpsPoint + 4, 12, 36),
        salary: mpsMonthlySalary(clampStat(s.mpsPoint + 4, 12, 36)),
        endingTitle: '結局：常額位 (Perm) — 1 in 80K 的贏家',
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
          '暑假一封短訊：「感謝你過去嘅貢獻，合約不予續約。」跳跳網又要重新登入，TA 職位竟爭激烈過以前。你開始懷疑「全人教育」係咪淨係口號。',
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
        next.phase = 'pgde_apply'
        next.currentTurn = buildPgdeApplyTurn()
      }
      break

    case 'pgde_apply': {
      if (choiceId === 'pgde_apply_full') {
        next.pgdeStatus =
          next.lastJudgment === '大成功' || next.lastJudgment === '成功'
            ? 'enrolled'
            : next.lastJudgment === '失敗'
              ? 'waitlisted'
              : 'applying'
      } else if (choiceId === 'pgde_apply_part') {
        next.pgdeStatus =
          next.lastJudgment === '大成功' || next.lastJudgment === '成功'
            ? 'enrolled'
            : 'applying'
      }
      next.phase = 'jump'
      next.currentTurn = buildJumpTurn()
      break
    }

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
        const adRng = createRng(next.seed + 77)
        const ads = drawJumpAds(level, adRng)
        next.jumpAds = ads
        next.jumpSelectedAdIds = []
        next.jumpAppliedAds = []
        next.jumpAppliedSchools = []
        next.coverLetterStyle = null
        next.jumpReplySummary = []
        next.interviewVacancySubject = null
        next.phase = 'jump_browse'
        next.currentTurn = buildJumpBrowseTurn(level, next.jumpAds)
      }
      break
    }

    case 'jump_browse': {
      const level = next.jumpLevel!
      if (choiceId === 'jump_refresh') {
        const adRng = createRng(next.seed + next.turn * 13)
        const ads = drawJumpAds(level, adRng)
        next.jumpAds = ads
        next.jumpSelectedAdIds = []
        next.currentTurn = buildJumpBrowseTurn(level, next.jumpAds)
      } else if (choiceId === 'jump_apply' || choiceId === 'custom') {
        next.phase = 'jump_apply_pick'
        next.currentTurn = buildJumpApplyPickTurn(
          next.jumpAds,
          next.jumpSelectedAdIds,
        )
      }
      break
    }

    case 'jump_apply_pick': {
      const level = next.jumpLevel!
      if (choiceId.startsWith('jump_toggle_')) {
        const adId = choiceId.slice('jump_toggle_'.length)
        const selected = [...next.jumpSelectedAdIds]
        const at = selected.indexOf(adId)
        if (at >= 0) selected.splice(at, 1)
        else if (selected.length < MAX_JUMP_APPLICATIONS) selected.push(adId)
        next.jumpSelectedAdIds = selected
        next.currentTurn = buildJumpApplyPickTurn(next.jumpAds, selected)
      } else if (choiceId === 'jump_back_browse') {
        next.phase = 'jump_browse'
        next.currentTurn = buildJumpBrowseTurn(level, next.jumpAds)
      } else if (choiceId === 'jump_confirm_apply') {
        if (next.jumpSelectedAdIds.length === 0) {
          next.currentTurn = buildJumpApplyPickTurn(
            next.jumpAds,
            next.jumpSelectedAdIds,
          )
        } else {
          next.jumpAppliedAds = appliedAdsFromSelection(next)
          next.jumpAppliedSchools = appliedSchoolsFromSelection(next)
          next.phase = 'jump_cover_letter'
          next.currentTurn = buildJumpCoverLetterTurn(next.jumpAppliedSchools)
        }
      }
      break
    }

    case 'jump_cover_letter': {
      const level = next.jumpLevel!
      if (choiceId.startsWith('cover_') || choiceId === 'custom') {
        const styleId = coverStyleFromChoice(choiceId, customText)
        next.coverLetterStyle = styleId
        const style = coverLetterStyleById(styleId)
        next.phase = 'jump_waiting'
        next.currentTurn = buildJumpWaitingTurn(level, style.label)
      }
      break
    }

    case 'jump_waiting': {
      const level = next.jumpLevel!
      const styleId = next.coverLetterStyle ?? 'pragmatic'
      const inviteRng = createRng(next.seed + next.turn * 31 + 42)
      const { invited, declined } = rollInterviewInvites(
        next.jumpAppliedSchools,
        styleId,
        inviteRng,
      )
      next.jumpReplySummary = formatInviteReplyLines(invited, declined, styleId)
      next.schools = invited
      next.currentSchoolIndex = 0
      next.interviewIsReInterview = false
      if (invited.length > 0) {
        next.phase = 'school_pick'
        next.currentTurn = buildSchoolPickTurn(
          next.schools,
          0,
          next.jumpReplySummary,
        )
      } else {
        next.phase = 'jump_no_invite'
        next.currentTurn = buildJumpNoInviteTurn(level)
      }
      break
    }

    case 'jump_no_invite': {
      const level = next.jumpLevel!
      if (choiceId === 'jump_retry') {
        const adRng = createRng(next.seed + next.turn * 17)
        const ads = drawJumpAds(level, adRng)
        next.jumpAds = ads
        next.jumpSelectedAdIds = []
        next.jumpAppliedAds = []
        next.jumpAppliedSchools = []
        next.coverLetterStyle = null
        next.jumpReplySummary = []
        next.interviewVacancySubject = null
        next.phase = 'jump_browse'
        next.currentTurn = buildJumpBrowseTurn(level, next.jumpAds)
      } else if (choiceId === 'jump_ta_fallback' || choiceId === 'custom') {
        const taSchool = pickTAPlacementSchool(
          next,
          createRng(next.seed + next.turn),
        )
        next = setTAJob(next, taSchool)
        next.phase = 'career'
        next.careerTurns = 0
        next.currentTurn = {
          title: '無面試邀請 — 過渡 TA',
          narrative:
            `今輪投書沒有學校約 second in。人事中介安排你到 ${taSchool.name}（${taSchool.district}）做教學助理：月薪 $17,000，日常印卷、整水機、維護學校網頁。科主任話「做熟咗可以再報跳跳網」——多數仍要重新面試。`,
          percentileLines: next.jumpReplySummary,
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
          const taSchool = pickTAPlacementSchool(
            next,
            createRng(next.seed + next.turn),
          )
          next = setTAJob(next, taSchool)
          next.phase = 'career'
          next.careerTurns = 0
          next.currentTurn = {
            title: '全軍覆沒 — 強制 TA',
            narrative:
              `本輪獲邀學校都無你份，或者你選擇放棄。人事部安排你到 ${taSchool.name}（${taSchool.district}）做教學助理：月薪 $17,000，日常印卷、整水機、維護學校網頁。**記住：做 TA 之後必須轉校**才可再任教席，唔可以喺同一間學校直接升做老師。`,
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
        if (isTaSchoolBlocked(next, school)) {
          next.currentTurn = {
            title: '無法應徵原校教席',
            narrative: `人事部回覆：你曾於 ${school.name} 任 TA，按規定**必須轉校**才可再申請教席。請揀其他學校，或返回跳跳網。`,
            choices: [
              {
                id: 'skip',
                label: '轉試下一間學校',
                description: '遵守轉校規則',
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
          break
        }
        next.interviewSchool = school
        next.interviewVacancySubject = vacancySubjectForSchool(next, school)
        next.phase = 'interview_panel'
        next.interviewIsReInterview = false
        next.currentTurn = buildPanelInterview(
          school,
          createRng(next.seed + next.turn),
          false,
          next,
        )
      }
      break
    }

    case 'interview_panel':
      next.phase = 'interview_micro'
      next.currentTurn = buildMicroTeaching(
        next.interviewSchool!,
        createRng(next.seed + next.turn),
        next,
      )
      next.interviewPanelResult = next.lastJudgment
      break

    case 'interview_micro':
      next.phase = 'interview_principal'
      next.currentTurn = buildPrincipalInterview(
        next.interviewSchool!,
        createRng(next.seed + next.turn),
        next.interviewIsReInterview,
      )
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
        next = setContractJob(next, school)
        if (next.taBlockedSchoolName && school.name !== next.taBlockedSchoolName) {
          next.taBlockedSchoolName = null
          next.taSchool = null
        }
        next.interviewIsReInterview = false
        next.phase = 'career'
        next.careerTurns = 0
        next.currentTurn = {
          title: '錄取！合約教席',
          narrative: `恭喜（或者同情）——${school.name}（${school.district}）向你發出合約教席聘書。${formatSalaryStatus(next.rank, next.salaryTrack, next.mpsPoint, next.salary)}。校長握手時話「期待你全情投入」。你微笑，心入面計緊還幾年學貸。校園修羅場正式開始。`,
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
          next.currentSchoolIndex === 0 ? next.jumpReplySummary : undefined,
        )
      } else {
        const taSchool =
          state.rank === 'TA' && next.taSchool
            ? next.taSchool
            : pickTAPlacementSchool(
                next,
                createRng(next.seed + next.turn * 5),
              )
        next = setTAJob(next, taSchool)
        next.phase = 'career'
        next.careerTurns = state.rank === 'TA' ? next.careerTurns : 0
        next.currentTurn = {
          title: state.rank === 'TA' ? '面試落敗 — 繼續做 TA' : '面試全滅 — TA 之路',
          narrative:
            `三部曲面試後，人事部禮貌回覆「會保留履歷」。你到 ${taSchool.name}（${taSchool.district}）做 TA，月薪 $17,000。**日後要任教席必須轉校**，請用跳跳網申請其他學校。`,
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
        next = advanceCareerYear(next)
        const skipTenureYear =
          choiceId.startsWith('fg_assign_') || choiceId === 'fg_decline'
        if (!skipTenureYear) {
          next.yearsAtSchool += 1
        }
        next = checkRetirement(next)
        if (next.phase === 'ending') break
        if (
          next.rank === '合約教席' ||
          next.rank === '常額位'
        ) {
          const track = next.salaryTrack ?? (next.jumpLevel === '小學' ? 'APSM' : 'GM')
          const newPoint = tickSalaryProgression(
            next.mpsPoint,
            next.yearsAtSchool,
            next.rank,
          )
          if (newPoint !== next.mpsPoint) {
            next.mpsPoint = newPoint
            next.salary = mpsMonthlySalary(newPoint)
            next.salaryTrack = track
          }
        }
      }

      if (choiceId === 'ta_same_school') {
        next.currentTurn = {
          title: '原校教席 — 申請被拒',
          narrative: `人事部正式回覆：你曾於 ${next.schoolName} 任 TA，按規定**不可於同一學校直接轉任教席**。唯一途徑：透過跳跳網**轉校**並通過 second in。`,
          percentileLines: ['引擎規則：taBlockedSchoolName 鎖定原校直至轉校錄取'],
          choices: [
            {
              id: 'ta_jump_hunt',
              label: '[跳跳網] 轉校搵教席',
              description: '正規路線',
              successRate: 100,
              costs: '無',
              effects: {
                大成功: {},
                成功: {},
                失敗: {},
                大失敗: {},
              },
            },
            {
              id: 'ta_stay',
              label: '[繼續] 做 TA',
              description: '觀望',
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
        break
      }

      if (choiceId === 'ta_jump_hunt') {
        const level =
          next.jumpLevel ??
          (next.taSchool && next.taSchool.band <= 2 ? '中學' : '中學')
        next.jumpLevel = level
        const adRng = createRng(next.seed + next.turn * 23)
        const ads = drawJumpAds(level, adRng)
        next.jumpAds = ads
        next.jumpSelectedAdIds = []
        next.jumpAppliedAds = []
        next.jumpAppliedSchools = []
        next.coverLetterStyle = null
        next.jumpReplySummary = []
        next.interviewVacancySubject = null
        next.phase = 'jump_browse'
        next.currentTurn = buildJumpBrowseTurn(level, next.jumpAds)
        break
      }

      if (choiceId === 'ta_stay') {
        next.currentTurn = pickCareerEvent(
          next,
          createRng(next.seed + next.turn * 17),
        )
        break
      }

      if (choiceId.startsWith('family_')) {
        next = applyFamilyChoiceEffects(
          next,
          choiceId,
          createRng(next.seed + next.turn * 41),
        )
      }

      if (choiceId.startsWith('promo_') && choiceId !== 'promo_skip') {
        const target = choiceId.replace('promo_', '') as keyof typeof PROMOTION_RATES
        if (
          (next.lastJudgment === '大成功' || next.lastJudgment === '成功') &&
          target in PROMOTION_RATES
        ) {
          next.leadershipRank = target as GameState['leadershipRank']
          next.lastJudgmentText =
            `${next.lastJudgmentText} 【晉升成功：${target}（設定機率 ${PROMOTION_RATES[target]}%）】`
        } else if (target in PROMOTION_RATES) {
          next.lastJudgmentText =
            `${next.lastJudgmentText} 【晉升落敗：${target}（設定機率 ${PROMOTION_RATES[target]}%）】`
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
