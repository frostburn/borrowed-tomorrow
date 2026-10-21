# Nell's curated idle and attack sheet

The user supplied `nell_lantern_attack_native(1).png`; its exact bytes are preserved as `nell-curated.png` (384 x 384 RGBA, 30,699 bytes). SHA-256: `c8d2a91f638f774bc678f6e79526c9115bf55e70a12ac513dd2d2160ffda9a4d`.

Rows: front, left, right, back. Columns: idle, wind-up, contact, follow-through. Every source cell is 96 x 96 with a shared sole line at row 86. Cropping the transparent margins at `[8,8,88,88]` yields 80 x 80 frames with their ground anchor at `(40,78)`. All visible source pixels fit this rectangle, including the lantern arcs. No resampling, palette reduction, alpha thresholding, redrawing or mirroring is performed.

Run `node scripts/export-nell-animation.mjs` with task-environment Python/Pillow. It exports four directional idle PNGs and four 160 x 160 attack pages. Attack page frames 0, 1 and 2 are wind-up, contact and follow-through in row-major order; the unused fourth cell is transparent. The exporter checks every exported frame against its source crop byte-for-byte. Source pixel height is 74; gameplay uniformly fits it to 63px standing height and uses the sole anchor, keeping every phase grounded without changing the native files. The Sprites workshop inspects native pixels and labels the row-78 guide.

Nell has no walk cycle. Exploration, followers, cutscene movement and battle movement translate the facing idle sprite. Attacks show frames at 0, 140 and 220ms, restore idle at 300ms and retain the shared 380ms combat presentation window. Hits, sound and effects still land at 140ms. Reduced-motion mode keeps idle. The retired Nell rig, skin cutouts and walk exports are removed; the mannequin's lantern attachment and compact proportion preset remain useful authoring tools for other characters. Nell's portrait is unchanged.

Review idle and all three attack poses in each direction in the Sprites tab. Walk is disabled for Nell; Orrin, Kit and Petra retain their authored walk cycles. Campaign saves and inventory are unaffected.
