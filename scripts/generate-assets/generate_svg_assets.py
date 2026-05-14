from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
UI_DIR = ROOT / 'public' / 'assets' / 'ui'
EFFECT_DIR = ROOT / 'public' / 'assets' / 'effects'

UI_DIR.mkdir(parents=True, exist_ok=True)
EFFECT_DIR.mkdir(parents=True, exist_ok=True)

SVG_TEMPLATE = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">{body}</svg>'

icons = {
    'class-tank.svg': '<rect x="6" y="6" width="20" height="20" fill="#7d8797"/><rect x="10" y="10" width="12" height="12" fill="#4b5568"/>',
    'class-assassin.svg': '<polygon points="16,4 28,16 16,28 4,16" fill="#7a48c6"/>',
    'class-healer.svg': '<rect x="12" y="5" width="8" height="22" fill="#3ea85f"/><rect x="5" y="12" width="22" height="8" fill="#3ea85f"/>',
    'class-hinderer.svg': '<circle cx="16" cy="16" r="11" fill="#3279d8"/><path d="M16 6 L20 16 L16 26 L12 16 Z" fill="#b8d6ff"/>',
    'class-attacker.svg': '<polygon points="5,27 16,5 27,27" fill="#dc5d2f"/>',
    'class-supporter.svg': '<circle cx="16" cy="16" r="10" fill="#d8b43a"/><circle cx="12" cy="14" r="2"/><circle cx="20" cy="14" r="2"/><rect x="11" y="19" width="10" height="2"/>',
    'shield.svg': '<path d="M16 3 L26 8 V16 C26 23 21 27 16 29 C11 27 6 23 6 16 V8 Z" fill="#68b7ff"/>',
    'buff.svg': '<polygon points="16,4 19,12 28,12 21,18 24,28 16,22 8,28 11,18 4,12 13,12" fill="#ffd966"/>',
    'debuff.svg': '<circle cx="16" cy="16" r="12" fill="#8b3a3a"/><rect x="8" y="14" width="16" height="4" fill="#ffe0e0"/>',
    'projectile.svg': '<rect x="6" y="12" width="20" height="8" fill="#ffffff"/><rect x="20" y="10" width="6" height="12" fill="#ffc857"/>',
}

for filename, body in icons.items():
    out = UI_DIR / filename
    out.write_text(SVG_TEMPLATE.format(body=body), encoding='utf-8')

(EFFECT_DIR / 'hit-flash.svg').write_text(
    SVG_TEMPLATE.format(body='<circle cx="16" cy="16" r="12" fill="#fff4a3"/><circle cx="16" cy="16" r="7" fill="#fff"/>'),
    encoding='utf-8',
)

print('Generated SVG UI/effect assets.')
