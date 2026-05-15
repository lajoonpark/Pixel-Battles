import type { ActionType, CombatEffectEvent, EffectVisualType, StatusEffect, Unit } from '../types/game'

let effectId = 0

function nextEffectId(prefix: string): string {
  effectId += 1
  return `${prefix}-${effectId}`
}

export function unitKey(unit: Unit): string {
  return `${unit.team}-${unit.position}`
}

export function visualTypeForAction(actionType: ActionType): EffectVisualType {
  if (actionType === 'healing') {
    return 'healing'
  }
  if (actionType === 'support') {
    return 'buff'
  }
  if (actionType === 'debuff') {
    return 'debuff'
  }
  if (actionType === 'hindrance') {
    return 'crowdControl'
  }
  return 'basicAttack'
}

export function appendAbilityCallout(
  events: CombatEffectEvent[],
  actor: Unit,
  abilityName: string,
  visualType: EffectVisualType,
  timestamp: number,
): void {
  events.push({
    id: nextEffectId('ability'),
    timestamp,
    type: 'abilityCallout',
    unitKey: unitKey(actor),
    visualType,
    text: abilityName,
    durationMs: 850,
  })
}

export function appendStatusEffectText(
  events: CombatEffectEvent[],
  target: Unit,
  status: StatusEffect,
  timestamp: number,
): void {
  const text = getStatusText(status)
  const visualType = getStatusVisualType(status.type)
  events.push({
    id: nextEffectId('status'),
    timestamp,
    type: 'floatingText',
    targetKey: unitKey(target),
    visualType,
    text,
    durationMs: 900,
  })
}

export function appendAttackOutcome(
  events: CombatEffectEvent[],
  source: Unit,
  targetBefore: Unit,
  targetAfter: Unit,
  timestamp: number,
  visualType: EffectVisualType,
): void {
  events.push({
    id: nextEffectId('projectile'),
    timestamp,
    type: 'projectile',
    sourceKey: unitKey(source),
    targetKey: unitKey(targetBefore),
    visualType,
  })
  events.push({
    id: nextEffectId('highlight'),
    timestamp,
    type: 'highlight',
    unitKey: unitKey(source),
    highlightRole: 'attacker',
    visualType,
    durationMs: 280,
  })
  events.push({
    id: nextEffectId('highlight'),
    timestamp,
    type: 'highlight',
    unitKey: unitKey(targetBefore),
    highlightRole: 'target',
    visualType,
    durationMs: 320,
  })

  const hpLost = Math.max(0, targetBefore.currentHp - targetAfter.currentHp)
  const shieldLost = Math.max(0, targetBefore.shieldAmount - targetAfter.shieldAmount)

  if (shieldLost > 0) {
    events.push({
      id: nextEffectId('shield-break'),
      timestamp,
      type: 'floatingText',
      targetKey: unitKey(targetBefore),
      visualType: 'buff',
      text: `SHIELD -${shieldLost}`,
      durationMs: 900,
    })
  }

  if (hpLost > 0) {
    events.push({
      id: nextEffectId('damage'),
      timestamp,
      type: 'floatingText',
      targetKey: unitKey(targetBefore),
      visualType,
      text: `${hpLost}`,
      durationMs: 900,
    })
  }
}

export function appendHealingOutcome(
  events: CombatEffectEvent[],
  source: Unit,
  targetBefore: Unit,
  targetAfter: Unit,
  timestamp: number,
): void {
  events.push({
    id: nextEffectId('projectile'),
    timestamp,
    type: 'projectile',
    sourceKey: unitKey(source),
    targetKey: unitKey(targetBefore),
    visualType: 'healing',
  })
  events.push({
    id: nextEffectId('highlight'),
    timestamp,
    type: 'highlight',
    unitKey: unitKey(source),
    highlightRole: 'attacker',
    visualType: 'healing',
    durationMs: 280,
  })
  events.push({
    id: nextEffectId('highlight'),
    timestamp,
    type: 'highlight',
    unitKey: unitKey(targetBefore),
    highlightRole: 'target',
    visualType: 'healing',
    durationMs: 320,
  })

  const healed = Math.max(0, targetAfter.currentHp - targetBefore.currentHp)
  if (healed <= 0) {
    return
  }

  events.push({
    id: nextEffectId('healing'),
    timestamp,
    type: 'floatingText',
    targetKey: unitKey(targetBefore),
    visualType: 'healing',
    text: `+${healed}`,
    durationMs: 900,
  })
}

function getStatusVisualType(type: StatusEffect['type']): EffectVisualType {
  if (type === 'stun' || type === 'slow') {
    return 'crowdControl'
  }
  if (type === 'attackDown' || type === 'defenseDown' || type === 'cooldownDelay' || type === 'antiHeal') {
    return 'debuff'
  }
  return 'buff'
}

function getStatusText(effect: StatusEffect): string {
  if (effect.type === 'stun') {
    return 'STUN'
  }
  if (effect.type === 'slow') {
    return 'SLOWED'
  }
  if (effect.type === 'attackDown') {
    return `-${Math.round(effect.value * 100)}% ATK`
  }
  if (effect.type === 'defenseDown') {
    return `-${Math.round(effect.value * 100)}% DEF`
  }
  if (effect.type === 'shield') {
    return `SHIELD +${Math.round(effect.value)}`
  }
  if (effect.type === 'cooldownDelay') {
    return 'CD DELAY'
  }
  if (effect.type === 'antiHeal') {
    return 'ANTI-HEAL'
  }
  if (effect.type === 'taunt') {
    return 'TAUNT'
  }
  return 'HASTE'
}
