import { ACTION_EXTRACTION_INSTRUCTIONS } from "./prompt.js";

const OUTPUT_FIELDS = `
返回一个 JSON 对象，顶层字段为 actions 数组。每个行动项包含：title、owner、due_date、action_evidence、owner_evidence、due_date_evidence、needs_confirmation、confirmation_reason、owner_candidates、due_date_candidates。缺失负责人或日期时使用 null；没有候选时使用空数组。
`.trim();

const BOUNDARY_RULES = `
行动项必须是尚待执行的具体动作。仅陈述现状、保持既有目标、已经完成的事项或明确“不需要新建任务”的内容不得提取。不得猜测负责人或日期；证据必须逐字复制原文。冲突或歧义必须保留为待确认状态。
`.trim();

const FEW_SHOT_EXAMPLES = `
示例 1：
输入：李雷：我下周五前补完集成测试。
结果：提取一条行动项，并保留负责人、日期和原文证据。

示例 2：
输入：上线日期保持 7 月 30 日，不需要新建任务。
结果：{"actions":[]}

示例 3：
输入：赵敏负责补测试。随后有人说负责人应该是陈晨，但没有最终决定。
结果：owner 为 null，保留两个候选及证据，并标记 needs_confirmation。
`.trim();

export type ActionPromptVariant = {
  id: "v1-basic" | "v2-boundaries" | "v3-few-shot" | "v4-structured";
  title: string;
  instructions: string;
  strictSchema: boolean;
};

export const ACTION_PROMPT_VARIANTS: ActionPromptVariant[] = [
  {
    id: "v1-basic",
    title: "单句自然语言要求",
    instructions: "从会议记录中提取所有行动项，只输出 JSON。",
    strictSchema: false,
  },
  {
    id: "v2-boundaries",
    title: "目标、Context 与边界",
    instructions: `从会议记录中提取行动项。\n\n${BOUNDARY_RULES}\n\n${OUTPUT_FIELDS}`,
    strictSchema: false,
  },
  {
    id: "v3-few-shot",
    title: "增加 Few-shot 边界示例",
    instructions: `从会议记录中提取行动项。\n\n${BOUNDARY_RULES}\n\n${OUTPUT_FIELDS}\n\n${FEW_SHOT_EXAMPLES}`,
    strictSchema: false,
  },
  {
    id: "v4-structured",
    title: "严格 Schema 与字段说明",
    instructions: ACTION_EXTRACTION_INSTRUCTIONS,
    strictSchema: true,
  },
];

export function parseRawJsonOutput(output: string): unknown {
  return JSON.parse(output);
}
