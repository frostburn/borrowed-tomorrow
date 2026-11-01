# Releasing Borrowed Tomorrow

The v1.0.0 preparation sets both package and lockfile versions to `1.0.0` and
provides [release notes](release-notes.md). Merging the preparation PR does not
create a tag, publish a GitHub release or deploy the site. Keep the existing
`v0.2.0-beta.1` pre-release intact. The hosted game is
[tomorrow.lumipakkanen.com](https://tomorrow.lumipakkanen.com/).

## Select and verify the candidate

### v1.0.0 preparation evidence

The preparation is based on merged main `560627c` (PR #265), with only README,
release documentation and package version changes. Gameplay, dependencies and
save schemas are unchanged.

- `npm run check`: 1,105 rule/content tests, TypeScript and production build pass with package version `1.0.0`.
- `npm run build:size`: 3.36 MB JavaScript raw / 635.71 kB gzip; startup 3.23 MB raw / 597.35 kB gzip; complete distribution 13.49 MB. Existing large-chunk warnings remain visible.
- The content baseline passed both critical development and production browser suites in [Check run 769](https://github.com/frostburn/borrowed-tomorrow/actions/runs/41315611097). The preparation PR must also pass its own required **Check** workflow.
- [Fresh headless ending audit](headless.md#fresh-campaign-through-both-endings--2026-11-01): both endings and the additional training-purchase route complete without defeats or retries.
- A live-host probe on 2026-11-01 returned HTTP 503 with an upstream connection failure from this environment. This does not establish the cause or the site's availability from other networks; the final hosted production check below remains unverified.

### Candidate checks

Record the candidate commit, browser/device, commands run and any remaining
issues in the release PR. Test the exact production build intended for hosting.
With Node 24:

```sh
npm ci
npm run check
npm run build:size
npx playwright install chromium
npm run test:e2e:ci
npm run test:e2e:ci:production
npm run preview
```

`check` includes the production build; no second build is needed before the
size report or production browser checks. An existing Chromium can be selected
with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Retain build/test logs and screenshots
outside the repository. Inspect size changes rather than hiding Vite's chunk
warnings; a warning alone is not a gameplay failure.

The normal **Check** workflow runs rule/content tests, the build and critical
development/production browser checks. Its final **check** job must pass for
the selected commit. It does not run the full adventure or every audio render.
Broader verification is available locally:

```sh
npm run test:e2e:smoke
npm run test:e2e:journeys
npm run test:e2e:production
npm run test:headless
```

The **Check → Run workflow → full_journey** option selects the broad browser
and audio suites. See [headless.md](headless.md) for simulation routes and
checkpoint provenance. Historical chained audits and canonical starts are
useful evidence, but do not replace a fresh production playthrough.

## Playthrough gates

These are checks to perform, not a claim that the candidate has passed them.
Story spoilers follow.

- [ ] Play a fresh campaign in the production preview through the recovered ending, without development starts or forced victories. Check that objectives lead to reachable interactions, equipment/skills/training are useful, and required battles remain winnable.
- [ ] Exercise all six chapter crossings. Pause and skip some, return from a departure, reload its save and finish the arrival. Formation, health, gear and supplies should persist.
- [ ] Save/reload before and after Nell's treatment, the final capital assault, the final boss forms and completion. Export and reimport a save; check a manual slot independently of the autosave.
- [ ] Verify the uncured branch from a separate pre-assault save: the warning permits returning for treatment; accepting the risk leads to the Lightbearer ending, not Chapter Seven. The saved return checkpoint should restore the earlier party and progress. The full fresh playthrough need not be repeated for this branch.
- [ ] Check both ending films, credits, soundtrack controls and completion reloads. A finished save should reopen its completion panel without replaying rewards.
- [ ] Check a phone-sized viewport and fractional DPR for readable menus, affected hexes and reachable controls. Confirm sound preferences survive a reload and reduced-motion playback remains usable.
- [ ] Open the production build on the intended host, including its actual subdirectory if used. Confirm art/music load, save/export work and the workshop, canonical starts and battle cheats are absent.

A softlock, lost progress, broken required interaction or unreachable ending
blocks release. Record cosmetic, balance and music findings with their severity;
they need not all become release blockers. Leave optional unmerged experiments
outside the candidate unless explicitly chosen for the release.

## Publish only after approval

Once the candidate is accepted and publication is requested:

1. Verify `package.json` and both root package versions in `package-lock.json` are `1.0.0`. They are updated together in the preparation PR. The campaign save format remains version 11.
2. Use the prepared release notes and retain the known issue #260. Record any further findings from the final playthrough/host checks above.
3. Build and verify the resulting release commit, including its required CI checks. If the final change is only version metadata, retain the playthrough evidence and identify the tested content commit as well.
4. Create the requested tag at that verified commit. Publish GitHub release notes or deploy only when those actions are requested. Do not move the existing pre-release tag.
5. For hosting, upload the complete `dist/`, including artwork and deferred chunks. Preserve relative paths and enable HTTP compression. Keep the previous deployment available for rollback.

Application release versions and campaign save versions are independent. A
release-number bump alone must not discard supported version-11 progress.

For v1.0.0, create the tag from the merged main commit after its checks pass,
not from the PR branch or an older build. A manual publication sequence is:

```sh
git switch main
git pull --ff-only origin main
npm ci
npm run check
git tag -a v1.0.0 -m "Borrowed Tomorrow v1.0.0"
git push origin v1.0.0
gh release create v1.0.0 --verify-tag --title "Borrowed Tomorrow v1.0.0" --notes-file docs/release-notes.md
```

Check that the selected commit is the intended merged candidate before creating
the tag. For a downloadable static build, archive the complete `dist/` with
`tar -czf borrowed-tomorrow-v1.0.0.tar.gz -C dist .` and attach that archive to
the release. This includes hidden build metadata as well as art and deferred
chunks. Deploy that same output to the hosted game and perform the host check
above; package version changes alone do not update an existing deployment.
