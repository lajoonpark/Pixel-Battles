import type { StatusEffect, StatusEffectType, Unit } from '../types/game'

export function addStatusEffect(unit: Unit, effect: StatusEffect): Unit {
  if (effect.type === 'shield') {
    return {
      ...unit,
      shieldAmount: unit.shieldAmount + effect.value,
      statusEffects: [...unit.statusEffects, effect],
    }
  }

  if (effect.type === 'cooldownDelay') {
    return {
      ...unit,
      currentCooldown: unit.currentCooldown + effect.value,
      statusEffects: [...unit.statusEffects, effect],
    }
  }

  return {
    ...unit,
    statusEffects: [...unit.statusEffects, effect],
  }
}

function sumEffect(unit: Unit, type: StatusEffectType): number {
  return unit.statusEffects
    .filter((effect) => effect.type === type)
    .reduce((sum, effect) => sum + effect.value, 0)
}

export function hasStatus(unit: Unit, type: StatusEffectType): boolean {
  return unit.statusEffects.some((effect) => effect.type === type)
}

export function getEffectiveAttack(unit: Unit): number {
  const reduction = sumEffect(unit, 'attackDown')
  return Math.max(1, Math.round(unit.attack * (1 - reduction)))
}

export function getEffectiveDefense(unit: Unit): number {
  const reduction = sumEffect(unit, 'defenseDown')
  return Math.max(0, Math.round(unit.defense * (1 - reduction)))
}

export function getEffectiveAttackSpeed(unit: Unit): number {
  const slow = sumEffect(unit, 'slow')
  const haste = sumEffect(unit, 'attackSpeedUp')
  return Math.max(0.25, unit.attackSpeed * (1 - slow + haste))
}

export function getHealingMultiplier(unit: Unit): number {
  const antiHeal = sumEffect(unit, 'antiHeal')
  return Math.max(0, 1 - antiHeal)
}

export function reduceStatusDurations(unit: Unit, delta: number): Unit {
  const nextEffects = unit.statusEffects
    .map((effect) => ({ ...effect, duration: effect.duration - delta }))
    .filter((effect) => effect.duration > 0)

  return {
    ...unit,
    statusEffects: nextEffects,
  }
}

export function isStunned(unit: Unit): boolean {
  return hasStatus(unit, 'stun')
}
