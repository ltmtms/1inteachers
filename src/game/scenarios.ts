import { COVER_LETTER_STYLES } from './coverLetter'
import { schoolLocationLabel, schoolTypeLabel, TA_MONTHLY_SALARY } from './constants'
import {
  drawMicroTeaching,
  drawPanelQuestion,
  drawPrincipalInterview,
  drawSubjectInterviewQuestion,
} from './interviewQuestions'
import { formatJumpAdLine, type JumpAd } from './jumpAds'
import { tryPickFamilyEvent } from './familyEvents'
import { buildLeadershipPromotionTurn, leadershipEligible } from './leadership'
import {
  buildAdminGroupInviteTurn,
  buildFunctionalGroupAssignmentTurn,
  needsFunctionalGroupAssignment,
  shouldOfferAdminInvite,
} from './functionalGroups'
import { pickGroupCareerEvent } from './groupScenarios'
import type { Choice, GameState, School, TurnContent } from './types'
import { randomInt } from './rng'

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

export function buildOriginTurn(state: GameState): TurnContent {
  const o = state.origin!
  return {
    title: '第一階段：出身抽取',
    narrative: `系統為你擲出 **1 in 80K** 的命運骰子。你係本地大學畢業生，經 JUPAS 入讀 ${o.jupasProgramme}（${o.jupasCode}），畢業於${o.university}，主修／教席學科對照：${o.major}。公開試為${o.exam}（${o.examLabel}）。你住在 ${state.residence}，年齡 ${state.age} 歲。履歷上寫著「未有 PGDE」——${o.pgdeNote}。下一步：可先報 PGDE，再睇跳跳網搵工。`,
    percentileLines: [
      `全港分位：你的公開試成績打敗了 ${o.percentile}% 考生`,
      `JUPAS 課程（非醫科）：${o.jupasProgramme}`,
      o.pgdeNote,
    ],
    choices: [
      choice('continue', '繼續 → 睇跳跳網', '前往選擇小學或中學路線', 100, '無代價', {
        大成功: { passion: 2 },
        成功: {},
        失敗: {},
        大失敗: {},
      }),
    ],
    allowCustom: false,
  }
}

export function buildPgdeApplyTurn(): TurnContent {
  return {
    title: 'PGDE 進修關',
    narrative:
      '教育局與大學聯招 PGDE 名額稀少；未持 PGDE 仍可申請合約教席，但學校會問「你幾時完成？」你可以現階段報讀全日制／兼讀 PGDE——程序繁複、等候時間長，而且每次申請都會消耗精神健康值。亦可選擇先搵工，日後再進修。',
    percentileLines: [
      '全日制 PGDE 錄取率：約 5%–12%（視學科）',
      '報名／面試／候補均會增加壓力',
    ],
    choices: [
      choice(
        'pgde_apply_full',
        '[報名] 全日制 PGDE',
        '多步驟、低錄取率',
        12,
        '精神健康 -12',
        {
          大成功: { san: -8, passion: 8 },
          成功: { san: -12 },
          失敗: { san: -18, passion: -5 },
          大失敗: { san: -25, passion: -10 },
        },
      ),
      choice(
        'pgde_apply_part',
        '[報名] 兼讀 PGDE（邊做邊讀）',
        '更難兼顧',
        8,
        '精神健康 -15',
        {
          大成功: { san: -10 },
          成功: { san: -15 },
          失敗: { san: -22 },
          大失敗: { san: -28, passion: -8 },
        },
      ),
      choice(
        'pgde_skip',
        '[暫不報] 先搵教席',
        '直接睇跳跳網',
        100,
        '無',
        emptyEffects,
      ),
    ],
    allowCustom: false,
  }
}

export function buildJumpTurn(): TurnContent {
  return {
    title: '睇跳跳網',
    narrative:
      '你登入跳跳網：篩選「津貼／資助」「直資」職位，略過官立同國際學校。凌晨三點頁面仍會更新——小學職位多但「八達通老師」傳言不絕；中學薪金靚但 second in 委會會問到你靈魂深處。名單來自教育局學校資料入口所連結的 CHSC 學校概覽（津貼／資助及直資 DSS）。先選路線，下一步會顯示模擬招聘廣告，再按流程：選校投書 → 撰寫求職信風格 → 等候隨機回覆與 second in。',
    choices: [
      choice('pri', '【小學】', '申請小學教席路線', 100, '無代價', emptyEffects),
      choice('sec', '【中學】', '申請中學教席路線', 100, '無代價', emptyEffects),
      choice(
        'both',
        '【兩邊都投】',
        '廣撒網，但體力與 SAN 先扣一截',
        85,
        'SAN -8',
        {
          大成功: { colleague: 5 },
          成功: { san: -5 },
          失敗: { san: -8, passion: -3 },
          大失敗: { san: -15, passion: -8 },
        },
      ),
    ],
    allowCustom: true,
  }
}

export function buildJumpBrowseTurn(
  level: '小學' | '中學',
  ads: JumpAd[],
): TurnContent {
  const list = ads.map((ad, i) => `${i + 1}. ${formatJumpAdLine(ad)}`).join('\n')
  return {
    title: '跳跳網 · 招聘廣告列',
    narrative: `你設定搜尋：${level} · 合約／常額教席。跳跳網列出最新職位（樣本廣告，非即時抓取外部網站）：\n${list}\n\n現實裡每個職位都要上載履歷、教學理念、求職信；校方或 HR 公司會篩選才邀請面試。面試會包含與職位學科相關的專題題目。下一步請從列表中選擇要投書的學校（最多三間），再撰寫求職信並等候回覆。亦可刷新頁面換一批廣告。`,
    percentileLines: [
      '全港教席空缺競爭：Band 1 學校常見每職數十至上百份申請',
      '資料來源：學校名稱及地區對照 CHSC 學校概覽',
    ],
    choices: [
      choice(
        'jump_apply',
        '[投書] 選擇志願學校',
        '從本頁廣告挑選最多三間，再寫求職信',
        100,
        '精神健康 -2（準備材料）',
        {
          大成功: { passion: 3 },
          成功: { san: -2 },
          失敗: { san: -4 },
          大失敗: { san: -6 },
        },
      ),
      choice(
        'jump_refresh',
        '[刷新] 再睇一輪廣告',
        '換一批職位',
        100,
        '無',
        {
          大成功: { san: 5 },
          成功: { san: 2 },
          失敗: {},
          大失敗: { san: -3 },
        },
      ),
    ],
    allowCustom: false,
  }
}

export const MAX_JUMP_APPLICATIONS = 3

export function buildJumpApplyPickTurn(
  ads: JumpAd[],
  selectedIds: string[],
): TurnContent {
  const selected = new Set(selectedIds)
  const pickedLines = ads
    .filter((a) => selected.has(a.id))
    .map((a) => `· ${a.school.name}（${a.subject}）`)
    .join('\n')
  const header = selectedIds.length
    ? `已選 ${selectedIds.length}／${MAX_JUMP_APPLICATIONS} 間：\n${pickedLines}\n\n點選下方職位可加入或取消志願。`
    : `請從本頁最多 ${MAX_JUMP_APPLICATIONS} 間學校投書（按職位勾選）。`

  const toggleChoices = ads.map((ad) => {
    const isOn = selected.has(ad.id)
    const atCap = !isOn && selectedIds.length >= MAX_JUMP_APPLICATIONS
    return choice(
      `jump_toggle_${ad.id}`,
      `${isOn ? '✓ ' : ''}[志願] ${ad.school.name} · ${ad.subject}`,
      atCap
        ? '已達三間上限，請先取消其他志願'
        : formatJumpAdLine(ad),
      100,
      isOn ? '取消志願' : '加入志願',
      emptyEffects,
    )
  })

  const confirm = choice(
    'jump_confirm_apply',
    `[送出] 確認投書（${selectedIds.length} 間）`,
    selectedIds.length
      ? '下一步：選擇求職信風格'
      : '請至少選擇一間學校',
    selectedIds.length ? 100 : 0,
    'SAN -3（寄出焦慮）',
    {
      大成功: { passion: 2 },
      成功: { san: -3 },
      失敗: { san: -5 },
      大失敗: { san: -7 },
    },
  )

  const back = choice(
    'jump_back_browse',
    '[返回] 再看招聘廣告',
    '不重置已選志願',
    100,
    '無',
    emptyEffects,
  )

  return {
    title: '跳跳網 · 選擇投書學校',
    narrative: header,
    percentileLines: [
      `每輪最多投書 ${MAX_JUMP_APPLICATIONS} 間；獲邀面試為獨立隨機，視學校與運氣`,
      '資料來源：CHSC 學校概覽（津貼／資助及直資 DSS）',
    ],
    choices: [...toggleChoices, confirm, back],
    allowCustom: false,
  }
}

export function buildJumpCoverLetterTurn(
  appliedSchools: School[],
): TurnContent {
  const names = appliedSchools.map((s) => s.name).join('、')
  const styleChoices = COVER_LETTER_STYLES.map((st) =>
    choice(
      `cover_${st.id}`,
      `【${st.label}】`,
      `${st.preview}\n— ${st.description}`,
      100,
      '無（風格不決定是否入圍）',
      {
        大成功: { passion: 2 },
        成功: {},
        失敗: {},
        大失敗: { san: -2 },
      },
    ),
  )
  return {
    title: '跳跳網 · 撰寫求職信',
    narrative: `你準備向 ${names} 寄出履歷與教學理念。最後一步：選一封求職信語氣（系統會附上對應摘錄）。校方是否邀請 second in 仍為隨機——風格只影響敘事與極少量機率微調（見說明）。`,
    percentileLines: [
      '基準邀請率約 32%／每間投書學校；風格加成最多約 +3%（非保證）',
      'PGDE 仍未修讀？誠實路線在面試關仍會被追問',
    ],
    choices: styleChoices,
    allowCustom: true,
  }
}

export function buildJumpWaitingTurn(
  level: '小學' | '中學',
  styleLabel: string,
): TurnContent {
  return {
    title: '跳跳網 · 等回覆',
    narrative: `求職信（${styleLabel}）已送出。過了一星期，電郵信箱大多靜默，WhatsApp 只有補習社廣告。${level} 招聘旺季，HR 自動回覆話「正在處理大量申請」。現實中有人等兩星期、有人兩個月——你按住 refresh 鍵，SAN 先扣一截。`,
    percentileLines: [
      '每間投書學校獨立骰是否獲 second in 邀請',
      '下一關：查看回覆並安排面試志願',
    ],
    choices: [
      choice(
        'jump_callbacks',
        '[查看] 電郵與跳跳網回覆',
        '揭曉本輪邀請結果',
        100,
        '無',
        emptyEffects,
      ),
    ],
    allowCustom: false,
  }
}

export function buildJumpNoInviteTurn(level: '小學' | '中學'): TurnContent {
  return {
    title: '跳跳網 · 本輪無面試邀請',
    narrative: `你投書的學校今輪都沒有約 second in——在 ${level} 招聘市場並不罕見。補習社群主傳來「要唔要代課」；媽媽問「仲係待業？」。你可以刷新跳跳網再投一輪，或者先接受 TA 過渡（月薪 $${TA_MONTHLY_SALARY.toLocaleString()}，職責：印卷、整水機、維護網頁）。`,
    percentileLines: [
      '邀請為隨機結果，與求職信風格無必然關係',
      'TA 仍可日後再投跳跳網搏教席',
    ],
    choices: [
      choice(
        'jump_retry',
        '[刷新] 再睇廣告、重新投書',
        '返回招聘列表',
        100,
        'SAN -2',
        {
          大成功: { passion: 3 },
          成功: { san: -2 },
          失敗: { san: -4 },
          大失敗: { san: -6 },
        },
      ),
      choice(
        'jump_ta_fallback',
        '[過渡] 接受 TA 安排',
        '從曾投書的學校或同類學校開始',
        100,
        '熱誠 -15；SAN -10',
        {
          大成功: {},
          成功: { passion: -15, san: -10 },
          失敗: { passion: -18, san: -12 },
          大失敗: { passion: -22, san: -15 },
        },
      ),
    ],
    allowCustom: true,
  }
}

export function buildSchoolPickTurn(
  schools: School[],
  index: number,
  replySummary?: string[],
): TurnContent {
  const s = schools[index]
  const pct = Math.max(5, 95 - s.difficulty)
  const profile = s.profileNote
    ? `學校概覽摘錄：${s.profileNote.slice(0, 120)}${s.profileNote.length > 120 ? '…' : ''}`
    : '學校概覽：資料由校方提供（CHSC）。'
  return {
    title: `面試志願 ${index + 1}／${schools.length}`,
    narrative: `你應徵「${schoolLocationLabel(s)}」｜${schoolTypeLabel(s)}。${profile} 教員室傳聞話加班係常態。面試難度指數 ${s.difficulty}／100。你可以硬闖面試三部曲，或者放棄轉下一間——全敗而仍未持 PGDE／未獲教席，系統會安排你做 TA（月薪 $${TA_MONTHLY_SALARY.toLocaleString()}）。**重要：做過 TA 後必須轉校**才可再任教席，唔可以喺同一間學校由 TA 直接升做老師。`,
    percentileLines: [
      ...(index === 0 && replySummary?.length ? replySummary : []),
      `根據歷年數據，類似背景獲取錄機率約 ${pct}%`,
      `面試難度分位：高於全港 ${s.difficulty}% 申請者會在此學校碰壁`,
    ],
    choices: [
      choice(
        'apply',
        `應徵 ${s.name}`,
        '進入地獄面試三部曲',
        100,
        'SAN -5（心理壓力）',
        {
          大成功: {},
          成功: { san: -3 },
          失敗: { san: -5 },
          大失敗: { san: -8 },
        },
      ),
      choice(
        'skip',
        '放棄，試下一間',
        '保留體力',
        100,
        '無代價',
        emptyEffects,
      ),
      choice(
        'research',
        '潛水教員群組做情報',
        '了解內幕',
        68,
        '時間 -1 日',
        {
          大成功: { principal: 8, colleague: 5 },
          成功: { principal: 4 },
          失敗: { colleague: -3 },
          大失敗: { san: -5, colleague: -8 },
        },
      ),
    ],
    allowCustom: true,
  }
}

export function buildPanelInterview(
  school: School,
  rng: () => number,
  reInterview = false,
  state?: GameState,
): TurnContent {
  const drawn = drawPanelQuestion(school, rng, reInterview)
  const subject =
    state?.interviewVacancySubject ?? state?.origin?.major ?? '公社科'
  const subjectQ = drawSubjectInterviewQuestion(
    subject,
    state?.origin?.major ?? '',
    rng,
  )
  return {
    title: reInterview ? '面試 I：原校內聘 Panel（重新 second in）' : '面試 I：科主任 Panel',
    narrative: `${drawn.narrative}\n\n${subjectQ.narrative} 你可以硬「面試扮識」引用最新教育潮語，或者誠實承認不足並展示教案。`,
    percentileLines: drawn.percentileLines,
    choices: [
      choice(
        'subject_strong',
        '[學科] 具體教案＋評估設計',
        '對準招聘學科',
        72,
        '精神健康 -5',
        {
          大成功: { principal: 15, passion: 8 },
          成功: { principal: 8, san: -5 },
          失敗: { principal: -8, san: -12 },
          大失敗: { principal: -15, san: -18 },
        },
      ),
      choice(
        'subject_weak',
        '[學科] 空泛口號應付',
        '易被追問',
        28,
        '錄取率下降',
        {
          大成功: { principal: 5 },
          成功: {},
          失敗: { principal: -12, san: -10 },
          大失敗: { principal: -20, san: -16 },
        },
      ),
      choice(
        'bluff',
        '[扮識] 狂拋 buzzword',
        '科主任好感賭一把',
        52,
        'SAN -10；成功 +校長好感',
        {
          大成功: { principal: 20, passion: 5 },
          成功: { principal: 12 },
          失敗: { principal: -15, san: -12 },
          大失敗: { principal: -25, san: -20, colleague: -5 },
        },
      ),
      choice(
        'honest',
        '[誠實] 承認未 PGDE 但展示教案',
        '穩陣路線',
        62,
        '熱誠 +／- 視結果',
        {
          大成功: { principal: 15, passion: 10, colleague: 8 },
          成功: { principal: 8, passion: 5 },
          失敗: { passion: -5, san: -8 },
          大失敗: { principal: -10, san: -15 },
        },
      ),
      choice(
        'deflect',
        '[轉移] 反問學校支援新教師政策',
        '攻守轉換',
        48,
        '人緣 視結果',
        {
          大成功: { colleague: 15, principal: 10 },
          成功: { colleague: 8 },
          失敗: { principal: -8 },
          大失敗: { principal: -18, colleague: -10 },
        },
      ),
    ],
    allowCustom: true,
  }
}

export function buildMicroTeaching(
  school: School,
  rng: () => number,
  state?: GameState,
): TurnContent {
  const drawn = drawMicroTeaching(
    school,
    rng,
    state?.interviewVacancySubject,
    state?.origin?.major,
  )
  return {
    title: '面試 II：試教 Micro-teaching',
    narrative: `${drawn.narrative} 你要即場改教案、用幽默化解，或者按本宣科硬撐完十五分鐘。`,
    percentileLines: drawn.percentileLines,
    choices: [
      choice(
        'improvise',
        '[即興] 改活動救場',
        '高風險高回報',
        55,
        'SAN -15',
        {
          大成功: { principal: 18, passion: 12 },
          成功: { principal: 10, passion: 5 },
          失敗: { san: -15, principal: -8 },
          大失敗: { san: -25, principal: -20 },
        },
      ),
      choice(
        'script',
        '[照稿] 完成既定流程',
        '穩定但無亮點',
        70,
        '熱誠 -3',
        {
          大成功: { principal: 8 },
          成功: { principal: 4 },
          失敗: { principal: -5, passion: -5 },
          大失敗: { principal: -12, san: -10 },
        },
      ),
      choice(
        'tech',
        '[技術] 改用手機熱點分享螢幕',
        'ICT 老師專屬',
        58,
        '體力 -1',
        {
          大成功: { principal: 15, colleague: 10 },
          成功: { principal: 8 },
          失敗: { san: -8 },
          大失敗: { san: -18, colleague: -5 },
        },
      ),
    ],
    allowCustom: true,
  }
}

export function buildPrincipalInterview(
  school: School,
  rng: () => number,
  reInterview = false,
): TurnContent {
  const drawn = drawPrincipalInterview(school, rng, reInterview)
  return {
    title: reInterview ? '面試 III：校長確認（內聘亦須過關）' : '面試 III：副校／校長',
    narrative: `${drawn.narrative} 接受代表「好教工」人設；討價還價可能被標記「唔夠投入」。`,
    percentileLines: drawn.percentileLines,
    choices: [
      choice(
        'yes_all',
        '[全收] 什麼都答應',
        '錄取率較高',
        78,
        'SAN -20；續約率 +',
        {
          大成功: { principal: 25, renewPerm: 10, san: -10 },
          成功: { principal: 15, renewPerm: 5, san: -15 },
          失敗: { principal: -5, san: -20 },
          大失敗: { principal: -15, san: -25, passion: -10 },
        },
      ),
      choice(
        'negotiate',
        '[討價] 要求清晰工時',
        '理性但冒險',
        45,
        '校長好感 視結果',
        {
          大成功: { principal: 20, passion: 8, renewPerm: 8 },
          成功: { principal: 5, passion: 5 },
          失敗: { principal: -20, renewPerm: -10 },
          大失敗: { principal: -30, san: -15 },
        },
      ),
      choice(
        'boundary',
        '[底線] 只接受合理範圍',
        '價值觀清晰',
        38,
        '可能直接出局',
        {
          大成功: { passion: 15, colleague: 12 },
          成功: { passion: 8 },
          失敗: { principal: -25 },
          大失敗: { principal: -35, san: -10 },
        },
      ),
    ],
    allowCustom: true,
  }
}

type CareerEventBuilder = (state: GameState, rng: () => number) => TurnContent

const careerEvents: CareerEventBuilder[] = [
  (state, rng) => ({
    title: '出卷修羅場',
    narrative: `學期中段，${state.schoolName} 各科組要「統一試卷難度」。你負責的科目被科主任要求「似 DSE 但又唔可以太 DSE」，家長群組同時傳言「今次考試好難」。影印房貼滿「節省用紙」標語，你捧住 USB 在走廊狂奔。`,
    percentileLines: [`全港教師出卷加班時長分位：${randomInt(rng, 55, 82)}%`],
    choices: [
      choice('grind', '[硬肝] 通宵改卷', '完成任務', 72, 'SAN -18', {
        大成功: { principal: 12, renewPerm: 5 },
        成功: { principal: 6, san: -12 },
        失敗: { san: -18, passion: -5 },
        大失敗: { san: -28, principal: -8 },
      }),
      choice('delegate', '[分工] 拉 TA 幫手', '人緣 視結果', 58, '人緣 -5?', {
        大成功: { colleague: 5, san: -5 },
        成功: { san: -8 },
        失敗: { colleague: -12, san: -10 },
        大失敗: { colleague: -20, principal: -5 },
      }),
      choice('template', '[模板] 用舊卷微調', '節省時間', 65, '熱誠 -5', {
        大成功: { san: -3 },
        成功: { san: -5, passion: -3 },
        失敗: { principal: -8, passion: -8 },
        大失敗: { principal: -15, colleague: -10 },
      }),
    ],
    allowCustom: true,
  }),
  (_state, rng) => ({
    title: 'SBA 地獄週',
    narrative:
      '連續四週 SBA 打卡、補交、家長簽名與「點解個仔得 12 分」電郵。系統提示：教育局檔案即將抽查。你發現有學生作品疑似 ChatGPT 生成——處理唔好可能上報頭條。',
    percentileLines: [`SBA 合規率全港分位：${randomInt(rng, 48, 70)}%`],
    choices: [
      choice('strict', '[嚴查] 全部重交', '合規但得罪人', 60, 'SAN -12', {
        大成功: { principal: 15, renewPerm: 8 },
        成功: { principal: 8 },
        失敗: { colleague: -10, san: -12 },
        大失敗: { colleague: -18, principal: -5 },
      }),
      choice('pragmatic', '[務實] 口頭警告', '平衡', 55, '風險自負', {
        大成功: { colleague: 8 },
        成功: {},
        失敗: { principal: -12, renewPerm: -8 },
        大失敗: { principal: -25, san: -15 },
      }),
      choice('ai', '[校本 AI] 用你寫的查重工具', 'IT 技能', 52, '體力 -1', {
        大成功: { principal: 18, renewPerm: 10, passion: 5 },
        成功: { principal: 10 },
        失敗: { san: -10 },
        大失敗: { san: -20, principal: -10 },
      }),
    ],
    allowCustom: true,
  }),
  (state) => ({
    title: '查簿／睇堂 ESR',
    narrative: `教育局視學官即將到 ${state.schoolName} 睇堂。校長早會語氣沉重：「今次 ESR 影響學校形象。」你的課被抽中，教案要與「學習歷程檔案」完全一致——即使你知道學生上堂時九成在偷睇手機。`,
    choices: [
      choice('perform', '[表演] 完美教學劇本', '高壓', 58, 'SAN -15', {
        大成功: { principal: 20, renewPerm: 12 },
        成功: { principal: 10, renewPerm: 5 },
        失敗: { principal: -15, san: -15 },
        大失敗: { principal: -25, san: -25 },
      }),
      choice('authentic', '[真實] 展示平時點教', '冒險', 42, '熱誠 +?', {
        大成功: { passion: 15, colleague: 10 },
        成功: { passion: 8 },
        失敗: { principal: -20 },
        大失敗: { principal: -30, renewPerm: -15 },
      }),
      choice('swap', '[調包] 與同事互換課節', '灰色操作', 35, '人緣 視結果', {
        大成功: { colleague: 15 },
        成功: { colleague: 5, san: -5 },
        失敗: { colleague: -20, principal: -10 },
        大失敗: { colleague: -30, principal: -25 },
      }),
    ],
    allowCustom: true,
  }),
  (state, rng) => ({
    title: 'IT 雜務地獄',
    narrative: `校內廣播：「哪位老師識整電腦？」——當然係 ${state.origin?.major?.includes('ICT') ? '你' : '教 ICT 的同事放假，最後又係你'}。換碳粉、重設密碼、為校慶寫投票網站，副校順口加一句：「順便研究校本 AI 聊天機械人啦。」`,
    percentileLines: [`全港教師非教學工時分位：${randomInt(rng, 70, 92)}%`],
    choices: [
      choice('accept', '[全接] 做校內 IT 英雄', '校長好感', 68, 'SAN -20', {
        大成功: { principal: 22, renewPerm: 8, san: -10 },
        成功: { principal: 12, san: -15 },
        失敗: { san: -22, passion: -8 },
        大失敗: { san: -30, passion: -15 },
      }),
      choice('refuse', '[拒絕] 堅持只教書', '底線', 40, '校長 -', {
        大成功: { passion: 12, san: 5 },
        成功: { passion: 5 },
        失敗: { principal: -18 },
        大失敗: { principal: -28, renewPerm: -12 },
      }),
      choice('automate', '[自動化] 寫腳本一鍵處理', '技術流', 55, '時間 -', {
        大成功: { principal: 15, colleague: 12, passion: 8 },
        成功: { principal: 8, colleague: 5 },
        失敗: { san: -10 },
        大失敗: { san: -18, principal: -8 },
      }),
    ],
    allowCustom: true,
  }),
  (_state, rng) => ({
    title: 'Part-time PGDE 之夜',
    narrative:
      '你終於報讀兼讀 PGDE——週五晚連續四小時課，週末還要交反思報告。教員室同事笑你「讀書讀到似返中學」。但完成 PGDE 係轉 Perm 的隱性門檻之一。',
    percentileLines: [`兼讀 PGDE 畢業率分位：約 ${randomInt(rng, 35, 55)}%`],
    choices: [
      choice('study', '[熬夜] 全力讀', 'SAN -', 62, 'SAN -18', {
        大成功: { renewPerm: 15, passion: 10 },
        成功: { renewPerm: 8, san: -12 },
        失敗: { san: -20, passion: -5 },
        大失敗: { san: -30, passion: -12 },
      }),
      choice('slack', '[求其] 交足功課就算', '風險', 48, '續約率 -?', {
        大成功: { san: -5 },
        成功: { san: -8 },
        失敗: { renewPerm: -10 },
        大失敗: { renewPerm: -18, principal: -8 },
      }),
      choice('quit_pgde', '[放棄] 專心教書', '轉行伏線', 100, '續約率 -15', {
        大成功: { san: 10, passion: 5 },
        成功: { san: 5, renewPerm: -10 },
        失敗: { renewPerm: -15 },
        大失敗: { renewPerm: -20, principal: -5 },
      }),
    ],
    allowCustom: true,
  }),
  (state) => ({
    title: '小圈子與教員室政治',
    narrative: `午餐時間，${state.schoolName} 教員室分成幾派。有人傳你「唔肯幫手帶學會」；有人話你「成日埋頭做 IT」。科主任叫你揀邊：幫 A 派做活動定同 B 派去飲茶。`,
    choices: [
      choice('a', '[站隊 A] 幫忙搞學會', '人緣波動', 55, '人緣 ±', {
        大成功: { colleague: 18, principal: 5 },
        成功: { colleague: 8 },
        失敗: { colleague: -15 },
        大失敗: { colleague: -25, san: -10 },
      }),
      choice('neutral', '[中立] 兩邊不得罪', '難度高', 45, 'SAN -5', {
        大成功: { colleague: 5, san: 5 },
        成功: {},
        失敗: { colleague: -8, san: -8 },
        大失敗: { colleague: -18, principal: -5 },
      }),
      choice('gossip', '[潛水] 只做耳機族', '低調', 72, '人緣 -3', {
        大成功: { san: 8 },
        成功: { san: 3 },
        失敗: { colleague: -5 },
        大失敗: { colleague: -12, principal: -8 },
      }),
    ],
    allowCustom: true,
  }),
  (state, rng) => ({
    title: '家長投訴',
    narrative: `家長代表發電郵給校長：「${state.schoolName} 某老師（你）針對我個仔。」WhatsApp 群組截圖滿天飛，內容半真半假。學校要你在三日內書面回覆，並可能安排三方會面。`,
    percentileLines: [`投訴成立率全港分位：${randomInt(rng, 20, 40)}%`],
    choices: [
      choice('apologize', '[道歉] 學校至上', '保住飯碗', 65, '熱誠 -10', {
        大成功: { principal: 12, renewPerm: 5 },
        成功: { principal: 5, passion: -8 },
        失敗: { passion: -12, san: -10 },
        大失敗: { principal: -10, passion: -15 },
      }),
      choice('evidence', '[據證] 用紀錄反駁', '理性', 50, 'SAN -8', {
        大成功: { principal: 15, passion: 5 },
        成功: { principal: 5 },
        失敗: { principal: -15, san: -12 },
        大失敗: { principal: -25, san: -20 },
      }),
      choice('escalate', '[上報] 要求學校支援', '制度', 42, '冒險', {
        大成功: { colleague: 10, san: 5 },
        成功: {},
        失敗: { principal: -18 },
        大失敗: { principal: -28, renewPerm: -15 },
      }),
    ],
    allowCustom: true,
  }),
  (_state) => ({
    title: 'Staff Meeting / TDD',
    narrative: `星期三放學後 TDD，校長宣佈新「教師專業發展」框架——簡報 120 頁，問有無意見。你已餓到胃抽筋，同事眼神空洞。這是爭取表現或保持沉默的關卡。`,
    choices: [
      choice('speak', '[發言] 提出具體建議', '曝光', 48, 'SAN -8', {
        大成功: { principal: 18, renewPerm: 10 },
        成功: { principal: 8 },
        失敗: { principal: -5, san: -10 },
        大失敗: { principal: -15, colleague: -8 },
      }),
      choice('silent', '[沉默] 點頭記錄', '安全', 80, '熱誠 -5', {
        大成功: { san: 5 },
        成功: { san: -3, passion: -3 },
        失敗: { passion: -5 },
        大失敗: { passion: -8, principal: -5 },
      }),
      choice('meme', '[內心] 在群組發 meme', '洩壓', 35, '人緣 賭', {
        大成功: { colleague: 20, san: 10 },
        成功: { colleague: 8, san: 5 },
        失敗: { colleague: -15 },
        大失敗: { principal: -20, colleague: -25 },
      }),
    ],
    allowCustom: true,
  }),
  (_state, rng) => ({
    title: '帶比賽／交流團',
    narrative: `學校指派你帶隊參加校外比賽，順便暑假交流團「見識世界」——當然係無額外津貼。學生興奮，你計住還有 PGDE 作業未交。`,
    percentileLines: [`課外活動負擔分位：高於 ${randomInt(rng, 60, 85)}% 同行`],
    choices: [
      choice('go', '[全情] 投入帶隊', '校長最愛', 70, 'SAN -22', {
        大成功: { principal: 25, renewPerm: 12, passion: 5 },
        成功: { principal: 12, san: -15 },
        失敗: { san: -22, passion: -5 },
        大失敗: { san: -32, passion: -12 },
      }),
      choice('minimal', '[最低] 符合安全要求即可', '平衡', 62, '校長 -', {
        大成功: { san: 5 },
        成功: {},
        失敗: { principal: -10 },
        大失敗: { principal: -18, renewPerm: -8 },
      }),
      choice('decline', '[拒絕] 稱病', '高風險', 30, '續約 -', {
        大成功: { san: 15, passion: 8 },
        成功: { san: 8 },
        失敗: { principal: -25, renewPerm: -15 },
        大失敗: { principal: -35, renewPerm: -25 },
      }),
    ],
    allowCustom: true,
  }),
  (state) => ({
    title: '續約關口',
    narrative: `學年結束前，${state.schoolName} 人事部暗示「編制緊縮」。你的合約續約／轉 Perm 機率目前 ${state.renewPerm}%。校長約你「飲杯茶」——茶好淡，似係暗示。`,
    percentileLines: [`合約續約機率：${state.renewPerm}%`],
    choices: [
      choice('plead', '[表忠] 承諾再捱多幾年', '續約', state.renewPerm, 'SAN -10', {
        大成功: { renewPerm: 20, principal: 15 },
        成功: { renewPerm: 10, principal: 8 },
        失敗: { renewPerm: -15, san: -12 },
        大失敗: { renewPerm: -25, san: -18 },
      }),
      choice('perm', '[爭 Perm] 提交成就檔案', '高難度', Math.min(55, state.renewPerm + 10), '壓力 MAX', {
        大成功: { renewPerm: 30, principal: 20 },
        成功: { renewPerm: 15 },
        失敗: { renewPerm: -20, principal: -10 },
        大失敗: { renewPerm: -30, principal: -20 },
      }),
      choice('prep_leave', '[鋪路] 暗中搵工', '轉行伏線', 58, '熱誠 -', {
        大成功: { san: 10 },
        成功: { san: 5 },
        失敗: { principal: -12 },
        大失敗: { principal: -22, colleague: -10 },
      }),
    ],
    allowCustom: true,
  }),
  (state) => ({
    title: '爭奪常額位 (Perm)',
    narrative: `傳聞 ${state.schoolName} 終於有一個 Perm 空缺——全組三個合約老師虎視眈眈。校政會議前夜，你收到匿名訊息：「有人已內定。」你要最後一搏，或者接受現實。`,
    percentileLines: [`轉 Perm 機率：${state.renewPerm}%`],
    choices: [
      choice('fight', '[硬拼] 公開競爭', 'Perm 結局伏線', Math.min(48, state.renewPerm), 'SAN -15', {
        大成功: { renewPerm: 40, principal: 25 },
        成功: { renewPerm: 20 },
        失敗: { san: -15, renewPerm: -15 },
        大失敗: { san: -25, principal: -20 },
      }),
      choice('alliance', '[結盟] 與同事分工', '人緣', 52, '人緣 視結果', {
        大成功: { colleague: 20, renewPerm: 25 },
        成功: { colleague: 10, renewPerm: 12 },
        失敗: { colleague: -18 },
        大失敗: { colleague: -28, principal: -15 },
      }),
      choice('exit', '[轉行] 報讀 UX／公關課程', '轉行結局', 75, '離開教育界', {
        大成功: { passion: 20, san: 20 },
        成功: { passion: 10, san: 10 },
        失敗: { san: -5 },
        大失敗: { san: -10, principal: -5 },
      }),
    ],
    allowCustom: true,
  }),
  // News: practising teacher licence renewal ≤3yr, ~150 CPD hrs/3yr, target 2028/29 — RTHK, SCMP, LegCo CB(3)60/2026
  (state, rng) => ({
    title: '執業牌照三週年審',
    narrative: `教育局電郵彈出：「執業教師須每三年續牌，三年內累積約一百五十小時持續專業發展。」副校在 WhatsApp 群組補刀：「二〇二八／二九全面實施，但今年先試水啦。」你翻開 ${state.schoolName} 的 TDD 紀錄——去年暑假帶隊算唔算？夜間兼讀 PGDE 的課堂算不算？同時要交教案、改卷、回家長訊息。系統提示：你的 CPD 時數分位低於全港 ${randomInt(rng, 35, 65)}% 同行，而人事部暗示「續約會睇專業進修紀錄」。教員室有人笑：「以前教書係執業，現係執業要考牌，考牌仲要喺放學後考。」`,
    percentileLines: [`CPD 達標率全港分位：約 ${randomInt(rng, 40, 72)}%`],
    choices: [
      choice('marathon', '[硬刷] 週末連環進修班', '時數先過關', 58, 'SAN -20', {
        大成功: { renewPerm: 12, principal: 10, san: -8 },
        成功: { renewPerm: 6, san: -15 },
        失敗: { san: -22, passion: -6 },
        大失敗: { san: -30, principal: -8 },
      }),
      choice('paperwork', '[文書] 把帶隊交流全部填表申報', '行政流', 62, '體力 -1', {
        大成功: { principal: 15, renewPerm: 8 },
        成功: { principal: 8, renewPerm: 4 },
        失敗: { principal: -5, san: -10 },
        大失敗: { principal: -12, colleague: -8 },
      }),
      choice('ignore', '[觀望] 等政策細節再講', '賭局', 44, '續約率 -?', {
        大成功: { san: 8, passion: 5 },
        成功: { san: 3 },
        失敗: { renewPerm: -12, principal: -10 },
        大失敗: { renewPerm: -20, principal: -18 },
      }),
    ],
    allowCustom: true,
  }),
  // News: compulsory digital CPD — 30/150 hrs digital, 50k training places/yr, $500k/school grant — RTHK Jun 2026
  (state, rng) => ({
    title: '數碼 CPD 三十小時',
    narrative: `Staff Meeting 投影機亮出「強制數碼教育」：三年一百五十小時 CPD 入面，至少三十小時要係數碼素養——AI 倫理、數據私隱、校本平台操作，樣樣都要打卡。局方話每年有五萬個培訓位，每間津貼／直資學校仲有一次性五十萬撥款買設備；但 ${state.schoolName} 的 IT 同事苦笑：「錢係買伺服器，唔係買你放工時間。」校長宣布下學期「全體老師要學生成式 AI 備課」，你心想自己連 Excel 樞紐表都未學完。網上課程排到晚上十點，與 PGDE 撞期；唔報又怕續牌被問。`,
    percentileLines: [`數碼培訓完成率分位：${randomInt(rng, 38, 68)}%`],
    choices: [
      choice('volunteer', '[搶先] 報名做校本數碼種子老師', '曝光 + 工時', 52, 'SAN -15', {
        大成功: { principal: 20, renewPerm: 10, passion: 5 },
        成功: { principal: 10, san: -10 },
        失敗: { san: -18, colleague: -6 },
        大失敗: { san: -26, principal: -8 },
      }),
      choice('online', '[最低] 只睇網上錄影湊足 30 小時', '務實', 68, '熱誠 -5', {
        大成功: { san: -3, renewPerm: 5 },
        成功: { san: -8, passion: -3 },
        失敗: { principal: -8 },
        大失敗: { principal: -15, renewPerm: -8 },
      }),
      choice('union', '[反映] 經教協要求澄清工時', '制度', 40, '校長 視結果', {
        大成功: { colleague: 15, passion: 8 },
        成功: { colleague: 6 },
        失敗: { principal: -15 },
        大失敗: { principal: -25, renewPerm: -10 },
      }),
    ],
    allowCustom: true,
  }),
  // News: primary pupils suspected AI cheating — school/EDB follow-up — RTHK Feb 2026
  (state, rng) => ({
    title: '小學 AI 作文疑雲',
    narrative: `有家長在 ${state.schoolName} 家長群組貼出兒童「讀書報告」：用詞老練、段落工整，懷疑係 ChatGPT 代筆。訊息半日內轉載過千，傳媒標題預覽已寫好「AI 作弊疑雲」。校長召開緊急會議：教育局要求校方跟進，可能要交調查報告。你負責該班導修——學生當面話「係自己寫」，但手機相簿有「複製提示詞」截圖。若嚴查可能得罪家長；若輕放又怕成為全港首例。同事 whisper：「中學 SBA 查咗幾年，點知小學都係戰場。」`,
    percentileLines: [`校本 AI 舞弊調查壓力分位：${randomInt(rng, 55, 85)}%`],
    choices: [
      choice('oral', '[當面] 口頭抽查理解', '合規路線', 56, 'SAN -12', {
        大成功: { principal: 14, renewPerm: 6 },
        成功: { principal: 6 },
        失敗: { colleague: -10, san: -14 },
        大失敗: { principal: -12, san: -20 },
      }),
      choice('parent', '[和談] 約家長三方會面', '人際', 50, '熱誠 -5', {
        大成功: { principal: 10, colleague: 8 },
        成功: { principal: 4 },
        失敗: { san: -12, passion: -8 },
        大失敗: { principal: -18, san: -18 },
      }),
      choice('policy', '[推搪] 等教育局指引', '觀望', 45, '風險自負', {
        大成功: { san: 5 },
        成功: {},
        失敗: { principal: -14, renewPerm: -10 },
        大失敗: { principal: -22, renewPerm: -18 },
      }),
    ],
    allowCustom: true,
  }),
  // News: aided schools thin enrolment, class reduction / downsizing — StarSchools, EDB planning
  (state, rng) => ({
    title: '殺班與收生寒冬',
    narrative: `新學年編班表出爐：${state.schoolName} 中一只得四班，較去年少一班；傳聞「殺班」後每班人數仍要逼近上限，否則再下學年可能合併級別。教員室瀰漫「誰會被調走」的氣氛——津貼學校編制與收生掛鈎，空班即空錢。校長在早會強調「做好招生開放日」，暗示老師週末要返學當導賞員。你睇住自己的合約到期日，同層有兩位同事已收到「來季可能調整聘用」的口頭通知。星島標題你未敢打開：「收生寒冬下的津貼校生存戰。」`,
    percentileLines: [`收生達標率分位：低於 ${randomInt(rng, 45, 70)}% 同類學校`],
    choices: [
      choice('open_day', '[衝刺] 周末招生義工', '校長好感', 64, 'SAN -16', {
        大成功: { principal: 18, renewPerm: 8 },
        成功: { principal: 8, san: -12 },
        失敗: { san: -18, passion: -5 },
        大失敗: { san: -26, principal: -6 },
      }),
      choice('transfer', '[自保] 暗中投其他校', '續約賭', 55, '熱誠 -3', {
        大成功: { san: 10, renewPerm: 5 },
        成功: { san: 4 },
        失敗: { principal: -10 },
        大失敗: { principal: -20, colleague: -12 },
      }),
      choice('share', '[共渡] 與同事分工減班務', '人緣', 52, '人緣 視結果', {
        大成功: { colleague: 18, san: 5 },
        成功: { colleague: 8 },
        失敗: { colleague: -12 },
        大失敗: { colleague: -22, san: -10 },
      }),
    ],
    allowCustom: true,
  }),
  // News: contract teacher non-renewal, scramble for perm amid declining student numbers
  (state, rng) => ({
    title: '末位解約大逃殺',
    narrative: `人事部內部 memo 外洩：來學年合約教席「按需要調整」，俗稱末位解約。${state.schoolName} 只有一個常額空缺傳聞，卻有五個合約老師——包括你。校政會議前，科主任逐個約談「了解意願」；你聽到走廊有人講「已有人內定」。學生人口下降像無形 HR，續約率 ${state.renewPerm}%  suddenly  feel like 賭馬賠率。有人開始狂接校外比賽、有人狂進修打卡；你嘅 PGDE 作業仍欠三千字。`,
    percentileLines: [`合約續聘競爭分位：高於 ${randomInt(rng, 70, 90)}% 學校`],
    choices: [
      choice('portfolio', '[突擊] 兩週內交成就檔', 'Perm 伏線', Math.min(50, state.renewPerm + 5), 'SAN -18', {
        大成功: { renewPerm: 25, principal: 18 },
        成功: { renewPerm: 12, principal: 8 },
        失敗: { san: -20, renewPerm: -12 },
        大失敗: { san: -28, renewPerm: -22, principal: -10 },
      }),
      choice('loyalty', '[表忠] 公開承諾多帶活動', '續約', 58, 'SAN -14', {
        大成功: { renewPerm: 15, principal: 12 },
        成功: { renewPerm: 8, san: -10 },
        失敗: { renewPerm: -10, san: -16 },
        大失敗: { renewPerm: -18, principal: -15 },
      }),
      choice('jump', '[跳船] 即刻更新跳跳網', '轉校', 48, '人緣 -5', {
        大成功: { san: 12, passion: 8 },
        成功: { san: 5 },
        失敗: { colleague: -15, principal: -12 },
        大失敗: { colleague: -22, renewPerm: -15 },
      }),
    ],
    allowCustom: true,
  }),
  // News: parental WhatsApp complaints escalate to EDB
  (state, rng) => ({
    title: '群組截圖直通局方',
    narrative: `家長代表唔滿意 ${state.schoolName} 處理課堂紀律，將 WhatsApp 群組對話截圖——包括你深夜回覆「收到，明天處理」的一句——上載社交平台，並向教育局正式投訴「教師態度消極」。帖文標籤 #真實校園，留言區有人認出學校校服。校長面色鐵青叫你寫澄清，限二十四小時；家長群組同時有人貼出你去年運動會戴口罩照片，話「對學生雙標」。投訴未必成立，但輿論已審判。`,
    percentileLines: [`社交媒體投訴升級率分位：${randomInt(rng, 25, 50)}%`],
    choices: [
      choice('statement', '[聲明] 與校方聯合回應', '保住飯碗', 60, 'SAN -12', {
        大成功: { principal: 14, renewPerm: 6 },
        成功: { principal: 6, san: -8 },
        失敗: { passion: -10, san: -14 },
        大失敗: { principal: -12, san: -20 },
      }),
      choice('private', '[私聊] 逐個家長和解', '體力', 52, 'SAN -10', {
        大成功: { colleague: 10, principal: 8 },
        成功: { principal: 4 },
        失敗: { san: -15, colleague: -8 },
        大失敗: { san: -22, principal: -15 },
      }),
      choice('legal', '[要求] 學校提供正式支援', '制度', 42, '冒險', {
        大成功: { renewPerm: 8, passion: 6 },
        成功: {},
        失敗: { principal: -20 },
        大失敗: { principal: -28, renewPerm: -12 },
      }),
    ],
    allowCustom: true,
  }),
  // News: STEM/IT teachers asked to build school systems without extra pay
  (state, rng) => ({
    title: '校本系統義工工程',
    narrative: `教育局鼓勸「數碼校政」，${state.schoolName} 用五十萬撥款買咗雲端套件——但無預算請外判。副校轉頭問教 STEM 的你：「順手幫手整個考勤 API、家長 App 同 AI 聊天機械人，暑假前上線啦。」你澄清自己係科學老師唔係工程師；對方笑：「全港 STEM 老師都係這樣，當專業發展嘛。」同時你要備課、出卷、填 CPD 表。不做的話「影響團隊精神」；做的話暑假蒸發。`,
    percentileLines: [`非教學 IT 義務分位：${randomInt(rng, 75, 95)}%`],
    choices: [
      choice('build', '[硬做] 暑假全職開發', '校長最愛', 54, 'SAN -25', {
        大成功: { principal: 22, renewPerm: 12, passion: 5 },
        成功: { principal: 12, san: -18 },
        失敗: { san: -25, passion: -10 },
        大失敗: { san: -35, principal: -5 },
      }),
      choice('vendor', '[堅持] 要求外判或加津貼', '底線', 38, '校長 -', {
        大成功: { passion: 12, colleague: 10 },
        成功: { passion: 6 },
        失敗: { principal: -20, renewPerm: -10 },
        大失敗: { principal: -30, renewPerm: -18 },
      }),
      choice('mvp', '[折衷] 做最低可行版本', '技術流', 62, 'SAN -12', {
        大成功: { principal: 14, colleague: 8 },
        成功: { principal: 6, san: -10 },
        失敗: { san: -16, principal: -8 },
        大失敗: { san: -22, colleague: -10 },
      }),
    ],
    allowCustom: true,
  }),
]

const taCareerEvents: CareerEventBuilder[] = [
  (state) => ({
    title: '科主任話：可以報教席',
    narrative: `你在 ${schoolLocationLabel({
      name: state.schoolName,
      district: state.schoolDistrict,
      band: 0,
      funding: '津貼/資助',
      difficulty: 0,
    })} 做 TA 已一段時間。科主任話「下學年可能有合約位」——但人事部明文：**你曾喺本校做 TA，不可喺同一間學校直接轉教席**，必須透過跳跳網**轉校**再面試。`,
    percentileLines: [
      '硬規則：TA 路線須轉校方可再任教席',
      `全港 TA 晉升教席：約 12%–18%`,
    ],
    choices: [
      choice(
        'ta_same_school',
        '[原校] 申請內部教席（已被拒）',
        '程序上不可行',
        5,
        '精神健康 -10',
        {
          大成功: { san: -8 },
          成功: { san: -10 },
          失敗: { san: -12 },
          大失敗: { san: -18, passion: -8 },
        },
      ),
      choice(
        'ta_jump_hunt',
        '[跳跳網] 轉校投書其他學校',
        '唯一正規路線',
        62,
        'SAN -5',
        {
          大成功: { passion: 10 },
          成功: { passion: 5 },
          失敗: { san: -8 },
          大失敗: { san: -14, passion: -5 },
        },
      ),
      choice(
        'ta_stay',
        '[觀望] 繼續做 TA',
        '保留體力',
        100,
        '無',
        {
          大成功: { san: 8 },
          成功: { san: 4 },
          失敗: { passion: -5 },
          大失敗: { passion: -10, san: -5 },
        },
      ),
    ],
    allowCustom: true,
  }),
  (state, rng) => ({
    title: '跳跳網通知：另一間學校邀面試',
    narrative: `你趁放學後刷新跳跳網，竟有一間 ${state.jumpLevel ?? '中學'} 職位回覆「second in」。唔係你任職嘅 ${state.schoolName}（${state.schoolDistrict}），但車程尚可。TA 同事話：「你一走，影印房冇人守。」`,
    percentileLines: [`獲邀面試分位：${randomInt(rng, 30, 65)}%`],
    choices: [
      choice('ta_jump_hunt', '[應徵] 準備面試三部曲', '離開 TA 搏教席', 58, 'SAN -10', {
        大成功: { passion: 12 },
        成功: { passion: 6 },
        失敗: { san: -12 },
        大失敗: { san: -18 },
      }),
      choice('ta_stay', '[放棄] 專心現職', '穩定', 100, '無', emptyEffects),
    ],
    allowCustom: false,
  }),
]

export function pickCareerEvent(state: GameState, rng: () => number): TurnContent {
  const family = tryPickFamilyEvent(state, rng)
  if (family) return family
  if (leadershipEligible(state) && rng() < 0.14) {
    return buildLeadershipPromotionTurn(state)
  }
  if (state.rank === 'TA' && rng() < 0.42) {
    const idx = randomInt(rng, 0, taCareerEvents.length - 1)
    return taCareerEvents[idx](state, rng)
  }
  if (needsFunctionalGroupAssignment(state)) {
    return buildFunctionalGroupAssignmentTurn(state, rng)
  }
  if (shouldOfferAdminInvite(state, rng)) {
    return buildAdminGroupInviteTurn(state)
  }
  if (state.functionalGroup && rng() < 0.52) {
    return pickGroupCareerEvent(state.functionalGroup, state, rng)
  }
  const idx = randomInt(rng, 0, careerEvents.length - 1)
  return careerEvents[idx](state, rng)
}

export function customActionChoice(text: string): Choice {
  return choice(
    'custom',
    `[自訂] ${text.slice(0, 40)}${text.length > 40 ? '…' : ''}`,
    text,
    40,
    '成功率不穩定；SAN -5 起',
    {
      大成功: { passion: 8, san: 5 },
      成功: { passion: 3 },
      失敗: { san: -10 },
      大失敗: { san: -20, principal: -10 },
    },
  )
}
