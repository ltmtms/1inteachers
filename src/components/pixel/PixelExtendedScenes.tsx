import type { ReactNode } from 'react'
import './pixel-extended.css'
import './pixel-shared.css'

type Compact = { compact?: boolean; caption: string; className: string; children: ReactNode }

function PixelFrame({ compact, caption, className, children }: Compact) {
  return (
    <div
      className={`pixel-scene ${className} ${compact ? 'pixel-scene--compact' : ''}`}
      role="img"
      aria-label={caption}
    >
      {children}
      <span className="pixel-scene__caption">{caption}</span>
    </div>
  )
}

export function PixelGraduationScene({ compact }: { compact?: boolean }) {
  return (
    <PixelFrame compact={compact} caption="畢業" className="pixel-grad">
      <div className="pixel-grad__stage" />
      <div className="pixel-grad__grad" />
      <div className="pixel-grad__cap" />
    </PixelFrame>
  )
}

export function PixelJumpNetScene({ compact }: { compact?: boolean }) {
  return (
    <PixelFrame compact={compact} caption="跳跳網" className="pixel-jump">
      <div className="pixel-jump__screen">
        <span className="pixel-jump__line pixel-jump__line--1" />
        <span className="pixel-jump__line pixel-jump__line--2" />
        <span className="pixel-jump__line pixel-jump__line--3" />
      </div>
      <span className="pixel-jump__cursor" />
    </PixelFrame>
  )
}

export function PixelTAScene({ compact }: { compact?: boolean }) {
  return (
    <PixelFrame compact={compact} caption="TA 日常" className="pixel-ta">
      <div className="pixel-ta__copier" />
      <span className="pixel-ta__paper" />
      <span className="pixel-ta__person" />
    </PixelFrame>
  )
}

export function PixelStaffRoomScene({ compact }: { compact?: boolean }) {
  return (
    <PixelFrame compact={compact} caption="教員室夜戰" className="pixel-staff">
      <span className="pixel-staff__lamp" />
      <div className="pixel-staff__desk" />
      <span className="pixel-staff__stack" />
    </PixelFrame>
  )
}

export type FunctionalSceneKind = 'discipline' | 'eca' | 'counselling' | 'it' | 'admin'

const FUNC_CAPTION: Record<FunctionalSceneKind, string> = {
  discipline: '訓導組',
  eca: '課外活動',
  counselling: '輔導組',
  it: '資訊科技組',
  admin: '行政組',
}

export function PixelFunctionalScene({
  compact,
  kind,
}: {
  compact?: boolean
  kind: FunctionalSceneKind
}) {
  return (
    <PixelFrame
      compact={compact}
      caption={FUNC_CAPTION[kind]}
      className={`pixel-func pixel-func--${kind}`}
    >
      <span className="pixel-func__icon" />
    </PixelFrame>
  )
}

export type FamilySceneKind = 'dating' | 'wedding' | 'child' | 'bereavement'

const FAMILY_CAPTION: Record<FamilySceneKind, string> = {
  dating: '拍拖',
  wedding: '結婚',
  child: '家庭',
  bereavement: '思念',
}

export function PixelFamilyScene({
  compact,
  kind,
}: {
  compact?: boolean
  kind: FamilySceneKind
}) {
  const quiet = kind === 'bereavement'
  return (
    <PixelFrame
      compact={compact}
      caption={FAMILY_CAPTION[kind]}
      className={`pixel-family ${quiet ? 'pixel-family--quiet' : ''}`}
    >
      {kind === 'dating' && <span className="pixel-family__heart" />}
      {kind === 'wedding' && <span className="pixel-family__rings" />}
      {kind === 'child' && <span className="pixel-family__cradle" />}
      {kind === 'bereavement' && (
        <>
          <span className="pixel-family__candle" />
          <span className="pixel-family__flame" />
        </>
      )}
    </PixelFrame>
  )
}

export function PixelPromotionScene({ compact }: { compact?: boolean }) {
  return (
    <PixelFrame compact={compact} caption="晉升" className="pixel-promo">
      <span className="pixel-promo__badge" />
      <span className="pixel-promo__star" />
    </PixelFrame>
  )
}

export function PixelRetirementScene({ compact }: { compact?: boolean }) {
  return (
    <PixelFrame compact={compact} caption="退休" className="pixel-retire">
      <span className="pixel-retire__sun" />
      <div className="pixel-retire__bench" />
      <span className="pixel-retire__person" />
    </PixelFrame>
  )
}
