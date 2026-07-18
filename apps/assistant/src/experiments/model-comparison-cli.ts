import { appendFile, mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { CodexCliAdapter } from "./codex-cli-adapter.js";
import { renderMarkdownReport } from "./report.js";
import { runExperiment } from "./runner.js";
import { loadModelComparisonTasks } from "./tasks.js";

const MODELS = ["gpt-5.6-sol", "claude-opus-4-7"];
const REPETITIONS = 2;

function experimentId(): string {
  return new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
}

async function main(): Promise<void> {
  const execute = process.argv.includes("--execute");
  const appRoot = process.cwd();
  const tasks = await loadModelComparisonTasks(appRoot);
  const totalCalls = tasks.length * MODELS.length * REPETITIONS;

  if (!execute) {
    console.log(`计划：${tasks.length} 个任务 × ${MODELS.length} 个模型 × ${REPETITIONS} 次 = ${totalCalls} 次调用`);
    console.log(`模型：${MODELS.join(", ")}`);
    console.log("这是 dry run，未调用模型。确认后使用 --execute。 ");
    return;
  }

  const id = experimentId();
  const outputDirectory = resolve(appRoot, "eval/model-comparison/results");
  const jsonlPath = resolve(outputDirectory, `${id}.jsonl`);
  const reportPath = resolve(outputDirectory, `${id}.md`);
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(jsonlPath, "", "utf8");

  const records = await runExperiment({
    experimentId: id,
    models: MODELS,
    repetitions: REPETITIONS,
    tasks,
    adapter: new CodexCliAdapter(),
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
