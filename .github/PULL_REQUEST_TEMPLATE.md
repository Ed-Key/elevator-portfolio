<!-- Every section below gets filled for real. Delete a section only if it
truly does not apply, and say why in Summary. Same convention as PageAura. -->

## Summary

<!-- What changed and why, in plain sentences. One coherent concern per PR. -->

## Risk map

<!-- Declared tier plus which changes are dangerous vs cosmetic. In this repo
the dangerous surfaces are the ride sequence timing, the modal chunk loading,
tuning persistence, and anything touching the deploy path. -->

**Tier**: <!-- low | medium | high -->
**Agent stats**: <!-- active work time, files touched. An hour-plus on a
"simple" change is an architecture smell worth discussing, not just merging. -->

<!-- Review depth convention: low tier = trust the evidence, skim the diff.
medium = read the diff. high = full critical-path trace. -->

## Review focus

<!-- The one or two paths worth tracing end to end, with a time estimate.
Point at files and line ranges, not "see diff". -->

## Verification

<!-- Evidence, not claims: lint and build output status, the browser drive
that was actually performed (there is no test suite here), pixel samples or
console checks where relevant. End with the Vercel preview as the final
check before releasing dev to main. -->

## Media

<!-- Anything with a visual surface gets before/after screenshots or a short
clip, captured during verification. Compact JPEGs (or MP4s, ~2 MB budget)
committed on the PR branch under docs/pr-media/<topic>/ and embedded with
commit-SHA raw URLs (this repo is public, so raw links render inline).
Write "None (no visual surface)" if not applicable. -->
