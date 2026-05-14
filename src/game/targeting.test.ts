import { describe, expect, it } from 'vitest'
import { getTarget } from './targeting'
import type { ClassType, Unit } from '../types/game'

function createUnit(
  id: string,
  classType: ClassType,
  team: 'player' | 'enemy',
  position: number,
  hp = 100,
): Unit {
  return {
    id,
    name: id,
    classType,
    roleDescription: '',
    maxHp: 100,
    currentHp: hp,
    attack: 20,
    defense: 5,
    attackSpeed: 1,
    abilityCooldown: 10,
    currentCooldown: 0,
    energy: 100,
    maxEnergy: 100,
    position,
    team,
    statusEffects: [],
    shieldAmount: 0,
    isAlive: true,
    attackTimer: 0,
    ability: {
      id: 'x',
      name: 'x',
      description: '',
      actionType: 'damage',
    },
  }
}

describe('getTarget', () => {
  it('assassin prioritizes healer for damage', () => {
    const actor = createUnit('a', 'Assassin', 'player', 0)
    const healer = createUnit('healer', 'Healer', 'enemy', 0)
    const tank = createUnit('tank', 'Tank', 'enemy', 1)
    const target = getTarget(actor, [actor, tank, healer], 'damage')
    expect(target?.id).toBe('healer')
  })

  it('healer healing picks lowest HP ally first', () => {
    const actor = createUnit('healer', 'Healer', 'player', 0)
    const tank = createUnit('tank', 'Tank', 'player', 1, 30)
    const attacker = createUnit('attacker', 'Attacker', 'player', 2, 40)
    const target = getTarget(actor, [actor, tank, attacker], 'healing')
    expect(target?.id).toBe('tank')
  })

  it('taunt overrides enemy damage targeting', () => {
    const actor = createUnit('attacker', 'Attacker', 'player', 0)
    const taunter = createUnit('taunter', 'Tank', 'enemy', 1)
    taunter.statusEffects = [{ type: 'taunt', value: 1, duration: 1 }]
    const healer = createUnit('healer', 'Healer', 'enemy', 2)
    const target = getTarget(actor, [actor, taunter, healer], 'damage')
    expect(target?.id).toBe('taunter')
  })
})
