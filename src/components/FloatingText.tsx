import type { EffectVisualType } from '../types/game'

interface FloatingTextProps {
  x: number
  y: number
  text: string
  visualType: EffectVisualType
  stackIndex: number
}

export function FloatingText({ x, y, text, visualType, stackIndex }: FloatingTextProps) {
  return (
    <div
      className={`floating-text ${visualType}`}
      style={{
        left: `${x}px`,
        top: `${y - 20 - stackIndex * 16}px`,
        animationDelay: `${Math.min(stackIndex * 40, 160)}ms`,
      }}
    >
      {text}
    </div>
  )
}
