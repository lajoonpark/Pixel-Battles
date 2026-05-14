import { useEffect, useMemo, useState } from 'react'
import { DEFAULT_ENEMY_TEAM_IDS } from '../data/enemies'
import { STARTER_CHARACTER_MAP } from '../data/characters'
import { createBattleState, stepCombat } from '../game/combat'
import { CLASS_COLORS } from '../data/classes'
import { HealthBar } from './HealthBar'
import { UnitSprite } from './UnitSprite'
import type { CharacterDefinition } from '../types/game'

interface BattleScreenProps {
  playerTeam: CharacterDefinition[]
  onBattleEnd: (winner: 'player' | 'enemy' | 'draw') => void
  onBack: () => void
}

export function BattleScreen({ playerTeam, onBattleEnd, onBack }: BattleScreenProps) {
  const enemyTeam = useMemo(
    () => DEFAULT_ENEMY_TEAM_IDS.map((id) => STARTER_CHARACTER_MAP[id]).filter(Boolean),
    [],
  )

  const [battleState, setBattleState] = useState(() => createBattleState(playerTeam, enemyTeam))

  useEffect(() => {
    const tick = 0.12
    const timer = window.setInterval(() => {
      setBattleState((previous) => stepCombat(previous, tick))
    }, tick * 1000)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (battleState.result) {
      onBattleEnd(battleState.result.winner)
    }
  }, [battleState.result, onBattleEnd])

  const playerUnits = battleState.units.filter((unit) => unit.team === 'player')
  const enemyUnits = battleState.units.filter((unit) => unit.team === 'enemy')

  return (
    <section className="screen battle-screen">
      <h2>Battle</h2>
      {!battleState.started && <p className="countdown">Starting in {battleState.countdown.toFixed(1)}...</p>}
      <div className="battlefield">
        <div className="lane">
          {playerUnits.map((unit) => (
            <article key={`${unit.team}-${unit.position}`} className="battle-unit">
              <UnitSprite unit={unit} />
              <HealthBar label="HP" current={unit.currentHp} max={unit.maxHp} color="#4cc96a" />
              <HealthBar label="EN" current={unit.energy} max={unit.maxEnergy} color="#43a0ff" />
              <HealthBar
                label="CD"
                current={Math.max(0, unit.abilityCooldown - unit.currentCooldown)}
                max={unit.abilityCooldown}
                color={CLASS_COLORS[unit.classType]}
              />
              <p className="status-line">
                {unit.statusEffects.length
                  ? unit.statusEffects.map((effect) => effect.type).join(', ')
                  : 'No status'}
              </p>
            </article>
          ))}
        </div>
        <div className="versus">VS</div>
        <div className="lane enemy">
          {enemyUnits.map((unit) => (
            <article key={`${unit.team}-${unit.position}`} className="battle-unit">
              <UnitSprite unit={unit} />
              <HealthBar label="HP" current={unit.currentHp} max={unit.maxHp} color="#4cc96a" />
              <HealthBar label="EN" current={unit.energy} max={unit.maxEnergy} color="#43a0ff" />
              <HealthBar
                label="CD"
                current={Math.max(0, unit.abilityCooldown - unit.currentCooldown)}
                max={unit.abilityCooldown}
                color={CLASS_COLORS[unit.classType]}
              />
              <p className="status-line">
                {unit.statusEffects.length
                  ? unit.statusEffects.map((effect) => effect.type).join(', ')
                  : 'No status'}
              </p>
            </article>
          ))}
        </div>
      </div>
      <div className="screen-actions">
        <button type="button" onClick={onBack}>
          Retreat
        </button>
      </div>
    </section>
  )
}
