import { functionalGroupLabel } from '../game/functionalGroups'
import { rankLabel } from '../game/state'
import type { GameState } from '../game/types'

export function StatusPanel({ state }: { state: GameState }) {
  const salary =
    state.salary > 0
      ? `MPS Pt. ${state.mpsPoint} ($${state.salary.toLocaleString()})`
      : state.rank === 'TA'
        ? '月薪 $17,000（TA）'
        : '—'

  const rows = [
    ['職級', rankLabel(state.rank)],
    ['月薪', salary],
    ['任教學校', `${state.schoolName}（${state.schoolType}）`],
    ...(state.phase === 'career' || state.phase === 'ending'
      ? [
          ['在校年資', `${state.yearsAtSchool} 年`],
          ['功能組別', functionalGroupLabel(state.functionalGroup)],
        ]
      : []),
    ['教學熱誠', `${state.passion} / 100`],
    ['精神 SAN 值', `${state.san} / 100`],
    ['校長/管理層好感', `${state.principal} / 100`],
    ['教員室人緣', `${state.colleague} / 100`],
    ['續約／轉 Perm 機率', `${state.renewPerm}%`],
  ]

  return (
    <header
      className="sticky top-0 z-20 border-b border-[var(--panel-border)] bg-[var(--panel-bg)]/95 backdrop-blur-md shadow-[var(--shadow-soft)]"
    >
      <div className="mx-auto max-w-2xl px-3 py-3">
        <p className="mb-2 text-xs font-medium tracking-wide text-[var(--accent)]">
          即時狀態面板 · 第 {state.turn} 回合
        </p>
        <dl className="grid grid-cols-1 gap-1 text-sm sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div
              key={label}
              className="flex flex-wrap gap-x-2 rounded-md border border-[var(--panel-border)]/60 bg-white/80 px-2 py-1.5"
            >
              <dt className="shrink-0 text-[var(--text-muted)]">【{label}】</dt>
              <dd className="text-[var(--text-primary)]">{value}</dd>
            </div>
          ))}
        </dl>
        {state.san <= 20 && state.phase !== 'ending' && (
          <p className="mt-2 text-xs text-red-600 animate-pulse">
            警告：SAN 偏低，接近精神崩潰（歸零即 Game Over）
          </p>
        )}
      </div>
    </header>
  )
}
