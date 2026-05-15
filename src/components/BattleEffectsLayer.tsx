import { useEffect, useMemo, useState } from 'react'
import type { RefObject } from 'react'
import { FloatingText } from './FloatingText'
import { Projectile } from './Projectile'
import type { CombatEffectEvent } from '../types/game'

interface BattleEffectsLayerProps {
  battlefieldRef: RefObject<HTMLDivElement | null>
  events: CombatEffectEvent[]
}

interface UnitAnchor {
  x: number
  y: number
  top: number
  left: number
  width: number
  height: number
}

function getDurationMs(event: CombatEffectEvent): number {
  if (event.durationMs) {
    return event.durationMs
  }
  if (event.type === 'projectile') {
    if (event.visualType === 'heavyAttack') {
      return 560
    }
    if (event.visualType === 'crowdControl') {
      return 460
    }
    return 320
  }
  if (event.type === 'abilityCallout') {
    return 850
  }
  return 900
}

function readAnchors(container: HTMLDivElement | null): Record<string, UnitAnchor> {
  if (!container) {
    return {}
  }

  const next: Record<string, UnitAnchor> = {}
  const containerRect = container.getBoundingClientRect()

  container.querySelectorAll<HTMLElement>('[data-unit-key]').forEach((element) => {
    const key = element.dataset.unitKey
    if (!key) {
      return
    }

    const rect = element.getBoundingClientRect()
    next[key] = {
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2,
      top: rect.top - containerRect.top,
      left: rect.left - containerRect.left,
      width: rect.width,
      height: rect.height,
    }
  })

  return next
}

export function BattleEffectsLayer({ battlefieldRef, events }: BattleEffectsLayerProps) {
  const [anchors, setAnchors] = useState<Record<string, UnitAnchor>>({})

  useEffect(() => {
    const refresh = () => {
      setAnchors(readAnchors(battlefieldRef.current))
    }

    const kickoff = window.setTimeout(refresh, 0)
    const interval = window.setInterval(refresh, 120)
    window.addEventListener('resize', refresh)

    return () => {
      window.clearTimeout(kickoff)
      window.clearInterval(interval)
      window.removeEventListener('resize', refresh)
    }
  }, [battlefieldRef, events.length])

  const rendered = useMemo(() => {
    const projectiles = events.filter((effect) => effect.type === 'projectile')
    const floatingTexts = events.filter((effect) => effect.type === 'floatingText')
    const highlights = events.filter((effect) => effect.type === 'highlight')
    const abilityCallouts = events.filter((effect) => effect.type === 'abilityCallout')
    const textStackCount = new Map<string, number>()

    return {
      projectiles,
      floatingTexts,
      highlights,
      abilityCallouts,
      textStackCount,
    }
  }, [events])

  return (
    <div className="battle-effects-layer" aria-hidden="true">
      {rendered.projectiles.map((projectile) => {
        if (!projectile.sourceKey || !projectile.targetKey) {
          return null
        }
        const start = anchors[projectile.sourceKey]
        const end = anchors[projectile.targetKey]
        if (!start || !end) {
          return null
        }

        return (
          <Projectile
            key={projectile.id}
            start={{ x: start.x, y: start.y }}
            end={{ x: end.x, y: end.y }}
            visualType={projectile.visualType}
            durationMs={getDurationMs(projectile)}
          />
        )
      })}

      {rendered.highlights.map((highlight) => {
        if (!highlight.unitKey) {
          return null
        }
        const anchor = anchors[highlight.unitKey]
        if (!anchor) {
          return null
        }
        return (
          <div
            key={highlight.id}
            className={`unit-highlight ${highlight.highlightRole ?? 'target'} ${highlight.visualType}`}
            style={{
              left: `${anchor.left - 4}px`,
              top: `${anchor.top - 4}px`,
              width: `${anchor.width + 8}px`,
              height: `${anchor.height + 8}px`,
              animationDuration: `${getDurationMs(highlight)}ms`,
            }}
          />
        )
      })}

      {rendered.abilityCallouts.map((callout) => {
        if (!callout.unitKey || !callout.text) {
          return null
        }
        const anchor = anchors[callout.unitKey]
        if (!anchor) {
          return null
        }
        return (
          <div
            key={callout.id}
            className={`ability-callout ${callout.visualType}`}
            style={{ left: `${anchor.x}px`, top: `${anchor.top - 8}px` }}
          >
            {callout.text}
          </div>
        )
      })}

      {rendered.floatingTexts.map((effect) => {
        if (!effect.targetKey || !effect.text) {
          return null
        }
        const anchor = anchors[effect.targetKey]
        if (!anchor) {
          return null
        }

        const stackKey = `${effect.targetKey}-${Math.round((effect.timestamp * 1000) / 260)}`
        const stackIndex = rendered.textStackCount.get(stackKey) ?? 0
        rendered.textStackCount.set(stackKey, stackIndex + 1)

        return (
          <FloatingText
            key={effect.id}
            x={anchor.x}
            y={anchor.top}
            text={effect.text}
            visualType={effect.visualType}
            stackIndex={stackIndex}
          />
        )
      })}
    </div>
  )
}
