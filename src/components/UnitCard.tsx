import { CLASS_COLORS } from '../data/classes'
import type { CharacterDefinition } from '../types/game'

interface UnitCardProps {
  character: CharacterDefinition
  selected?: boolean
  onClick?: () => void
}

export function UnitCard({ character, selected = false, onClick }: UnitCardProps) {
  return (
    <button
      type="button"
      className={`unit-card ${selected ? 'selected' : ''}`}
      onClick={onClick}
      style={{ borderColor: CLASS_COLORS[character.classType] }}
    >
      <h3>{character.name}</h3>
      <p className="class-pill" style={{ backgroundColor: CLASS_COLORS[character.classType] }}>
        {character.classType}
      </p>
      <p>HP: {character.maxHp}</p>
      <p>ATK: {character.attack}</p>
      <p>Cooldown: {character.abilityCooldown}s</p>
      <p className="ability-name">{character.ability.name}</p>
      <p>{character.ability.description}</p>
      <small>{character.roleDescription}</small>
    </button>
  )
}
