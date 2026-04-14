# MIGRATION_PLAN — ClickUp + Paperclip Wake-Hook Orchestration

## Decision
Adopt **Paperclip wake-hook orchestration** as runtime control plane while retaining **ClickUp** as project management + approval layer.

## Target Architecture

### Control Planes
- **Planning plane (human):** ClickUp
- **Execution plane (agent runtime):** Paperclip wake/webhook dispatcher
- **Worker plane (compute):** OpenClaw/Claude Code worker agents + provider APIs

### Source of Truth
- Task intent/status: ClickUp
- Run state + retries + health: Paperclip runtime logs/dashboard
- Artifacts: GitHub repo (`results/`, `docs/`, exported deck)

---

## Trigger Mapping (v1)

| ClickUp Event | Paperclip Wake Event | Agent | Output Contract |
|---|---|---|---|
| Task -> in development (`[Agent] Data/Prep`) | `wake:data_prep:start` | Data/Prep | `results/dataset_manifest.csv`, `results/smoke_manifest.csv` |
| Data/Prep outputs present | `wake:model_runner:start` | Model Runner | `results/model_outputs_raw.jsonl`, `results/model_outputs_clean.csv` |
| Model outputs present | `wake:evaluation:start` | Evaluation | `results/scores.csv`, `results/scoring_notes.md` |
| Scores present | `wake:stats:start` | Stats | `results/metrics_summary.csv`, `results/delta_vs_baseline.csv` |
| Stats present | `wake:reporting:start` | Reporting | `results/findings_memo.md`, `results/figures/*` |
| Reporting done | `wake:ppt_builder:start` | PowerPoint Builder | `results/Bias_Update_2026_Pilot.pptx` |

---

## Reliability Rules
1. **No silent skip:** every failed step writes a machine-readable failure reason.
2. **Retries:** 3 attempts with backoff (2m, 5m, 15m).
3. **Escalation:** after max retries, set ClickUp task to `in review` + comment with blocker.
4. **Heartbeat role:** monitor-only (stalls, heartbeat health, nudge), not heavy execution.
5. **Idempotency:** wake handlers check if output exists before rerun.

---

## ClickUp Sync Contract

### Status transitions
- `backlog` -> `in development` when wake accepted
- `in development` -> `in review` when output contract complete
- `in review` -> `shipped` after human approval
- Any fatal blocker -> comment + keep `in review` (or `cancelled` by human)

### Required comments per stage
- Start timestamp + run id
- Artifacts produced
- Missing inputs (if blocked)
- Retry attempts summary (if applicable)

---

## Rollout Plan

### Phase 0 — Current (now)
- Manual orchestrator (Wanda) updates ClickUp + runs agents.

### Phase 1 — Semi-automatic
- Add Paperclip wake handlers for Data/Prep + Model Runner.
- Keep Evaluation/Stats/Reporting manual for quality control.

### Phase 2 — Full chain automation
- Enable wake chain through all agents including PPT builder.
- Add failure matrix + on-call alerting for blocked runs.

### Phase 3 — Hardened production
- Dashboard health checks + dead-letter queue
- Daily run digest and weekly reliability report

---

## Required Inputs Before Full Auto
1. Dataset source path/URL for HAM subset
2. Provider keys for all enabled models
3. Final scoring rubric thresholds
4. Human approver identity for final deck signoff

---

## Fallback / Rollback
If wake-chain misfires:
1. Pause wake dispatch for downstream stages.
2. Revert to manual orchestrator mode (current process).
3. Resume from last successful artifact checkpoint.

This avoids re-running whole pipeline unnecessarily.
