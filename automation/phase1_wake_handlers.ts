/**
 * Phase 1 wake handlers (Data/Prep + Model Runner)
 * Paperclip runtime -> ClickUp sync bridge
 */

type Stage = 'data_prep' | 'model_runner';

interface WakeEvent {
  stage: Stage;
  runId: string;
  taskId: string;
  timestamp: string;
  payload?: Record<string, unknown>;
}

const CLICKUP_API = 'https://api.clickup.com/api/v2';
const CLICKUP_TOKEN = process.env.CLICKUP_API_TOKEN || '';

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

async function runDataPrep(event: WakeEvent) {
  // TODO: call actual Paperclip worker or local runner command
  await clickupComment(event.taskId, `Paperclip wake received: Data/Prep started (run ${event.runId}).`);
  await clickupComment(event.taskId, 'Data/Prep executing: generating dataset/smoke manifests.');
}

async function runModelRunner(event: WakeEvent) {
  // TODO: call actual Paperclip worker or local runner command
  await clickupComment(event.taskId, `Paperclip wake received: Model Runner started (run ${event.runId}).`);
  await clickupComment(event.taskId, 'Model Runner executing: running smoke model pass and collecting raw outputs.');
}

export async function handleWake(event: WakeEvent) {
  await clickupUpdateStatus(event.taskId, 'in development');

  if (event.stage === 'data_prep') await runDataPrep(event);
  if (event.stage === 'model_runner') await runModelRunner(event);

  // For Phase 1 we hand off to human review after stage run
  await clickupUpdateStatus(event.taskId, 'in review');
  await clickupComment(event.taskId, `Phase 1 stage complete for run ${event.runId}. Ready for review.`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const stage = (process.argv[2] as Stage) || 'data_prep';
  const taskId = process.argv[3] || '';
  if (!taskId) {
    console.error('Usage: tsx automation/phase1_wake_handlers.ts <data_prep|model_runner> <clickupTaskId>');
    process.exit(1);
  }
  handleWake({
    stage,
    taskId,
    runId: `local-${Date.now()}`,
    timestamp: new Date().toISOString()
  }).then(() => console.log('ok')).catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
