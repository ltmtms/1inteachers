import { formatSalaryStatus } from '../game/constants'
import { functionalGroupLabel } from '../game/functionalGroups'
import { formatSchoolStatus, rankLabel } from '../game/state'
import type { GameState } from '../game/types'

export function StatusPanel({ state }: { state: GameState }) {
  const salary = formatSalaryStatus(
    state.rank,
    state.salaryTrack,
    state.mpsPoint,
    state.salary,
  )

  const schoolRowLabel = state.rank === 'TA' ? '任教學校（TA）' : '任教學校'
  const schoolRowValue = formatSchoolStatus(state)

  const major = state.origin?.major ?? '—'
  const pgdeLabel =
    state.pgdeStatus === 'completed'
      ? '已完成 PGDE'
      : state.pgdeStatus === 'enrolled'
        ? '修讀 PGDE 中'
        : state.pgdeStatus === 'waitlisted'
          ? 'PGDE 候補'
          : state.pgdeStatus === 'applying'
            ? 'PGDE 申請中'
            : '未有 PGDE'

  const rows = [
    ['年齡', `${state.age} 歲`],
    ['職級', rankLabel(state.rank)],
    ['主修／學科', major],
    ['PGDE', pgdeLabel],
    ['居住', state.residence !== '—' ? state.residence : '—'],
    ['月薪／薪點', salary],
    [schoolRowLabel, schoolRowValue],
    ...(state.leadershipRank ? [['管理職', state.leadershipRank]] : []),
    ...(state.phase === 'career' || state.phase === 'ending'
      ? [
          ['在校年資', `${state.yearsAtSchool} 年`],
          ['功能組別', functionalGroupLabel(state.functionalGroup)],
        ]
      : []),
    ['教學熱誠', `${state.passion} / 100`],
    ['精神健康值', `${state.san} / 100`],
    ['家庭負擔度', `${state.familyBurden} / 100`],
    ['校長/管理層好感', `${state.principal} / 100`],
    ['教員室人緣', `${state.colleague} / 100`],
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
            警告：精神健康值偏低，接近崩潰（歸零即 Game Over）
          </p>
        )}
      </div>
    </header>
  )
}
