# Camera rendering update

- Paint into a retained back buffer; publish only completed Java paint jobs.
- Suspend other VM threads while a paint job is incomplete.
- Schedule paints only at Java update boundaries; coalesce touch camera changes at those boundaries.
- Cache immutable method/field/descriptor lookups without changing game bytecode or game timing.
- Browser animation callback budgets: 8 ms VM plus 4 ms paint, checked every 256 instructions (not hard real-time deadlines).
- Service worker cache refreshed to v12.

Validation: 7 VM tests, framebuffer partial-paint regression, original touch workflow (selection, movement, camera, building, save, groups), 600-callback camera workload. See camera-performance-report.json for measured native Canvas timings.

Limitations: The native Canvas workload produced 109 completed game frames across 10 simulated seconds. The original Java update/repaint cadence remains intact. A requestAnimationFrame callback is not a new game frame; 60 unique FPS has NOT been achieved or verified. Browser/Android GPU performance and visual behavior on the user's device remain untested. No gameplay timing was accelerated to inflate FPS.
