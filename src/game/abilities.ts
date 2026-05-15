import { getTarget } from './targeting'
import { addStatusEffect } from './statusEffects'
import { applyDamage, applyHeal, calculateBasicAttackDamage, sameUnit } from './combatUtils'
import {
  appendAbilityCallout,
  appendAttackOutcome,
  appendHealingOutcome,
  appendStatusEffectText,
  visualTypeForAction,
} from './effects'
import type { CombatEffectEvent, EffectVisualType, StatusEffect, Unit } from '../types/game'

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

function applyDamageWithEffects(
  units: Unit[],
  actor: Unit,
  target: Unit | null,
  rawDamage: number,
  visualType: EffectVisualType,
  events: CombatEffectEvent[],
  timestamp: number,
): Unit[] {
  if (!target) {
    return units
  }
  return units.map((unit) => {
    if (!sameUnit(unit, target)) {
      return unit
    }
    const next = applyDamage(unit, rawDamage)
    appendAttackOutcome(events, actor, unit, next, timestamp, visualType)
    return next
  })
}

function applyHealWithEffects(
  units: Unit[],
  actor: Unit,
  target: Unit | null,
  amount: number,
  events: CombatEffectEvent[],
  timestamp: number,
): Unit[] {
  if (!target) {
    return units
  }
  return units.map((unit) => {
    if (!sameUnit(unit, target)) {
      return unit
    }
    const next = applyHeal(unit, amount)
    appendHealingOutcome(events, actor, unit, next, timestamp)
    return next
  })
}

function applyStatusWithEffects(
  units: Unit[],
  actor: Unit,
  target: Unit | null,
  status: StatusEffect,
  visualType: EffectVisualType,
  events: CombatEffectEvent[],
  timestamp: number,
): Unit[] {
  if (!target) {
    return units
  }
  return units.map((unit) => {
    if (!sameUnit(unit, target)) {
      return unit
    }
    const next = addStatusEffect(unit, status)
    appendAttackOutcome(events, actor, unit, next, timestamp, visualType)
    appendStatusEffectText(events, unit, status, timestamp)
    return next
  })
}

export function executeAbility(
  actor: Unit,
  units: Unit[],
  events: CombatEffectEvent[],
  timestamp: number,
): Unit[] {
  const baseVisual = visualTypeForAction(actor.ability.actionType)
  appendAbilityCallout(events, actor, actor.ability.name, baseVisual, timestamp)

  switch (actor.ability.id) {
    case 'ground-slam': {
      const enemies = aliveTeam(units, actor.team === 'player' ? 'enemy' : 'player')
      const target = getTarget(actor, units, 'hindrance')
      const ordered = target
        ? [target, ...enemies.filter((enemy) => !sameUnit(enemy, target))]
        : enemies
      return ordered.slice(0, 2).reduce((accUnits, enemy, index) => {
        let updated = applyDamageWithEffects(
          accUnits,
          actor,
          enemy,
          calculateBasicAttackDamage(actor, enemy) + 22,
          'crowdControl',
          events,
          timestamp,
        )
        if (index === 0) {
          updated = applyStatusWithEffects(
            updated,
            actor,
            enemy,
            { type: 'stun', value: 1, duration: 1 },
            'crowdControl',
            events,
            timestamp,
          )
        }
        return updated
      }, units)
    }
    case 'fortify': {
      let updated = applyStatusWithEffects(
        units,
        actor,
        actor,
        { type: 'shield', value: 160, duration: 4 },
        'buff',
        events,
        timestamp,
      )
      updated = applyStatusWithEffects(
        updated,
        actor,
        actor,
        { type: 'taunt', value: 1, duration: 2.5 },
        'buff',
        events,
        timestamp,
      )
      return updated
    }
    case 'backline-blink': {
      const target = getTarget(actor, units, 'damage')
      return applyDamageWithEffects(
        units,
        actor,
        target,
        target ? calculateBasicAttackDamage(actor, target) + 80 : 0,
        'heavyAttack',
        events,
        timestamp,
      )
    }
    case 'weak-spot': {
      const target = findLowestHpEnemy(units, actor.team)
      return applyDamageWithEffects(
        units,
        actor,
        target,
        target ? calculateBasicAttackDamage(actor, target) + 100 : 0,
        'heavyAttack',
        events,
        timestamp,
      )
    }
    case 'sweet-heal': {
      return units.map((unit) => {
        if (unit.team !== actor.team || !unit.isAlive) {
          return unit
        }
        const next = applyHeal(unit, 90)
        appendHealingOutcome(events, actor, unit, next, timestamp)
        return next
      })
    }
    case 'emergency-patch': {
      const target = getTarget(actor, units, 'healing')
      return applyHealWithEffects(units, actor, target, 165, events, timestamp)
    }
    case 'freeze-pulse': {
      const target = getTarget(actor, units, 'hindrance')
      const enemies = aliveTeam(units, actor.team === 'player' ? 'enemy' : 'player')
      const ordered = target
        ? [target, ...enemies.filter((enemy) => !sameUnit(enemy, target))]
        : enemies
      return ordered.slice(0, 2).reduce((accUnits, enemy) => {
        let updated = applyDamageWithEffects(
          accUnits,
          actor,
          enemy,
          calculateBasicAttackDamage(actor, enemy) + 32,
          'crowdControl',
          events,
          timestamp,
        )
        updated = applyStatusWithEffects(
          updated,
          actor,
          enemy,
          { type: 'stun', value: 1, duration: 0.8 },
          'crowdControl',
          events,
          timestamp,
        )
        return updated
      }, units)
    }
    case 'bad-luck': {
      const target = getTarget(actor, units, 'debuff')
      let updated = applyStatusWithEffects(
        units,
        actor,
        target,
        { type: 'attackDown', value: 0.25, duration: 4 },
        'debuff',
        events,
        timestamp,
      )
      updated = applyStatusWithEffects(
        updated,
        actor,
        target,
        { type: 'cooldownDelay', value: 1.5, duration: 4 },
        'debuff',
        events,
        timestamp,
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
          applyDamageWithEffects(
            accUnits,
            actor,
            target,
            calculateBasicAttackDamage(actor, target) + 10,
            'basicAttack',
            events,
            timestamp,
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
      let updated = applyDamageWithEffects(
        units,
        actor,
        target,
        calculateBasicAttackDamage(actor, target) + 70,
        'heavyAttack',
        events,
        timestamp,
      )
      updated = applyDamageWithEffects(updated, actor, splash, 25, 'heavyAttack', events, timestamp)
      return updated
    }
    case 'bubble-shield': {
      return units.map((unit) => {
        if (unit.team !== actor.team || !unit.isAlive) {
          return unit
        }
        const shieldStatus: StatusEffect = {
          type: 'shield',
          value: 95,
          duration: 6,
        }
        const next = addStatusEffect(unit, shieldStatus)
        appendAttackOutcome(events, actor, unit, next, timestamp, 'buff')
        appendStatusEffectText(events, unit, shieldStatus, timestamp)
        return next
      })
    }
    case 'quick-tune': {
      const allies = aliveTeam(units, actor.team)
      const target = getTarget(actor, units, 'support') ?? allies[0]
      if (!target) {
        return units
      }
      let updated = applyStatusWithEffects(
        units,
        actor,
        target,
        { type: 'attackSpeedUp', value: 0.35, duration: 4.5 },
        'buff',
        events,
        timestamp,
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
