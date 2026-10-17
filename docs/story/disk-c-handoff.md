# Disk C — The Last Ambulance Train

Implemented in `src/content/disk-c/`. This document preserves its incoming contract. The next pending chapter is described in `disk-d-handoff.md`.

## Exact continuation

Disk B ends with `chapter: disk-b`, `diskBComplete: true`, `bEvacuated: true`, `bLarkspurReceived: true`, and `boundary: disk-c:ambulance-siding`. The physical save remains at Larkspur beside the unscheduled train, normally near `(32,10)`; return exploration may change that location. Do not infer the pending chapter from coordinates. Nell and Orrin are the only combatants. Mira is with Bram at Larkspur.

The departure dialogue reads a dispatch for **Cinderbank siding**: an ambulance train must depart before dawn, two carriages carry wounded soldiers, and no medical staff appear on the passenger list. Orrin identifies the next service number on the same relay. Nell asks him to leave Mira with Bram and fetch their coats.

Import a real version-2 Disk B completion save during verification. Preserve all prior progress, the outfall choice, the optional maintenance discovery, and Ansel’s first answer. Do not consume this boundary until the new scene and assets are ready. Earlier towns remain visitable. Continue the save schema with migrations, not resets.

The Larkspur service enters Cinderbank at `(20,37)`, beside the return-platform marker at `(20,38)`, on both first arrival and later visits. Existing saves retain their saved position. After warming the patients, the painted ambulance door and Dena’s “Help at the carriage door” action open the same boarding-refusal scene; neither bypasses the crew-register requirements.

## Local adventure to build

Establish Cinderbank’s local date, the train’s destination, and what will happen at departure before relying on the deadline. There is no inherited real-time countdown. Meet someone tending the wounded immediately; give the player a concrete job that improves their situation. The missing staff on the manifest should obstruct an attempted action before a character explains its implications.

The previous chapter escaped through a maintenance path. Let that experience help Nell and Orrin ask better questions without making it a universal answer. Do not repeat Rillbridge as another flood evacuation. Choose one substantial medical-transport or railway-logistics problem, show the available resources and costs, and resolve the passengers’ immediate danger before the next disk.

Keep Mira’s reunion intact. Bram, Tilda, and Elspeth have their own recovery at Larkspur. If the orchard flooded, follow through on lost food and Tilda’s request for credit; if it stayed dry, allow practical recovery through the crossing. The optional work sheet means Orrin can recognize his father’s maintenance time only when `bWorksheetRead` is true.

Ada Fenwick remains private author knowledge. A useful new record may advance the author or maintenance thread, but avoid a speech explaining the whole return railway. Follow the repository’s `write-game-prose` skill and update canon, knowledge, open threads, and the next exact boundary after implementing the chapter.
