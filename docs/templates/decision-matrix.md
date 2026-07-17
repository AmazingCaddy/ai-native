# AI 技术判断矩阵

## 使用方法

每完成一天，至少填写或修正一行。“使用条件”和“不使用条件”必须具体到问题，不填写“视情况而定”。成本使用相对值即可，但需要包含工程复杂度。

| 技术/模式 | 解决的问题 | 使用条件 | 不使用条件 | 主要失败模式 | 质量/延迟/成本 | 替代方案 | 项目证据 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Prompt | 让模型理解当前任务 | 任务可由现有模型完成，缺少清晰指令 | 问题来自缺失知识或权限 | 指令冲突、过长、对输入脆弱 | 低/低/低 | Context、RAG、业务代码 | |
| Structured Outputs | 稳定机器可读格式 | 下游依赖固定字段和类型 | 纯面向用户的自由创作 | 结构正确但内容错误 | 高/低/低 | 解析加校验、Tool Calling | |
| Long Context | 一次提供较多相关材料 | 数据量可控且大部分都相关 | 语料持续增长或大量噪声 | 关键信息被淹没、成本高 | 中/中/中高 | RAG、摘要、压缩 | |
| Embedding Search | 按语义召回内容 | 词面不同但含义相近 | 精确 ID、数字和代码检索 | 相似但不能回答问题 | 中/低/中 | 关键词、混合搜索 | |
| Hybrid Search | 同时利用词面与语义 | 企业文档含术语、ID 和自然语言 | 数据很小或单一方法已满足 | 融合权重不合理 | 高/中/中 | 单一搜索、Rerank | |
| RAG | 在推理时提供外部事实 | 知识频繁变化且可检索 | 问题是行为、格式或基础能力不足 | 检索漏召回、引用不支持 | 中高/中/中 | 长上下文、工具、微调 | |
| Tool Calling | 让模型请求外部能力 | 需要实时数据或执行动作 | 固定步骤无需模型选择 | 参数错误、越权、结果注入 | 高/中/中 | 普通函数、Workflow | |
| MCP | 让多个 AI 客户端复用集成 | 工具需要标准发现和独立边界 | 单应用内部少量函数 | 权限配置错误、协议复杂度 | 中/中/中高 | SDK、HTTP API | |
| Workflow | 稳定编排已知步骤 | 路径可预先定义 | 下一步强依赖未知中间结果 | 状态丢失、重复执行 | 高/低/中 | Agent、任务队列 | |
| Agent | 动态选择工具和步骤 | 路径不确定且反馈可验证 | 固定高风险流程 | 循环、越权、成本失控 | 中/高/高 | Workflow、人工处理 | |
| Fine-tuning | 改变模型稳定行为或任务能力 | 有高质量数据和明确评测 | 只是知识更新或 Prompt 不清 | 过拟合、数据污染、维护成本 | 中高/低/高 | Prompt、RAG、蒸馏 | |
| Human in the Loop | 控制高风险或模糊决定 | 错误影响高或判断主观 | 低风险且可确定性校验 | 审批疲劳、责任不清 | 高/高/中 | 自动规则、抽样审核 | |

## 必须能回答的对比

- Prompt vs RAG vs Fine-tuning
- Long Context vs Retrieval
- Keyword vs Vector vs Hybrid Search
- Direct Function vs HTTP API vs MCP
- Workflow vs Agent
- Single Agent vs Multi-Agent
- Cloud Model vs Local Model
- Automatic Action vs Human Approval
- Large Model vs Small Model vs Model Routing
