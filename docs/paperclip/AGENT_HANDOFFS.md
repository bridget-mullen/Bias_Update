# AGENT_HANDOFFS — Execution Contracts

Each agent receives assignment context from ClickUp + this repo.

## Agent 1 — Data/Prep
**Input:** `Annotation_Meltdown.ipynb` (legacy), pilot notebook scaffold, dataset source
**Tasks:**
- Replace hardcoded local paths with config-driven paths
- Normalize dataset schema for runner compatibility
- Produce smoke subset (n=20) and pilot subset (n=120)
**Output:** `results/dataset_manifest.csv`, `results/smoke_manifest.csv`

## Agent 2 — Model Runner
**Input:** manifests + `configs/models.yaml`
**Tasks:**
- Run unified prompt across enabled models
- Log raw output, model id, timestamp, image id, failure state
**Output:** `results/model_outputs_raw.jsonl`, `results/model_outputs_clean.csv`

## Agent 3 — Evaluation
**Input:** model output files
**Tasks:**
- Apply scoring rubric for 4 dimensions
- Flag uncertain/ambiguous scoring cases
**Output:** `results/scores.csv`, `results/scoring_notes.md`

## Agent 4 — Stats
**Input:** current scores + prior baseline data
**Tasks:**
- Compute per-model metrics and baseline deltas
- Run significance / confidence interval checks where applicable
**Output:** `results/metrics_summary.csv`, `results/delta_vs_baseline.csv`, `results/stats_notes.md`

## Agent 5 — Reporting
**Input:** summary/delta files + notes
**Tasks:**
- Write concise findings memo
- Build comparison table + chart-ready narrative
**Output:** `results/findings_memo.md`, `results/figures/`

## Agent 6 — PowerPoint Builder
**Input:** all validated outputs
**Tasks:**
- Create final executive presentation
- Include method, model list, pilot design, core results, caveats, next-step plan
**Output:** `results/Bias_Update_2026_Pilot.pptx`

## Handoff Rule
No downstream agent starts until upstream output files exist and pass Definition of Done checks.
