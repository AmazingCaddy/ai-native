---
title: Day 1 问题清单
---

# Day 1：AI 技术全景问题清单

日期：2026-07-18

## 当前主线

- 当前阶段：Day 1 已完成
- 状态：已关闭
- 当前任务：无
- 下一次进入：Day 2 Prompt、Context 与结构化输出

## 问题列表

| ID | 问题 | 状态 | 记录 |
| --- | --- | --- | --- |
| D01-Q01 | LLM、Embedding 模型和 Reranker 的输入与输出分别是什么？ | 已完成 | [学习记录](./day-01-notes.md#q1llmembedding-与-reranker-的输入和输出是什么) |
| D01-Q02 | RAG、Tool Calling 和微调分别改变 AI 系统的哪一部分？ | 已完成 | [学习记录](./day-01-notes.md#q2ragtool-calling-与微调改变什么) |
| D01-Q03 | 为什么模型更大不等于应用效果一定更好？ | 已完成 | [学习记录](./day-01-notes.md#q3为什么模型更大不等于应用效果更好) |
| D01-Q04 | 文档问答中，LLM、Embedding 和 Reranker 如何分工？ | 已完成 | [学习记录](./day-01-notes.md#q4三类模型在文档问答中的分工) |
| D01-Q05 | 频繁变化的知识应该优先使用 RAG 还是微调？为什么？ | 已完成 | [学习记录](./day-01-notes.md#q5频繁变化的知识应该使用-rag-还是微调) |
| D01-Q06 | Token 与 Context Window 分别是什么，它们如何影响应用？ | 已完成 | [学习记录](./day-01-notes.md#q6token-与-context-window-如何影响应用) |
| D01-Q07 | Transformer 和 Attention 解决了什么问题？ | 已完成 | [学习记录](./day-01-notes.md#q7transformer-与-attention-解决什么问题) |
| D01-Q08 | 模型层、应用层和工程层分别包含什么？ | 已完成 | [学习记录](./day-01-notes.md#q8模型层应用层和工程层如何分工) |
| D01-Q09 | 如何设计一个公平、可重复的模型能力对比实验？ | 已完成 | [学习记录](./day-01-notes.md#q9如何公平比较两个模型) |
| D01-Q10 | 主线项目第一天需要建立哪些成功标准和最小骨架？ | 已完成 | [学习记录](./day-01-notes.md#q10第一天应该怎样启动主线项目) |

## 最终验收

| ID | 问题 | 状态 | 记录 |
| --- | --- | --- | --- |
| CHECK-Q01 | 用不超过五句话说明技术地图的三层结构及关键关系。 | 已完成 | [学习记录](./day-01-notes.md#check-q01技术地图口述验收) |

## 技术地图检查问题（辅助，不替代地图）

| ID | 问题 | 状态 | 记录 |
| --- | --- | --- | --- |
| MAP-Q01 | Embedding、RAG 和 Reranker 在文档问答中的先后关系是什么？ | 已完成 | [学习记录](./day-01-notes.md#map-q01embeddingrag-和-reranker-的先后关系) |
| MAP-Q02 | Prompt、RAG 和 Tool Calling 分别给 LLM 带来了什么？ | 备用检查题 | [学习记录](./day-01-notes.md#map-q02promptrag-和-tool-calling-分别带来什么) |
| MAP-Q03 | Workflow、Agent 和 Tool Calling 之间是什么关系？ | 备用检查题 | 待记录 |
| MAP-Q04 | Token、Context Window、Prompt 与 RAG 如何共同限制一次推理？ | 备用检查题 | 待记录 |
| MAP-Q05 | Eval 应该测量技术地图中的哪些节点与关系？ | 备用检查题 | 待记录 |
| MAP-Q06 | 一个 RAG 答案错误时，如何沿技术地图定位故障？ | 备用检查题 | 待记录 |

## 回溯规则

1. 围绕当前问题的短追问继续记录在当天学习记录中。
2. 跨主题、需要详细图表或可能跨天继续的追问，登记到[讨论索引](../discussions/index.md)。
3. 展开讨论结束后，回到“当前主线”中最近的未完成问题。
4. 每日结束时将未完成问题标记为 `延期`，并写明下一次继续位置。
