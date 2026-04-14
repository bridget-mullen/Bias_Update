/**
 * Phase 1 wake handlers (Data/Prep + Model Runner)
 * Paperclip runtime -> ClickUp sync bridge
 */

import { access } from 'node:fs/promises';
import { constants } from 'node:fs';
import { exec } from 'node:child_process';

type Stage = 'data_prep' | 'model_runner';

interface WakeEvent {
  stage: Stage;
  runId: string;
  taskId: string;
  timestamp: string;
  payload?: {
    dispatcherEventName?: string;
    dispatcherUrl?: string;
    dispatcherToken?: string;
    command?: string;
  } & Record<string, unknown>;
}

const CLICKUP_API = 'https://api.clickup.com/api/v2';
const CLICKUP_TOKEN = process.env.CLICKUP_API_TOKEN || '';
const DEFAULT_DISPATCH_URL = process.env.PAPERCLIP_WAKE_DISPATCH_URL || '';
const DEFAULT_DISPATCH_TOKEN = process.env.PAPERCLIP_WAKE_DISPATCH_TOKEN || '';

const OUTPUT_CONTRACT: Record<Stage, string[]> = {
  data_prep: ['results/dataset_manifest.csv', 'results/smoke_manifest.csv'],
  model_runner: ['results/model_outputs_raw.jsonl', 'results/model_outputs_clean.csv']
};

async function clickupUpdateStatus(taskId: string, status: string) {
  if (!CLICKUP_TOKEN) throw new Error('Missing CLICKUP_API_TOKEN');
  await fetch(`${CLICKUP_API}/task/${taskId}`, {
    method: 'PUT',
    headers: {
      Authorization: CLICKUP_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ status })
  });
}

async function clickupComment(taskId: string, text: string) {
  if (!CLICKUP_TOKEN) throw new Error('Missing CLICKUP_API_TOKEN');
  await fetch(`${CLICKUP_API}/task/${taskId}/comment`, {
    method: 'POST',
    headers: {
      Authorization: CLICKUP_TOKEN,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ comment_text: text, notify_all: false })
  });
}

function execAsync(command: string): Promise<void> {
  return new Promise((resolve, reject) => {
    exec(command, { cwd: process.cwd() }, (error, _stdout, stderr) => {
      if (error) return reject(new Error(stderr || error.message));
      resolve();
    });
  });
}

async function dispatchToPaperclip(event: WakeEvent) {
  const dispatcherUrl = (event.payload?.dispatcherUrl as string | undefined) || DEFAULT_DISPATCH_URL;
  const dispatcherToken = (event.payload?.dispatcherToken as string | undefined) || DEFAULT_DISPATCH_TOKEN;
  const dispatcherEventName = (event.payload?.dispatcherEventName as string | undefined) || `wake:${event.stage}:start`;

  if (dispatcherUrl) {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (dispatcherToken) headers.Authorization = `Bearer ${dispatcherToken}`;

    const res = await fetch(dispatcherUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        event: dispatcherEventName,
        runId: event.runId,
        taskId: event.taskId,
        stage: event.stage,
        timestamp: event.timestamp,
        payload: event.payload || {}
      })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Dispatcher call failed (${res.status}): ${text}`);
    }
    return;
  }

  const command = event.payload?.command;
  if (typeof command === 'string' && command.trim()) {
    await execAsync(command);
    return;
  }

  throw new Error('No dispatcher configured. Set PAPERCLIP_WAKE_DISPATCH_URL or payload.command');
}

async function verifyOutputs(stage: Stage): Promise<{ ok: boolean; missing: string[] }> {
  const expected = OUTPUT_CONTRACT[stage];
  const missing: string[] = [];

  for (const path of expected) {
    try {
      await access(path, constants.F_OK);
    } catch {
      missing.push(path);
    }
  }

  return { ok: missing.length === 0, missing };
}

export async function handleWake(event: WakeEvent) {
  await clickupUpdateStatus(event.taskId, 'in development');
  await clickupComment(event.taskId, `Paperclip wake accepted: ${event.stage} (run ${event.runId}).`);

  try {
    await dispatchToPaperclip(event);
    const check = await verifyOutputs(event.stage);

    if (!check.ok) {
      await clickupComment(
        event.taskId,
        `Stage ran but output contract is incomplete. Missing: ${check.missing.join(', ')}`
      );
      await clickupUpdateStatus(event.taskId, 'in review');
      return;
    }

    await clickupComment(event.taskId, `Output contract verified for ${event.stage}.`);
    await clickupUpdateStatus(event.taskId, 'in review');
    await clickupComment(event.taskId, `Phase 1 stage complete for run ${event.runId}. Ready for review.`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await clickupComment(event.taskId, `Stage failed: ${message}`);
    await clickupUpdateStatus(event.taskId, 'in review');
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const stage = (process.argv[2] as Stage) || 'data_prep';
  const taskId = process.argv[3] || '';
  const command = process.argv[4] || '';

  if (!taskId) {
    console.error('Usage: tsx automation/phase1_wake_handlers.ts <data_prep|model_runner> <clickupTaskId> [command]');
    process.exit(1);
  }

  handleWake({
    stage,
    taskId,
    runId: `local-${Date.now()}`,
    timestamp: new Date().toISOString(),
    payload: command ? { command } : {}
  })
    .then(() => console.log('ok'))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
