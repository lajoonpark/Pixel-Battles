import { getEffectiveAttack, getEffectiveDefense, getHealingMultiplier } from './statusEffects'
import type { Unit } from '../types/game'

export function sameUnit(a: Unit, b: Unit): boolean {
  return a.team === b.team && a.position === b.position
}

export function gainEnergy(unit: Unit, amount: number): Unit {
  return {
    ...unit,
    energy: Math.min(unit.maxEnergy, unit.energy + amount),
  }
}

export function applyDamage(target: Unit, amount: number): Unit {
  if (!target.isAlive) {
    return target
  }

  let pendingDamage = Math.max(1, Math.round(amount))
  let shieldAmount = target.shieldAmount

  if (shieldAmount > 0) {
    const shieldAbsorb = Math.min(shieldAmount, pendingDamage)
    shieldAmount -= shieldAbsorb
    pendingDamage -= shieldAbsorb
  }

  const nextHp = Math.max(0, target.currentHp - pendingDamage)

  return {
    ...target,
    shieldAmount,
    currentHp: nextHp,
    isAlive: nextHp > 0,
    energy: Math.min(target.maxEnergy, target.energy + 6),
  }
}

export function applyHeal(target: Unit, rawHealing: number): Unit {
  if (!target.isAlive) {
    return target
  }

  const healing = Math.round(rawHealing * getHealingMultiplier(target))
  return {
    ...target,
    currentHp: Math.min(target.maxHp, target.currentHp + Math.max(0, healing)),
  }
}

export function calculateBasicAttackDamage(attacker: Unit, target: Unit): number {
  const attack = getEffectiveAttack(attacker)
  const defense = getEffectiveDefense(target)
  return Math.max(1, attack - defense)
}
