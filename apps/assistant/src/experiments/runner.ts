import { performance } from "node:perf_hooks";

import type { ModelAdapter, ModelRunRecord, ModelTask } from "./types.js";

type RunExperimentOptions = {
  experimentId: string;
  models: string[];
  repetitions: number;
  tasks: ModelTask[];
  adapter: ModelAdapter;
  onRecord?: (record: ModelRunRecord) => Promise<void> | void;
};

export async function runExperiment(options: RunExperimentOptions): Promise<ModelRunRecord[]> {
  if (options.models.length < 2) {
    throw new Error("At least two models are required for a comparison.");
  }
  if (!Number.isInteger(options.repetitions) || options.repetitions < 1) {
    throw new Error("Repetitions must be a positive integer.");
  }

  const records: ModelRunRecord[] = [];

  for (let repetition = 1; repetition <= options.repetitions; repetition += 1) {
    for (const task of options.tasks) {
      for (const model of options.models) {
        const startedAt = new Date().toISOString();
        const start = performance.now();
        let record: ModelRunRecord;

        try {
          const response = await options.adapter.generate({ model, prompt: task.prompt });
          record = {
            experimentId: options.experimentId,
            taskId: task.id,
            taskTitle: task.title,
            criteria: task.criteria,
            model,
            repetition,
            startedAt,
            elapsedMs: Math.round(performance.now() - start),
            status: "succeeded",
            output: response.output,
            usage: response.usage,
          };
        } catch (error) {
          record = {
            experimentId: options.experimentId,
            taskId: task.id,
            taskTitle: task.title,
            criteria: task.criteria,
            model,
            repetition,
            startedAt,
            elapsedMs: Math.round(performance.now() - start),
            status: "failed",
            output: "",
            error: error instanceof Error ? error.message : String(error),
          };
        }

        records.push(record);
        await options.onRecord?.(record);
      }
    }
  }

  return records;
}
