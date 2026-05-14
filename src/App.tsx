import { CharactersScreen } from './components/CharactersScreen'
import { MainMenu } from './components/MainMenu'
import { TeamScreen } from './components/TeamScreen'
import { BattleScreen } from './components/BattleScreen'
import { useGameStore } from './state/useGameStore'

function App() {
  const {
    screen,
    setScreen,
    teamIds,
    teamCharacters,
    characters,
    toggleCharacterInTeam,
    saveTeam,
    lastWinner,
    setLastWinner,
  } = useGameStore()

  if (screen === 'team') {
    return (
      <TeamScreen
        characters={characters}
        teamIds={teamIds}
        onToggle={toggleCharacterInTeam}
        onSave={() => {
          saveTeam()
          setScreen('menu')
        }}
        onBack={() => setScreen('menu')}
      />
    )
  }

  if (screen === 'characters') {
    return <CharactersScreen characters={characters} onBack={() => setScreen('menu')} />
  }

  if (screen === 'battle') {
    return (
      <BattleScreen
        playerTeam={teamCharacters.length ? teamCharacters : characters.slice(0, 5)}
        onBattleEnd={(winner) => {
          setLastWinner(winner)
          setScreen('result')
        }}
        onBack={() => setScreen('menu')}
      />
    )
  }

  if (screen === 'result') {
    return (
      <section className="screen menu-screen">
        <h2>{lastWinner === 'player' ? 'Victory!' : lastWinner === 'enemy' ? 'Defeat' : 'Draw'}</h2>
        <button type="button" onClick={() => setScreen('menu')}>
          Return to Main Menu
        </button>
      </section>
    )
  }

  return (
    <MainMenu
      onStart={() => {
        setLastWinner(null)
        setScreen('battle')
      }}
      onTeam={() => setScreen('team')}
      onCharacters={() => setScreen('characters')}
    />
  )
}

export default App
