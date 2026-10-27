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
