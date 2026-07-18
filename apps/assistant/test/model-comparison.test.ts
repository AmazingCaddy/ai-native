import assert from "node:assert/strict";
import { test } from "node:test";

import { parseCodexJsonl } from "../src/experiments/codex-cli-adapter.js";
import { renderMarkdownReport } from "../src/experiments/report.js";
import { runExperiment } from "../src/experiments/runner.js";
import type { ModelAdapter, ModelTask } from "../src/experiments/types.js";

const tasks: ModelTask[] = [
  {
    id: "task-1",
    category: "extraction",
    title: "Task 1",
    prompt: "Prompt 1",
    criteria: ["Criterion 1"],
  },
  {
    id: "task-2",
    category: "grounded-qa",
    title: "Task 2",
    prompt: "Prompt 2",
    criteria: ["Criterion 2"],
  },
];

test("runExperiment executes every task, model, and repetition sequentially", async () => {
  const calls: string[] = [];
  const adapter: ModelAdapter = {
    async generate(request) {
      calls.push(`${request.model}:${request.prompt}`);
      return { output: "ok", usage: { inputTokens: 10, outputTokens: 2 } };
    },
  };

  const records = await runExperiment({
    experimentId: "experiment-1",
    models: ["model-a", "model-b"],
    repetitions: 2,
    tasks,
    adapter,
  });

  assert.equal(records.length, 8);
  assert.deepEqual(calls.slice(0, 4), [
    "model-a:Prompt 1",
    "model-b:Prompt 1",
    "model-a:Prompt 2",
    "model-b:Prompt 2",
  ]);
  assert.ok(records.every((record) => record.status === "succeeded"));
});

test("runExperiment records failures and continues", async () => {
  const adapter: ModelAdapter = {
    async generate(request) {
      if (request.model === "model-a") throw new Error("unavailable");
      return { output: "ok" };
    },
  };

  const records = await runExperiment({
    experimentId: "experiment-2",
    models: ["model-a", "model-b"],
    repetitions: 1,
    tasks: [tasks[0]],
    adapter,
  });

  assert.equal(records[0].status, "failed");
  assert.equal(records[0].error, "unavailable");
  assert.equal(records[1].status, "succeeded");
});

test("parseCodexJsonl extracts the final message and token usage", () => {
  const response = parseCodexJsonl(
    [
      JSON.stringify({ type: "item.completed", item: { type: "agent_message", text: "answer" } }),
      JSON.stringify({
        type: "turn.completed",
        usage: { input_tokens: 12, cached_input_tokens: 4, output_tokens: 3 },
      }),
    ].join("\n"),
  );

  assert.equal(response.output, "answer");
  assert.deepEqual(response.usage, { inputTokens: 12, cachedInputTokens: 4, outputTokens: 3 });
});

test("renderMarkdownReport creates an explicit manual scoring table", () => {
  const report = renderMarkdownReport([
    {
      experimentId: "experiment-3",
      taskId: "task-1",
      taskTitle: "Task 1",
      criteria: ["Criterion 1"],
      model: "model-a",
      repetition: 1,
      startedAt: "2026-07-18T00:00:00.000Z",
      elapsedMs: 120,
      status: "succeeded",
      output: "answer",
    },
  ]);

  assert.match(report, /人工评分表/);
  assert.match(report, /待评分/);
  assert.match(report, /评分标准：Criterion 1/);
  assert.match(report, /相同 Codex Agent 外壳/);
});
