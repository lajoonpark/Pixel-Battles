import { useMemo, useState } from 'react'
import { STARTER_CHARACTER_MAP, STARTER_CHARACTERS } from '../data/characters'

const STORAGE_KEY = 'pixel-battles-team-v1'
const DEFAULT_TEAM = ['brickguard', 'pepper-shot', 'honey-saint']

export type Screen = 'menu' | 'team' | 'characters' | 'battle' | 'result'

function loadInitialTeam(): string[] {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) {
    return DEFAULT_TEAM
  }

  try {
    const parsed = JSON.parse(saved)
    if (!Array.isArray(parsed)) {
      return DEFAULT_TEAM
    }

    return parsed.filter((id) => typeof id === 'string' && STARTER_CHARACTER_MAP[id]).slice(0, 5)
  } catch {
    return DEFAULT_TEAM
  }
}

export function useGameStore() {
  const [screen, setScreen] = useState<Screen>('menu')
  const [teamIds, setTeamIds] = useState<string[]>(() => loadInitialTeam())
  const [lastWinner, setLastWinner] = useState<'player' | 'enemy' | 'draw' | null>(null)

  const teamCharacters = useMemo(
    () => teamIds.map((id) => STARTER_CHARACTER_MAP[id]).filter(Boolean),
    [teamIds],
  )

  const toggleCharacterInTeam = (id: string) => {
    setTeamIds((current) => {
      if (current.includes(id)) {
        return current.filter((value) => value !== id)
      }

      if (current.length >= 5) {
        return current
      }

      return [...current, id]
    })
  }

  const saveTeam = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(teamIds))
  }

  return {
    screen,
    setScreen,
    teamIds,
    teamCharacters,
    characters: STARTER_CHARACTERS,
    toggleCharacterInTeam,
    saveTeam,
    lastWinner,
    setLastWinner,
  }
}
