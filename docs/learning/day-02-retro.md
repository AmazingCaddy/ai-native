---
title: Day 2 每日复盘
---

# Day 2：每日复盘

日期：2026-07-19

投入时间：未精确计时；跨知识问答、实现、真实评测与修订

今日主题：Prompt、Context、Structured Outputs 与可验证行动项接口

## 今日产出

- 可运行代码：Floway Responses Adapter、版本化 Prompt、Zod Schema、证据校验、`POST /actions/extract`、稳定错误和 Trace。
- 新增测试与评测：10 条行动项 Case、确定性评分器、真实 Floway 评测、四版本 Prompt 对照 dry run。
- 技术地图：新增 Prompt、动态 Context、Structured Outputs、Zod、证据、业务校验、人工确认、Eval 与 Trace 的完整关系。
- 判断矩阵：补充 Structured Outputs、证据校验、显式不确定性和版本化评测取舍。
- Git：Day 2 主线已提交为 `b6a076f`；后续 Floway 改造和三模型对比已提交为 `f9569ad`。

## 最重要的理解

学习者形成的核心表述是：

> schema只能保证返回的数据格式的正确性，不能保证内容的正确性。

补充后的完整认识：Prompt 与 Schema 要求模型返回最小充分、可验证的声明；应用使用 Zod、原文证据和业务规则验证结果。缺失用 `null`，冲突保留候选与证据，高风险结果必须确认后执行。

## 决策题修订

1. 稳定指令与动态信息：任务定义、Schema 和不得猜测属于版本化稳定规则；会议正文、日期、时区和用户偏好按请求注入。
2. Prompt 很长但效果不好：先用失败样例定位 Prompt、Context、模型或应用层，再删除冲突和重复规则；不盲目追加补丁。
3. Schema 通过是否代表正确：只代表结构满足合同；内容仍需在线证据校验、业务规则、离线 Eval 和必要人工确认。

## 失败案例

- 输入或场景：两位同名“王宁”，会议未说明具体负责人。
- 预期：`owner: null`、`ambiguous_owner`、候选数组为空并进入确认。
- 实际：初版 Schema 没有 `ambiguous_owner`；修订后模型又错误填充不适用的候选数组，Zod 拒绝输出。
- 所属层：Prompt / Schema / 应用。
- 根因：不确定性枚举和候选数组语义不完整。
- 修复：增加 `ambiguous_owner`，在 Prompt 与 Schema description 中明确候选数组只用于明确冲突。
- 是否加入回归评测：是，E09。

第二个失败来自评分器：E08 模型标题“完成测试”未命中字面标签“补测试”。保留原报告后，将人工期望改为稳定语义关键词“测试”并独立重评分，避免把评分器假阴性误判为模型错误。

## 效率与质量

- 自动化：输入、Schema、证据、错误分支和评分器均可重复测试；最终自动测试数量以最新测试运行为准。
- 最终版真实评测：10/10 Case；Schema、证据、Precision、Recall、Owner、Due Date 和确认状态均为 100%；字段捏造 0。
- 边界：样本只有 10 条且评分规则曾在观察输出后修订，必须增加 held-out Case。
- 四版本实验：40 次评估、36 次真实模型调用已完成；通过率从 V1 10%、V2 60%、V3 70% 提升到 V4 100%。

## 明日输入

- 必须带到明天的问题：如何把已实现的 AI 功能纳入可审查、可测试、可回滚的 AI 编程工作流？
- 应停止做的事项：停止用 Prompt 长度代替故障定位；停止把 Schema 通过率当作内容正确率。
- 第一个 30 分钟任务：用 Goal、Context、Constraints、Done when 模板让 AI 修改一个小功能，并比较一次模糊请求与结构化请求的代码质量。
