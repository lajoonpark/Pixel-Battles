import type { EffectVisualType } from '../types/game'

interface Point {
  x: number
  y: number
}

interface ProjectileProps {
  start: Point
  end: Point
  visualType: EffectVisualType
  durationMs: number
}

export function Projectile({ start, end, visualType, durationMs }: ProjectileProps) {
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx)

  return (
    <div
      className={`projectile ${visualType}`}
      style={{
        left: `${start.x}px`,
        top: `${start.y}px`,
        width: `${length}px`,
        transform: `rotate(${angle}rad)`,
        animationDuration: `${durationMs}ms`,
      }}
    >
      <span className="projectile-trail" />
      <span className="projectile-head" />
    </div>
  )
}
