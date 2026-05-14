from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
CHAR_DIR = ROOT / 'public' / 'assets' / 'characters'
EFFECT_DIR = ROOT / 'public' / 'assets' / 'effects'

CHAR_DIR.mkdir(parents=True, exist_ok=True)
EFFECT_DIR.mkdir(parents=True, exist_ok=True)

PALETTE = {
    'Tank': ('#7d8797', '#4f5968'),
    'Assassin': ('#7a48c6', '#4c2c7f'),
    'Healer': ('#3ea85f', '#267141'),
    'Hinderer': ('#3279d8', '#204f8e'),
    'Attacker': ('#dc5d2f', '#8f3518'),
    'Supporter': ('#d8b43a', '#8c7423'),
}

CHARACTERS = {
    'brickguard': 'Tank',
    'iron-bun': 'Tank',
    'shadow-pip': 'Assassin',
    'needle-fox': 'Assassin',
    'honey-saint': 'Healer',
    'leaf-nurse': 'Healer',
    'frost-imp': 'Hinderer',
    'hex-sprout': 'Hinderer',
    'pepper-shot': 'Attacker',
    'ember-cub': 'Attacker',
    'bubble-bard': 'Supporter',
    'clock-mouse': 'Supporter',
}

ANIMATIONS = ['idle', 'attack', 'ability', 'hurt', 'defeated']


def draw_sprite(base: str, shade: str, frame_shift: int, defeated: bool) -> Image.Image:
    img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    # body
    d.rectangle((8, 8 + frame_shift, 23, 23 + frame_shift), fill=base)
    d.rectangle((10, 10 + frame_shift, 21, 21 + frame_shift), fill=shade)
    # eyes
    eye = '#111111' if not defeated else '#555555'
    d.rectangle((12, 13 + frame_shift, 13, 14 + frame_shift), fill=eye)
    d.rectangle((18, 13 + frame_shift, 19, 14 + frame_shift), fill=eye)
    # feet
    foot = shade if not defeated else '#666666'
    d.rectangle((10, 24 + frame_shift, 13, 26 + frame_shift), fill=foot)
    d.rectangle((18, 24 + frame_shift, 21, 26 + frame_shift), fill=foot)
    return img


for name, class_name in CHARACTERS.items():
    class_dir = CHAR_DIR / name
    class_dir.mkdir(parents=True, exist_ok=True)
    base, shade = PALETTE[class_name]
    frames = []
    for i, anim in enumerate(ANIMATIONS):
        shift = 0 if anim in ('idle', 'defeated') else (-1 if i % 2 == 0 else 1)
        frame = draw_sprite(base, shade, shift, anim == 'defeated')
        frame.save(class_dir / f'{anim}.png')
        frames.append(frame)

    sheet = Image.new('RGBA', (32 * len(frames), 32), (0, 0, 0, 0))
    for idx, frame in enumerate(frames):
        sheet.paste(frame, (idx * 32, 0))
    sheet.save(class_dir / 'spritesheet.png')

for effect_name, color in [('slash', '#ffffff'), ('heal', '#66ff88'), ('shield-pop', '#66bbff')]:
    img = Image.new('RGBA', (32, 32), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rectangle((8, 8, 24, 24), outline=color, width=3)
    d.line((8, 8, 24, 24), fill=color, width=2)
    d.line((24, 8, 8, 24), fill=color, width=2)
    img.save(EFFECT_DIR / f'{effect_name}.png')

for tile_name, color in [('battlefield-tile', '#2c3347'), ('battlefield-tile-alt', '#313b54')]:
    tile = Image.new('RGBA', (32, 32), color)
    tile.save(EFFECT_DIR / f'{tile_name}.png')

print('Generated placeholder pixel sprites and effects.')
