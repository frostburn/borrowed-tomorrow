# Layered walk reference

Open `?dev=animation` in Vite or choose **Animation** in the workshop. The armless mannequin is an editable reference for establishing motion before applying character artwork. Its source is deterministic geometry and joint data, with no generated raster poses.

## Parts and coordinate system

`src/dev/reference-actor.ts` defines eight visible layers: head, torso, and separate thigh, shin and foot parts for each anatomical leg. Head includes the face/nose; torso includes the neck. Parts are attached to named hip, knee and ankle joints. Each part can be hidden or shown alone. Teal marks the left leg and amber the right; Anatomy colors switches to neutral clothing.

`src/art/actor-space.ts` defines anatomical right as positive x, forward as positive y and up as positive z. Four camera orientations project the same parts onto an 80 x 80 frame around ground anchor (40,68). Right is viewer left in front, viewer right in back, near in right profile and far in left profile. No part is mirrored to change direction.

`src/art/layered-sprite.ts` rasterizes editable part geometry with a depth buffer. Parts occlude one another according to their actual positions, including when the legs cross. The silhouette has a one-pixel outline. Every output pixel is opaque or transparent; there is no antialiasing or runtime fitting of the frame.

## Gait

`src/art/walk-cycle.ts` owns the motion. Each leg has two fixed 15-pixel bones. Two-bone inverse kinematics chooses the forward-bending knee solution for a foot target. The right leg follows the left by half a cycle. Hips rise by one pixel during mid-support.

One cycle advances the root 40 pixels. Each foot supports weight for 60% of a cycle, allowing double support at contact without an airborne phase. During support its local forward coordinate is `12 - 40 * legPhase`; root travel cancels this exactly, leaving that foot fixed in world space. The other 40% returns the foot forward with eased travel and six pixels of clearance. Ankle height is three pixels above the sole.

The six sampled poses are left contact, left support, right passing, right contact, right support and left passing. Playback is 120 ms per pose at 1x. Previous/Next frame wraps through the same poses. Changing speed preserves the current frame. Leaving the panel stops playback; reduced motion starts it paused.

## Review and reuse

The 3x inspector and native six-frame strip use the same layer buffers as the exports. The moving floor follows the root: alternating teal/amber ground marks represent fixed world contacts. A planted foot must remain on its mark across successive frames. Joint guides expose hips, knees and ankles. Foot paths show the local trajectory of each ankle.

**Export frame PNG** writes the current visible layers on an 80 x 80 transparent frame. **Export six frames PNG** writes six such frames in a 160 x 240 page. Solo a layer before exporting to obtain that part's complete cycle. Guides, backgrounds and anatomy markers outside the character are excluded. **Export pose data** writes all six joint poses, root travel, anatomy IDs, camera direction and the native anchor as JSON. These controls do not write campaign saves, inventory or character builds.

To extend this reference, edit part profiles/materials and bone attachment data in the source, review one profile's contacts and passing poses, then inspect the other orientations. Keep the planted-foot equation and fixed bone lengths when changing proportions or stride. Future right-hand layers should attach on positive anatomical x rather than derive their side from screen coordinates.

The lightweight kinematic tests cover support, floor clearance, constant world-space foot contacts, fixed bone lengths, anatomical side projection, loop closure, native alpha and head registration. Detailed workshop playback, layer isolation and PNG/JSON export checks stay in the manually run browser suite. Production ignores the route and omits its code and controls.
