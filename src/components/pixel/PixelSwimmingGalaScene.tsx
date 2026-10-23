import './pixel-swimming-gala.css'
import './pixel-shared.css'

/** Poolside swimming gala — teacher with stopwatch and whistle. */
export function PixelSwimmingGalaScene({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`pixel-scene pixel-swim ${compact ? 'pixel-scene--compact' : ''}`}
      role="img"
      aria-label="像素風格游泳比賽：老師池邊計時"
    >
      <div className="pixel-swim__deck" />
      <div className="pixel-swim__pool">
        <span className="pixel-swim__wave pixel-swim__wave--1" />
        <span className="pixel-swim__wave pixel-swim__wave--2" />
        <span className="pixel-swim__lane pixel-swim__lane--1" />
        <span className="pixel-swim__lane pixel-swim__lane--2" />
        <span className="pixel-swim__lane pixel-swim__lane--3" />
        <span className="pixel-swim__swimmer" />
      </div>
      <div className="pixel-swim__teacher">
        <span className="pixel-swim__teacher-head" />
        <span className="pixel-swim__teacher-body" />
        <span className="pixel-swim__stopwatch" />
        <span className="pixel-swim__whistle" />
      </div>
      <span className="pixel-scene__caption">游泳</span>
    </div>
  )
}
