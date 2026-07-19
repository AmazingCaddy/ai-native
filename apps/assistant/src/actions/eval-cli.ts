import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { ZodError } from "zod";

import { loadLocalEnvironment } from "../environment.js";
import { createActionServiceFromEnvironment } from "./config.js";
import { ActionExtractionError } from "./errors.js";
import {
  evaluateActionCase,
  loadActionEvaluationSet,
  summarizeActionEvaluation,
  type ActionEvaluationOutcome,
} from "./eval.js";

const execute = process.argv.includes("--execute");
loadLocalEnvironment();
const datasetPath = join(process.cwd(), "eval", "action-items.json");
const evaluationSet = await loadActionEvaluationSet(datasetPath);
const caseId = process.argv.find((argument) => argument.startsWith("--case="))?.slice("--case=".length);
const selectedCases = caseId
  ? evaluationSet.cases.filter((testCase) => testCase.id === caseId)
  : evaluationSet.cases;

if (selectedCases.length === 0) throw new Error(`Unknown evaluation case: ${caseId}`);

function safeDiagnostic(error: unknown): unknown {
  let current = error;
  while (current instanceof Error) {
    if (current instanceof ZodError) return current.issues;
    if (!("cause" in current) || current.cause === current) break;
    current = current.cause;
  }
  return undefined;
}

if (!execute) {
  console.log(`Validated ${evaluationSet.cases.length} action evaluation cases.`);
  if (caseId) console.log(`Selected case: ${caseId}`);
  console.log("Dry run only. Pass --execute to call the configured provider model.");
} else {
  const service = createActionServiceFromEnvironment(process.env);
  if (!service) {
    throw new Error(
      "Configure FLOWAY_BASE_URL, FLOWAY_API_KEY, and FLOWAY_MODEL (or OPENAI_API_KEY and OPENAI_MODEL) before using --execute.",
    );
  }

  const records = [];
  for (const testCase of selectedCases) {
    let outcome: ActionEvaluationOutcome;
    let rawResponse: unknown = null;
    let diagnostic: unknown;
    try {
      const response = await service.execute(testCase.input, testCase.id);
      rawResponse = response;
      outcome = { response: { actions: response.actions }, errorCode: null };
    } catch (error) {
      if (!(error instanceof ActionExtractionError)) throw error;
      outcome = { response: null, errorCode: error.code };
      diagnostic = safeDiagnostic(error);
    }
    records.push({
      id: testCase.id,
      input: testCase.input,
      expected: testCase.expected,
      response: rawResponse,
      errorCode: outcome.errorCode,
      diagnostic,
      score: evaluateActionCase(testCase, outcome),
    });
  }

  const scores = records.map((record) => record.score);
  const summary = summarizeActionEvaluation(scores);
  const runId = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
  const outputDirectory = join(process.cwd(), "eval", "action-extraction", "results");
  const outputPath = join(outputDirectory, `${runId}.json`);
  const report = { version: evaluationSet.version, runId, summary, records };
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(JSON.stringify({ summary, outputPath }, null, 2));
  if (summary.passedCases !== summary.totalCases) process.exitCode = 1;
}
