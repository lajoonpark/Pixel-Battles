import { getTarget } from './targeting'
import { addStatusEffect } from './statusEffects'
import { applyDamage, applyHeal, calculateBasicAttackDamage, sameUnit } from './combatUtils'
import type { Unit } from '../types/game'

function replaceUnit(units: Unit[], nextUnit: Unit): Unit[] {
  return units.map((unit) => (sameUnit(unit, nextUnit) ? nextUnit : unit))
}

function applyToTarget(units: Unit[], target: Unit | null, updater: (unit: Unit) => Unit): Unit[] {
  if (!target) {
    return units
  }
  return units.map((unit) => (sameUnit(unit, target) ? updater(unit) : unit))
}

function aliveTeam(units: Unit[], team: Unit['team']): Unit[] {
  return units.filter((unit) => unit.team === team && unit.isAlive)
}

function findLowestHpEnemy(units: Unit[], team: Unit['team']): Unit | null {
  const enemies = units.filter((unit) => unit.team !== team && unit.isAlive)
  if (enemies.length === 0) {
    return null
  }

  return [...enemies].sort((a, b) => a.currentHp / a.maxHp - b.currentHp / b.maxHp)[0]
}

export function executeAbility(actor: Unit, units: Unit[]): Unit[] {
  switch (actor.ability.id) {
    case 'ground-slam': {
      const enemies = aliveTeam(units, actor.team === 'player' ? 'enemy' : 'player')
      const target = getTarget(actor, units, 'hindrance')
      const ordered = target
        ? [target, ...enemies.filter((enemy) => !sameUnit(enemy, target))]
        : enemies
      return ordered.slice(0, 2).reduce((accUnits, enemy, index) => {
        let updated = applyToTarget(accUnits, enemy, (current) =>
          applyDamage(current, calculateBasicAttackDamage(actor, current) + 22),
        )
        if (index === 0) {
          updated = applyToTarget(updated, enemy, (current) =>
            addStatusEffect(current, { type: 'stun', value: 1, duration: 1 }),
          )
        }
        return updated
      }, units)
    }
    case 'fortify': {
      return applyToTarget(units, actor, (current) =>
        addStatusEffect(
          addStatusEffect(current, {
            type: 'shield',
            value: 160,
            duration: 4,
          }),
          {
            type: 'taunt',
            value: 1,
            duration: 2.5,
          },
        ),
      )
    }
    case 'backline-blink': {
      const target = getTarget(actor, units, 'damage')
      return applyToTarget(units, target, (current) =>
        applyDamage(current, calculateBasicAttackDamage(actor, current) + 80),
      )
    }
    case 'weak-spot': {
      const target = findLowestHpEnemy(units, actor.team)
      return applyToTarget(units, target, (current) =>
        applyDamage(current, calculateBasicAttackDamage(actor, current) + 100),
      )
    }
    case 'sweet-heal': {
      return units.map((unit) => {
        if (unit.team !== actor.team || !unit.isAlive) {
          return unit
        }
        return applyHeal(unit, 90)
      })
    }
    case 'emergency-patch': {
      const target = getTarget(actor, units, 'healing')
      return applyToTarget(units, target, (current) => applyHeal(current, 165))
    }
    case 'freeze-pulse': {
      const target = getTarget(actor, units, 'hindrance')
      const enemies = aliveTeam(units, actor.team === 'player' ? 'enemy' : 'player')
      const ordered = target
        ? [target, ...enemies.filter((enemy) => !sameUnit(enemy, target))]
        : enemies
      return ordered.slice(0, 2).reduce((accUnits, enemy) => {
        let updated = applyToTarget(accUnits, enemy, (current) =>
          applyDamage(current, calculateBasicAttackDamage(actor, current) + 32),
        )
        updated = applyToTarget(updated, enemy, (current) =>
          addStatusEffect(current, { type: 'stun', value: 1, duration: 0.8 }),
        )
        return updated
      }, units)
    }
    case 'bad-luck': {
      const target = getTarget(actor, units, 'debuff')
      let updated = applyToTarget(units, target, (current) =>
        addStatusEffect(current, { type: 'attackDown', value: 0.25, duration: 4 }),
      )
      updated = applyToTarget(updated, target, (current) =>
        addStatusEffect(current, { type: 'cooldownDelay', value: 1.5, duration: 4 }),
      )
      return updated
    }
    case 'rapid-fire': {
      const target = getTarget(actor, units, 'damage')
      if (!target) {
        return units
      }
      return [1, 2, 3].reduce(
        (accUnits) =>
          applyToTarget(accUnits, target, (current) =>
            applyDamage(current, calculateBasicAttackDamage(actor, current) + 10),
          ),
        units,
      )
    }
    case 'fireball': {
      const target = getTarget(actor, units, 'damage')
      if (!target) {
        return units
      }
      const enemies = aliveTeam(units, actor.team === 'player' ? 'enemy' : 'player')
      const splash = enemies.find((enemy) => !sameUnit(enemy, target)) ?? null
      let updated = applyToTarget(units, target, (current) =>
        applyDamage(current, calculateBasicAttackDamage(actor, current) + 70),
      )
      updated = applyToTarget(updated, splash, (current) => applyDamage(current, 25))
      return updated
    }
    case 'bubble-shield': {
      return units.map((unit) => {
        if (unit.team !== actor.team || !unit.isAlive) {
          return unit
        }
        return addStatusEffect(unit, {
          type: 'shield',
          value: 95,
          duration: 6,
        })
      })
    }
    case 'quick-tune': {
      const allies = aliveTeam(units, actor.team)
      const target = getTarget(actor, units, 'support') ?? allies[0]
      if (!target) {
        return units
      }
      let updated = applyToTarget(units, target, (current) =>
        addStatusEffect(current, { type: 'attackSpeedUp', value: 0.35, duration: 4.5 }),
      )
      updated = applyToTarget(updated, target, (current) => ({
        ...current,
        currentCooldown: Math.max(0, current.currentCooldown - 1.2),
      }))
      return updated
    }
    default:
      return replaceUnit(units, actor)
  }
}
