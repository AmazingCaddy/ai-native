import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import type { ModelTask } from "./types.js";

const CODE_SAMPLE = `
export async function retry<T>(
  operation: () => Promise<T>,
  attempts: number,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, attempt * 100));
    }
  }

  throw lastError;
}
`.trim();

export async function loadModelComparisonTasks(appRoot: string): Promise<ModelTask[]> {
  const [meeting, leavePolicy] = await Promise.all([
    readFile(resolve(appRoot, "data/meetings/2026-07-15-atlas-sync.md"), "utf8"),
    readFile(resolve(appRoot, "data/documents/leave-policy.md"), "utf8"),
  ]);

  return [
    {
      id: "meeting-action-items",
      category: "extraction",
      title: "从会议记录提取行动项",
      prompt: `请从下面的会议记录中提取所有行动项。只输出 JSON 数组，每项必须包含 task、owner 和 dueDate；未明确的信息使用 null，不要猜测。\n\n${meeting}`,
      criteria: ["行动项无遗漏", "负责人和日期准确", "输出是合法 JSON", "不猜测缺失字段"],
    },
    {
      id: "explain-retry-code",
      category: "code-explanation",
      title: "解释陌生代码",
      prompt: `请面向熟悉 TypeScript、但第一次看到这段代码的工程师解释其行为。说明控制流程、退避方式，并指出至少两个边界或风险。控制在 300 字以内。\n\n\`\`\`ts\n${CODE_SAMPLE}\n\`\`\``,
      criteria: ["控制流程解释准确", "识别线性退避", "指出至少两个真实边界", "不超过 300 字"],
    },
    {
      id: "grounded-leave-policy",
      category: "grounded-qa",
      title: "根据给定资料回答事实问题",
      prompt: `只能根据给定资料回答问题，并引用支持答案的原句。资料没有答案时必须明确说不知道。\n\n问题：未使用年假最多可以结转多少天？\n\n资料：\n${leavePolicy}`,
      criteria: ["答案为最多 5 天", "包含支持答案的原句", "没有引入资料外事实"],
    },
    {
      id: "clarify-vague-requirement",
      category: "clarification",
      title: "对模糊产品需求提出澄清问题",
      prompt: "产品需求：做一个 AI 助手，帮助团队提高效率。请先不要给方案，只提出最多 8 个高价值澄清问题，并按优先级排序。",
      criteria: ["没有直接给方案", "问题不超过 8 个", "覆盖用户、任务、数据、风险和成功指标", "优先级清晰"],
    },
  ];
}
