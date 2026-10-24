/** 全遊戲共用免責聲明（主選單、遊戲中、結局） */
export const DISCLAIMER_TEXT =
  '本遊戲內容純屬虛構，如有雷同，實屬巧合。'

export function GameDisclaimer({ className = '' }: { className?: string }) {
  return (
    <footer
      className={`border-t border-[var(--panel-border)]/80 bg-[var(--panel-bg)]/90 px-4 py-2 text-center text-[11px] leading-relaxed text-[var(--text-muted)] ${className}`}
      role="contentinfo"
    >
      {DISCLAIMER_TEXT}
    </footer>
  )
}
