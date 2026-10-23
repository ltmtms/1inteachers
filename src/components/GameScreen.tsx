import { useEffect, useState } from 'react'
import { resolveChoice, startNewGame } from '../game/engine'
import { deserialize, serialize } from '../game/state'
import { SAVE_KEY, type GameState } from '../game/types'
import { ChoiceList } from './ChoiceList'
import { PixelTeacherScene } from './PixelTeacherScene'
import { StatusPanel } from './StatusPanel'

function loadSave(): GameState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return null
    return deserialize(raw)
  } catch {
    return null
  }
}

type Props = { initialSeed?: number }

export function GameScreen({ initialSeed }: Props) {
  const [state, setState] = useState<GameState | null>(() => loadSave())
  const [custom, setCustom] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (state && state.phase !== 'menu') {
      localStorage.setItem(SAVE_KEY, serialize(state))
    }
  }, [state])

  const handleStart = () => {
    const s = startNewGame(initialSeed)
    setState(s)
    setCustom('')
  }

  const handleSelect = (choiceId: string, customText?: string) => {
    if (!state || busy) return
    setBusy(true)
    setTimeout(() => {
      const next = resolveChoice(state, choiceId, customText)
      setState(next)
      setCustom('')
      setBusy(false)
    }, 120)
  }

  const handleReset = () => {
    localStorage.removeItem(SAVE_KEY)
    setState(null)
    setCustom('')
  }

  if (!state || state.phase === 'menu') {
    const saved = loadSave()
    return (
      <div className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-12">
        <PixelTeacherScene />
        <h1 className="mt-8 text-2xl font-bold leading-tight text-[var(--accent)] sm:text-3xl">
          香港教師生涯模擬器
        </h1>
        <p className="mt-1 text-lg text-[var(--text-muted)]">
          1 in 80 Billion 終極教畜之路
        </p>
        <p className="mt-6 text-sm leading-relaxed text-[var(--text-muted)]">
          黑色幽默 · 高難度 RNG · 百分位標籤 · 地獄面試三部曲 · 校園修羅場。
          客戶端存檔，無需登入。學校名單僅含津貼／資助及直資（DSS），組別參考{' '}
          <a
            href="https://starschools.hk/admission/banding"
            className="text-[var(--accent)] underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            StarSchools
          </a>
          。
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleStart}
            className="rounded-lg bg-[var(--accent)] px-6 py-3 font-medium text-white shadow-[var(--shadow-soft)] hover:brightness-110"
          >
            開始遊戲
          </button>
          {saved && saved.phase !== 'menu' && (
            <button
              type="button"
              onClick={() => setState(saved)}
              className="rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] px-6 py-3 text-[var(--text-primary)] hover:bg-white"
            >
              繼續上次存檔
            </button>
          )}
        </div>
        <p className="mt-8 text-xs text-[var(--text-muted)]">
          可選：在 URL 加 <code className="text-[var(--accent)]">?seed=12345</code>{' '}
          重現同一命運（重新開始時生效）
        </p>
      </div>
    )
  }

  const turn = state.currentTurn

  return (
    <div className="flex min-h-dvh flex-col pb-10">
      <StatusPanel state={state} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <div className="mb-6 flex justify-center">
          <PixelTeacherScene compact state={state} />
        </div>
        {state.phase === 'ending' ? (
          <article className="space-y-6">
            <h2 className="text-xl font-bold text-[var(--accent)]">{state.endingTitle}</h2>
            <p className="whitespace-pre-wrap leading-relaxed text-[var(--text-primary)]">
              {state.endingNarrative}
            </p>
            {state.lastJudgmentText && (
              <p className="text-sm text-[var(--success)]">{state.lastJudgmentText}</p>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg border border-[var(--panel-border)] bg-[var(--panel-bg)] px-5 py-2.5 text-sm hover:bg-white"
            >
              再玩一條命（清除存檔）
            </button>
          </article>
        ) : turn ? (
          <article className="space-y-6">
            {turn.title && (
              <h2 className="text-lg font-semibold text-[var(--accent)]">{turn.title}</h2>
            )}
            {turn.percentileLines && turn.percentileLines.length > 0 && (
              <ul className="space-y-1 rounded-md border border-[var(--accent-border)] bg-[var(--accent-soft)] px-3 py-2 text-sm text-[var(--text-primary)]">
                {turn.percentileLines.map((line) => (
                  <li key={line}>📊 {line}</li>
                ))}
              </ul>
            )}
            <p className="leading-relaxed text-[var(--text-primary)]">{turn.narrative}</p>
            {state.lastJudgmentText && (
              <p className="rounded-md border border-[var(--success)]/30 bg-[var(--success-bg)] px-3 py-2 text-sm font-medium text-[var(--success)]">
                {state.lastJudgmentText}
              </p>
            )}
            <ChoiceList
              choices={turn.choices}
              allowCustom={turn.allowCustom ?? true}
              customValue={custom}
              onCustomChange={setCustom}
              onSelect={handleSelect}
              disabled={busy}
            />
          </article>
        ) : (
          <p className="text-[var(--text-muted)]">載入中…</p>
        )}
        <footer className="mt-10 flex gap-3 border-t border-[var(--panel-border)] pt-4 text-xs text-[var(--text-muted)]">
          <button
            type="button"
            onClick={handleReset}
            className="hover:text-[var(--text-primary)]"
          >
            重設
          </button>
          <span>存檔自動寫入 localStorage</span>
        </footer>
      </main>
    </div>
  )
}
