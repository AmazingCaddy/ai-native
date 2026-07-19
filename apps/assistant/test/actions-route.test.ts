import assert from "node:assert/strict";
import { test } from "node:test";

import { buildApp } from "../src/app.js";
import { ActionModelError, type ActionExtractionResult } from "../src/actions/openai-adapter.js";
import type { ActionExtractor } from "../src/actions/service.js";
import { ActionExtractionService } from "../src/actions/service.js";
import { InMemoryActionTraceStore } from "../src/actions/trace.js";

const groundedResult: ActionExtractionResult = {
  actions: [
    {
      title: "补支付模块集成测试",
      owner: "李雷",
      due_date: "2026-07-24",
      action_evidence: "李雷下周五前补完支付模块集成测试",
      owner_evidence: "李雷",
      due_date_evidence: "下周五前",
      needs_confirmation: false,
      confirmation_reason: null,
      owner_candidates: [],
      due_date_candidates: [],
    },
  ],
  metadata: {
    provider: "openai",
    providerRequestId: "resp_123",
    model: "model-snapshot",
    promptVersion: "actions-v1",
    schemaVersion: "actions-v1",
    latencyMs: 20,
    inputTokens: 100,
    outputTokens: 25,
  },
};

function createExtractor(
  extract: ActionExtractor["extract"] = async () => groundedResult,
): ActionExtractor {
  return {
    provider: "openai",
    model: "configured-model",
    extract,
  };
}

function createService(extractor = createExtractor()) {
  const traceStore = new InMemoryActionTraceStore();
  const service = new ActionExtractionService(extractor, traceStore);
  return { service, traceStore };
}

const validRequest = {
  meeting_content: "李雷下周五前补完支付模块集成测试",
  current_date: "2026-07-19",
  timezone: "Asia/Shanghai",
  output_language: "zh-CN",
};

test("POST /actions/extract validates evidence and records a successful trace", async (context) => {
  const { service, traceStore } = createService();
  const app = buildApp({ actionService: service });
  context.after(async () => app.close());

  const response = await app.inject({
    method: "POST",
    url: "/actions/extract",
    payload: validRequest,
  });

  assert.equal(response.statusCode, 200);
  const body = response.json();
  assert.deepEqual(body.actions, groundedResult.actions);
  assert.equal(body.meta.provider_request_id, "resp_123");
  assert.equal(body.meta.prompt_version, "actions-v1");
  assert.equal(traceStore.traces.length, 1);
  assert.equal(traceStore.traces[0].requestId, body.request_id);
  assert.equal(traceStore.traces[0].status, "succeeded");
});

test("POST /actions/extract rejects empty input with a stable error", async (context) => {
  const { service, traceStore } = createService();
  const app = buildApp({ actionService: service });
  context.after(async () => app.close());

  const response = await app.inject({
    method: "POST",
    url: "/actions/extract",
    payload: { ...validRequest, meeting_content: "   " },
  });

  assert.equal(response.statusCode, 400);
  assert.equal(response.json().errorCode, "EMPTY_INPUT");
  assert.equal(traceStore.traces[0].status, "failed");
  assert.equal(traceStore.traces[0].errorCode, "EMPTY_INPUT");
});

test("POST /actions/extract rejects ungrounded model evidence", async (context) => {
  const ungroundedResult: ActionExtractionResult = {
    ...groundedResult,
    actions: [{ ...groundedResult.actions[0], action_evidence: "原文中不存在" }],
  };
  const { service, traceStore } = createService(createExtractor(async () => ungroundedResult));
  const app = buildApp({ actionService: service });
  context.after(async () => app.close());

  const response = await app.inject({
    method: "POST",
    url: "/actions/extract",
    payload: validRequest,
  });

  assert.equal(response.statusCode, 422);
  assert.equal(response.json().errorCode, "OUTPUT_GROUNDING_FAILED");
  assert.equal(traceStore.traces[0].errorCode, "OUTPUT_GROUNDING_FAILED");
});

for (const [modelCode, expectedStatus] of [
  ["MODEL_TIMEOUT", 504],
  ["MODEL_OUTPUT_PARSE_FAILED", 502],
  ["MODEL_OUTPUT_SCHEMA_FAILED", 502],
] as const) {
  test(`POST /actions/extract maps ${modelCode} to HTTP ${expectedStatus}`, async (context) => {
    const extractor = createExtractor(async () => {
      throw new ActionModelError(modelCode, "safe model error");
    });
    const { service } = createService(extractor);
    const app = buildApp({ actionService: service });
    context.after(async () => app.close());

    const response = await app.inject({
      method: "POST",
      url: "/actions/extract",
      payload: validRequest,
    });

    assert.equal(response.statusCode, expectedStatus);
    assert.equal(response.json().errorCode, modelCode);
    assert.equal(response.json().errorDescription, "safe model error");
  });
}

test("POST /actions/extract reports missing model configuration", async (context) => {
  const app = buildApp();
  context.after(async () => app.close());

  const response = await app.inject({
    method: "POST",
    url: "/actions/extract",
    payload: validRequest,
  });

  assert.equal(response.statusCode, 503);
  assert.equal(response.json().errorCode, "MODEL_NOT_CONFIGURED");
});
