import { describe, expect, it } from 'vitest'
import { applyDamage, calculateBasicAttackDamage } from './combatUtils'
import type { Unit } from '../types/game'

const actor: Unit = {
  id: 'actor',
  name: 'actor',
  classType: 'Attacker',
  roleDescription: '',
  maxHp: 100,
  currentHp: 100,
  attack: 30,
  defense: 5,
  attackSpeed: 1,
  abilityCooldown: 10,
  currentCooldown: 0,
  energy: 0,
  maxEnergy: 100,
  position: 0,
  team: 'player',
  statusEffects: [],
  shieldAmount: 0,
  isAlive: true,
  attackTimer: 0,
  ability: { id: 'x', name: 'x', description: '', actionType: 'damage' },
}

describe('combat helpers', () => {
  it('uses max(1, attack - defense) damage formula', () => {
    const target: Unit = { ...actor, id: 'target', team: 'enemy', defense: 50 }
    expect(calculateBasicAttackDamage(actor, target)).toBe(1)
  })

  it('applies shield before hp', () => {
    const target: Unit = { ...actor, id: 'target', team: 'enemy', shieldAmount: 12, currentHp: 100 }
    const result = applyDamage(target, 20)
    expect(result.shieldAmount).toBe(0)
    expect(result.currentHp).toBe(92)
  })
})
