import { schoolTypeLabel } from './constants'
import type { Choice, GameState, School, TurnContent } from './types'
import { pickOne, randomInt } from './rng'

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
    narrative: `系統為你擲出 1 in 80 Billion 的命運骰子。你畢業於${o.university}，主修${o.major}，公開試為${o.exam}（${o.examLabel}）。履歷上寫著「未有 PGDE」——${o.pgdeNote}。教員室老師會說你「仲係 fresh grad」，但其實你已經在補習社教了兩年，只是唔敢寫落 CV。下一步：睇 JUMP，決定衝小學定中學戰場。`,
    percentileLines: [
      `全港分位：你的公開試成績打敗了 ${o.percentile}% 考生`,
      o.pgdeNote,
    ],
    choices: [
      choice('continue', '繼續 → 睇 JUMP', '前往選擇小學或中學路線', 100, '無代價', {
        大成功: { passion: 2 },
        成功: {},
        失敗: {},
        大失敗: {},
      }),
    ],
    allowCustom: false,
  }
}

export function buildJumpTurn(): TurnContent {
  return {
    title: '睇 JUMP',
    narrative:
      'JUMP 網站凌晨三點照樣開著，你捧住凍咖啡刷新頁面。小學職位多但「八達通老師」傳言不絕；中學薪金靚但科主任 Panel 會問到你靈魂深處。無論選邊，系統都會為你抽籤三間香港津貼／直資（DSS）或官立學校——Band 1 做夢、Band 3 歷練，參考組別資料來自 StarSchools。',
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

export function buildSchoolPickTurn(
  schools: School[],
  index: number,
): TurnContent {
  const s = schools[index]
  const pct = Math.max(5, 95 - s.difficulty)
  return {
    title: `面試志願 ${index + 1}／${schools.length}`,
    narrative: `你鎖定「${s.name}」（${schoolTypeLabel(s)}）。校園網站寫滿「全人教育」與「關愛文化」，但教員室傳聞話加班係常態。合約續約／轉 Perm 的江湖規矩，呢間學校難度指數 ${s.difficulty}／100。你可以硬闖面試三部曲，或者放棄轉下一間——全敗的話，系統會安排你做 TA（月薪 $17,000，職責：印卷、整水機、維護網頁）。`,
    percentileLines: [
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

export function buildPanelInterview(school: School, rng: () => number): TurnContent {
  const topics = [
    '課程發展與評估政策',
    '校本數據分析',
    '跨學科 STEM 協作',
  ]
  const topic = pickOne(rng, topics)
  return {
    title: '面試 I：科主任 Panel',
    narrative: `「${school.name}」會議室冷氣過猛。科主任拋題：「請即場講解你如何處理${topic}，以及點解你唔該攞 PGDE 先來見工。」旁邊一位老師似曾相識——你唔肯定係咪十年前補習社學生。你可以硬「面試扮識」引用最新教育潮語，或者誠實承認不足並展示教案。`,
    percentileLines: [`Panel 滿意度基準線：全港前 ${randomInt(rng, 25, 45)}% 申請者`],
    choices: [
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

export function buildMicroTeaching(_school: School, rng: () => number): TurnContent {
  const lessons = ['二次函數圖像', '議題探究公社科', '英文辯論技巧', 'Scratch 編程入門']
  const swans = [
    '面試官低頭扮睡，你以為可以收工',
    '電子白板死機，全場靜默三十秒',
    '學生臨場問「老師你幾時結婚」',
  ]
  const lesson = pickOne(rng, lessons)
  const swan = pickOne(rng, swans)
  return {
    title: '面試 II：試教 Micro-teaching',
    narrative: `試教課題：「${lesson}」。你剛寫完第一個學習目標，黑天鵝出現——${swan}。下層有位副校在記分紙上畫貓。你要即場改教案、用幽默化解，或者按本宣科硬撐完十五分鐘。`,
    percentileLines: [`試教評分預測分位：${randomInt(rng, 40, 75)}%`],
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

export function buildPrincipalInterview(_school: School): TurnContent {
  return {
    title: '面試 III：副校／校長',
    narrative: `最後一關，校長笑容專業：「我哋重視全人教育。星期六學校活動、無償帶比賽、暑假交流團——你 OK 嗎？」窗外正飄雨，你想起 PGDE 課程表與合約年期。接受代表「好教工」人設；討價還價可能被標記「唔夠投入」。`,
    percentileLines: ['全港新教師首年離職率分位：高於 62% 同行'],
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
]

export function pickCareerEvent(state: GameState, rng: () => number): TurnContent {
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
