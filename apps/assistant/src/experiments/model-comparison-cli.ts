import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import OpenAI from "openai";

import { resolveFlowayConnection } from "../actions/config.js";
import { loadLocalEnvironment } from "../environment.js";
import { resolveComparisonModels } from "./config.js";
import { FlowayResponsesAdapter } from "./floway-responses-adapter.js";
import { renderMarkdownReport } from "./report.js";
import { runExperiment } from "./runner.js";
import { loadModelComparisonTasks } from "./tasks.js";

const REPETITIONS = 2;

function experimentId(): string {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

async function main(): Promise<void> {
  loadLocalEnvironment();
  const execute = process.argv.includes("--execute");
  const appRoot = process.cwd();
  const tasks = await loadModelComparisonTasks(appRoot);
  const flowayConnection = resolveFlowayConnection(process.env);
  const models = resolveComparisonModels(process.argv.slice(2), process.env);
  const totalCalls = tasks.length * models.length * REPETITIONS;

  if (!execute) {
    console.log(`计划：${tasks.length} 个任务 × ${models.length} 个模型 × ${REPETITIONS} 次 = ${totalCalls} 次调用`);
    console.log("Adapter：floway-direct");
    console.log(`模型：${models.join(", ")}`);
    console.log("这是 dry run，未调用模型。确认后使用 --execute。 ");
    return;
  }

  if (!flowayConnection) {
    throw new Error("FLOWAY_BASE_URL and FLOWAY_API_KEY are required with --execute.");
  }
  const adapter = FlowayResponsesAdapter.fromClient(
    new OpenAI({
      apiKey: flowayConnection.apiKey,
      baseURL: flowayConnection.baseURL,
    }),
  );

  const id = experimentId();
  const outputDirectory = resolve(appRoot, "eval/model-comparison/results");
  const jsonlPath = resolve(outputDirectory, `${id}.jsonl`);
  const reportPath = resolve(outputDirectory, `${id}.md`);
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(jsonlPath, "", "utf8");

  const records = await runExperiment({
    experimentId: id,
    models,
    repetitions: REPETITIONS,
    tasks,
    adapter,
    onRecord: async (record) => {
      await appendFile(jsonlPath, `${JSON.stringify(record)}\n`, "utf8");
      console.log(`${record.status}: ${record.taskId} / ${record.model} / ${record.repetition}`);
    },
  });

  await writeFile(reportPath, renderMarkdownReport(records), "utf8");
  console.log(`原始结果：${jsonlPath}`);
  console.log(`评分报告：${reportPath}`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
