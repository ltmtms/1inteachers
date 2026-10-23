import './pixel-classroom.css'
import './pixel-shared.css'

/** Indoor classroom — teacher at board, desks, chalk motion. */
export function PixelClassroomScene({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`pixel-scene pixel-classroom ${compact ? 'pixel-scene--compact' : ''}`}
      role="img"
      aria-label="像素風格課室：老師黑板前授課"
    >
      <div className="pixel-classroom__wall" />
      <div className="pixel-classroom__floor" />
      <div className="pixel-classroom__board">
        <span className="pixel-classroom__chalk pixel-classroom__chalk--1" />
        <span className="pixel-classroom__chalk pixel-classroom__chalk--2" />
        <span className="pixel-classroom__chalk pixel-classroom__chalk--3" />
      </div>
      <div className="pixel-classroom__desk pixel-classroom__desk--1">
        <span className="pixel-classroom__student" />
      </div>
      <div className="pixel-classroom__desk pixel-classroom__desk--2">
        <span className="pixel-classroom__student pixel-classroom__student--b" />
      </div>
      <div className="pixel-classroom__desk pixel-classroom__desk--3">
        <span className="pixel-classroom__student" />
      </div>
      <div className="pixel-classroom__teacher">
        <span className="pixel-classroom__teacher-head" />
        <span className="pixel-classroom__teacher-body" />
        <span className="pixel-classroom__teacher-arm" />
        <span className="pixel-classroom__pointer" />
      </div>
      <span className="pixel-scene__caption">課室</span>
    </div>
  )
}
