import type { CharacterDefinition } from '../types/game'
import { UnitCard } from './UnitCard'

interface TeamScreenProps {
  characters: CharacterDefinition[]
  teamIds: string[]
  onToggle: (id: string) => void
  onSave: () => void
  onBack: () => void
}

export function TeamScreen({ characters, teamIds, onToggle, onSave, onBack }: TeamScreenProps) {
  return (
    <section className="screen">
      <h2>Team Builder</h2>
      <p>Select up to 5 units.</p>
      <div className="team-slots">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="slot">
            {teamIds[index] ?? 'Empty'}
          </div>
        ))}
      </div>
      <div className="cards-grid">
        {characters.map((character) => (
          <UnitCard
            key={character.id}
            character={character}
            selected={teamIds.includes(character.id)}
            onClick={() => onToggle(character.id)}
          />
        ))}
      </div>
      <div className="screen-actions">
        <button type="button" onClick={onSave}>
          Save Team
        </button>
        <button type="button" onClick={onBack}>
          Back
        </button>
      </div>
    </section>
  )
}
