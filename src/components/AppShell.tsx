import type { ReactNode } from 'react'
import { GameDisclaimer } from './GameDisclaimer'

/** 包裝所有玩家可見畫面，確保免責聲明始終顯示 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col">{children}</div>
      <GameDisclaimer />
    </div>
  )
}
