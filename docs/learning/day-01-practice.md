---
title: Day 1 应用骨架实践
---

# Day 1：应用骨架实践记录

日期：2026-07-18

## 目标

建立一个不调用模型、不连接数据库，但能够安装、编译、启动和测试的“团队知识与任务助手”骨架。

## 技术决策

- TypeScript + Node.js 24 LTS
- Fastify HTTP 服务
- npm workspaces 管理课程站点和应用
- Node.js `node:test` + `tsx` 执行 TypeScript 测试

内部设计说明保存在 `planning/2026-07-18-assistant-day1-skeleton-design.md`，不发布到学习站点。

## 已完成

- [x] 创建 `apps/assistant/` 独立工作区
- [x] 实现 `GET /health`
- [x] 添加严格 TypeScript 配置
- [x] 添加无需监听端口的 Fastify 请求注入测试
- [x] 添加 `.env.example` 并忽略真实环境文件
- [x] 准备 5 份虚构团队文档
- [x] 准备 3 份虚构会议记录及行动项人工标注
- [x] 准备 10 条问答评测问题，其中 3 条资料中没有答案

## 验证结果

| 验证 | 结果 |
| --- | --- |
| `npm run assistant:typecheck` | 通过 |
| `npm run assistant:test` | 1 个测试通过，0 个失败 |
| `npm run assistant:build` | 通过 |
| `npm run assistant:start` | 成功监听 `127.0.0.1:3001` |
| `GET /health` | HTTP 200，返回服务名、状态和版本 |
| `npm run build` | Docusaurus 站点构建通过 |
| `npm audit` | 0 个已知漏洞 |

健康检查响应：

```json
{
  "status": "ok",
  "service": "team-knowledge-assistant",
  "version": "0.1.0"
}
```

## 尚未完成的 Day 1 验收项

- [ ] 使用两个模型或两种推理设置完成四类任务对比实验
- [ ] 建立包含至少 12 个节点和 10 条关系的第一版技术地图
- [ ] 将当天技术取舍写入判断矩阵
- [ ] 完成 Day 1 每日复盘

这些项目完成前，Day 1 仍处于“进行中”。

## 实践追问：是否升级到 Node.js 24？

### 原始问题

> node版本可以提升到24吗

### 结论

可以，项目开发、CI 和最低运行版本统一升级到 Node.js 24：

- `.nvmrc` 使用主版本 `24`，自动获取该发布线的当前版本。
- 根包和助手应用的 `engines.node` 设置为 `>=24.0`。
- GitHub Pages 构建工作流使用 Node.js 24。
- `@types/node` 与 Node.js 24 对齐。

核验日期：2026-07-18。

- [Node.js 官方发布状态](https://nodejs.org/en/about/previous-releases)：Node.js 24 是 LTS 发布线。
- [Docusaurus 安装要求](https://docusaurus.io/docs/installation)：Docusaurus 3.10.2 要求 Node.js 20.0 或以上。
- [Fastify LTS 政策](https://fastify.dev/docs/latest/Reference/LTS/)：Fastify 在其 LTS 周期内验证 Node.js LTS 发布线；当前仓库也已在 Node.js 24.13.0 上实测通过。

## 实践追问：需要进入应用目录运行吗？

### 原始问题

> 现在这种两层应用的形式，需要cd到apps/assistant 下运行命令吗

### 结论

不需要。这里使用的是 npm workspaces，而不是必须切换目录的“两层应用”。推荐始终在仓库根目录运行：

```bash
npm install
npm run assistant:dev
npm run assistant:test
npm run assistant:typecheck
npm run assistant:build
npm run assistant:start
```

根目录脚本通过 `--workspace @ai-native/assistant` 将命令转发到 `apps/assistant`。如果已经进入该目录，也可以直接运行 `npm run dev`、`npm test` 等局部脚本。依赖安装推荐在根目录执行，以统一维护根目录的 `package-lock.json`。

### 追问：`<package>` 是什么？

#### 原始问题

> npm install后面的 &lt;package&gt; 是什么呀

#### 解释

`<package>` 是文档中的占位符，表示需要新增的真实 npm 包名，不要输入尖括号。例如：

```bash
npm install zod --workspace @ai-native/assistant
npm install @fastify/cors --workspace @ai-native/assistant
```

如果只是安装 `package.json` 已经声明的全部依赖，不需要填写包名：

```bash
npm install
```

当前 Fastify、TypeScript 和测试依赖已经安装，因此现在不需要额外执行带包名的安装命令。

## 实践追问：技术地图是什么？

### 原始问题

> 技术地图具体是什么？

### 解释

技术地图是由“概念节点”和“有含义的关系”组成的认知图，用于回答一种技术在系统中的位置、依赖、用途和边界。只有术语列表不算技术地图。

Day 1 的地图至少包含 Foundation Model、Inference、Token、Context Window、Embedding、Reranker、Prompt、RAG、Tool Calling、Workflow、Agent 和 Eval，并画出至少 10 条带方向或标签的关系。地图完成后，应能在五分钟内从模型层讲到应用层和工程层。

技术地图任务仍未完成；当前问题保持开放，后续共同绘制第一版。

### 技术地图追问：Reranker 如何排序？

#### 原始问题

> reranker是怎么排序的？

#### 记录

该问题涉及两阶段检索和模型相关性打分，已建立独立线程：[DISC-002：Reranker 如何给候选排序](../discussions/DISC-002-how-reranking-works.md)。稳定结论同步整理到 Day 1 正式复习材料。

#### 实战追问

> 具体的实战过程中，用的是什么现成的技术吗？

当前 TypeScript 项目计划在 Day 6 定义供应商无关的 `Reranker` 接口，优先使用 Cohere 或 Jina 的托管 HTTP API完成实验；需要私有部署时，再考虑通过 Sentence Transformers 运行本地 Cross-Encoder。具体选型和来源见 `DISC-002`。

#### 切块追问

> 这里是不是还涉及每篇文档的切块呀

是。实际链路会先把文档解析成带来源和位置元数据的 Chunk，再对 Chunk 生成 Embedding、召回和 Rerank。这个结论和初始切块策略已继续记录在 `DISC-002`。
