"""Keep editor-owned interaction roles when scenery exporters rebuild a layout."""
import json

def retain_interaction_roles(path, layers):
 if not path.exists():return
 authored={o['name']:[p for p in o.get('properties',[]) if p['name'] in ('kind','storyUntil','marker','rest') or p['name']=='sprite' and p['value']=='supply-clerk']
  for l in json.loads(path.read_text())['layers'] if l['name']=='Interactions' for o in l.get('objects',[])}
 for layer in layers:
  if layer['name']!='Interactions':continue
  for obj in layer.get('objects',[]):
   if any(p['name']=='sprite' and p['value']=='supply-clerk' for p in authored.get(obj['name'],[])):
    obj['properties']=[p for p in obj['properties'] if p['name'] not in ('sprite','sign')]
   names={p['name'] for p in obj['properties']}
   obj['properties'].extend(p for p in authored.get(obj['name'],[]) if p['name'] not in names)


_preserved=set()
def preserve_map_format(directory):
 """Whole-region exports leave editor formatting alone when content is unchanged.
 Some region extensions write a map in stages; compare only after all finish.
 """
 import atexit
 directory=directory.resolve()
 if directory in _preserved:return
 _preserved.add(directory)
 originals={path:path.read_text()for path in directory.glob('*.json')}
 def finish():
  for path,original in originals.items():
   if path.exists() and json.loads(path.read_text())==json.loads(original):path.write_text(original)
 atexit.register(finish)
