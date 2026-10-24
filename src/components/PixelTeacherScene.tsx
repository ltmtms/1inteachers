import { useEffect, useMemo, useState } from 'react'
import type { GameState } from '../game/types'
import { PixelClassroomScene } from './pixel/PixelClassroomScene'
import {
  PixelFamilyScene,
  PixelFunctionalScene,
  PixelGraduationScene,
  PixelJumpNetScene,
  PixelPromotionScene,
  PixelRetirementScene,
  PixelStaffRoomScene,
  PixelTAScene,
} from './pixel/PixelExtendedScenes'
import { PixelSportsDayScene } from './pixel/PixelSportsDayScene'
import { PixelSwimmingGalaScene } from './pixel/PixelSwimmingGalaScene'
import {
  parsePixelSceneOverride,
  resolvePixelScene,
  type PixelSceneVariant,
  type ResolvedPixelScene,
} from './pixel/resolvePixelSceneVariant'
import './pixel/pixel-extended.css'
import { PixelSchoolScene } from './PixelSchoolScene'

const MENU_CYCLE: PixelSceneVariant[] = [
  'graduation',
  'jump-net',
  'classroom',
  'ta-desk',
  'staff-room',
  'sports-day',
  'promotion',
  'retirement',
]

type Props = {
  compact?: boolean
  /** When set, scene follows game context; when null, menu title-screen behaviour applies. */
  state?: GameState | null
}

function renderScene(resolved: ResolvedPixelScene, compact: boolean) {
  const { variant, subject } = resolved
  switch (variant) {
    case 'classroom':
      return <PixelClassroomScene compact={compact} subject={subject} />
    case 'sports-day':
      return <PixelSportsDayScene compact={compact} />
    case 'swimming-gala':
      return <PixelSwimmingGalaScene compact={compact} />
    case 'graduation':
      return <PixelGraduationScene compact={compact} />
    case 'jump-net':
      return <PixelJumpNetScene compact={compact} />
    case 'ta-desk':
      return <PixelTAScene compact={compact} />
    case 'staff-room':
      return <PixelStaffRoomScene compact={compact} />
    case 'func-discipline':
      return <PixelFunctionalScene compact={compact} kind="discipline" />
    case 'func-eca':
      return <PixelFunctionalScene compact={compact} kind="eca" />
    case 'func-counselling':
      return <PixelFunctionalScene compact={compact} kind="counselling" />
    case 'func-it':
      return <PixelFunctionalScene compact={compact} kind="it" />
    case 'func-admin':
      return <PixelFunctionalScene compact={compact} kind="admin" />
    case 'family-dating':
      return <PixelFamilyScene compact={compact} kind="dating" />
    case 'family-wedding':
      return <PixelFamilyScene compact={compact} kind="wedding" />
    case 'family-child':
      return <PixelFamilyScene compact={compact} kind="child" />
    case 'family-bereavement':
      return <PixelFamilyScene compact={compact} kind="bereavement" />
    case 'promotion':
      return <PixelPromotionScene compact={compact} />
    case 'retirement':
      return <PixelRetirementScene compact={compact} />
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

  const resolved: ResolvedPixelScene = urlOverride
    ? { variant: urlOverride }
    : state
      ? resolvePixelScene(state)
      : { variant: MENU_CYCLE[menuIndex] }

  return renderScene(resolved, compact)
}
