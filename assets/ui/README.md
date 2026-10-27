# Object cards and equipment icons

Run `python3 assets/ui/export-icons.py` from the repository root. It writes only
`public/art/vector/ui/`: native 32 × 32 transparent icons and 128 × 128 dialogue
cards. The cards reuse the same object shapes at integer scale on a subdued
background. All artwork is authored directly as vector geometry; no image
samples, external dependencies, fonts or embedded images are needed.

Broad material planes, colored undersides and restrained detail match the cast
and the shared two-pixel framebuffer. Icons are displayed at native size
(except the 16px footer indicators), with nearest filtering. Keep item names,
counts and costs alongside them. Related fittings share an identifiable shape:
reflectors, prisms, nozzles, valves, rings, sights, stocks, medical focuses,
clasps, saber guards, shield braces, coats and harnesses. The coat silhouettes
also distinguish heavy protective gear. `src/content/ui-art.ts` explicitly maps
every equipment ID; its complete `Record<ItemId, UIIcon>` catches missing entries.

That module also resolves authored reading/inspection labels to cards. Narrated
locations and actions keep BT. An explicit dialogue portrait takes precedence,
so the unseen Chapter Five voice remains abstract light while Chapter Seven can
show the Benefactor. Named character portraits and expressions are unchanged.
The household's spoken line has an explicit speaker cue; narration under the
same label retains BT.

`game/rewards.ts` compares money, medicine and total owned equipment before and
after dialogue completion/choice or battle victory. Only real positive changes
are displayed. Moving a worn copy to/from the bag, failed/capped awards and
repeated completed interactions do not create a receipt. Notices preserve any
message emitted by the same story action. Shop receipts use the successful
transaction result; prices, supply rules and saves remain unchanged.

Review the real screens with:

```sh
BT_QA_SCREENSHOTS=/tmp/bt-ui-art npm run test:e2e -- tests/e2e/object-items.spec.ts
```

These desktop/phone graphics checks are opt-in, outside default CI. Unit coverage
is in `tests/ui-art.test.ts`. Stage outputs and run `npm run check:art-upload`
before publishing.
