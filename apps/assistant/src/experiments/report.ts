import type { ModelRunRecord } from "./types.js";

function cell(value: string | number | undefined): string {
  return value === undefined ? "—" : String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

export function renderMarkdownReport(records: ModelRunRecord[]): string {
  const models = [...new Set(records.map((record) => record.model))];
  const summary = models.map((model) => {
    const modelRecords = records.filter((record) => record.model === model);
    const succeeded = modelRecords.filter((record) => record.status === "succeeded");
    const averageLatency = succeeded.length
      ? Math.round(succeeded.reduce((total, record) => total + record.elapsedMs, 0) / succeeded.length)
      : undefined;
    return `| ${cell(model)} | ${succeeded.length}/${modelRecords.length} | ${cell(averageLatency)} |`;
  });

  const runs = records.map(
    (record) =>
      `| ${cell(record.taskTitle)} | ${cell(record.provider)} | ${cell(record.model)} | ${record.repetition} | ${record.status} | ${record.elapsedMs} | ${cell(record.usage?.inputTokens)} | ${cell(record.usage?.outputTokens)} | 待评分 | 待评分 | 待评分 |`,
  );
  const outputs = records.map(
    (record) =>
      `### ${record.taskTitle} · ${record.model} · 第 ${record.repetition} 次\n\nProvider：${record.provider}\n\n状态：${record.status}\n\n评分标准：${record.criteria.join("；")}\n\n${record.error ? `错误：${record.error}` : record.output}`,
  );

  return `# 模型能力对比实验\n\n> 本实验通过 OpenAI-compatible Responses API 直连模型，不包含 Codex Agent 外壳。\n\n## 自动汇总\n\n| 模型 | 成功次数 | 平均延迟（ms） |\n| --- | ---: | ---: |\n${summary.join("\n")}\n\n## 人工评分表\n\n| 任务 | Provider | 模型 | 次数 | 状态 | 延迟（ms） | 输入 Token | 输出 Token | 正确性 | 格式稳定性 | 主观可用性/失败原因 |\n| --- | --- | --- | ---: | --- | ---: | ---: | ---: | --- | --- | --- |\n${runs.join("\n")}\n\n## 原始输出\n\n${outputs.join("\n\n")}\n`;
}
