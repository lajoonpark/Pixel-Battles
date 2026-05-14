import type { ActionType, ClassType } from '../types/game'

export const CLASS_COLORS: Record<ClassType, string> = {
  Tank: '#7d8797',
  Assassin: '#7a48c6',
  Healer: '#3ea85f',
  Hinderer: '#3279d8',
  Attacker: '#dc5d2f',
  Supporter: '#d8b43a',
}

const TANK_DAMAGE_PRIORITY: ClassType[] = [
  'Tank',
  'Hinderer',
  'Attacker',
  'Assassin',
  'Supporter',
  'Healer',
]

const TANK_SUPPORT_PRIORITY: ClassType[] = [
  'Attacker',
  'Hinderer',
  'Healer',
  'Assassin',
  'Tank',
  'Supporter',
]

const ASSASSIN_DAMAGE_PRIORITY: ClassType[] = [
  'Healer',
  'Supporter',
  'Attacker',
  'Hinderer',
  'Tank',
  'Assassin',
]

const HEALER_DAMAGE_PRIORITY: ClassType[] = [
  'Attacker',
  'Assassin',
  'Hinderer',
  'Tank',
  'Supporter',
  'Healer',
]

const HINDERER_DAMAGE_PRIORITY: ClassType[] = [
  'Tank',
  'Hinderer',
  'Attacker',
  'Assassin',
  'Supporter',
  'Healer',
]

const HINDERER_HINDRANCE_PRIORITY: ClassType[] = [
  'Healer',
  'Supporter',
  'Assassin',
  'Attacker',
  'Hinderer',
  'Tank',
]

const HINDERER_DEBUFF_PRIORITY: ClassType[] = [
  'Tank',
  'Attacker',
  'Assassin',
  'Hinderer',
  'Supporter',
  'Healer',
]

const ATTACKER_DAMAGE_PRIORITY = TANK_DAMAGE_PRIORITY
const SUPPORTER_DAMAGE_PRIORITY = TANK_DAMAGE_PRIORITY

const SUPPORTER_SUPPORT_PRIORITY: ClassType[] = [
  'Attacker',
  'Tank',
  'Hinderer',
  'Assassin',
  'Healer',
  'Supporter',
]

export const HEALER_HEAL_TIE_BREAKER: ClassType[] = [
  'Tank',
  'Hinderer',
  'Attacker',
  'Assassin',
  'Supporter',
  'Healer',
]

export const TARGETING_PRIORITIES: Record<ClassType, Partial<Record<ActionType, ClassType[]>>> = {
  Tank: {
    damage: TANK_DAMAGE_PRIORITY,
    hindrance: TANK_DAMAGE_PRIORITY,
    support: TANK_SUPPORT_PRIORITY,
  },
  Assassin: {
    damage: ASSASSIN_DAMAGE_PRIORITY,
    hindrance: ASSASSIN_DAMAGE_PRIORITY,
  },
  Healer: {
    damage: HEALER_DAMAGE_PRIORITY,
    healing: HEALER_HEAL_TIE_BREAKER,
  },
  Hinderer: {
    damage: HINDERER_DAMAGE_PRIORITY,
    hindrance: HINDERER_HINDRANCE_PRIORITY,
    debuff: HINDERER_DEBUFF_PRIORITY,
  },
  Attacker: {
    damage: ATTACKER_DAMAGE_PRIORITY,
  },
  Supporter: {
    damage: SUPPORTER_DAMAGE_PRIORITY,
    support: SUPPORTER_SUPPORT_PRIORITY,
  },
}
