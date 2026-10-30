# Portrait expressions

The five party members and Tomas retain their independently drawn 128 x 128 neutral SVGs
in `public/art/vector/portrait-*.svg`. Expression variants replace only each
portrait's existing brows, eyes, pupils and mouth. Orrin's beard, Celia's glasses,
head shapes, hair, connected necks and costumes stay in their original layers.
Tomas retains his two-tone dark green eyes, including paired iris accents in
every expression. His first-screen welcome, concern and protective refusal
use explicit cues, with further cues at his rescue and later sibling scenes.

Kit also has a flustered variant: lifted inner brows, a wider sideways glance,
a small parted smile and warmer cheeks. Use it for his verbal slips, reserving
the softer bashful smile for quieter affection. It is available only for Kit.

Rebuild the 33 variants from the repository root, without extra dependencies:

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

Pupils use equal 4 × 4 native rectangles in each expression. The eye openings
keep those blocks within a visible pale ivory sclera, including happy eyes;
three-pixel widths and mismatched odd heights can produce unequal pupils after
two-pixel sampling. Local eyelid/brow anchors still follow each original face.
Tomas’s darker pupil accents are paired 2 × 2 blocks within his green irises.
The browser regression renders all 63 human faces at all four sampling phases,
checking the actual visible eye pixels rather than just SVG coordinates.
The neutral Emperor is unchanged from main, and Tilda has a deliberately
partly closed left eyelid with a lowered pupil; the audit preserves these individual shapes.
