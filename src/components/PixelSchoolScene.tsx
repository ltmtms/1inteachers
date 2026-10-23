import './pixel-school.css'

/** Cohesive 8-bit school yard — CSS-only sprite animation (no external assets). */
export function PixelSchoolScene({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`pixel-scene ${compact ? 'pixel-scene--compact' : ''}`}
      role="img"
      aria-label="像素風格校舍與教師動畫"
    >
      <div className="pixel-sky">
        <span className="pixel-cloud pixel-cloud--a" />
        <span className="pixel-cloud pixel-cloud--b" />
      </div>
      <div className="pixel-school">
        <div className="pixel-roof" />
        <div className="pixel-wall">
          <span className="pixel-window pixel-window--l" />
          <span className="pixel-window pixel-window--r" />
          <span className="pixel-door" />
        </div>
        <div className="pixel-flagpole">
          <span className="pixel-flag" />
        </div>
      </div>
      <div className="pixel-ground" />
      <div className="pixel-teacher" title="合約老師趕去面試">
        <span className="pixel-teacher__head" />
        <span className="pixel-teacher__body" />
        <span className="pixel-teacher__legs" />
        <span className="pixel-teacher__book" />
      </div>
      <div className="pixel-chalkboard">
        <span className="pixel-chalk pixel-chalk--1" />
        <span className="pixel-chalk pixel-chalk--2" />
        <span className="pixel-chalk pixel-chalk--3" />
      </div>
    </div>
  )
}
