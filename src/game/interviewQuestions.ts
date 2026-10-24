import type { School } from './types'
import { pickOne, randomInt } from './rng'

export type PanelQuestion = {
  prompt: string
  context: string
}

export type MicroScenario = {
  lesson: string
  swan: string
  focus: string
}

export type PrincipalQuestion = {
  narrative: string
  percentileLine: string
}

const PANEL_QUESTIONS: PanelQuestion[] = [
  {
    prompt: '請說明你如何落實「高中課程優化」下的評估與課業政策，並舉一例校本實踐。',
    context: '科主任追問：「功課量點計？家長話太多，教育局又話要減負。」',
  },
  {
    prompt: '若班上有 SEN 學生與資優學生同堂，你會如何差異化教學而不影響課堂節奏？',
    context: 'Panel 補刀：「我哋支援人手有限，唔好淨係紙上談兵。」',
  },
  {
    prompt: '請分享一次你處理課堂紀律或欺凌疑似的經驗，以及你如何與訓導／輔導組協作。',
    context: '副校抬眼：「家長可能第二日就打來學校。」',
  },
  {
    prompt: '你如何透過形成性評估改善學生學習？請具體說明一個科目單元的設計。',
    context: '科主任：「我哋要對準 DSE 趨勢，但又唔可以只係操卷。」',
  },
  {
    prompt: '請談談你對「價值觀教育」及國民教育的理解，如何在日常課堂滲入？',
    context: '有人記低你每一個用詞——似係校長代表。',
  },
  {
    prompt: '若家長在 WhatsApp 群組公開質疑你評分，你會如何回應並保護學生？',
    context: 'Panel 笑：「我哋學校群組文化『比較活躍』。」',
  },
  {
    prompt: '請說明你對 AI 輔助學習與學術誠信的立場；若懷疑學生用生成式 AI 交功課，你會怎樣做？',
    context: '「教育局最近好多學校問同一條題。」',
  },
  {
    prompt: '你如何與科組同事協作編訂試卷，處理「難度一致」與「家長期望」的拉扯？',
    context: '科主任展示一份被家長投訴過的試卷封面。',
  },
  {
    prompt: '請用三分鐘說明你的教學理念，以及為何選擇申請本校而非他校。',
    context: '「最後一分鐘——講一樣你覺得自己唔夠好、但正在改善嘅位。」',
  },
  {
    prompt: '你尚未完成 PGDE／仍在修讀，如何說服我們你仍能承擔班主任或學會導師工作？',
    context: '人事部同事在旁狂做筆記。',
  },
  {
    prompt: '請即場設計一個跨學科 STEM 活動（15 分鐘），並說明如何評估學習成效。',
    context: '白板筆冇水，你當作是「情境題」一部分。',
  },
  {
    prompt: '若校長要求你暑假帶境外交流團兼備課，你會如何平衡工時與教學質素？',
    context: '「我哋重視全人——你明㗎啦？」',
  },
]

const MICRO_SCENARIOS: MicroScenario[] = [
  {
    lesson: '二次函數圖像與應用',
    swan: '電子白板死機，學生開始玩紙條',
    focus: '板書與提問',
  },
  {
    lesson: '英文辯論：社交媒體與青少年',
    swan: '試教班有學生用母語插嘴挑戰規則',
    focus: '課堂管理',
  },
  {
    lesson: '公社科：國情導賞（議題探究）',
    swan: '有學生問「考試會唔會考呢啲」',
    focus: '價值觀與中立',
  },
  {
    lesson: '小學常識：社區資源與安全',
    swan: '投影機色偏，圖片睇唔清',
    focus: '教具應變',
  },
  {
    lesson: 'Scratch 編程：循環結構',
    swan: 'Wi‑Fi 斷線，半班未登入',
    focus: '分層任務',
  },
  {
    lesson: '中文寫作：議論文鋪排',
    swan: '學生當場問「老師你篇文有幾多分」',
    focus: '評估標準',
  },
  {
    lesson: '科學探究：酸鹼中和實驗',
    swan: '實驗器材數量不足，要改演示',
    focus: '安全與改備',
  },
  {
    lesson: '音樂：節拍與合唱',
    swan: '面試官低頭扮睇電話，你以為可以收工',
    focus: '節奏帶動',
  },
]

const PRINCIPAL_SETS: PrincipalQuestion[] = [
  {
    narrative:
      '校長笑容專業：「我哋天主教／辦學團體重視全人與服務。星期六學校活動、主日學、無償帶比賽——你 OK 嗎？」窗外飛雨，你諗起 PGDE 截止日。',
    percentileLine: '全港新教師首年離職率分位：高於 62% 同行',
  },
  {
    narrative:
      '副校代問：「若下學年收生未達標、班數要調整，合約教席點安排？你點睇學校承擔？」語氣平和，但係壓力測試。',
    percentileLine: '收生壓力下教席穩定性分位：低於 48% 同區學校',
  },
  {
    narrative:
      '校長：「我哋剛推校本 AI 政策。你會唔會用 ChatGPT 幫手改卷？點樣向家長解釋？」旁邊有人記錄你每一個「唔會」同「會」。',
    percentileLine: '學術誠信問答通過率分位：約 55%',
  },
  {
    narrative:
      '「你點睇執業教師牌照同 CPD？三年一百五十小時——包括數碼素養——你準備好未？」校長遞上一杯紙杯茶。',
    percentileLine: 'CPD 規劃完整度分位：高於 40% 申請者',
  },
  {
    narrative:
      '校長指住窗外運動場：「我哋下月有學界，之後有交流團。你願意做學會顧問嗎？唔係強迫，但……」句子冇講完。',
    percentileLine: '課外承擔意願分位：科主任內部參考線 70%',
  },
  {
    narrative:
      '「若你是本校 TA 升上來，點解我哋仲要再面試一次？」校長直白問——你要說服佢：公開程序同專業標準一樣重要。',
    percentileLine: '原校 TA 內聘再面試率：全港約 75%–85%',
  },
]

const REINTERVIEW_PANEL: PanelQuestion[] = [
  {
    prompt:
      '你喺本校做 TA 兩年，請具體講一件你支援課堂或 SEN 學生的例子——同申請教席有何分別？',
    context: '科主任：「我哋要對外講得通，唔係「熟口面」就自動過。」',
  },
  {
    prompt: '同事對你印象如何？請回應：有教員話你「只識印卷唔識教」。',
    context: 'Panel 似笑非笑，等你自己拆彈。',
  },
  {
    prompt: '若你獲聘，會否即時與現有 TA 同事產生角色衝突？你點處理？',
    context: '人事部提醒：「同一條晉升梯，有人等咗更耐。」',
  },
]

type SubjectQuestion = {
  prompt: string
  good: string
  weak: string
}

const SUBJECT_QUESTIONS: Record<string, SubjectQuestion[]> = {
  中文: [
    {
      prompt: '請說明你如何教 DSE 中文寫作中的議論文鋪排，並舉一例校本評估設計。',
      good: '引用學習歷程與形成性評估，具體到單元目標',
      weak: '只背誦「多元閱讀」口號，無例子',
    },
    {
      prompt: '若學生文言文基礎薄弱，你會如何在有限課時內建立信心？',
      good: '分層任務、讀寫結合、具體支架',
      weak: '答「多背經典」但無課堂策略',
    },
  ],
  英文: [
    {
      prompt: 'How would you scaffold argumentative writing for S4 students with mixed ability?',
      good: 'Clear differentiation, formative feedback, exemplars',
      weak: 'Vague “more practice” without pedagogy',
    },
    {
      prompt: '請分享你設計一節閱讀課時，如何連結 DSE Paper 1 技能與課堂互動。',
      good: '具體文本類型與評估對準',
      weak: '只強調操卷',
    },
  ],
  數學: [
    {
      prompt: '請解釋你如何教二次函數圖像，並處理學生「識計數唔識解題」的情況。',
      good: '由圖像到代數、錯誤分析、分層練習',
      weak: '只列公式無教學步驟',
    },
    {
      prompt: '校本測驗難度與 DSE 趨勢不一致時，你會如何與科組協調？',
      good: '數據對照、共同出卷機制',
      weak: '個人主觀「我覺得夠難」',
    },
  ],
  科學: [
    {
      prompt: '請設計一節酸鹼中和探究課，說明安全與評估安排。',
      good: '風險評估、替代實驗、學習重點',
      weak: '忽略安全只講「有趣」',
    },
  ],
  '科學／STEM': [
    {
      prompt: '請說明 STEM 跨學科活動中，你如何評估學生科學探究能力。',
      good: '明確評估準則與歷程紀錄',
      weak: '活動熱鬧但無學習證據',
    },
  ],
  'ICT／資訊科技': [
    {
      prompt: '請說明你如何在課堂引入編程思維，並處理學生抄襲程式碼問題。',
      good: '學術誠信、分階段任務、口頭查核',
      weak: '只推薦 YouTube 自學',
    },
  ],
  '資訊及通訊科技': [
    {
      prompt: '請分享你設計校本 eLearning 任務時，如何照顧不同數碼能力學生。',
      good: '分層資源、無障礙、形成性評估',
      weak: '假設人人有最新手機',
    },
  ],
  公社科: [
    {
      prompt: '議題探究課如何保持中立，同時回應家長對「政治化」的疑慮？',
      good: '多元觀點、資料素養、校本政策',
      weak: '迴避問題或單一口徑',
    },
  ],
  '通識／公社科': [
    {
      prompt: '請舉例說明你如何設計一節國情相關單元，並連結評估。',
      good: '議題框架、資料分析、價值觀教育',
      weak: '純背誦資料',
    },
  ],
  常識: [
    {
      prompt: '小學常識如何連結社區資源？請舉一個戶外學習例子。',
      good: '風險評估、學習目標、跟進',
      weak: '當旅行團無教學設計',
    },
  ],
}

function normalizeSubjectKey(subject: string, major: string): string {
  const s = subject || major
  if (SUBJECT_QUESTIONS[s]) return s
  if (s.includes('中文') || major.includes('中文')) return '中文'
  if (s.includes('英文') || major.includes('英文')) return '英文'
  if (s.includes('數學')) return '數學'
  if (s.includes('ICT') || s.includes('資訊')) return 'ICT／資訊科技'
  if (s.includes('科學') || s.includes('STEM')) return '科學／STEM'
  if (s.includes('公社') || s.includes('通識')) return '公社科'
  return '公社科'
}

export function drawSubjectInterviewQuestion(
  vacancySubject: string,
  playerMajor: string,
  rng: () => number,
): { narrative: string; subjectKey: string } {
  const key = normalizeSubjectKey(vacancySubject, playerMajor)
  const pool = SUBJECT_QUESTIONS[key] ?? SUBJECT_QUESTIONS['公社科']
  const q = pickOne(rng, pool)
  return {
    subjectKey: key,
    narrative: `學科專題（${key}）：「${q.prompt}」——Panel 期待聽到具體教學設計，而非空泛口號。`,
  }
}

export function subjectAnswerEffects(
  choiceId: string,
): { successRate: number; good: boolean } {
  if (choiceId === 'subject_strong') return { successRate: 72, good: true }
  if (choiceId === 'subject_weak') return { successRate: 28, good: false }
  if (choiceId === 'subject_honest') return { successRate: 58, good: true }
  return { successRate: 50, good: false }
}

export function drawPanelQuestion(
  school: School,
  rng: () => number,
  reInterview: boolean,
): { narrative: string; percentileLines: string[] } {
  const pool = reInterview
    ? [...REINTERVIEW_PANEL, ...PANEL_QUESTIONS]
    : PANEL_QUESTIONS
  const q = pickOne(rng, pool)
  const sponsor =
    school.profileNote?.includes('天主教') || school.name.includes('天主教')
      ? '辦學團體強調服務與紀律，'
      : school.funding === '直資 (DSS)'
        ? '直資校強調品牌與問責，'
        : '津貼校編制緊拙，'
  return {
    narrative: `「${school.name}」（${school.district}）會議室冷氣過猛。${sponsor}科主任拋題：「${q.prompt}」${q.context}`,
    percentileLines: [
      `Panel 滿意度基準線：全港前 ${randomInt(rng, 22, 48)}% 申請者`,
      reInterview ? '內部轉聘：仍須通過公開 second in 程序' : 'second in 委員會至少三名教師代表',
    ],
  }
}

export function drawMicroTeaching(
  school: School,
  rng: () => number,
  vacancySubject?: string | null,
  playerMajor?: string,
): { narrative: string; percentileLines: string[] } {
  const key = vacancySubject
    ? normalizeSubjectKey(vacancySubject, playerMajor ?? '')
    : null
  const filtered = key
    ? MICRO_SCENARIOS.filter((m) => {
        if (key === '數學') return m.lesson.includes('函數')
        if (key === '英文') return m.lesson.includes('英文')
        if (key === '中文') return m.lesson.includes('中文')
        if (key.includes('科學') || key.includes('STEM')) return m.lesson.includes('科學')
        if (key.includes('ICT') || key.includes('資訊')) return m.lesson.includes('Scratch')
        if (key === '公社科') return m.lesson.includes('公社')
        if (key === '常識') return m.lesson.includes('常識')
        return true
      })
    : MICRO_SCENARIOS
  const pool = filtered.length ? filtered : MICRO_SCENARIOS
  const m = pickOne(rng, pool)
  return {
    narrative: `試教課題：「${m.lesson}」（評估重點：${m.focus}）。地點：${school.district} · ${school.name} 模擬課室。你剛寫完第一個學習目標，黑天鵝出現——${m.swan}。下層有位副校在記分紙上畫貓。`,
    percentileLines: [`試教評分預測分位：${randomInt(rng, 38, 78)}%`],
  }
}

export function drawPrincipalInterview(
  school: School,
  rng: () => number,
  reInterview: boolean,
): { narrative: string; percentileLines: string[] } {
  const base = reInterview
    ? pickOne(rng, PRINCIPAL_SETS.filter((p) => p.narrative.includes('TA')))
    : pickOne(rng, PRINCIPAL_SETS)
  const fallback = pickOne(rng, PRINCIPAL_SETS)
  const picked = base ?? fallback
  const loc = `${school.name}（${school.district}）`
  return {
    narrative: `${loc} — 最後一關。${picked.narrative}`,
    percentileLines: [picked.percentileLine],
  }
}
