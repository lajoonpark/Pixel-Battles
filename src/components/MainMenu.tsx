interface MainMenuProps {
  onStart: () => void
  onTeam: () => void
  onCharacters: () => void
}

export function MainMenu({ onStart, onTeam, onCharacters }: MainMenuProps) {
  return (
    <section className="screen menu-screen">
      <h1>Pixel Battles MVP</h1>
      <p>Build a 5-unit team and watch auto battles.</p>
      <div className="menu-buttons">
        <button type="button" onClick={onStart}>
          Start Battle
        </button>
        <button type="button" onClick={onTeam}>
          Team
        </button>
        <button type="button" onClick={onCharacters}>
          Characters
        </button>
        <button type="button" disabled>
          Settings (coming soon)
        </button>
      </div>
    </section>
  )
}
