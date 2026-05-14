import { HEALER_HEAL_TIE_BREAKER, TARGETING_PRIORITIES } from '../data/classes'
import type { ActionType, ClassType, TeamType, Unit } from '../types/game'

function getPriorityIndex(priority: ClassType[], classType: ClassType): number {
  const index = priority.indexOf(classType)
  return index === -1 ? Number.MAX_SAFE_INTEGER : index
}

function getCandidates(units: Unit[], team: TeamType): Unit[] {
  return units.filter((unit) => unit.team === team && unit.isAlive)
}

export function getTarget(actor: Unit, allUnits: Unit[], actionType: ActionType): Unit | null {
  const isFriendlyAction = actionType === 'healing' || actionType === 'support'
  const candidateTeam: TeamType = isFriendlyAction
    ? actor.team
    : actor.team === 'player'
      ? 'enemy'
      : 'player'

  let candidates = getCandidates(allUnits, candidateTeam).filter((unit) => unit.id !== actor.id || unit.position !== actor.position)

  if (!isFriendlyAction) {
    const tauntUnits = candidates.filter((unit) =>
      unit.statusEffects.some((effect) => effect.type === 'taunt'),
    )
    if (tauntUnits.length > 0) {
      candidates = tauntUnits
    }
  }

  if (candidates.length === 0) {
    return null
  }

  if (actionType === 'healing') {
    return [...candidates].sort((a, b) => {
      const hpDiff = a.currentHp / a.maxHp - b.currentHp / b.maxHp
      if (Math.abs(hpDiff) > 0.001) {
        return hpDiff
      }

      return (
        getPriorityIndex(HEALER_HEAL_TIE_BREAKER, a.classType) -
        getPriorityIndex(HEALER_HEAL_TIE_BREAKER, b.classType)
      )
    })[0]
  }

  const classPriority =
    TARGETING_PRIORITIES[actor.classType][actionType] ??
    TARGETING_PRIORITIES[actor.classType].damage ??
    HEALER_HEAL_TIE_BREAKER

  return [...candidates].sort((a, b) => {
    const p = getPriorityIndex(classPriority, a.classType) - getPriorityIndex(classPriority, b.classType)
    if (p !== 0) {
      return p
    }

    return a.position - b.position
  })[0]
}
