import { useEffect, useMemo, useState } from 'react'
import type { GameState } from '../game/types'
import { PixelClassroomScene } from './pixel/PixelClassroomScene'
import { PixelSportsDayScene } from './pixel/PixelSportsDayScene'
import { PixelSwimmingGalaScene } from './pixel/PixelSwimmingGalaScene'
import {
  parsePixelSceneOverride,
  resolvePixelSceneVariant,
  type PixelSceneVariant,
} from './pixel/resolvePixelSceneVariant'
import { PixelSchoolScene } from './PixelSchoolScene'

const MENU_CYCLE: PixelSceneVariant[] = [
  'school-yard',
  'classroom',
  'sports-day',
  'swimming-gala',
]

type Props = {
  compact?: boolean
  /** When set, scene follows game context; when null, menu title-screen behaviour applies. */
  state?: GameState | null
}

function renderScene(variant: PixelSceneVariant, compact: boolean) {
  switch (variant) {
    case 'classroom':
      return <PixelClassroomScene compact={compact} />
    case 'sports-day':
      return <PixelSportsDayScene compact={compact} />
    case 'swimming-gala':
      return <PixelSwimmingGalaScene compact={compact} />
    default:
      return <PixelSchoolScene compact={compact} />
  }
}

export function PixelTeacherScene({ compact = false, state = null }: Props) {
  const urlOverride = useMemo(
    () => parsePixelSceneOverride(window.location.search),
    [],
  )

  const [menuIndex, setMenuIndex] = useState(0)

  useEffect(() => {
    if (state || urlOverride) return
    const id = window.setInterval(() => {
      setMenuIndex((i) => (i + 1) % MENU_CYCLE.length)
    }, 4000)
    return () => window.clearInterval(id)
  }, [state, urlOverride])

  const variant: PixelSceneVariant = urlOverride
    ?? (state ? resolvePixelSceneVariant(state) : MENU_CYCLE[menuIndex])

  return renderScene(variant, compact)
}
