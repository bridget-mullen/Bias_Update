# AUTOMATION_ARCHITECTURE — Paperclip-Aligned Trigger Design

## Goal
Run specialist agents reliably without overloading heartbeat loops.

## Trigger Layers

### 1) Event/Webhook Triggers (Primary execution)
Use for actual work starts.

- ClickUp task moves to `in development` -> start assigned agent run
- New dataset artifact uploaded -> trigger Data/Prep validation
- New model output file written -> trigger Evaluation agent
- Evaluation complete -> trigger Stats agent
- Stats complete -> trigger Reporting + PowerPoint Builder

### 2) Heartbeat Triggers (Monitoring/orchestration)
Use for lightweight supervision, not heavy compute.

- Check for stuck tasks (> X minutes with no artifact updates)
- Check run health + retry queues
- Post concise progress summaries
- Escalate failures needing human decision

### 3) Cron Triggers (Time-based routines)
Use for scheduled summaries and maintenance.

- Morning briefing status snapshot
- End-of-day project digest
- Nightly memory/report consolidation
- Backup/sync hygiene jobs

## Recommended Workflow for This Project
1. Data/Prep runs by ClickUp status/event trigger
2. Smoke run completion triggers Evaluation
3. Evaluation completion triggers Stats
4. Stats completion triggers Reporting + PowerPoint
5. Heartbeat watches for stalls and alerts

## Why this split works
- Prevents heartbeats from becoming expensive worker loops
- Keeps execution deterministic and auditable
- Preserves recoverability when a single run fails

## Immediate Next Wiring
- [ ] Map each ClickUp agent task ID to a trigger handler
- [ ] Define artifact-ready conditions per agent
- [ ] Add retry policy + failure escalation matrix
- [ ] Add "blocked" status automation when required inputs are missing
