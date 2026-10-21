"""Reproduce native Pixel Art Fixer review assets; never writes campaign art.

python assets/characters/reconstruct-civilians.py SOURCE_DIR --fixer-root FIXER_ROOT
Dependencies/build recipe: pixel-fixer.md. Pillow is authoring-only.
"""
import argparse
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

root = Path(__file__).resolve().parents[2]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('sources', type=Path)
parser.add_argument('--fixer-root', type=Path, required=True)
parser.add_argument('--output-dir', type=Path, default=root / 'src/dev/art/civilian-review')
args = parser.parse_args()
manifest = json.loads((root / 'assets/characters/pixel-fixer-civilians.json').read_text())
checkout = args.fixer_root.resolve()
revision = subprocess.check_output(['git', '-C', str(checkout), 'rev-parse', 'HEAD'], text=True).strip()
if revision != manifest['revision']:
    raise ValueError('Use the pinned Pixel Art Fixer revision')
binary = checkout / 'rust/target/release/pixelfixer'
if not binary.is_file():
    raise ValueError('Build the Rust CLI first; see pixel-fixer.md')
outputs = []
with tempfile.TemporaryDirectory(prefix='civilian-reconstruction-') as temporary:
    for entry in manifest['entries']:
        source = args.sources / entry['source']
        if hashlib.sha256(source.read_bytes()).hexdigest() != entry['sourceSha256']:
            raise ValueError(f'Source hash mismatch: {source}')
        output = Path(temporary) / f"{entry['role']}-fixed.png"
        full = json.loads(subprocess.check_output([str(binary), 'process', str(source), str(output), 'full'], text=True))
        fast = json.loads(subprocess.check_output([str(binary), 'fast', str(source)], text=True))
        for mode, result in [('full', full), ('fast', fast)]:
            expected = entry[mode]
            if any(result[key] != expected[key] for key in ['cols', 'rows', 'consensus']):
                raise ValueError(f"Changed {mode} detection for {entry['role']}; review instead of overwriting")
        image = Image.open(output).convert('RGBA')
        if image.size != (entry['full']['cols'], entry['full']['rows']):
            raise ValueError('Reconstruction dimensions disagree with detection')
        if set(image.getchannel('A').tobytes()) != {0, 255}:
            raise ValueError('Expected transparent, binary-alpha reconstruction')
        data = output.read_bytes()
        if len(data) > 131072 or hashlib.sha256(data).hexdigest() != entry['outputSha256']:
            raise ValueError('Changed reconstruction: inspect before accepting new bytes')
        outputs.append((output.name, data))
        print(f"{entry['role']}: {image.size}, {entry['confidence']}; {entry['campaignDecision']}")
# All sources and detections must validate before replacing any review image.
args.output_dir.mkdir(parents=True, exist_ok=True)
for name, data in outputs:
    (args.output_dir / name).write_bytes(data)
