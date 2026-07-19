---
title: Day 2 四版本 Prompt 对照报告
---

# Day 2：四版本 Prompt 对照报告

日期：2026-07-19

Provider：Floway，OpenAI-compatible Responses API

模型：`gpt-5.6-terra`

评测集：`actions-eval-v1`，10 条合成 Case

实验规模：4 个 Prompt 版本 × 10 个 Case，共 40 次评估；空输入由应用直接拦截，实际模型调用 36 次

## 版本定义

| 版本 | 增量 |
| --- | --- |
| `v1-basic` | 只有一句自然语言要求：“提取行动项，只输出 JSON” |
| `v2-boundaries` | 增加目标、动态 Context、业务边界和字段要求 |
| `v3-few-shot` | 增加正例、明确否定和冲突边界示例 |
| `v4-structured` | 使用生产版 Prompt、字段说明和 Strict Structured Outputs |

## 结果

| 版本 | Case 通过率 | Schema | 证据 | Precision | Recall | Owner | Due Date | 确认状态 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `v1-basic` | 10% | 0% | 0% | 100%* | 0% | 0% | 0% | 0% |
| `v2-boundaries` | 60% | 66.7% | 66.7% | 100% | 66.7% | 66.7% | 55.6% | 66.7% |
| `v3-few-shot` | 70% | 66.7% | 66.7% | 100% | 66.7% | 66.7% | 66.7% | 66.7% |
| `v4-structured` | 100% | 100% | 100% | 100% | 100% | 100% | 100% | 100% |

\* V1 的 Precision 为 100% 是空分母约定，不代表模型内容全部正确。由于输出没有通过目标 Schema，评分器无法将其行动项与人工参考稳定匹配。

## 失败分析

### V1：自然语言 JSON 不等于接口合同

模型通常返回合法 JSON，但使用顶层数组和自选字段，例如 `action_item`、`assignee`。这说明“只输出 JSON”只能约束大致格式，不能定义稳定字段合同。

### V2：规则改善语义，但结构仍会漂移

目标、Context 和边界使 6/10 Case 通过，但模型将 `confirmation_reason` 写成自由文本，将候选人写成字符串数组，并在同名歧义中填充不适用的日期候选。相对日期 Case 还把 2026-07-19 之后的“下周五”计算成 2026-07-31，而人工约定为 2026-07-24。

### V3：Few-shot 修复部分语义边界

Few-shot 将通过率提高到 70%，并修正了相对日期。但候选对象字段仍从预期的 `value/evidence` 漂移成 `name/evidence`，`confirmation_reason` 仍是自由文本。示例能够教语义模式，不能提供结构硬保证。

### V4：Strict Schema 完成接口收口

最终生产版使用严格 Schema、字段 description、运行时 Zod、原文证据与业务校验，10/10 Case 全部通过。结果证明 Schema 的价值主要是消除结构自由度；内容正确仍来自 Prompt 边界、Context、证据和 Eval 的共同作用。

## 结论

本实验验证了清晰的渐进关系：规则改善任务理解，Few-shot 改善边界案例，Strict Schema 保证字段合同。三者不是替代关系，而是分层组合。

不能只看总通过率：V2/V3 的输出常常“人能看懂”，但应用无法可靠消费；V4 的结构通过也仍需证据和业务校验。

## 可追溯文件

- 原始结果：`apps/assistant/eval/action-prompt-comparison/results/2026-07-19T13-20-45-525Z.json`

## 边界

- 只有一个模型和 10 条合成 Case，不能推广为通用 Prompt 定律。
- 非 Strict 版本使用 `JSON.parse` 和最终 Schema 评分，刻意暴露字段漂移；它们不是针对每个版本分别优化后的最佳 Prompt。
- 后续应增加 held-out Case 和重复运行，观察随机波动与过拟合。
