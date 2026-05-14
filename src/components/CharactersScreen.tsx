import type { CharacterDefinition } from '../types/game'
import { UnitCard } from './UnitCard'

interface CharactersScreenProps {
  characters: CharacterDefinition[]
  onBack: () => void
}

export function CharactersScreen({ characters, onBack }: CharactersScreenProps) {
  return (
    <section className="screen">
      <h2>Characters</h2>
      <p>Starter roster and class roles.</p>
      <div className="cards-grid">
        {characters.map((character) => (
          <UnitCard key={character.id} character={character} />
        ))}
      </div>
      <div className="screen-actions">
        <button type="button" onClick={onBack}>
          Back
        </button>
      </div>
    </section>
  )
}
