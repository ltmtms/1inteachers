import type { Choice, GameState, TurnContent } from './types'
import type { FunctionalGroupId } from './functionalGroups'
import { FUNCTIONAL_GROUP_LABELS } from './functionalGroups'
import { randomInt } from './rng'

type GroupEventBuilder = (state: GameState, rng: () => number) => TurnContent

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

function tagTitle(group: FunctionalGroupId, title: string): string {
  return `【${FUNCTIONAL_GROUP_LABELS[group]}】${title}`
}

const groupEvents: { group: FunctionalGroupId; build: GroupEventBuilder }[] = [
  // 行政組
  {
    group: 'admin',
    build: (state, rng) => ({
      title: tagTitle('admin', '行政會議馬拉松'),
      narrative: `行政組例會——議程包括下年度編班、外判清潔合約、以及「家長意見書要不要回覆逐條」。校長話「今日盡快散」，但副校第 ${randomInt(rng, 3, 8)} 項議程係你負責跟進的 ${state.schoolName} 校本政策。你肚餓，WhatsApp 家長群又有新訊息。`,
      percentileLines: [`行政會議超時率：${randomInt(rng, 55, 82)}%`],
      choices: [
        choice('adm_speak', '[發言] 提出具體修訂', '管理層曝光', 48, 'SAN -10', {
          大成功: { principal: 22, renewPerm: 12 },
          成功: { principal: 10, renewPerm: 5 },
          失敗: { principal: -8, san: -12 },
          大失敗: { principal: -18, san: -18 },
        }),
        choice('adm_notes', '[紀錄] 做會議秘書', '穩陣', 65, 'SAN -8', {
          大成功: { principal: 12, colleague: 6 },
          成功: { principal: 6, san: -6 },
          失敗: { san: -10 },
          大失敗: { san: -16, colleague: -5 },
        }),
        choice('adm_leave', '[早退] 稱有課要備', '政治風險', 35, '校長 -', {
          大成功: { san: 8 },
          成功: { san: 3 },
          失敗: { principal: -15 },
          大失敗: { principal: -25, renewPerm: -10 },
        }),
      ],
      allowCustom: true,
    }),
  },
  {
    group: 'admin',
    build: (state) => ({
      title: tagTitle('admin', '校政會前線'),
      narrative: `校政會議前，行政組要決定：合約教席空缺係公開招聘定「內部推薦」。你手上有一份同事成就表——有人求你幫手「寫靚啲」，有人警告你「唔好多事」。${state.schoolName} 的 Perm 傳言又起，空氣凝固。`,
      choices: [
        choice('adm_fair', '[公正] 堅持程序公開', '道義', 42, '人緣 賭', {
          大成功: { principal: 15, passion: 10 },
          成功: { principal: 6, passion: 5 },
          失敗: { colleague: -15 },
          大失敗: { colleague: -25, principal: -10 },
        }),
        choice('adm_align', '[配合] 跟校長方向', '續約路線', 58, '熱誠 -5', {
          大成功: { principal: 18, renewPerm: 10 },
          成功: { principal: 8, renewPerm: 4 },
          失敗: { principal: -5, passion: -8 },
          大失敗: { principal: -15, renewPerm: -8 },
        }),
        choice('adm_abstain', '[棄權] 唔表態', '低調', 72, 'SAN -3', {
          大成功: { san: 5 },
          成功: {},
          失敗: { principal: -8 },
          大失敗: { principal: -14, colleague: -6 },
        }),
      ],
      allowCustom: true,
    }),
  },
  {
    group: 'admin',
    build: (state, rng) => ({
      title: tagTitle('admin', '突發危機應變'),
      narrative: `社交媒體出現 ${state.schoolName} 負面帖文，行政組即時開 Zoom。教育局來電查詢、家長會要求見校長、記者郵件已 cc 全組。你負責起草對外聲明——限兩小時，錯一字都係頭條。`,
      percentileLines: [`危機公關壓力分位：${randomInt(rng, 60, 88)}%`],
      choices: [
        choice('adm_crisis', '[通宵] 與法團顧問改稿', 'SAN -', 54, 'SAN -18', {
          大成功: { principal: 20, renewPerm: 8 },
          成功: { principal: 10, san: -12 },
          失敗: { san: -18 },
          大失敗: { san: -26, principal: -12 },
        }),
        choice('adm_delegate', '[分工] 拉其他組別幫手', '協作', 52, '人緣 視結果', {
          大成功: { colleague: 15, principal: 8 },
          成功: { colleague: 6 },
          失敗: { colleague: -12, san: -10 },
          大失敗: { colleague: -20, principal: -8 },
        }),
        choice('adm_min', '[最低] 用教育局模板', '安全', 68, '熱誠 -3', {
          大成功: { principal: 6 },
          成功: {},
          失敗: { principal: -10 },
          大失敗: { principal: -18, renewPerm: -6 },
        }),
      ],
      allowCustom: true,
    }),
  },
  // 資訊科技組
  {
    group: 'it',
    build: (state, rng) => ({
      title: tagTitle('it', 'Wi‑Fi 全軍覆沒'),
      narrative: `朝早七點，${state.schoolName} 全校 Wi‑Fi 死機——考試班要即時上網核對資料。資訊科技組廣播：「IT 同事請回校。」你捧住筆電在伺服器房出汗，供應商話「最快三點先有人」。`,
      percentileLines: [`校本 IT 突發工時分位：${randomInt(rng, 72, 94)}%`],
      choices: [
        choice('it_hotspot', '[應急] 手機熱點救場', '體力', 58, 'SAN -12', {
          大成功: { principal: 16, colleague: 12 },
          成功: { principal: 8, san: -8 },
          失敗: { san: -14 },
          大失敗: { san: -22, principal: -6 },
        }),
        choice('it_vendor', '[追供應商] 逐個電話', '行政', 62, 'SAN -10', {
          大成功: { principal: 14 },
          成功: { principal: 6, san: -8 },
          失敗: { san: -12 },
          大失敗: { san: -18, colleague: -5 },
        }),
        choice('it_postpone', '[建議] 改期考試', '政治', 40, '校長 -', {
          大成功: { san: 10, passion: 5 },
          成功: { san: 4 },
          失敗: { principal: -18 },
          大失敗: { principal: -28, renewPerm: -10 },
        }),
      ],
      allowCustom: true,
    }),
  },
  {
    group: 'it',
    build: (_state) => ({
      title: tagTitle('it', 'eLearning 平台大更新'),
      narrative: `教育局推新校本學習平台，資訊科技組要在兩星期內為全體老師開帳號、上培訓、寫 FAQ。副校：「順便整合 AI 備課工具。」你發現舊平台學生作業未 migrate，科主任問「點解我睇唔到去年 SBA」。`,
      choices: [
        choice('it_train', '[培訓] 放學後工作坊', '曝光', 60, 'SAN -14', {
          大成功: { principal: 18, renewPerm: 8 },
          成功: { principal: 8, san: -10 },
          失敗: { san: -16 },
          大失敗: { san: -24, colleague: -8 },
        }),
        choice('it_video', '[錄影] 做教學片', '技術流', 55, '時間 -', {
          大成功: { colleague: 15, principal: 10 },
          成功: { colleague: 6, san: -8 },
          失敗: { san: -12 },
          大失敗: { san: -18, principal: -5 },
        }),
        choice('it_slow', '[排期] 分階段上線', '務實', 52, '校長 視結果', {
          大成功: { principal: 8, san: 5 },
          成功: {},
          失敗: { principal: -12 },
          大失敗: { principal: -20, renewPerm: -6 },
        }),
      ],
      allowCustom: true,
    }),
  },
  {
    group: 'it',
    build: (state, rng) => ({
      title: tagTitle('it', '深夜帳號救援'),
      narrative: `晚上十點，${state.schoolName} 群組：「老師我交唔到功課！」資訊科技組慣例——非辦公時間照接。你重設密碼、解鎖帳號、順手幫校長助理整 Excel，抬頭已過午夜。`,
      percentileLines: [`非教學 IT 支援夜間率：${randomInt(rng, 65, 90)}%`],
      choices: [
        choice('it_help', '[全救] 逐個回覆', '校長好感', 65, 'SAN -16', {
          大成功: { principal: 14, renewPerm: 6 },
          成功: { principal: 6, san: -12 },
          失敗: { san: -18, passion: -6 },
          大失敗: { san: -26, passion: -12 },
        }),
        choice('it_bot', '[自動] 設 FAQ 機械人', '長遠', 52, '體力 -1', {
          大成功: { principal: 12, colleague: 10, passion: 6 },
          成功: { principal: 6, colleague: 4 },
          失敗: { san: -10 },
          大失敗: { san: -16, principal: -8 },
        }),
        choice('it_off', '[關機] 明早再處理', '底線', 38, '人緣 -', {
          大成功: { san: 12, passion: 6 },
          成功: { san: 6 },
          失敗: { colleague: -12, principal: -10 },
          大失敗: { colleague: -20, principal: -18 },
        }),
      ],
      allowCustom: true,
    }),
  },
  // 學務組
  {
    group: 'academic',
    build: (_state) => ({
      title: tagTitle('academic', '升留班會議'),
      narrative: `學務組召開升留班 panel：邊個學生要重讀、邊個可以「附條升班」。家長代表已在門外等候。你手上成績表同操行紀錄打架——一個學生數學合格但欠交功課三十次。`,
      choices: [
        choice('aca_strict', '[嚴格] 按條文執行', '合規', 55, 'SAN -10', {
          大成功: { principal: 14, renewPerm: 6 },
          成功: { principal: 6 },
          失敗: { colleague: -8, san: -12 },
          大失敗: { principal: -10, san: -18 },
        }),
        choice('aca_case', '[個案] 逐個討論', '公義', 48, 'SAN -12', {
          大成功: { passion: 12, principal: 8 },
          成功: { passion: 5, san: -8 },
          失敗: { san: -14 },
          大失敗: { san: -22, principal: -8 },
        }),
        choice('aca_defer', '[押後] 要更多資料', '拖延', 62, '家長 -', {
          大成功: { san: 5 },
          成功: {},
          失敗: { principal: -10 },
          大失敗: { principal: -18, colleague: -6 },
        }),
      ],
      allowCustom: true,
    }),
  },
  {
    group: 'academic',
    build: (state, rng) => ({
      title: tagTitle('academic', '統測與分班'),
      narrative: `學務組要為 ${state.schoolName} 設計統測難度與分班編制——「精英班」傳言又起。科主任想要數據靚仔，家長想要「公平」；你夾在中間改試卷藍圖。`,
      percentileLines: [`分班爭議率分位：${randomInt(rng, 50, 78)}%`],
      choices: [
        choice('aca_data', '[數據] 用校本分析說服', '專業', 54, 'SAN -8', {
          大成功: { principal: 16, renewPerm: 8 },
          成功: { principal: 8 },
          失敗: { san: -10, principal: -5 },
          大失敗: { san: -16, principal: -14 },
        }),
        choice('aca_flat', '[平均] 減少精英班', '理想', 42, '校長 -', {
          大成功: { passion: 15, colleague: 10 },
          成功: { passion: 8 },
          失敗: { principal: -15 },
          大失敗: { principal: -25, renewPerm: -10 },
        }),
        choice('aca_copy', '[沿用] 去年方案微調', '省力', 68, '熱誠 -4', {
          大成功: { san: 4 },
          成功: { san: -3 },
          失敗: { principal: -8 },
          大失敗: { principal: -14, colleague: -8 },
        }),
      ],
      allowCustom: true,
    }),
  },
  {
    group: 'academic',
    build: (state) => ({
      title: tagTitle('academic', '成績表地獄週'),
      narrative: `學期末，學務組負責核對全校成績表——錯一個位家長就會打爆電話。系統 export 失敗，你要手動對照 ${state.schoolName} 三十個班。影印房已關門，你仍在電腦房。`,
      choices: [
        choice('aca_check', '[逐格] 三重核對', 'SAN -', 58, 'SAN -16', {
          大成功: { principal: 12, renewPerm: 5 },
          成功: { principal: 5, san: -12 },
          失敗: { san: -18 },
          大失敗: { san: -26, principal: -8 },
        }),
        choice('aca_team', '[組隊] 拉科主任幫手', '人緣', 52, '人緣 視結果', {
          大成功: { colleague: 14, san: -6 },
          成功: { colleague: 6, san: -8 },
          失敗: { colleague: -12, san: -12 },
          大失敗: { colleague: -22, san: -16 },
        }),
        choice('aca_risk', '[趕死] 相信系統', '賭', 44, '續約 -', {
          大成功: { san: 6 },
          成功: {},
          失敗: { principal: -14, renewPerm: -8 },
          大失敗: { principal: -24, renewPerm: -15 },
        }),
      ],
      allowCustom: true,
    }),
  },
  // 訓導組
  {
    group: 'discipline',
    build: (_state) => ({
      title: tagTitle('discipline', '課堂衝突調查'),
      narrative: `有學生投訴被同學欺凌，訓導組要立案調查。雙方家長版本完全相反，WhatsApp 截圖滿天飛。你負責約談學生——有人話「老師偏心」，有人話「學校唔理」。`,
      choices: [
        choice('dis_full', '[深入] 多輪面談', 'SAN -', 52, 'SAN -14', {
          大成功: { principal: 14, passion: 8 },
          成功: { principal: 6, san: -10 },
          失敗: { san: -16 },
          大失敗: { san: -24, principal: -8 },
        }),
        choice('dis_medi', '[調停] 三方會面', '好夜走', 48, 'SAN -12', {
          大成功: { principal: 12, renewPerm: 5 },
          成功: { principal: 4, san: -10 },
          失敗: { san: -14, principal: -6 },
          大失敗: { san: -22, principal: -14 },
        }),
        choice('dis_ref', '[轉介] 交社工跟進', '制度', 60, '熱誠 +?', {
          大成功: { colleague: 10, san: 5 },
          成功: { colleague: 4 },
          失敗: { principal: -8 },
          大失敗: { principal: -16, colleague: -8 },
        }),
      ],
      allowCustom: true,
    }),
  },
  {
    group: 'discipline',
    build: (state, rng) => ({
      title: tagTitle('discipline', '見家長之夜'),
      narrative: `訓導組家長晚會——${state.schoolName} 禮堂坐滿人。你負責講解校規與手機政策，台下有人直播。散會後家長排隊「傾兩句」，抬頭已過十點。`,
      percentileLines: [`家長晚會超時分位：${randomInt(rng, 58, 85)}%`],
      choices: [
        choice('dis_stay', '[陪盡] 逐個解答', '校長最愛', 62, 'SAN -18', {
          大成功: { principal: 18, renewPerm: 8 },
          成功: { principal: 8, san: -14 },
          失敗: { san: -20 },
          大失敗: { san: -28, passion: -8 },
        }),
        choice('dis_slot', '[預約] 另約時間', '邊界', 50, '家長 -', {
          大成功: { san: 8, principal: 4 },
          成功: { san: 2 },
          失敗: { principal: -12 },
          大失敗: { principal: -22, renewPerm: -6 },
        }),
        choice('dis_team', '[分工] 與同事輪值', '人緣', 55, '人緣 視結果', {
          大成功: { colleague: 15, san: -6 },
          成功: { colleague: 6, san: -8 },
          失敗: { colleague: -12 },
          大失敗: { colleague: -20, san: -14 },
        }),
      ],
      allowCustom: true,
    }),
  },
  {
    group: 'discipline',
    build: (_state) => ({
      title: tagTitle('discipline', '停課危機'),
      narrative: `一名學生屢次違規，訓導組建議短期停課——家長威脅投訴教育局。校長要你起草信函同跟進計劃，明日就要交。你清楚停課可能救佢，亦可能引爆輿論。`,
      choices: [
        choice('dis_suspend', '[支持] 執行停課', '硬線', 45, 'SAN -10', {
          大成功: { principal: 16, renewPerm: 6 },
          成功: { principal: 6 },
          失敗: { principal: -12, san: -12 },
          大失敗: { principal: -22, san: -18 },
        }),
        choice('dis_alt', '[替代] 社會服務安排', '柔性', 55, 'SAN -8', {
          大成功: { passion: 12, principal: 8 },
          成功: { passion: 5 },
          失敗: { san: -10, principal: -5 },
          大失敗: { san: -16, principal: -14 },
        }),
        choice('dis_wait', '[觀察] 再給機會', '風險', 40, '續約 -', {
          大成功: { colleague: 8 },
          成功: {},
          失敗: { principal: -14 },
          大失敗: { principal: -24, renewPerm: -10 },
        }),
      ],
      allowCustom: true,
    }),
  },
  // 課外活動組
  {
    group: 'eca',
    build: (_state, rng) => ({
      title: tagTitle('eca', '周末外出比賽'),
      narrative: `課外活動組帶隊打校外比賽——星期六清晨六點校門集合。學生興奮，你未飲咖啡。回程塞车，有家長問「點解唔係第一名」。`,
      percentileLines: [`ECA 周末工時分位：${randomInt(rng, 65, 88)}%`],
      choices: [
        choice('eca_full', '[全程] 照顧安全與士氣', 'SAN -', 65, 'SAN -16', {
          大成功: { principal: 16, renewPerm: 8, passion: 5 },
          成功: { principal: 8, san: -12 },
          失敗: { san: -18 },
          大失敗: { san: -26, passion: -8 },
        }),
        choice('eca_min', '[最低] 符合指引即可', '平衡', 58, '校長 -', {
          大成功: { san: 6 },
          成功: {},
          失敗: { principal: -10 },
          大失敗: { principal: -18 },
        }),
        choice('eca_parent', '[安撫] 逐個回覆家長', '體力', 52, 'SAN -12', {
          大成功: { principal: 10, colleague: 6 },
          成功: { principal: 4, san: -8 },
          失敗: { san: -14 },
          大失敗: { san: -20, principal: -8 },
        }),
      ],
      allowCustom: true,
    }),
  },
  {
    group: 'eca',
    build: (_state) => ({
      title: tagTitle('eca', '海外交流團準備'),
      narrative: `暑假交流團名額三十，課外活動組要搞簡介會、保險、家長同意書——還有「學生持 BNO 要不要額外聲明」的行政問題。副校話「你順便做宣傳片」。`,
      choices: [
        choice('eca_trip', '[投入] 親自跟團', '續約 +', 60, 'SAN -20', {
          大成功: { principal: 22, renewPerm: 12 },
          成功: { principal: 10, san: -15 },
          失敗: { san: -22 },
          大失敗: { san: -30, principal: -6 },
        }),
        choice('eca_local', '[留守] 只負責本地籌備', '省力', 62, 'SAN -8', {
          大成功: { principal: 8 },
          成功: { principal: 4, san: -6 },
          失敗: { san: -12 },
          大失敗: { san: -18, colleague: -5 },
        }),
        choice('eca_outsource', '[外判] 旅行社多做事', '預算', 48, '校長 視結果', {
          大成功: { san: 10, principal: 6 },
          成功: { san: 4 },
          失敗: { principal: -12 },
          大失敗: { principal: -20, renewPerm: -8 },
        }),
      ],
      allowCustom: true,
    }),
  },
  {
    group: 'eca',
    build: (state, rng) => ({
      title: tagTitle('eca', '學會登記混亂'),
      narrative: `${state.schoolName} 學會登記系統塞車——三百學生同時報名。課外活動組要處理「點解我唔入到籃球隊」的客诉，還有老師搶學生去自己學會。`,
      percentileLines: [`ECA 行政錯誤率分位：${randomInt(rng, 40, 65)}%`],
      choices: [
        choice('eca_fair', '[抽籤] 公開公正程序', '公義', 55, 'SAN -10', {
          大成功: { principal: 12, passion: 8 },
          成功: { principal: 5 },
          失敗: { colleague: -10, san: -12 },
          大失敗: { colleague: -18, principal: -8 },
        }),
        choice('eca_manual', '[人手] 通宵改表', '硬肝', 58, 'SAN -16', {
          大成功: { principal: 14, renewPerm: 5 },
          成功: { principal: 6, san: -12 },
          失敗: { san: -18 },
          大失敗: { san: -26 },
        }),
        choice('eca_delay', '[延期] 下週再開', '政治', 42, '學生 -', {
          大成功: { san: 6 },
          成功: {},
          失敗: { principal: -14 },
          大失敗: { principal: -22, colleague: -10 },
        }),
      ],
      allowCustom: true,
    }),
  },
  // 輔導組
  {
    group: 'counselling',
    build: (_state) => ({
      title: tagTitle('counselling', '長談三小時'),
      narrative: `輔導組個案：學生話「唔想返學」，你關上會議室門開始長談。外面課堂照上，你錯過了備課時間。社工話「要尊重自主」，家長話「你哋有冇跟進」。`,
      choices: [
        choice('cou_listen', '[陪伴] 繼續傾到穩定', '情緒勞動', 52, 'SAN -14', {
          大成功: { passion: 15, principal: 8 },
          成功: { passion: 8, san: -10 },
          失敗: { san: -16, passion: -5 },
          大失敗: { san: -24, passion: -12 },
        }),
        choice('cou_plan', '[結束] 約下次再談', '邊界', 58, '學生 視結果', {
          大成功: { san: 6, principal: 4 },
          成功: {},
          失敗: { principal: -8 },
          大失敗: { principal: -16, passion: -6 },
        }),
        choice('cou_sw', '[轉介] 即時聯絡社工', '協作', 62, 'SAN -6', {
          大成功: { colleague: 12, principal: 10 },
          成功: { colleague: 5, principal: 4 },
          失敗: { san: -10 },
          大失敗: { san: -16, principal: -10 },
        }),
      ],
      allowCustom: true,
    }),
  },
  {
    group: 'counselling',
    build: (state, rng) => ({
      title: tagTitle('counselling', '保密與通報'),
      narrative: `學生向你透露可能傷害自己——輔導組要決定：即時通報定守保密？${state.schoolName} 政策寫得好清楚，現實卻好灰。你手震開緊急聯絡表。`,
      percentileLines: [`高危個案壓力分位：${randomInt(rng, 70, 92)}%`],
      choices: [
        choice('cou_report', '[通報] 跟機制上報', '合規', 60, 'SAN -12', {
          大成功: { principal: 14, renewPerm: 5 },
          成功: { principal: 6, san: -8 },
          失敗: { san: -14 },
          大失敗: { san: -22, principal: -8 },
        }),
        choice('cou_stay', '[陪伴] 先穩定再報', '道義賭', 45, 'SAN -10', {
          大成功: { passion: 12, principal: 6 },
          成功: { passion: 5 },
          失敗: { principal: -14, san: -14 },
          大失敗: { principal: -24, san: -22 },
        }),
        choice('cou_escalate', '[升級] 拉校長與社工開會', '制度', 52, 'SAN -10', {
          大成功: { principal: 16, colleague: 8 },
          成功: { principal: 8, san: -8 },
          失敗: { san: -14, principal: -6 },
          大失敗: { san: -20, principal: -16 },
        }),
      ],
      allowCustom: true,
    }),
  },
  {
    group: 'counselling',
    build: (_state) => ({
      title: tagTitle('counselling', '朋輩輔導培訓'),
      narrative: `輔導組要培訓學生輔導員——教你哋點樣「聆聽而不拯救世界」。你準備工作坊，同時自己 case load 已爆。有老師話「你地組成日開會，仲有冇時間教書？」`,
      choices: [
        choice('cou_train', '[認真] 做互動工作坊', 'SAN -', 55, 'SAN -12', {
          大成功: { principal: 12, passion: 10 },
          成功: { principal: 6, passion: 4, san: -8 },
          失敗: { san: -14 },
          大失敗: { san: -20, colleague: -6 },
        }),
        choice('cou_slides', '[快打] 用局方 ppt', '省力', 72, '熱誠 -4', {
          大成功: { san: 4 },
          成功: { san: -3 },
          失敗: { principal: -6 },
          大失敗: { principal: -12, passion: -6 },
        }),
        choice('cou_bound', '[反映] 要求減 case', '底線', 40, '校長 -', {
          大成功: { san: 12, passion: 8 },
          成功: { san: 6 },
          失敗: { principal: -16 },
          大失敗: { principal: -26, renewPerm: -8 },
        }),
      ],
      allowCustom: true,
    }),
  },
]

export function pickGroupCareerEvent(
  group: FunctionalGroupId,
  state: GameState,
  rng: () => number,
): TurnContent {
  const pool = groupEvents.filter((e) => e.group === group)
  const idx = randomInt(rng, 0, pool.length - 1)
  return pool[idx].build(state, rng)
}

export function groupEventCount(): number {
  return groupEvents.length
}
