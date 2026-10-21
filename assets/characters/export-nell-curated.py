"""Extract the user's native Nell sheet without recoloring or resampling."""
from pathlib import Path
import hashlib
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SOURCE = ROOT / 'assets/characters/nell-curated.png'
image = Image.open(SOURCE).convert('RGBA')
assert image.size == (384, 384)
print('Source SHA-256:', hashlib.sha256(SOURCE.read_bytes()).hexdigest())
for row, direction in enumerate(('front', 'left', 'right', 'back')):
    frames = []
    for column in range(4):
        cell = image.crop((96 * column, 96 * row, 96 * (column + 1), 96 * (row + 1)))
        bounds = cell.getchannel('A').getbbox()
        assert bounds and bounds[0] >= 8 and bounds[1] >= 8 and bounds[2] <= 88 and bounds[3] <= 88
        # Discard transparent margins only. Every visible RGBA pixel is preserved.
        frames.append(cell.crop((8, 8, 88, 88)))
    suffix = '' if direction == 'front' else '-' + direction
    idle = ROOT / f'public/art/nell{suffix}.png'
    frames[0].save(idle, optimize=True)
    page = Image.new('RGBA', (160, 160))
    for index, frame in enumerate(frames[1:]):
        page.paste(frame, (index % 2 * 80, index // 2 * 80))
    output = ROOT / f'public/art/animation/nell-{direction}.png'
    page.save(output, optimize=True)
    assert idle.stat().st_size <= 131072 and output.stat().st_size <= 131072
    assert Image.open(idle).tobytes() == frames[0].tobytes()
    recovered = Image.open(output)
    for index, frame in enumerate(frames[1:]):
        x, y = index % 2 * 80, index // 2 * 80
        assert recovered.crop((x, y, x + 80, y + 80)).tobytes() == frame.tobytes()
    print(direction, 'idle + three attack frames verified')
