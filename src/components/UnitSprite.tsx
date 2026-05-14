import { CLASS_COLORS } from '../data/classes'
import type { Unit } from '../types/game'

interface UnitSpriteProps {
  unit: Unit
}

export function UnitSprite({ unit }: UnitSpriteProps) {
  const classColor = CLASS_COLORS[unit.classType]

  return (
    <div className={`unit-sprite ${unit.team} ${unit.isAlive ? '' : 'defeated'}`}>
      <div className="pixel" style={{ backgroundColor: classColor }}>
        <div className="pixel-eye" />
      </div>
      <strong>{unit.name}</strong>
    </div>
  )
}
