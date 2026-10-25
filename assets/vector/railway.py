"""Direction variants of native railway SVGs, without runtime mirroring.

The original engine faces left. Right-facing placements retain its dimensions
and ground anchor; the chapter's engine-right light definition mirrors the lamp.
"""
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
NS = '{http://www.w3.org/2000/svg}'


def engine_right(key, url):
    source = ROOT / 'public' / url
    svg = ET.fromstring(source.read_text())
    width = float(svg.get('width'))
    group = ET.Element(NS + 'g', {'transform': f'translate({width:g} 0) scale(-1 1)'})
    for element in list(svg):
        if element.tag in (NS + 'title', NS + 'metadata'):
            continue
        svg.remove(element)
        group.append(element)
    svg.append(group)
    svg.find(NS + 'title').text = 'Right-facing locomotive'
    svg.find(NS + 'metadata').text = 'Direction variant of ' + url + '; source: assets/vector/railway.py'
    target = source.with_name('engine-right.svg')
    target.write_text(ET.tostring(svg, encoding='unicode') + '\n')
    return key + '-right', str(target.relative_to(ROOT / 'public'))
