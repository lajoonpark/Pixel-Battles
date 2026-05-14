export type ClassType =
  | 'Tank'
  | 'Assassin'
  | 'Healer'
  | 'Hinderer'
  | 'Attacker'
  | 'Supporter'

export type TeamType = 'player' | 'enemy'

export type ActionType = 'damage' | 'healing' | 'hindrance' | 'support' | 'debuff'

export type StatusEffectType =
  | 'stun'
  | 'slow'
  | 'attackDown'
  | 'defenseDown'
  | 'shield'
  | 'cooldownDelay'
  | 'antiHeal'
  | 'taunt'
  | 'attackSpeedUp'

export interface StatusEffect {
  type: StatusEffectType
  value: number
  duration: number
}

export interface AbilityDefinition {
  id: string
  name: string
  description: string
  actionType: ActionType
}

export interface CharacterDefinition {
  id: string
  name: string
  classType: ClassType
  roleDescription: string
  maxHp: number
  attack: number
  defense: number
  attackSpeed: number
  abilityCooldown: number
  maxEnergy: number
  ability: AbilityDefinition
}

export interface Unit extends CharacterDefinition {
  currentHp: number
  currentCooldown: number
  energy: number
  position: number
  team: TeamType
  statusEffects: StatusEffect[]
  shieldAmount: number
  isAlive: boolean
  attackTimer: number
}

export interface BattleResult {
  winner: TeamType | 'draw'
}

export interface BattleState {
  units: Unit[]
  elapsed: number
  countdown: number
  started: boolean
  result: BattleResult | null
}
