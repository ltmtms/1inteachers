import './pixel-sports-day.css'
import './pixel-shared.css'

/** Outdoor sports ground — teacher with whistle and clipboard. */
export function PixelSportsDayScene({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`pixel-scene pixel-sports ${compact ? 'pixel-scene--compact' : ''}`}
      role="img"
      aria-label="像素風格運動會：老師執哨吹哨"
    >
      <div className="pixel-sports__sky">
        <span className="pixel-sports__cloud pixel-sports__cloud--a" />
        <span className="pixel-sports__cloud pixel-sports__cloud--b" />
      </div>
      <div className="pixel-sports__bunting">
        <span />
        <span />
        <span />
        <span />
      </div>
      <div className="pixel-sports__track" />
      <div className="pixel-sports__runner pixel-sports__runner--a">
        <span className="pixel-sports__runner-body" />
      </div>
      <div className="pixel-sports__runner pixel-sports__runner--b">
        <span className="pixel-sports__runner-body" />
      </div>
      <div className="pixel-sports__teacher">
        <span className="pixel-sports__teacher-head" />
        <span className="pixel-sports__teacher-body" />
        <span className="pixel-sports__clipboard" />
        <span className="pixel-sports__whistle" />
      </div>
      <span className="pixel-scene__caption">運動會</span>
    </div>
  )
}
