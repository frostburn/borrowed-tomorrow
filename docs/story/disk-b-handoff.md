# Disk B — A Town Expecting Rain

Disk B is implemented. Its incoming boundary remains `disk-b:rillbridge-arrival`, with `chapter: disk-a`, `diskAComplete: true`, and a physical location in an earlier map. Returning to Larkspur does not erase that pending arrival.

**Begin Disk B** validates and copies the incoming state, loads the two new maps, then commits `chapter: disk-b`, `diskBStarted: true`, location `rillbridge` `(12,18)`, and `boundary: null`. Failure to load leaves the incoming state intact and allows retry. Version-1 saves migrate to version 2; party HP/focus, equipment, experience, marks, bandages, journal, play time, and choice flags carry forward. `tests/fixtures/disk-a-v1.json` is the original browser-playthrough save and is imported in browser QA.

The local route is Bram → overflow → gauge → Tilda → carriage refusal → trolley → schoolhouse gate → schoolhouse → outfall choice → keeper → crossing → Ansel → dispatch. The maintenance work sheet is optional. The party remains Nell and Orrin; Mira stays with Bram after their reunion.

The orchard channel gives a dry keeper arena at the cost of the trees. The millrace keeps the orchard bank dry and introduces shallow-water movement costs. Both paths rescue thirty-one residents. Their survival is confirmed after midnight at Larkspur.

The outgoing boundary is `disk-c:ambulance-siding`. See `disk-c-handoff.md` for the precise saved state and next adventure. Earlier regions, Rillbridge, and the sluice remain visitable. Keep all content and flag IDs stable.
