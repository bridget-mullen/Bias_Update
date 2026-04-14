# DEFINITION_OF_DONE — Quality Gates

## Global DoD
- Reproducible: another operator can run using repo docs/config only.
- Traceable: every result links to model id, prompt version, and image id.
- Comparable: same prompt schema and scoring rubric applied across models.

## Agent-Specific Acceptance

### Data/Prep DoD
- No absolute local paths left in active notebook/pipeline code.
- Smoke and pilot manifests generated and checked.

### Model Runner DoD
- Every model run logs success/failure with reason.
- Missing provider access is explicitly marked (not silently skipped).

### Evaluation DoD
- All scored rows have metric completeness or explicit NA reason.
- Ambiguous scoring examples documented.

### Stats DoD
- Baseline deltas computed for all available comparable metrics.
- Confidence/uncertainty method documented.

### Reporting DoD
- Findings memo includes: key wins, regressions, uncertainty caveats.
- At least one compact model ranking/comparison table.

### PowerPoint Builder DoD
- Deck includes:
  1) Why this update matters
  2) Method and model roster
  3) Pilot design and sample
  4) Results + baseline deltas
  5) Risks/limitations
  6) Recommended next run
- Deck is presentation-ready (clean visuals, minimal text density, clear headline per slide).
