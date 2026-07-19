import assert from "node:assert/strict";
import { test } from "node:test";

import { validateActionEvidence } from "../src/actions/evidence.js";
import { ActionModelError, OpenAIActionAdapter } from "../src/actions/openai-adapter.js";
import {
  ACTION_EXTRACTION_INSTRUCTIONS,
  buildActionExtractionInput,
} from "../src/actions/prompt.js";
import {
  ACTION_PROMPT_VARIANTS,
  parseRawJsonOutput,
} from "../src/actions/prompt-variants.js";
import {
  actionSchema,
  extractActionsResponseSchema,
  type ExtractedAction,
  type ExtractActionsResponse,
} from "../src/actions/schema.js";

const completeAction: ExtractedAction = {
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
};

test("action schema accepts fixed nullable fields and rejects omitted values", () => {
  assert.equal(actionSchema.safeParse(completeAction).success, true);

  const missingOwner = {
    ...completeAction,
    owner: null,
    owner_evidence: null,
    due_date: null,
    due_date_evidence: null,
    needs_confirmation: true,
    confirmation_reason: "missing_owner_and_due_date",
  };
  assert.equal(actionSchema.safeParse(missingOwner).success, true);

  const omittedOwner = { ...missingOwner } as Record<string, unknown>;
  delete omittedOwner.owner;
  assert.equal(actionSchema.safeParse(omittedOwner).success, false);
});

test("action schema enforces evidence pairing and conflict candidates", () => {
  assert.equal(
    actionSchema.safeParse({ ...completeAction, owner_evidence: null }).success,
    false,
  );

  const ownerConflict = {
    ...completeAction,
    owner: null,
    owner_evidence: null,
    needs_confirmation: true,
    confirmation_reason: "conflicting_owner",
    owner_candidates: [
      { value: "赵敏", evidence: "赵敏负责补测试" },
      { value: "陈晨", evidence: "负责人应该是陈晨" },
    ],
  };
  assert.equal(actionSchema.safeParse(ownerConflict).success, true);
  assert.equal(
    actionSchema.safeParse({ ...ownerConflict, owner_candidates: ownerConflict.owner_candidates.slice(0, 1) })
      .success,
    false,
  );
});

test("prompt builder separates stable instructions from dynamic context", () => {
  const input = buildActionExtractionInput({
    meetingContent: "李雷：我下周五前补完测试。",
    currentDate: "2026-07-19",
    timezone: "Asia/Shanghai",
  });

  assert.match(ACTION_EXTRACTION_INSTRUCTIONS, /不得猜测负责人或截止日期/);
  assert.match(ACTION_EXTRACTION_INSTRUCTIONS, /不需要新建任务/);
  assert.deepEqual(JSON.parse(input), {
    current_date: "2026-07-19",
    timezone: "Asia/Shanghai",
    output_language: "zh-CN",
    meeting_content: "李雷：我下周五前补完测试。",
  });
});

test("Prompt comparison variants progressively add boundaries, examples, and strict schema", () => {
  assert.deepEqual(
    ACTION_PROMPT_VARIANTS.map((variant) => variant.id),
    ["v1-basic", "v2-boundaries", "v3-few-shot", "v4-structured"],
  );
  assert.deepEqual(
    ACTION_PROMPT_VARIANTS.map((variant) => variant.strictSchema),
    [false, false, false, true],
  );
  assert.doesNotMatch(ACTION_PROMPT_VARIANTS[0].instructions, /保持既有目标/);
  assert.match(ACTION_PROMPT_VARIANTS[1].instructions, /保持既有目标/);
  assert.match(ACTION_PROMPT_VARIANTS[2].instructions, /示例 3/);
  assert.equal(ACTION_PROMPT_VARIANTS[3].instructions, ACTION_EXTRACTION_INSTRUCTIONS);
});

test("raw Prompt variants require directly parseable JSON", () => {
  assert.deepEqual(parseRawJsonOutput('{"actions":[]}'), { actions: [] });
  assert.throws(() => parseRawJsonOutput('```json\n{"actions":[]}\n```'));
});

test("evidence validator rejects quotes that are not in the meeting", () => {
  assert.deepEqual(
    validateActionEvidence("李雷下周五前补完支付模块集成测试", [completeAction]),
    [],
  );

  const errors = validateActionEvidence("支付模块需要补测试", [
    { ...completeAction, action_evidence: "不存在的引文" },
  ]);
  assert.ok(errors.some((error) => error.field === "action_evidence"));
  assert.ok(errors.some((error) => error.field === "owner_evidence"));
  assert.ok(errors.some((error) => error.field === "due_date_evidence"));
});

test("OpenAI adapter submits structured output request and returns metadata", async () => {
  const parsed: ExtractActionsResponse = { actions: [completeAction] };
  let capturedRequest: Record<string, unknown> | undefined;
  let capturedTimeout: number | undefined;
  const adapter = new OpenAIActionAdapter(
    async (request, options) => {
      capturedRequest = request as unknown as Record<string, unknown>;
      capturedTimeout = options?.timeout;
      return {
        id: "resp_123",
        model: "test-model-snapshot",
        output_parsed: parsed,
        usage: { input_tokens: 100, output_tokens: 20 },
      };
    },
    { model: "test-model", timeoutMs: 1_500, maxOutputTokens: 500 },
  );

  const result = await adapter.extract({
    meetingContent: "李雷下周五前补完支付模块集成测试",
    currentDate: "2026-07-19",
    timezone: "Asia/Shanghai",
  });

  assert.equal(capturedRequest?.model, "test-model");
  assert.equal(capturedRequest?.instructions, ACTION_EXTRACTION_INSTRUCTIONS);
  assert.equal(capturedRequest?.max_output_tokens, 500);
  assert.equal(capturedTimeout, 1_500);
  assert.equal(result.metadata.providerRequestId, "resp_123");
  assert.equal(result.metadata.model, "test-model-snapshot");
  assert.equal(result.metadata.inputTokens, 100);
  assert.deepEqual(result.actions, parsed.actions);
  assert.equal(extractActionsResponseSchema.safeParse(parsed).success, true);
});

test("OpenAI adapter rejects responses without parsed output", async () => {
  const adapter = new OpenAIActionAdapter(
    async () => ({
      id: "resp_123",
      model: "test-model",
      output_parsed: null,
      usage: { input_tokens: 10, output_tokens: 2 },
    }),
    { model: "test-model" },
  );

  await assert.rejects(
    adapter.extract({
      meetingContent: "李雷补测试",
      currentDate: "2026-07-19",
      timezone: "Asia/Shanghai",
    }),
    (error: unknown) =>
      error instanceof ActionModelError && error.code === "MODEL_OUTPUT_PARSE_FAILED",
  );
});
