# Layered walk reference

Open `?dev=animation` in Vite or choose **Animation** in the workshop. The mannequin is an editable reference for establishing motion before applying character artwork. Choose the **Mannequin** or **Nell** skin. The mannequin offers Unarmed, Lantern (Nell) and Steam lance (Orrin); Nell uses her own lantern skin. **Arms and weapon** hides those parts together to recover the armless reference. The motion source is deterministic geometry and joint data, with no generated raster poses.

## Parts and coordinate system

`src/dev/reference-actor.ts` defines fifteen visible layers: head, torso, separate thigh/shin/foot parts for each leg, separate upper-arm/forearm/hand parts for each arm, and a right-weapon layer. Head includes the face/nose; torso includes the neck. Each foot combines a dark sole with a shaped shoe upper, a four-pixel heel behind the ankle and eight-pixel toe in front. Each part can be hidden or shown alone. Teal marks the anatomical left limbs and amber the right; Anatomy colors switches to neutral clothing. Hands retain a skin material so the weapon grip reads clearly.

`src/art/actor-space.ts` defines anatomical right as positive x, forward as positive y and up as positive z. Four camera orientations project the same parts onto an 80 x 80 frame around ground anchor (40,68). Right is viewer left in front, viewer right in back, near in right profile and far in left profile. No part is mirrored to change direction.

`src/art/layered-sprite.ts` rasterizes editable part geometry with a depth buffer. Parts occlude one another according to their actual positions, including when the legs cross. The silhouette has a one-pixel outline. Every output pixel is opaque or transparent; there is no antialiasing or runtime fitting of the frame.

Nell attaches her native face/cap/braids and costume pixels to her own rounded clothing, glove and boot meshes, with twelve-pixel leg bones retargeted to her compact proportions. The reference supplies joint and foot motion; Nell does not reuse its rectangular placeholder solids. Her carrying elbow bends to hold the original native lantern artwork at her waist, attached to the anatomical right grip. Canonical 80 x 80 skin textures preserve source RGB with crisp alpha, so browser previews match the baked game frames exactly. Anatomy colors are disabled for this actual-art skin; joint guides still identify each side. See `nell-rig.md` for the source and export recipe. Gameplay uses the small baked PNG pages and does not load this authoring model.

## Gait

`src/art/walk-cycle.ts` owns the motion. Each leg has two fixed 15-pixel bones. Two-bone inverse kinematics chooses the forward-bending knee solution for a foot target. The right leg follows the left by half a cycle. Hips stay low during double support, rise by up to 2.4 pixels over the supporting foot, and settle at the next contact; the supporting leg straightens through mid-stance.

One cycle advances the root 40 pixels. Each foot supports weight for 60% of a cycle, allowing double support at contact without an airborne phase. Its flat footprint origin follows `12 - 40 * legPhase`; root travel cancels this exactly. The shoe lands at 20 degrees with its heel on that footprint, lowers flat during the first 12% of the cycle, and rolls around its fixed toe from 36% through 60%, reaching a 38-degree toe-off. The planted heel or toe stays fixed in world space as the ankle moves around it. Both sole ends remain above the floor.

The other 40% returns the foot forward with eased travel and six pixels of sole clearance. During swing the ankle flexes to bring the toes up for the next heel strike. The ankle is attached three pixels above the unrotated sole; its actual target follows the rotated shoe. Inverse kinematics solves both leg bones from this target. `footPoint` applies the same transform to the shoe geometry and its named heel/toe landmarks.

The six sampled poses are left contact, left support, right passing, right contact, right support and left passing. Playback is 120 ms per pose at 1x. Previous/Next frame wraps through the same poses. Changing speed preserves the current frame. Leaving the panel stops playback; reduced motion starts it paused.

## Arms and right-hand attachments

`src/art/reference-rig.ts` adds arms to the existing walk pose without changing the accepted legs, feet or hip rise. Each arm has a shoulder, elbow, wrist and grip. Nine-pixel upper arms and eight-pixel forearms use two-bone inverse kinematics, with elbows bending back so forearms reach forward. Shoulders and grips stay on their own anatomical side at x = -10 (left) and +10 (right).

Unarmed hands counter-swing against their corresponding legs. Both carrying presets keep the free left arm swinging, while the right hand has a smaller forward/back motion. The lantern hangs below the right grip with a small pendulum swing. The steam lance rests higher, angled forward and down, with its stock behind the grip. These are deliberately simple placeholders rather than replacement character artwork.

Every weapon part uses `weaponPoint` around the right hand's grip; the weapon pose identifies its hand as `right`. The same world-space geometry is projected for all four views. The grip is viewer left in front, viewer right in back, near in right profile and far in left profile. Depth-buffer occlusion lets the torso hide the far arm and portions of the carried weapon naturally. Do not mirror a hand, switch attachment sides or move a weapon toward the camera just to make it visible.

## Review and reuse

The 3x inspector and native six-frame strip use the same layer buffers as the exports. The moving floor follows the root: alternating teal/amber footprints mark fixed heel and toe locations. A supporting foot must roll between those marks across successive frames. The contact readout distinguishes heel, sole, toe and swing. Joint guides expose hips, knees, ankles, heels, toes, shoulders, elbows, wrists, grips and the right-hand weapon attachment. Foot paths show the local trajectory of each ankle. Switching a weapon preserves the current playback/frame state and layer selection.

**Export frame PNG** writes the current visible layers on an 80 x 80 transparent frame. **Export six frames PNG** writes six such frames in a 160 x 240 page. Solo a layer before exporting to obtain that part's complete cycle. Guides, backgrounds and anatomy markers outside the character are excluded. Filenames identify Nell or the mannequin's weapon selection, camera direction and visible layers. **Export pose data** writes the skin/weapon selection, all six leg/arm joint poses, foot origins/pitches, heel/toe landmarks, contact states, the right-hand weapon grip/pitch, root travel, anatomy IDs, camera direction and native anchor as version-4 JSON. These controls do not write campaign saves, inventory or character builds.

To extend this reference, edit part profiles/materials and bone attachment data in the source, review one profile's contacts and passing poses, then inspect the other orientations. Keep the ground-contact pivots fixed and limb lengths constant when changing proportions or stride. New weapons must attach through the right grip rather than derive their hand from screen coordinates.

The lightweight kinematic tests cover support, floor clearance, constant world-space foot contacts, fixed leg/arm lengths, right-hand attachments, anatomical side projection, loop closure, native alpha, head registration, layer isolation and preservation of the armless body. Detailed workshop playback, all three weapon selections and PNG/JSON export checks stay in the manually run browser suite. Production ignores the route and omits its code and controls.
