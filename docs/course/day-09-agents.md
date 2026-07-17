# Day 9：Agent

## 今日目标

- 准确定义 Agent，并判断什么时候不需要 Agent
- 构建带预算、停止条件、工具边界和人工介入的执行循环
- 区分短期 Context、长期记忆和外部事实库
- 用同一任务比较 Workflow 与 Agent

## 开始前决策题

1. 什么时候“下一步由模型决定”产生的价值大于不确定性？
2. Agent 已经调用工具五次仍未完成，应继续尝试还是停止？
3. 会话历史、用户偏好、任务状态和知识库都应该叫 Memory 吗？

## 6 小时时间表

| 时间 | 内容 |
| --- | --- |
| 00:00–00:25 | 选择一个路径无法完全预先确定的任务 |
| 00:25–01:10 | 阅读 Building effective agents 的 Agent 部分 |
| 01:10–01:45 | 阅读 OpenAI Agents 和 Context engineering |
| 01:45–02:20 | 设计循环、状态、预算和停止条件 |
| 02:20–04:50 | 实现受限 Agent 并加入 Trace |
| 04:50–05:30 | 与 Day 8 Workflow 做对照实验 |
| 05:30–06:00 | 红队测试、更新矩阵和复盘 |

## 核心内容

### 适合 Agent 的条件

- 目标清楚，但完成路径依赖中间结果
- 可用工具能提供真实反馈
- 错误可以检测、限制和恢复
- 任务价值足以覆盖更高的延迟与成本
- 有明确的权限、预算和停止机制

固定审批、数据校验、账务计算和简单流水线优先使用普通工作流。

### 最小 Agent 状态

- Goal：本次任务要达到的结果
- Context：当前必要事实，不是全部历史
- Plan/Next action：下一步候选动作
- Observation：工具或环境返回的事实
- Tool history：已执行动作和结果摘要
- Budget：剩余步骤、时间和 Token
- Completion：完成、失败或需要人工帮助

### Memory 分类

- 工作记忆：当前任务的中间状态
- 情景记忆：过去发生过的任务和结果
- 语义记忆：稳定事实和知识
- 程序记忆：规则、工具说明和操作方法

只有确实影响后续任务的信息才持久化，并为用户提供查看、更正和删除能力。

## 动手实验：Workflow 对比 Agent

使用同一组 5 个任务，分别运行：

1. 固定步骤的 Day 8 Workflow
2. 允许模型选择下一工具的 Agent

比较成功率、工具调用次数、延迟、Token、失败可解释性和人工介入次数。结论可能是 Workflow 更好，这也是有效结果。

## 主线项目任务

实现一个有限目标，例如：“查找支持问题答案的文档；证据不足时再搜索一次；最后回答或拒答”。

必须包含：

1. 显式允许的工具列表。
2. 最大步骤、最大 Token、最大总时间和最大失败次数。
3. 每个工具调用前的权限与参数校验。
4. 写操作的人类审批。
5. 每一步的模型输入摘要、决策、工具结果和状态。
6. 达到预算或重复失败后的明确停止结果。
7. 对工具结果中 Prompt Injection 的防护和测试。

不要在今天引入多 Agent，除非单 Agent 无法表达明确的权限或上下文边界。

## 必读资料

- [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents)
- [OpenAI Agents](https://developers.openai.com/api/docs/guides/agents)

选读：[Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)。

## 验收清单

- [ ] Agent 有明确目标、预算和停止状态
- [ ] 无工具或重复失败时不会无限循环
- [ ] 写工具仍然需要人工批准
- [ ] Workflow 与 Agent 的 5 个任务结果可以对比
- [ ] 已测试工具输出中的恶意指令
- [ ] 能解释为什么当前项目不需要多 Agent
