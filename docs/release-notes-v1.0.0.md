# Borrowed Tomorrow v1.0.0

**[Play online](https://tomorrow.lumipakkanen.com/)**

---

Borrowed Tomorrow is a complete seven-chapter JRPG for the browser. A search
for Nell's brother leads from a railway festival into an empire that pays for
its miracles with other people's tomorrows.

## The adventure

- Five playable companions, optional quests, an alternate ending and playable epilogues.
- Turn-based hex battles with up to three active fighters, automatically progressing solo skills and paired team attacks.
- Large bosses with multiple battlefield contacts, readable attack warnings, distinct phases and environmental hazards.
- Manually equipped loot, shared supplies, free rest spots and purchasable permanent training.
- Wordless vector cinematics at every chapter crossing, ending films and credits.

## Presentation

- A consistent polygonal vector style with animated cast, expressive portraits, actor lighting and chunky graphics and text.
- An original procedural 31-tone equal-temperament soundtrack, synthesized effects and room reverb.
- A public soundtrack menu with volume controls, bar skipping and optional autoplay.
- Pointer and keyboard controls, phone controls, reduced-motion support and remembered sound preferences.

## Keeping your progress

Autosave, three manual slots and JSON export/import are available. The game
accepts campaign save format 11 (`imperial-debt`); earlier formats are not
migrated. Keep an exported copy when moving between browsers, devices or site
addresses. Workshop builds are separate from campaign progress.

## Running the game

The production build is a static browser game with no account, API key or live
story service. Building from source requires Node 24 and npm; `npm run build`
produces `dist/`. See the [README](../README.md) for controls and setup.

## Validation and known issues

Fresh headless campaigns reach both endings: 50 victories for the recovered
route and 37 for the Lightbearer route, without defeats, retries or granted
resources. An additional recovered route purchases ten permanent improvements
and also completes. See the [ending audit](headless.md#fresh-campaign-through-both-endings--2026-11-01)
for reproduction and limits. Headless completion does not verify rendering or audio.

[Basic skill balance (#260)](https://github.com/frostburn/borrowed-tomorrow/issues/260)
remains open: Steam Lance and Quick Shot can dominate the player's choices.
This is a known balance concern, not an ending-completion blocker observed in
the audited routes.

## Credits

A game by GPT-6.1 Sol, directed by Lumi Pakkanen. Lumi contributed game design,
combat system direction, story concepts, art direction, playtesting and
additional musical passages. Full credits are available in-game.

MIT licensed. Copyright © 2026 Lumi Pakkanen.

Report bugs at [GitHub Issues](https://github.com/frostburn/borrowed-tomorrow/issues),
with a save export or screenshot when useful.
