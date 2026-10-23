import { useEffect, useState } from 'react'
import { resolveChoice, startNewGame } from '../game/engine'
import { deserialize, serialize } from '../game/state'
import { SAVE_KEY, type GameState } from '../game/types'
import { ChoiceList } from './ChoiceList'
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
        <h1 className="text-2xl font-bold leading-tight text-amber-400 sm:text-3xl">
          香港教師生涯模擬器
        </h1>
        <p className="mt-1 text-lg text-zinc-300">
          1 in 80 Billion 終極教畜之路
        </p>
        <p className="mt-6 text-sm leading-relaxed text-zinc-400">
          黑色幽默 · 高難度 RNG · 百分位標籤 · 地獄面試三部曲 · 校園修羅場。
          客戶端存檔，無需登入。
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleStart}
            className="rounded-lg bg-amber-700 px-6 py-3 font-medium text-white hover:bg-amber-600"
          >
            開始遊戲
          </button>
          {saved && saved.phase !== 'menu' && (
            <button
              type="button"
              onClick={() => setState(saved)}
              className="rounded-lg border border-zinc-600 px-6 py-3 text-zinc-200 hover:bg-zinc-900"
            >
              繼續上次存檔
            </button>
          )}
        </div>
        <p className="mt-8 text-xs text-zinc-600">
          可選：在 URL 加 <code className="text-zinc-500">?seed=12345</code>{' '}
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
        {state.phase === 'ending' ? (
          <article className="space-y-6">
            <h2 className="text-xl font-bold text-amber-400">{state.endingTitle}</h2>
            <p className="whitespace-pre-wrap leading-relaxed text-zinc-300">
              {state.endingNarrative}
            </p>
            {state.lastJudgmentText && (
              <p className="text-sm text-amber-200/80">{state.lastJudgmentText}</p>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="rounded-lg bg-zinc-800 px-5 py-2.5 text-sm hover:bg-zinc-700"
            >
              再玩一條命（清除存檔）
            </button>
          </article>
        ) : turn ? (
          <article className="space-y-6">
            {turn.title && (
              <h2 className="text-lg font-semibold text-amber-500/90">{turn.title}</h2>
            )}
            {turn.percentileLines && turn.percentileLines.length > 0 && (
              <ul className="space-y-1 rounded-md border border-amber-900/30 bg-amber-950/20 px-3 py-2 text-sm text-amber-200/90">
                {turn.percentileLines.map((line) => (
                  <li key={line}>📊 {line}</li>
                ))}
              </ul>
            )}
            <p className="leading-relaxed text-zinc-300">{turn.narrative}</p>
            {state.lastJudgmentText && (
              <p className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-emerald-400/90">
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
          <p className="text-zinc-500">載入中…</p>
        )}
        <footer className="mt-10 flex gap-3 border-t border-zinc-800 pt-4 text-xs text-zinc-600">
          <button type="button" onClick={handleReset} className="hover:text-zinc-400">
            重設
          </button>
          <span>存檔自動寫入 localStorage</span>
        </footer>
      </main>
    </div>
  )
}
