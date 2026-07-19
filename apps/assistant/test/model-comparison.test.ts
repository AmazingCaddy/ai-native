import assert from "node:assert/strict";
import { test } from "node:test";

import {
  parseComparisonModels,
  resolveComparisonModels,
} from "../src/experiments/config.js";
import { FlowayResponsesAdapter } from "../src/experiments/floway-responses-adapter.js";
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
    provider: "test",
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
  assert.ok(records.every((record) => record.provider === "test"));
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
    provider: "test",
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

test("comparison model list trims values, rejects duplicates, and supports CLI override", () => {
  assert.deepEqual(parseComparisonModels(" model-a, model-b,model-c "), [
    "model-a",
    "model-b",
    "model-c",
  ]);
  assert.throws(() => parseComparisonModels("model-a"), /at least two/);
  assert.throws(() => parseComparisonModels("model-a,model-a"), /duplicate/);
  assert.deepEqual(
    resolveComparisonModels(["--models=cli-a,cli-b"], {
      MODEL_COMPARISON_MODELS: "env-a,env-b",
    }),
    ["cli-a", "cli-b"],
  );
  assert.throws(() => resolveComparisonModels([], {}), /Configure MODEL_COMPARISON_MODELS/);
});

test("Floway Responses adapter returns raw text and usage metadata", async () => {
  let capturedModel: string | undefined;
  let capturedInput: unknown;
  let capturedTimeout: number | undefined;
  const adapter = new FlowayResponsesAdapter(async (request, options) => {
    capturedModel = String(request.model);
    capturedInput = request.input;
    capturedTimeout = options?.timeout;
    return {
      id: "resp_123",
      model: "model-snapshot",
      output_text: "answer",
      usage: {
        input_tokens: 12,
        input_tokens_details: { cached_tokens: 4 },
        output_tokens: 3,
      },
    };
  }, 1_500);

  const response = await adapter.generate({ model: "requested-model", prompt: "question" });

  assert.equal(adapter.provider, "floway-direct");
  assert.equal(capturedModel, "requested-model");
  assert.equal(capturedInput, "question");
  assert.equal(capturedTimeout, 1_500);
  assert.deepEqual(response, {
    output: "answer",
    providerRequestId: "resp_123",
    actualModel: "model-snapshot",
    usage: { inputTokens: 12, cachedInputTokens: 4, outputTokens: 3 },
  });
});

test("renderMarkdownReport creates an explicit manual scoring table", () => {
  const report = renderMarkdownReport([
    {
      experimentId: "experiment-3",
      taskId: "task-1",
      taskTitle: "Task 1",
      criteria: ["Criterion 1"],
      provider: "floway-direct",
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
  assert.match(report, /Responses API 直连模型/);
});

test("direct Floway report explicitly excludes the Codex Agent shell", () => {
  const report = renderMarkdownReport([
    {
      experimentId: "experiment-4",
      taskId: "task-1",
      taskTitle: "Task 1",
      criteria: ["Criterion 1"],
      provider: "floway-direct",
      model: "model-a",
      repetition: 1,
      startedAt: "2026-07-19T00:00:00.000Z",
      elapsedMs: 80,
      status: "succeeded",
      output: "answer",
    },
  ]);

  assert.match(report, /Responses API 直连模型/);
  assert.doesNotMatch(report, /对应结果不代表裸模型 API/);
});
