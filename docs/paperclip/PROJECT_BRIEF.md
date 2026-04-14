# PROJECT_BRIEF — Bias Update 2026 (Pilot)

## Objective
Re-run a focused subset of last year’s multimodal LLM bias analysis using updated model versions and compare outcome shifts.

## Research Question
Do newer multimodal foundation models show meaningful changes in bias/error patterns when describing museum images?

## Pilot Scope
- Sample size: 20-image smoke run, then 120-image pilot run.
- Domain: Harvard Art Museum style image set (or closest available subset from prior notebook workflow).
- Comparison: Current-model metrics vs last-year baseline metrics.

## Model Roster (Display Names)
1. GPT-4.5
2. Claude Opus 4.6
3. Gemini 3.0 Pro
4. Llama 4 Maverick
5. Mistral (latest multimodal)
6. Qwen-VL (latest)

Canonical IDs live in: `configs/models.yaml`

## Standard Prompt Constraint
All models receive the same task framing and output schema to reduce prompt-induced confounds.

## Scoring Dimensions
- factual_error_rate
- stereotype_language_rate
- omission_rate
- overconfidence_rate

## Deliverables
1. Pilot results table (model x metric)
2. Baseline delta table
3. Key charts for executive readout
4. Final PowerPoint with methodology, results, interpretation, and limitations
