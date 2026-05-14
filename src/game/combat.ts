import { executeAbility } from './abilities'
import { gainEnergy, applyDamage, calculateBasicAttackDamage, sameUnit } from './combatUtils'
import { getTarget } from './targeting'
import { getEffectiveAttackSpeed, isStunned, reduceStatusDurations } from './statusEffects'
import type { BattleState, CharacterDefinition, TeamType, Unit } from '../types/game'

function toUnit(character: CharacterDefinition, team: TeamType, position: number): Unit {
  return {
    ...character,
    currentHp: character.maxHp,
    currentCooldown: character.abilityCooldown,
    energy: 0,
    position,
    team,
    statusEffects: [],
    shieldAmount: 0,
    isAlive: true,
    attackTimer: 0,
  }
}

export function createBattleState(
  playerCharacters: CharacterDefinition[],
  enemyCharacters: CharacterDefinition[],
): BattleState {
  return {
    units: [
      ...playerCharacters.map((character, index) => toUnit(character, 'player', index)),
      ...enemyCharacters.map((character, index) => toUnit(character, 'enemy', index)),
    ],
    elapsed: 0,
    countdown: 2,
    started: false,
    result: null,
  }
}

function updateUnit(units: Unit[], updatedUnit: Unit): Unit[] {
  return units.map((unit) => (sameUnit(unit, updatedUnit) ? updatedUnit : unit))
}

function checkBattleResult(units: Unit[]): BattleState['result'] {
  const playerAlive = units.some((unit) => unit.team === 'player' && unit.isAlive)
  const enemyAlive = units.some((unit) => unit.team === 'enemy' && unit.isAlive)

  if (playerAlive && enemyAlive) {
    return null
  }

  if (playerAlive && !enemyAlive) {
    return { winner: 'player' }
  }

  if (!playerAlive && enemyAlive) {
    return { winner: 'enemy' }
  }

  return { winner: 'draw' }
}

export function stepCombat(state: BattleState, delta: number): BattleState {
  if (state.result) {
    return state
  }

  if (!state.started) {
    const nextCountdown = Math.max(0, state.countdown - delta)
    return {
      ...state,
      elapsed: state.elapsed + delta,
      countdown: nextCountdown,
      started: nextCountdown === 0,
    }
  }

  let units = state.units.map((unit) => {
    if (!unit.isAlive) {
      return unit
    }

    const withStatus = reduceStatusDurations(unit, delta)
    return {
      ...withStatus,
      currentCooldown: Math.max(0, withStatus.currentCooldown - delta),
      attackTimer: withStatus.attackTimer + delta,
    }
  })

  const actingOrder = units
    .filter((unit) => unit.isAlive)
    .sort((a, b) => b.attackSpeed - a.attackSpeed)

  for (const originalActor of actingOrder) {
    const actor = units.find((unit) => sameUnit(unit, originalActor))
    if (!actor || !actor.isAlive) {
      continue
    }

    if (isStunned(actor)) {
      continue
    }

    if (actor.currentCooldown <= 0 && actor.energy >= actor.maxEnergy) {
      units = executeAbility(actor, units)
      const refreshedActor = units.find((unit) => sameUnit(unit, actor))
      if (refreshedActor) {
        units = updateUnit(units, {
          ...refreshedActor,
          currentCooldown: refreshedActor.abilityCooldown,
          energy: 0,
        })
      }
      continue
    }

    const attackInterval = 1 / getEffectiveAttackSpeed(actor)
    if (actor.attackTimer < attackInterval) {
      continue
    }

    const target = getTarget(actor, units, 'damage')
    if (!target) {
      continue
    }

    const damage = calculateBasicAttackDamage(actor, target)

    units = updateUnit(
      units,
      gainEnergy(
        {
          ...actor,
          attackTimer: 0,
        },
        22,
      ),
    )

    units = units.map((unit) => {
      if (sameUnit(unit, target)) {
        return applyDamage(unit, damage)
      }
      return unit
    })
  }

  const result = checkBattleResult(units)

  return {
    ...state,
    units,
    elapsed: state.elapsed + delta,
    result,
  }
}
