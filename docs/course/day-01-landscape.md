# Day 1：AI 技术全景

## 今日目标

- 解释训练、推理、Token、Embedding、Context Window 和 Transformer 的基本含义
- 区分模型能力、应用技术和工程基础设施
- 建立第一版 AI 技术地图
- 初始化主线项目，并定义可以评测的成功标准

## 开始前决策题

先用不超过 10 分钟写下答案，结束时再修订：

1. 大语言模型、Embedding 模型和 Reranker 分别返回什么？
2. RAG、Tool Calling 和微调分别改变系统的哪一部分？
3. 为什么“模型更大”不等于“应用效果一定更好”？

## 6 小时时间表

| 时间 | 内容 |
| --- | --- |
| 00:00–00:30 | 写基线答案，列出已经知道和不知道的概念 |
| 00:30–01:30 | 阅读 LLM Course Introduction，建立术语表 |
| 01:30–02:00 | 浏览 Illustrated Transformer，理解 Attention 的信息流 |
| 02:00–02:30 | 浏览 AI application development track 和当前模型指南 |
| 02:30–03:15 | 完成模型能力对比实验 |
| 03:15–05:15 | 初始化主线项目和测试骨架 |
| 05:15–06:00 | 更新技术地图、判断矩阵和复盘 |

## 核心内容

### 模型层

- 基础模型：从大量数据中学习通用模式
- 指令模型：针对遵循自然语言指令进行训练或对齐
- 推理模型：在回答前投入更多计算处理复杂问题
- Embedding 模型：把输入转换为可比较的向量
- Reranker：对一组候选结果重新排序
- 多模态模型：处理文本以外的图片、音频或视频

### 应用层

- Prompt 和 Context 决定模型当前能看到的任务信息
- Structured Outputs 把不稳定文本约束为稳定的数据接口
- RAG 在推理时取回外部知识，不修改模型参数
- Tool Calling 允许模型提出对外部系统的调用请求
- Workflow 用确定性代码组织固定步骤
- Agent 让模型根据中间状态选择后续步骤

### 工程层

- 评测回答“系统是否真的变好”
- Guardrail、权限和人工确认限制高风险行为
- Trace、日志、Token、延迟和成本使问题可诊断
- 缓存、路由、降级和重试改善稳定性与经济性

## 动手实验：能力不是一个分数

选择两个可用模型，或者同一模型的两种推理设置，完成四类任务：

1. 从会议记录提取行动项
2. 解释一段陌生代码
3. 根据给定资料回答事实问题
4. 对一个模糊产品需求提出澄清问题

每项记录：正确性、格式稳定性、延迟、输入/输出 Token、主观可用性和失败原因。不要用单次结果宣布某个模型“更好”。

## 主线项目任务

1. 阅读 [项目说明](../project/project-brief.md)。
2. 创建应用目录、测试目录和项目 README。
3. 写出目标用户、三个核心用例和明确不做的内容。
4. 准备 5 至 10 份安全文档和 3 份会议记录样例。
5. 写下 10 个真实问题，其中至少 3 个在资料中没有答案。
6. 建立最小健康检查或 Hello World 测试，确认项目可重复启动。
7. 添加 `.env.example` 和忽略规则，不提交真实凭据。

## 技术地图任务

使用 [技术地图模板](../templates/technology-map.md)，先添加以下节点：

- Foundation Model
- Inference
- Token
- Context Window
- Embedding
- Reranker
- Prompt
- RAG
- Tool Calling
- Workflow
- Agent
- Eval

每个节点只写一句定义，并至少画出 10 条关系。

## 必读资料

- [Hugging Face LLM Course: Introduction](https://huggingface.co/learn/llm-course/chapter1/1)
- [The Illustrated Transformer](https://jalammar.github.io/illustrated-transformer/)
- [AI app development: Concept to production](https://developers.openai.com/tracks/ai-application-development)
- [Model guidance](https://developers.openai.com/api/docs/guides/latest-model)

选读：[Attention Is All You Need](https://arxiv.org/abs/1706.03762)。本轮只读摘要、架构图和结论。

## 验收清单

- [ ] 能在五分钟内口述技术地图的主要层次
- [ ] 能说明生成模型、Embedding 和 Reranker 的输出差异
- [ ] 模型对比表包含至少四类任务和一个失败案例
- [ ] 主线项目能够启动并运行最小测试
- [ ] 10 个真实问题已经保存为后续评测素材
- [ ] 复盘中修订了开始前的三个答案
