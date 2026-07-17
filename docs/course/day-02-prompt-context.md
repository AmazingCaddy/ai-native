# Day 2：Prompt、Context 与结构化输出

## 今日目标

- 把 Prompt 从“聊天技巧”理解为应用接口设计
- 区分稳定指令、动态上下文、用户输入和示例
- 用 Schema 获得可校验的结构化输出
- 建立第一个能够自动评测的 AI 功能

## 开始前决策题

1. 哪些要求应放入稳定指令，哪些信息应在每次请求中动态提供？
2. Prompt 已经写得很长但效果不好时，下一步应该继续加规则吗？
3. 结构化输出通过 Schema 校验，是否代表业务内容正确？

## 6 小时时间表

| 时间 | 内容 |
| --- | --- |
| 00:00–00:30 | 回顾 Day 1 失败案例，写今日基线答案 |
| 00:30–01:30 | 阅读 Prompt engineering，整理提示结构 |
| 01:30–02:00 | 阅读 Structured Outputs 的原理和限制 |
| 02:00–02:45 | 完成 Prompt 逐步增强实验 |
| 02:45–05:15 | 实现会议行动项提取功能与测试 |
| 05:15–06:00 | 运行评测、版本化 Prompt、更新地图和复盘 |

## 核心内容

### 推荐的输入结构

1. 目标：需要模型完成什么工作
2. 上下文：完成任务所需的事实材料
3. 约束：不能改变或不能执行的事项
4. 输出：Schema、格式、语言和受众
5. 示例：覆盖容易混淆或失败的边界情况
6. 完成标准：模型或应用应做的最后检查

不要依赖“请认真思考”之类无法验证的要求。把成功条件写成可以检查的数据或行为。

### Context 的组成

- 系统或开发者指令：长期稳定的角色、边界和行为
- 用户输入：当前任务和意图
- 检索内容：当前任务需要的外部事实
- 工具结果：系统执行后返回的真实状态
- 会话历史：只保留会影响当前任务的信息
- 工作记忆：中间结论、计划和待处理事项

### 结构化输出的边界

Schema 可以保证字段、类型和枚举等结构约束，但不能自动保证事实正确。应用仍需执行字段级校验、业务规则校验和必要的人工确认。

## 动手实验：从自由文本到稳定接口

用同一组 10 份会议记录运行四个版本：

1. 只有一句自然语言要求
2. 增加目标、上下文和边界
3. 增加两个正例和一个边界例
4. 增加严格 Schema 与字段说明

建议行动项字段：`title`、`owner`、`due_date`、`evidence`、`confidence`、`needs_confirmation`。

记录以下指标：Schema 通过率、遗漏率、错误负责人数量、捏造日期数量和人工修改时间。

## 主线项目任务

1. 实现 `POST /actions/extract` 或等价入口。
2. 定义行动项 Schema，并由运行时 Schema 库校验。
3. 未出现负责人或截止日期时返回空值，不允许猜测。
4. 为低置信度和信息冲突设置 `needs_confirmation`。
5. 保存 Prompt 版本号和模型调用元数据。
6. 将 10 份样例加入评测集，至少包含：空文本、无任务、多人同名、相对日期和互相冲突的任务。
7. 为解析失败提供稳定错误，不把原始异常直接展示给用户。

## 必读资料

- [OpenAI Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering)
- [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs)

选读：[Anthropic Prompt engineering overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview)。重点比较共性，不背诵提供商特有语法。

## 验收清单

- [ ] 10 个样例的 Schema 通过率为 100%
- [ ] 缺失负责人和日期时不会自动编造
- [ ] Prompt 有明确版本号，可回滚到上一版本
- [ ] 至少记录一个“格式正确但内容错误”的案例
- [ ] 能解释 Prompt 问题、Context 问题和模型能力问题的区别
- [ ] 评测集已开始使用 [模板](../templates/eval-set.md)
