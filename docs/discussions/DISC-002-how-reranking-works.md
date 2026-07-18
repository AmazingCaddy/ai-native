---
title: DISC-002 Reranker 如何排序
---

# DISC-002：Reranker 如何给候选排序

> 本页保留讨论过程。经过校正的正式结论见 [Day 1 复习材料](../review/day-01-review.md#reranker-如何排序)。

## 元信息

- 来源：Day 1 技术地图
- 创建日期：2026-07-18
- 最近更新：2026-07-18
- 状态：已整理
- 关联概念：Embedding、关键词搜索、RAG、Reranker、相关性
- 整理目标：理解两阶段检索中精排的输入、计算和边界

## 原始问题

> reranker是怎么排序的？

### 追问

> 具体的实战过程中，用的是什么现成的技术吗？

### 追问 2

> 这里是不是还涉及每篇文档的切块呀

## 为什么值得独立讨论

这个问题连接了首次召回、模型打分和 RAG 上下文选择。理解它可以避免误以为 Reranker 会搜索全部文档，或误以为向量相似度就是最终相关性。

## 讨论记录

### 2026-07-18：召回后再精排

检索系统通常先用向量、关键词或混合搜索，从大量文档中快速找出一批候选，例如前 50 条。Reranker 再分别读取“原始问题 + 一个候选文档”，输出相关性分数，然后按分数从高到低排序，只把前几条交给 LLM。

常见 Cross-Encoder Reranker 会将 Query 和候选文档放进同一个 Transformer，使两边 Token 可以充分交互，再通过评分头输出一个标量。它通常使用带有相关/不相关标注的 Query–Document 数据训练，也可以使用成对或列表排序目标。

与 Embedding 检索相比，Reranker 计算更精细但更慢。因此 Embedding 或关键词搜索负责“大范围快速召回”，Reranker 只负责“小范围精排”。

### 2026-07-18：实战技术选项

常见实现不需要自己训练模型：

- 托管 API：Cohere Rerank 接收 `query`、`documents` 和 `top_n`，当前 Rerank 4.0 提供 `fast` 与 `pro` 多语言模型。
- 托管 API：Jina 提供 `https://api.jina.ai/v1/rerank`，包含多语言 Cross-Encoder 和 Listwise Reranker。
- 本地部署：Sentence Transformers 提供 Python `CrossEncoder`、`predict()` 和 `rank()`，可以加载预训练模型在本机或自有服务中运行。

当前 TypeScript 项目推荐先定义与供应商无关的 `Reranker` 接口，Day 6 使用 HTTP 调用托管 API完成第一次实验。这样不需要增加 Python 服务，也能对比“只召回”和“召回 + 精排”。如果之后出现隐私、成本或离线要求，再将实现替换为本地 Cross-Encoder。

核验来源：

- [Cohere Rerank 概览](https://docs.cohere.com/docs/rerank-overview)
- [Cohere Rerank API](https://docs.cohere.com/reference/rerank)
- [Jina Reranker](https://jina.ai/reranker/)
- [Sentence Transformers CrossEncoder](https://sbert.net/docs/cross_encoder/usage/usage.html)

### 2026-07-18：文档切块位于 Reranker 之前

实际 RAG 系统通常不会直接把整篇长文档 Embedding 或交给 Reranker，而是先解析、清洗并切成带元数据的 Chunk。每个 Chunk 单独生成向量并进入索引。查询时先召回 Chunk，再使用“Query + Chunk 文本”进行精排，最后将少量高相关 Chunk 交给 LLM。

Chunk 至少应保存 `documentId`、标题、章节、位置、来源和文本。这样回答时才能合并同一文档的相邻片段，并生成可靠引用。

切块大小没有通用最优值。块过大时，主题混杂、精排成本高且可能被截断；块过小时，上下文容易断裂、候选数量和索引成本增加。当前项目在 Day 6 可以从“按 Markdown 标题和段落切分、每块约 300–500 Token、约 50 Token 重叠”开始，再用评测数据调整。短文档不应为了满足固定大小而强行切碎。

## 阶段性结论

- Reranker 的输入是原始 Query 和已经召回的候选文档。
- 它为每个候选计算相关性分数，再按分数降序排列。
- 分数通常用于相对排序，不一定是经过校准的概率。
- 没有被首次召回的文档，Reranker 无法找回来。
- 文档截断、领域不匹配和候选规模过大可能降低质量或增加延迟。
- 实战中通常直接使用托管 Rerank API 或预训练 Cross-Encoder，而不是从零训练。
- Reranker 通常排序的是已经切分并召回的 Chunk，而不是直接对全部完整文档排序。
- Chunk 大小和重叠是需要通过检索评测调优的参数，不是固定常数。

## 可选深入问题

- [ ] 是否需要用 Day 6 的真实检索结果比较“只有向量召回”和“召回 + Reranker”？

## 下一步

讨论已于 2026-07-18 整理并关闭。Day 6 实现 RAG 时，使用当前评测问题验证精排收益。

## 整理结果

- [Day 1：AI 技术全景复习材料](../review/day-01-review.md#reranker-如何排序)
