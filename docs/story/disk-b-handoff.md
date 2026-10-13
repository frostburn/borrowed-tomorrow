# Insert Disk B — A Town Expecting Rain

## Exact continuation

Disk A is complete when `diskAComplete` is true and `boundary` equals `disk-b:rillbridge-arrival`. Current saves retain `chapter: disk-a` and a physical location in Rillbridge tunnel. The player can return to Larkspur; that must not erase the pending arrival.

When Disk B is implemented, the existing `disk-b` exit must recognize this boundary, consume it only after entering the new scene successfully, and place Nell, Orrin, and narrative companion Mira at the western approach to Rillbridge. Import a real Disk A save during verification. Preserve party HP, equipment, experience, marks, bandages, journal, and every choice flag. Keep earlier regions visitable.

The final exchange was:

- Mira recognizes the blue house beside the bridge.
- Nell notices tomorrow's date on the festival banner.
- Orrin realizes the flood has not happened yet.

Open with the mundane arrival: a baker preparing for the festival, the bridge being decorated, and Mira trying to run home. Establish the local date explicitly. Find her father early; searching for him should not occupy the whole chapter.

## Local adventure

The town expects seasonal rain. A flood warning is unconvincing without physical evidence. Let the party inspect the upstream sluice, discover a blocked overflow, and arrange an evacuation route. People have reasons to remain: a bedridden neighbor, animals in a cellar, bridge tolls, and an official trying to protect the festival's investment. Pick a few substantial problems rather than scattering fetch quests.

The registry interferes when Nell tries to move an unlisted resident onto the train. Demonstrate its rule in an action the player can understand and work around. Do not solve the central railway mystery here.

Hex combat can introduce shallow water as movement cost and a floodgate arena with narrow safe approaches. Preserve the preview/commit contract and regular axial geometry. Add a third combatant only when the story gives them a reason to join.

End with a resolved evacuation or rescue whose effects survive when returning to Larkspur. The next departure can point to the soldiers' train, but earn that transition by finishing the flood story first.

## Implementation checklist

- Add a chapter module and load its assets when entering the new region.
- Add save migrations if the schema changes. Keep a fixture of the original version-1 boundary save.
- Keep stable content IDs; do not rename existing flags to improve prose.
- Update canon, character knowledge, and open threads after writing the actual dialogue.
- Record the next precise boundary and verify returning to earlier towns.
