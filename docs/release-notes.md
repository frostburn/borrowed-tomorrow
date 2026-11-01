# Borrowed Tomorrow v1.1.0

**[Play online](https://tomorrow.lumipakkanen.com/)**

## Phone layouts

- Play in portrait or landscape. Portrait presents the world at half size without the chunky stage filter, above full-width controls; landscape keeps its command sidebar.
- Fine-detail character status shows miniatures, names, HP and levels. Combat pan arrows sit beside status, leaving the battlefield clear.
- Dialogue keeps native 128×128 chunky portraits, with full-width text below and a separate action row. Phone menus, inventory and safe-area handling adapt to the viewport.
- All ten late-game commands fit without scrolling the command list. Pan the battlefield in either direction with touch dragging or four camera buttons.
- Rotate without losing the selected skill or pending confirmation. Camera drags do not spend an action or swallow the next control tap.

## Audio

Reduce shared post-room output gain from 1.5 to 1.4 for a slightly quieter mix.
Music/effects balance, compressor drive, room wet levels and volume/mute controls
retain their existing behavior.

## Saves and compatibility

Existing campaign save format 11 (`imperial-debt`) remains supported. This
release does not change save schemas, dependencies, story progression or combat
rules. Export a save when moving between browsers, devices or site addresses.

[Basic skill balance (#260)](https://github.com/frostburn/borrowed-tomorrow/issues/260)
remains a known concern. Physical-device Safari coverage and final hosting checks
are recorded separately in the release checklist; passing CI is not a claim of a
complete physical-device playthrough.

See the [v1.0.0 release notes](release-notes-v1.0.0.md) for the original seven-chapter
release, credits and setup, and the [release guide](releasing.md) for publication.
