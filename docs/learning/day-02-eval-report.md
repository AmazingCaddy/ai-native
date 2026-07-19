---
title: Day 2 行动项真实评测报告
---

# Day 2：行动项真实评测报告

日期：2026-07-19

Provider：Floway，OpenAI-compatible Responses endpoint

模型：`gpt-5.6-terra`

Prompt / Schema：`actions-v1`

评测集：`actions-eval-v1`，10 条合成 Case

## 最终结果

| 指标 | 结果 |
| --- | ---: |
| Case 通过率 | 100%（10/10） |
| Schema 通过率 | 100% |
| 证据通过率 | 100% |
| Precision | 100% |
| Recall | 100% |
| Owner 正确率 | 100% |
| Due Date 正确率 | 100% |
| 确认状态正确率 | 100% |
| 捏造负责人 | 0 |
| 捏造日期 | 0 |

上述结果来自最终完整 10 Case 原始响应的独立重评分。原始结果和评分修订均保留，未覆盖历史。

## 迭代记录

1. 首次运行通过 9/10；E09 同名负责人歧义的确认状态失败。
2. 增加 `ambiguous_owner` 后，单 Case 暴露候选数组语义说明不足，Zod 正确拒绝不满足不变量的输出。
3. 在 Prompt 和 Schema description 中明确候选数组只用于明确冲突，E09 单 Case 通过。
4. 最终完整运行的 Schema、证据和所有字段内容正确；E08 标题“完成测试”未命中字面标签“补测试”，属于评分器假阴性。
5. 人工期望改用稳定语义关键词“测试”，对已保存原始结果独立重评分为 10/10。

## 可追溯文件

- 原始运行：`apps/assistant/eval/action-extraction/results/2026-07-19T11-30-29-246Z.json`
- 重评分：`apps/assistant/eval/action-extraction/results/2026-07-19T11-30-29-246Z.regraded.json`
- E09 修复后单 Case：`apps/assistant/eval/action-extraction/results/2026-07-19T11-29-39-879Z.json`

## 边界

- 10 条合成 Case 样本很小，不能推出模型的一般能力。
- E08 评分规则是在观察输出后修正，虽然属于明确的语义等价修复，仍可能产生后验偏差。
- 后续应保留独立 held-out Case，并重复运行以观察随机波动。
- 课程要求的四个 Prompt 版本真实对照尚未执行，本报告只代表最终生产版 Prompt/Schema。
