# PPT_AGENT_BRIEF — Agentic Technology Slides

## Objective
Include a concise section in the final presentation that explains how agentic orchestration enabled this project setup and execution.

## Visual Assets (approved by Bridget)
- `assets/ppt/agentic-state-machine.jpg`
- `assets/ppt/agentic-memory-loop.jpg`

## Slide Requirements
1. **Why Agentic Workflow (1 slide)**
   - Contrast single request-response vs state-machine orchestration
   - Explain retries/recovery/context compaction at a high level

2. **Memory + Continuity (1 slide)**
   - Show how memory consolidation/background loops reduce context collapse
   - Explain why this improves long-running research projects

3. **How This Project Used It (1 slide)**
   - Human control: ClickUp + approvals
   - Runtime control: wake hooks, specialist agents, output contracts
   - Result: faster setup + reproducible pipeline

## Speaker Note Guidance
Keep claims practical and concrete:
- "The agent system handled orchestration, while I stayed in approval/control."
- "Specialist agents reduced setup overhead and made the run structure reproducible."
- "Wake-hook orchestration is more reliable than depending on one active chat loop."

## Design Notes
- Use provided images as background diagrams with minimal overlaid text.
- Headline-first layout: one key claim per slide.
- Keep bullets short (max 4 bullets per slide).
