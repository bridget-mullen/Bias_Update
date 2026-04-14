# PHASE1_WIRING

## What is wired now
- Data/Prep wake handler scaffold
- Model Runner wake handler scaffold
- ClickUp status sync (`in development` -> `in review`)
- ClickUp stage comments for run traceability
- Dispatcher integration via `PAPERCLIP_WAKE_DISPATCH_URL` (or per-event command fallback)
- Output-contract verification before stage completion

## Runtime contract
- Input: wake event (`stage`, `taskId`, `runId`)
- Actions:
  1) Set task to `in development`
  2) Run stage handler
  3) Post stage log comments
  4) Set task to `in review`

## Local test
```bash
# Uses PAPERCLIP_WAKE_DISPATCH_URL if set
npx tsx automation/phase1_wake_handlers.ts data_prep 86b9dtetk
npx tsx automation/phase1_wake_handlers.ts model_runner 86b9dtetu

# Or pass a local command fallback explicitly
npx tsx automation/phase1_wake_handlers.ts data_prep 86b9dtetk "python3 scripts/run_data_prep.py"
```

## Next
- Replace placeholder stage logic with real Paperclip worker dispatch calls.
- Add output contract checks before moving to `in review`.
- Enable wake endpoint integration from dashboard dispatcher.
