import type { Choice } from '../game/types'

type Props = {
  choices: Choice[]
  allowCustom: boolean
  customValue: string
  onCustomChange: (v: string) => void
  onSelect: (choiceId: string, customText?: string) => void
  disabled?: boolean
}

export function ChoiceList({
  choices,
  allowCustom,
  customValue,
  onCustomChange,
  onSelect,
  disabled,
}: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-400">行動選項</p>
      {choices.map((c) => (
        <button
          key={c.id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(c.id)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-900/90 px-4 py-3 text-left transition hover:border-amber-700/60 hover:bg-zinc-800 disabled:opacity-50"
        >
          <span className="block font-medium text-amber-100">
            {c.label}
          </span>
          <span className="mt-1 block text-sm text-zinc-400">{c.description}</span>
          <span className="mt-2 block text-xs text-zinc-500">
            成功率約 {c.successRate}% · 代價：{c.costs}
          </span>
        </button>
      ))}
      {allowCustom && (
        <div className="rounded-lg border border-dashed border-zinc-600 bg-zinc-900/50 p-3">
          <label className="text-sm text-zinc-400" htmlFor="custom-action">
            D. 自訂行動
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              id="custom-action"
              type="text"
              value={customValue}
              onChange={(e) => onCustomChange(e.target.value)}
              placeholder="例如：搵舊同學內推、請假面試另一間…"
              className="flex-1 rounded-md border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600"
              disabled={disabled}
            />
            <button
              type="button"
              disabled={disabled || !customValue.trim()}
              onClick={() => onSelect('custom', customValue.trim())}
              className="rounded-md bg-amber-800 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-40"
            >
              執行自訂
            </button>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            自訂行動基礎成功率約 40%，結算為【判定：成功／大成功／失敗／大失敗】
          </p>
        </div>
      )}
    </div>
  )
}
