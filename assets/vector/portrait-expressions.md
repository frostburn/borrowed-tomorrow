# Portrait expressions

The five party members retain their independently drawn 128 x 128 neutral SVGs
in `public/art/vector/portrait-*.svg`. Expression variants replace only each
portrait's existing brows, eyes, pupils and mouth. Orrin's beard, Celia's glasses,
head shapes, hair, connected necks and costumes stay in their original layers.

Rebuild the 27 variants from the repository root, without extra dependencies:

```sh
python assets/vector/portrait-expressions.py
```

Edit local feature anchors and mouth polygons in that script. It fails if an
expected facial path no longer exists in a neutral original. Neutral originals
are never overwritten. Keep outputs as self-contained SVGs and run the staged
art-upload check before committing them.

`src/content/portrait-expressions.ts` lists supported expressions. `STAGED` in
`content/dialogue.ts` accepts an explicit cue beside the camera direction:

```ts
line('Nell', 'Dialogue already written for this moment.', {
  expression: 'worried', focus: {x: 23, y: 15},
});
```

Expressions belong to individual lines and reset to neutral on the next line.
Unannotated dialogue, narration and unsupported NPC expressions retain their
existing portrait behavior. Expression choice never changes saves or story
branches. Add cues in context rather than inferring emotion from keywords.

Review under **Workshop → Sprites → Portrait expressions**. The preview uses
the actual dialogue assets and the shared chunky framebuffer. Browser checks
compare every variant with its original outside the facial features, check
native dimensions and sampled expression detail, and replay the festival and
optional recovery scenes at desktop and phone sizes.
