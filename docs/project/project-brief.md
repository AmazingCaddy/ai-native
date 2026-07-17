# 主线项目：团队知识与任务助手

## 问题定义

团队知识散落在文档和会议记录中。成员需要反复搜索资料、确认来源、提取行动项并同步到任务系统。项目目标是建立一个小型助手，完成“查到可信信息”和“把信息转成待确认行动”两个闭环。

## 目标用户

- 需要快速查询项目资料的软件工程师
- 需要从会议记录中整理任务的项目负责人
- 需要审查 AI 生成内容和操作记录的团队管理员

## 核心用例

1. 用户导入允许用于实验的文档。
2. 用户提问，系统回答并展示引用片段和文档来源。
3. 用户提交会议记录，系统输出结构化行动项。
4. 用户要求创建任务，系统先预览参数，再请求确认。
5. 用户确认后，系统调用真实或模拟任务工具。
6. 开发者能够查看模型调用、检索结果、工具执行、延迟和成本。

## 两周范围

### 必须完成

- 文档导入、切分、索引和删除
- 带引用的问答
- 会议记录到行动项的结构化提取
- 至少一个只读工具和一个需确认的写工具
- 图片、PDF 页面或音频中的一种多模态输入
- 20 条自动评测用例
- 基础日志、错误处理、成本与延迟记录
- 部署到一个可访问环境

### 明确不做

- 企业级 SSO 和多租户权限
- 大规模爬虫和实时数据同步
- 通用自主 Agent 平台
- 多个 Agent 之间的复杂协作
- 真实任务系统不可用时的强行集成
- 复杂 UI 设计系统

## 建议架构

```text
Web/CLI
  |
Application API
  |-- Model Gateway ------ Model API
  |-- Retrieval Service -- Document/Chunk Store
  |-- Tool Registry ------ Read Tool / Write Tool
  |-- Approval Service --- Pending Actions
  `-- Trace & Eval Store -- Calls / Feedback / Metrics
```

固定业务流程用普通代码表达。只有步骤无法预先确定、且模型确实需要根据中间结果选择下一步时，才进入 Agent 循环。

## 核心数据对象

| 对象 | 最小字段 |
| --- | --- |
| Document | `id`、`title`、`source`、`checksum`、`created_at` |
| Chunk | `id`、`document_id`、`text`、`position`、`metadata`、`embedding` |
| Message | `id`、`conversation_id`、`role`、`content`、`created_at` |
| Citation | `message_id`、`chunk_id`、`quote`、`score` |
| ToolRun | `id`、`tool`、`input`、`status`、`requires_approval`、`result` |
| ModelCall | `id`、`model`、`prompt_version`、`latency_ms`、`input_tokens`、`output_tokens` |
| EvalCase | `id`、`category`、`input`、`expected`、`grader`、`threshold` |

## 关键接口

- `POST /documents`：导入并索引文档
- `DELETE /documents/{id}`：删除文档及索引
- `POST /answers`：检索、生成回答并返回引用
- `POST /actions/extract`：把会议记录转成结构化行动项
- `POST /tools/preview`：生成工具调用预览
- `POST /tools/{runId}/approve`：批准并执行写操作
- `GET /traces/{id}`：查看一次请求的主要步骤和指标
- `POST /feedback`：记录用户反馈

接口名称可以适配现有框架，但能力边界应保持清晰。

## 质量指标

| 指标 | 两周目标 |
| --- | ---: |
| 结构化输出 Schema 通过率 | 100% |
| 有答案问题的引用覆盖率 | >= 90% |
| 无依据问题的正确拒答率 | >= 80% |
| 工具参数校验通过率 | 100% |
| 未确认写操作执行次数 | 0 |
| 20 条核心评测通过率 | >= 80% |
| 每次请求延迟和 Token 可查询 | 100% |

这些是学习项目目标，不应直接当作真实生产系统 SLO。

## 每日增量

| 天 | 项目增量 |
| ---: | --- |
| 1 | 项目骨架、问题定义、10 条初始评测问题 |
| 2 | 行动项结构化提取 |
| 3 | 开发约定、测试和 AI 编程流程 |
| 4 | 可靠模型调用层和流式输出 |
| 5 | 工具注册、参数校验和审批 |
| 6 | 文档索引、检索、回答和引用 |
| 7 | 一种多模态输入 |
| 8 | 端到端自动化工作流 |
| 9 | 有停止条件的 Agent 路径 |
| 10 | 团队 SOP、角色和审计字段 |
| 11 | 来源、状态、确认、反馈和失败交互 |
| 12 | 评测、安全、日志和指标 |
| 13 | 集成测试、部署和回滚准备 |
| 14 | 发布、用户测试和复盘 |
