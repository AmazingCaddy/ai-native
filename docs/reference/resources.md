# 资料索引

更新时间：2026-07-17。

筛选原则：官方文档和原始论文优先；实践指南优先于营销文章；每个主题只保留少量高信号资料。课程内标为“必读”的材料控制在每天约 60 至 90 分钟。

## 基础模型与技术地图

| 资料 | 用途 | 建议 |
| --- | --- | --- |
| [AI app development: Concept to production](https://developers.openai.com/tracks/ai-application-development) | 从模型到生产应用的完整路径 | 核心，先浏览全篇 |
| [Model guidance](https://developers.openai.com/api/docs/guides/latest-model) | 当前模型选择原则 | 核心，选模型时复查 |
| [Hugging Face LLM Course: Introduction](https://huggingface.co/learn/llm-course/chapter1/1) | Transformer、LLM 与生态概览 | 核心，45 分钟 |
| [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/) | 用图理解 Attention 和 Transformer | 核心，30 分钟 |
| [Attention Is All You Need](https://arxiv.org/abs/1706.03762) | Transformer 原始论文 | 选读，不要求推导公式 |

## Prompt 与 Context

| 资料 | 用途 | 建议 |
| --- | --- | --- |
| [OpenAI Prompt engineering](https://developers.openai.com/api/docs/guides/prompt-engineering) | Prompt 结构、示例与上下文策略 | 核心 |
| [OpenAI Structured Outputs](https://developers.openai.com/api/docs/guides/structured-outputs) | 用 JSON Schema 约束模型输出 | 核心 |
| [Anthropic Prompt engineering overview](https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview) | 从另一模型提供商视角理解 Prompt | 选读 |
| [Effective context engineering for AI agents](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents) | Context 的选择、压缩与组织 | 第 9 天复读 |

## AI 编程

| 资料 | 用途 | 建议 |
| --- | --- | --- |
| [Codex best practices](https://learn.chatgpt.com/guides/best-practices) | 目标、上下文、约束、完成标准、测试和 Review | 核心 |
| [Codex prompting](https://learn.chatgpt.com/docs/prompting) | 编写可执行任务描述 | 核心 |
| [GitHub Copilot best practices](https://docs.github.com/en/copilot/get-started/best-practices) | AI 编程的通用使用与审查原则 | 选读 |

## 模型 API、工具与 MCP

| 资料 | 用途 | 建议 |
| --- | --- | --- |
| [Streaming API responses](https://developers.openai.com/api/docs/guides/streaming-responses) | 理解流式事件与增量 UI | 核心 |
| [Using tools](https://developers.openai.com/api/docs/guides/tools) | Tool Calling 的调用循环与安全边界 | 核心 |
| [MCP and Connectors](https://developers.openai.com/api/docs/guides/tools-connectors-mcp) | 在模型 API 中使用 MCP | 选读 |
| [Model Context Protocol repository](https://github.com/modelcontextprotocol/modelcontextprotocol) | MCP 规范与官方文档入口 | 核心 |

## Embedding、搜索与 RAG

| 资料 | 用途 | 建议 |
| --- | --- | --- |
| [Vector embeddings](https://developers.openai.com/api/docs/guides/embeddings) | Embedding 的用途、距离与限制 | 核心 |
| [Retrieval](https://developers.openai.com/api/docs/guides/retrieval) | Vector Store、检索参数与结果合成 | 核心 |
| [pgvector](https://github.com/pgvector/pgvector) | 在 PostgreSQL 中保存和搜索向量 | 选读，需要数据库时使用 |

## 多模态

| 资料 | 用途 | 建议 |
| --- | --- | --- |
| [Images and vision](https://developers.openai.com/api/docs/guides/images-vision) | 图片输入、理解和限制 | 核心 |
| [File inputs](https://developers.openai.com/api/docs/guides/file-inputs) | PDF 和其他文件作为模型输入 | 核心或按项目选读 |
| [Speech to text](https://developers.openai.com/api/docs/guides/speech-to-text) | 音频转写与流式转写 | 核心或按项目选读 |

## 自动化与 Agent

| 资料 | 用途 | 建议 |
| --- | --- | --- |
| [Building effective agents](https://www.anthropic.com/engineering/building-effective-agents) | Workflow、Agent 及常见编排模式 | 核心 |
| [OpenAI Agents](https://developers.openai.com/api/docs/guides/agents) | Agent、工具、知识、逻辑和 SDK | 核心 |
| [n8n Advanced AI](https://docs.n8n.io/advanced-ai/) | 可视化 AI 工作流和集成 | 选读 |
| [n8n AI tutorial](https://docs.n8n.io/advanced-ai/intro-tutorial/) | 从零搭建一个 AI 工作流 | 选做 |
| [Temporal overview](https://docs.temporal.io/temporal) | Durable Execution、重试和长任务状态 | 选读 |

## AI 产品与用户体验

| 资料 | 用途 | 建议 |
| --- | --- | --- |
| [Google PAIR Guidebook](https://pair.withgoogle.com/guidebook/) | 以用户为中心设计 AI 产品 | 核心 |
| [Microsoft HAX Guidelines](https://www.microsoft.com/en-us/haxtoolkit/ai-guidelines/) | AI 交互的 18 条设计准则 | 核心 |

## 评测、安全与生产工程

| 资料 | 用途 | 建议 |
| --- | --- | --- |
| [Evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices) | 评测设计、对比和评分方法 | 核心 |
| [Safety best practices](https://developers.openai.com/api/docs/guides/safety-best-practices) | 安全检查、人工介入和对抗测试 | 核心 |
| [Production best practices](https://developers.openai.com/api/docs/guides/production-best-practices) | 上线前的安全、扩展和成本控制 | 核心 |
| [OWASP Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/) | Prompt Injection 等常见应用风险 | 核心 |
| [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) | 组织层面的 AI 风险管理框架 | 选读 |
| [OpenTelemetry GenAI semantic conventions](https://github.com/open-telemetry/semantic-conventions-genai) | GenAI Trace、Metric 和事件语义 | 选读 |
| [The Twelve-Factor App](https://12factor.net/) | 配置、日志和部署的通用基础 | 选读 |

## 资料使用规则

- 官方页面发生变化时，以页面内最新 SDK 示例和迁移说明为准。
- 不复制粘贴过时的模型名称；通过配置选择当前可用模型。
- 不因教程使用某个框架就默认项目也需要该框架。
- 阅读任何文章后，都要补充“适用场景、失败模式、替代方案”三项笔记。
- 需要最新价格、配额或模型可用性时，单独查询提供商官方页面，不依赖本课程中的静态信息。
