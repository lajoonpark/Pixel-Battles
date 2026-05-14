# Pixel-Battles

A browser-based 2D pixel-style auto-battler MVP. Build a team of up to 5 units, start a battle, and watch class-based AI, cooldowns, energy, and status effects decide the winner.

## Run the game

```bash
npm install
npm run dev
```

Open the local Vite URL shown in your terminal.

## Implemented systems

- Main Menu, Team, Characters, Battle, and Result screens
- 12 starter characters (2 per class)
- 6 class roles: Tank, Assassin, Healer, Hinderer, Attacker, Supporter
- Auto battle loop with:
  - basic attacks based on attack speed
  - cooldown + energy ability triggers
  - class/action-based targeting priorities
  - status effects (stun, slow, attackDown, defenseDown, shield, cooldownDelay, antiHeal, taunt)
- Team selection up to 5 units
- Team persistence with `localStorage`
- Default preset enemy team using the same AI/combat systems

## Targeting priorities

Targeting is centralized in:

- `src/data/classes.ts` (priority maps)
- `src/game/targeting.ts` (`getTarget(actor, allUnits, actionType)`)

Every action uses `actionType` (`damage`, `healing`, `hindrance`, `support`, `debuff`) and class priority maps so priorities are not hardcoded per character.

## Add a new character

1. Add a new entry in `src/data/characters.ts` with stats and ability metadata.
2. Implement ability behavior in `src/game/abilities.ts` by matching `ability.id`.
3. (Optional) Add generated placeholder sprites by running asset scripts (below).

## Placeholder asset generation

Reusable scripts are in `scripts/generate-assets/`.

```bash
python3 scripts/generate-assets/generate_svg_assets.py
python3 scripts/generate-assets/generate_pixel_assets.py
```

Generated outputs are placed in:

- `public/assets/characters/`
- `public/assets/effects/`
- `public/assets/ui/`

## Intentionally not included yet

- No backend/database
- No login/account system
- No gacha/shop/kingdom/equipment systems
- No multiplayer
- No copyrighted external assets
