# Playable-character art set

Created with built-in Image Gen. These are artwork replacements, not changes to the characters' identities. Nell's new atlas establishes the shared rendering; the other four use that atlas as their style reference and the former cast only as identity references. Final game assets live in `public/art/` under their existing character names, plus `-left`, `-right` and `-back`.

## Shared production prompt

Transparent JRPG character production atlas. One head-and-shoulders portrait in the upper half; four complete compact world actors in an evenly spaced lower row, ordered front, left profile, right profile, back. Same character, costume and tools in all depictions. Compact 2.75-head-tall actors, slight overhead camera, dark warm outlines, discrete late-16-bit/early-PC pixel clusters, warm upper-left highlights and blue-violet shadows. Simplified readable faces throughout, without mixing painted realism and anime rendering. No text, labels, frames, scenery, ground shadows or extra figures. Clear transparent gaps. Design for 128 x 128 portraits and 80 x 80 actors.

## Character briefs

- **Nell:** seventeen-year-old female railway apprentice; auburn-brown twin braids, red railway cap with brass emblem, red short jacket, cream shirt, navy overalls, brown boots and brass oil lantern in her right hand. Determined, approachable expression. Original Nell assets supply identity only.
- **Orrin:** broad-shouldered male railway mechanic, dark beard and moustache, kind eyes, navy cap with brass goggles on its brim, cream rolled sleeves, charcoal work clothes, leather gloves, tool belt, boots and brass steam-lance tool. Same actor scale as Nell, with a wider torso.
- **Kit:** seventeen-year-old boy courier, short tousled chestnut hair, clean-shaven youthful face, bashful friendly smile, dusty blue jacket, cream shirt, ochre scarf, leather satchel, brown trousers and boots, compact repeating crossbow in his right hand. No hat or lantern. Keep the same actor proportions as Nell.
- **Celia:** older female physician, neat silver-gray bob, small round spectacles, calm face, forest-green field coat, cream high-collared blouse with brass clasp, charcoal calf-length skirt and visible practical boots. Brown medical book under her left arm and medical satchel at her hip. No religious cross or weapon.
- **Petra:** adult female knight, short swept-back dark hair with close-cut sides, determined angular face, fully covered dark green military tunic and trousers, red collar, brass sun insignia, steel shoulder plates, leather belts and armored boots. Shield on her left arm and saber at her right side. No helmet or lantern.

## Native export

`node scripts/import-character-atlas.mjs <hero> <source.png>` separates the five cutouts with ImageMagick. It finds bounds from the opaque alpha region to exclude stray near-transparent atlas noise, then copies the original RGBA cutout. Point sampling is an authoring export, with no color quantization. All four actor views use one uniform scale and sit on an 80 x 80 transparent canvas with feet ending on row 67 (ground anchor at 68). Portraits occupy a 128 x 128 canvas. Gameplay renders these exports at 1:1; only the dev inspector offers deliberate integer enlargement.

The generated source atlases remain attached to the work chat. The committed native exports are the production artwork; normal builds require neither Image Gen nor ImageMagick.
