import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import OpenAI from "openai";

import { loadLocalEnvironment } from "../environment.js";
import { resolveFlowayConnection } from "./config.js";
import { ActionExtractionError, type ActionErrorCode } from "./errors.js";
import {
  evaluateActionCase,
  loadActionEvaluationSet,
  summarizeActionEvaluation,
  type ActionCaseScore,
  type ActionEvaluationOutcome,
} from "./eval.js";
import { OpenAIActionAdapter } from "./openai-adapter.js";
import { buildActionExtractionInput } from "./prompt.js";
import { ACTION_PROMPT_VARIANTS, parseRawJsonOutput } from "./prompt-variants.js";
import { ActionExtractionService } from "./service.js";
import { InMemoryActionTraceStore } from "./trace.js";

type PromptComparisonRecord = {
  variant: string;
  variantTitle: string;
  caseId: string;
  rawOutput: unknown;
  metadata: unknown;
  errorCode: ActionErrorCode | null;
  score: ActionCaseScore;
};

loadLocalEnvironment();

const execute = process.argv.includes("--execute");
const evaluationSet = await loadActionEvaluationSet(
  join(process.cwd(), "eval", "action-items.json"),
);
const model = process.env.FLOWAY_MODEL?.trim();
const totalEvaluations = ACTION_PROMPT_VARIANTS.length * evaluationSet.cases.length;
const inputErrorCases = evaluationSet.cases.filter(
  (testCase) => testCase.expected.error_code !== null,
).length;
const plannedModelCalls = totalEvaluations - ACTION_PROMPT_VARIANTS.length * inputErrorCases;

if (!execute) {
  console.log(
    `计划：${ACTION_PROMPT_VARIANTS.length} 个 Prompt 版本 × ${evaluationSet.cases.length} 个 Case = ${totalEvaluations} 次评估`,
  );
  console.log(`预计模型调用：${plannedModelCalls} 次；输入错误由应用层直接拦截。`);
  console.log(`模型：${model ?? "未配置 FLOWAY_MODEL"}`);
  for (const variant of ACTION_PROMPT_VARIANTS) {
    console.log(`${variant.id}: ${variant.title}${variant.strictSchema ? "（Strict Schema）" : ""}`);
  }
  console.log("这是 dry run，未调用模型。确认后使用 --execute。");
} else {
  const floway = resolveFlowayConnection(process.env);
  if (!floway || !model) {
    throw new Error("FLOWAY_BASE_URL, FLOWAY_API_KEY, and FLOWAY_MODEL are required.");
  }

  const client = new OpenAI({ apiKey: floway.apiKey, baseURL: floway.baseURL });
  const strictService = new ActionExtractionService(
    OpenAIActionAdapter.fromClient(client, { model, provider: "floway" }),
    new InMemoryActionTraceStore(),
  );
  const records: PromptComparisonRecord[] = [];

  for (const variant of ACTION_PROMPT_VARIANTS) {
    for (const testCase of evaluationSet.cases) {
      let outcome: ActionEvaluationOutcome;
      let rawOutput: unknown = null;
      let metadata: unknown = null;

      if (testCase.expected.error_code !== null) {
        outcome = { response: null, errorCode: testCase.expected.error_code };
      } else if (variant.strictSchema) {
        try {
          const response = await strictService.execute(testCase.input, `${variant.id}:${testCase.id}`);
          rawOutput = response.actions;
          metadata = response.meta;
          outcome = { response: { actions: response.actions }, errorCode: null };
        } catch (error) {
          if (!(error instanceof ActionExtractionError)) throw error;
          outcome = { response: null, errorCode: error.code };
        }
      } else {
        try {
          const response = await client.responses.create({
            model,
            instructions: variant.instructions,
            input: buildActionExtractionInput({
              meetingContent: testCase.input.meeting_content,
              currentDate: testCase.input.current_date,
              timezone: testCase.input.timezone,
              outputLanguage: testCase.input.output_language,
            }),
          });
          rawOutput = response.output_text;
          metadata = {
            provider_request_id: response.id,
            model: response.model,
            input_tokens: response.usage?.input_tokens ?? 0,
            output_tokens: response.usage?.output_tokens ?? 0,
          };
          try {
            outcome = { response: parseRawJsonOutput(response.output_text), errorCode: null };
          } catch {
            outcome = { response: response.output_text, errorCode: null };
          }
        } catch {
          outcome = { response: null, errorCode: "MODEL_CALL_FAILED" };
        }
      }

      const score = evaluateActionCase(testCase, outcome);
      records.push({
        variant: variant.id,
        variantTitle: variant.title,
        caseId: testCase.id,
        rawOutput,
        metadata,
        errorCode: outcome.errorCode,
        score,
      });
      console.log(`${variant.id}: ${testCase.id} → ${score.passed ? "passed" : "failed"}`);
    }
  }

  const summaries = ACTION_PROMPT_VARIANTS.map((variant) => ({
    variant: variant.id,
    title: variant.title,
    summary: summarizeActionEvaluation(
      records.filter((record) => record.variant === variant.id).map((record) => record.score),
    ),
  }));
  const runId = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
  const outputDirectory = join(process.cwd(), "eval", "action-prompt-comparison", "results");
  const outputPath = join(outputDirectory, `${runId}.json`);
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    outputPath,
    `${JSON.stringify({ runId, model, evaluationVersion: evaluationSet.version, summaries, records }, null, 2)}\n`,
    "utf8",
  );
  console.log(JSON.stringify({ summaries, outputPath }, null, 2));
}
