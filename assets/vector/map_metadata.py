"""Keep editor-owned interaction roles when scenery exporters rebuild a layout."""
import json

def retain_interaction_roles(path, layers):
 if not path.exists():return
 authored={o['name']:[p for p in o.get('properties',[]) if p['name'] in ('kind','storyUntil')]
  for l in json.loads(path.read_text())['layers'] if l['name']=='Interactions' for o in l.get('objects',[])}
 for layer in layers:
  if layer['name']!='Interactions':continue
  for obj in layer.get('objects',[]):
   obj['properties'].extend(authored.get(obj['name'],[]))
