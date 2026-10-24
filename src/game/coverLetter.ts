import type { School } from './types'

/** 求職信語氣；只影響敘事，面試邀請仍為獨立隨機（見 rollInterviewInvites）。 */
export type CoverLetterStyleId =
  | 'pragmatic'
  | 'assertive'
  | 'modest'
  | 'wuxia'

export interface CoverLetterStyle {
  id: CoverLetterStyleId
  label: string
  /** 玩家看到的語氣預覽（求職信開首摘錄） */
  preview: string
  description: string
  /** 敘事用；不保證邀請 */
  narrativeTag: string
  /** 邀請率微調（文檔化；預設仍接近隨機） */
  inviteRateBonus: number
}

export const COVER_LETTER_STYLES: CoverLetterStyle[] = [
  {
    id: 'pragmatic',
    label: '務實／穩健',
    preview:
      '「本人理解合約教席之責任，願配合校政、完成行政工作，並以穩定課堂管理為首要……」',
    description: '像人事部最愛的那種：條分縷析、少許承諾、多點「配合」',
    narrativeTag: '語氣四平八穩，HR 讀完只會點頭說「OK，放入待覆」',
    inviteRateBonus: 0.02,
  },
  {
    id: 'assertive',
    label: '進取／積極',
    preview:
      '「本人具豐富補習經驗，可即時接手班務；盼於面試中展示課堂節奏與學科專長……」',
    description: '自信、快刀斬亂麻，略帶「我準備好了」的推銷感',
    narrativeTag: '字裡行間寫住「請盡快回覆」，科主任或覺得醒目，或覺得太急',
    inviteRateBonus: 0.03,
  },
  {
    id: 'modest',
    label: '溫和／謙遜',
    preview:
      '「作為新晉教師，本人深知仍有不足，惟願在資深同事指導下謙卑學習，服務學生……」',
    description: '禮貌、放低姿態，把「學校栽培」放在前面',
    narrativeTag: '讀起來舒服，但唔會因為客氣就自動入圍——現實如此',
    inviteRateBonus: 0.01,
  },
  {
    id: 'wuxia',
    label: '武俠／武術風（創意）',
    preview:
      '「弟子願入貴校門牆，以三尺講台為擂台，以黑板為江湖；課堂如過招，紀律如門規……」',
    description: '離題但記憶點滿分；校長可能當笑話轉發教員群',
    narrativeTag: '有人當你奇才，有人當你 spam——邀請全看運氣',
    inviteRateBonus: 0,
  },
]

export function coverLetterStyleById(
  id: CoverLetterStyleId,
): CoverLetterStyle {
  return COVER_LETTER_STYLES.find((s) => s.id === id) ?? COVER_LETTER_STYLES[0]
}

/** 每間投書學校獨立骰邀請；基準率約 32%，再加風格微調（見各 style.inviteRateBonus）。 */
const BASE_INVITE_RATE = 0.32

export function rollInterviewInvites(
  applied: School[],
  styleId: CoverLetterStyleId,
  rng: () => number,
): { invited: School[]; declined: School[] } {
  const style = coverLetterStyleById(styleId)
  const rate = Math.min(0.55, BASE_INVITE_RATE + style.inviteRateBonus)
  const invited: School[] = []
  const declined: School[] = []
  for (const school of applied) {
    const difficultyPenalty = school.difficulty * 0.0015
    const p = Math.max(0.12, Math.min(0.48, rate - difficultyPenalty))
    if (rng() < p) invited.push(school)
    else declined.push(school)
  }
  return { invited, declined }
}

export function formatInviteReplyLines(
  invited: School[],
  declined: School[],
  styleId: CoverLetterStyleId,
): string[] {
  const style = coverLetterStyleById(styleId)
  const lines: string[] = [
    `你以「${style.label}」風格寄出求職信。${style.narrativeTag}`,
    '面試邀請為獨立隨機結果（風格只影響敘事，不保證入圍）。',
  ]
  if (invited.length) {
    lines.push(
      `✉️ 獲 second in 邀請：${invited.map((s) => s.name).join('、')}`,
    )
  }
  if (declined.length) {
    lines.push(
      `📭 暫無回音／婉拒：${declined.map((s) => s.name).join('、')}`,
    )
  }
  if (!invited.length) {
    lines.push('今輪沒有任何學校約面試——可以刷新跳跳網再投，或接受 TA 過渡。')
  }
  return lines
}
