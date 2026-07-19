import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

import type { ActionErrorCode } from "./errors.js";
import {
  evaluateActionCase,
  loadActionEvaluationSet,
  summarizeActionEvaluation,
  type ActionEvaluationOutcome,
} from "./eval.js";

type SavedRecord = {
  id: string;
  response: { actions?: unknown } | null;
  errorCode: ActionErrorCode | null;
};

type SavedReport = {
  runId: string;
  records: SavedRecord[];
};

const resultPath = process.argv[2];
if (!resultPath) throw new Error("Pass the saved result JSON path to regrade.");

const evaluationSet = await loadActionEvaluationSet(
  join(process.cwd(), "eval", "action-items.json"),
);
const savedReport = JSON.parse(await readFile(resultPath, "utf8")) as SavedReport;

const scores = savedReport.records.map((record) => {
  const testCase = evaluationSet.cases.find((candidate) => candidate.id === record.id);
  if (!testCase) throw new Error(`Unknown evaluation case in saved result: ${record.id}`);

  const outcome: ActionEvaluationOutcome =
    record.errorCode === null
      ? { response: { actions: record.response?.actions }, errorCode: null }
      : { response: null, errorCode: record.errorCode };
  return evaluateActionCase(testCase, outcome);
});
const regradedReport = {
  sourceRunId: savedReport.runId,
  evaluationVersion: evaluationSet.version,
  summary: summarizeActionEvaluation(scores),
  scores,
};
const outputPath = resultPath.endsWith(".json")
  ? `${resultPath.slice(0, -".json".length)}.regraded.json`
  : `${resultPath}.regraded.json`;
await writeFile(outputPath, `${JSON.stringify(regradedReport, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      ...regradedReport,
      outputPath,
    },
    null,
    2,
  ),
);
