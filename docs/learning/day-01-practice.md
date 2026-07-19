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

- [x] 使用两个模型或两种推理设置完成四类任务对比实验
- [x] 建立包含至少 12 个节点和 10 条关系的第一版技术地图
- [x] 将当天技术取舍写入判断矩阵
- [x] 完成 Day 1 每日复盘

四项实践产出、技术地图口述验收和最终验证均已完成，Day 1 正式关闭。

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

## 实践追问：`copilot -p` 是什么？

### 原始问题

> copilot -p 是什么意思？

### 解释

`-p` 是 `--prompt` 的缩写，用于非交互模式：执行一次给定 Prompt，完成后退出。

```bash
copilot -p "Respond with exactly: AUTH_OK"
```

不带 `-p` 的 `copilot` 默认进入持续对话的交互模式；`-i` 则进入交互模式并先执行一条初始 Prompt。

`-p` 本身不表示登录、提权或自动批准工具。`--allow-tool web_fetch` 是 Copilot 内部的工具权限；Codex 请求沙箱外执行则是另一层宿主权限，两者不能混为一谈。

### 追问：Codex 自己没有 Web Search 吗？

#### 原始问题

> codex 自己没有web search的能力吗

#### 解释

Codex 有原生 Web Search，并支持 `cached`、`indexed`、`live` 和 `disabled` 模式；`--search` 会启用 live 模式。原生 Web Search 与 shell 命令的网络权限相互独立。

本次会话没有成功使用原生搜索有两个具体原因：当前会话虽然暴露了 Web 工具，但网关返回“search provider is not configured”；同时已安装的 `web-search` 技能明确要求优先调用 Copilot CLI，所以最初走的是 `copilot -p` 路径。Copilot CLI 在沙箱内无法读取 Keychain，申请沙箱外授权后已经验证可用。

官方依据：[Codex Web Search 模式](https://learn.chatgpt.com/docs/agent-approvals-security#web-search-mode)。

## 实践追问：Codex Skill 与符号链接

### 原始问题

> codex的skill怎么设置的？  ~/.codex/skills 目录下好多link过来的skill

### 本机检查结果

- `~/.codex/skills/.system/` 保存 OpenAI 随 Codex 提供的系统技能。
- `run-learning-program/` 是直接安装在该目录中的个人技能。
- 其余大部分条目是符号链接，目标为 `~/Github/mai-agents/plugins/*/skills` 或 `~/Github/mai-agents/skills/local/*/skills`。
- `~/.agents/skills/` 当前为空。

每个技能目录至少包含 `SKILL.md`，其 YAML front matter 中的 `name` 和 `description` 决定技能名称和隐式触发范围。Codex 启动时先加载名称、描述和路径，真正触发后再读取完整说明及其 `scripts/`、`references/` 等资源。

官方当前推荐用户级技能放在 `~/.agents/skills/`，仓库技能放在 `.agents/skills/`。Codex支持符号链接并会跟随目标目录。当前安装还会发现 `~/.codex/skills/`，因此这些 `mai-agents` 链接会出现在本会话技能列表中。

不需要删除链接就能禁用技能。可以在 `~/.codex/config.toml` 添加：

```toml
[[skills.config]]
path = "/absolute/path/to/skill/SKILL.md"
enabled = false
```

修改后重启 Codex。官方依据：[Build skills](https://learn.chatgpt.com/docs/build-skills)。

## 返回主线：技术地图构建

状态：进行中。

### MAP-Q01

请用一句话描述 Embedding、RAG 和 Reranker 在文档问答中的先后关系。

#### 原始回答

> 在创建文档向量数据库的时候，需要对文档切块之后的内容做Embedding，存在向量数据库，RAG检索的时候，对query做Embedding之后，用于向量数据库的查询，之后检索出来top-n发送到reranker做精排，得到top 5之类的结果

#### 判断

正确。回答已经准确区分了离线建库和在线检索，并说明了 Embedding、向量召回与 Reranker 的顺序。

#### 参考答案

文档先切块并通过 Embedding 建立向量索引；查询时也通过同一向量空间的 Embedding 进行 Top-N 初步召回，再由 Reranker 结合 Query 对候选块精排，选出 Top-K 作为上下文交给 LLM 生成答案。

需要补充一个边界：RAG 是整套“检索增强生成”流程，不只是其中的检索动作；Reranker 通常接收 `Query + 候选文本块`，输出相关性分数或排序结果。

#### 一句话记忆

Embedding 负责粗召回，Reranker 负责精排序，RAG 把检索结果送入 LLM 完成增强生成。

#### 复习

- 状态：待复习
- 首次回答日期：2026-07-18
- 下次复习：2026-07-19
- 追问状态：已关闭；用户于 2026-07-18 明确进入下一题

#### 追问 1

> 所以RAG指的是整个完整的过程对吧

对。RAG 的核心在线流程包括检索、上下文增强和 LLM 生成；若说的是完整的 RAG 系统，通常还会把文档解析、切块、Embedding 和索引构建等离线准备过程包括在内。“RAG 检索”只是对其中检索阶段的简称。

### MAP-Q02

在技术地图中，Prompt、RAG 和 Tool Calling 都会影响 LLM 的工作，但作用不同。请分别说明它们给 LLM 带来了什么。

#### 原始回答

> 尚未回答

### 学习流程纠偏：技术地图不应被问答替代

#### 原始问题

> 对了，技术地图 为什么最后变成了 问答题呢

#### 结论

这是学习流程设计偏差：为了满足“知识问答必须留痕”和“开始前列出问题清单”的规则，把原本应产出一张关系图的实践任务拆成了一组问答，导致检查手段取代了实际交付物。

正确分工应该是：

- **技术地图**是实践交付物，需要实际建立节点、关系、分层和边界。
- **问题清单**用于导航讨论和检查理解，不是技术地图本身。
- **问答记录**保存学习过程与误区，不能代替地图的构建和验收。

当前 `MAP-Q02` 尚未作答，不应把它当成技术地图的下一项交付。后续应先共同构建第一版地图，再围绕地图中的关系进行少量检查和修正。

### 追问：技术地图到底长什么样？

#### 原始问题

> 那么技术地图到底长什么样啊

#### 结论

技术地图没有唯一外观。当前任务采用“分层依赖图”：用方框表示技术节点，用带标签的箭头表示依赖、限制、提供、调用和测量等关系，用分组框区分模型层、应用层和工程层。图之外还应保存节点定义、适用边界、失败模式和项目证据。

完整的三层 Mermaid 版本已写入[正式复习资料](../review/day-01-review.md#实践概念什么是技术地图)。

第一版地图包含 12 个节点和 13 条带标签的关系，数量验收通过。技术地图检查题保留为辅助材料，不再作为实践主线逐题执行。

## 下一项实践：模型能力对比实验

### 进入信号

> 接下来做什么

### 任务

选择两个可调用模型，或同一模型的两种推理设置，对会议行动项提取、陌生代码解释、基于资料的事实问答、模糊需求澄清四类任务进行对比。每项记录正确性、格式稳定性、延迟、输入/输出 Token、主观可用性和失败原因，并至少保留一个失败案例。

当前准备项：确认可调用的模型或推理设置。

### 可用模型来源

#### 原始回答

> floway里面配置了github copilot的订阅，有 claude 和 gpt

#### 实验选择

使用 Floway 作为统一调用入口，对比一个 GPT 模型和一个 Claude 模型。这样可以复用现有 GitHub Copilot 订阅，同时保持四类任务、Prompt、输入数据和评测口径一致。

当前 Codex 配置可确认 GPT 模型 ID 为 `gpt-5.6-sol`，Provider 为 `floway`，使用 Responses 协议。用户确认 Claude 模型 ID 为 `claude-opus-4-7`；本轮不记录任何访问令牌或订阅凭据。

### 候选执行方式

1. **Codex CLI + Floway（Day 1 推荐）**：两个模型使用相同的 Codex Agent 外壳、Prompt 和只读环境，输出 JSONL 以统计耗时和 Token。优点是复用现有认证；边界是测到的是“模型在 Codex Agent 外壳中的表现”，不是裸模型 API。
2. **直接调用 Floway Responses API**：实验控制最干净，但需要确认网关连接和认证注入方式，不能把凭据写入仓库。
3. **Floway 界面手工对比**：启动最快，但计时、Token 统计和复现实验较弱。

计划采用方式 1：四类任务 × 两个模型 × 每项两次，共 16 次模型调用。实际执行会消耗 GitHub Copilot AI Credits，因此在调用前单独确认。

### 工程化纠偏：实验是否需要写代码？

#### 原始问题

> 不用写代码吗？

#### 结论

需要。手工或直接执行 16 次命令只能得到一次性结果，无法稳定固定任务、Prompt、运行次数、计时方式和结果结构。Day 1 应先实现最小 TypeScript 实验运行器，并通过 Fake Adapter 测试任务调度和结果记录；测试通过后，再明确授权真实模型调用。

推荐结构为：固定四类任务数据、统一 `ModelAdapter` 接口、首个 Codex CLI Adapter、JSONL 原始结果和 Markdown 汇总。Codex CLI Adapter 可以复用 Floway 的现有认证，但实验结论必须标注为“模型在相同 Codex Agent 外壳中的表现”，不能冒充裸模型 API 基准。

#### 实现结果

已完成 TypeScript 实验运行器：

- 固定四类任务和逐项评分标准。
- 统一 `ModelAdapter` 接口与 Codex CLI Adapter。
- 默认 dry run；只有显式传入 `--execute` 才调用模型。
- 四类任务、两个模型、两次重复，按顺序执行共 16 次。
- 每次结果立即写入 JSONL，实验中断时保留已完成记录。
- 自动生成包含延迟、Token、原始输出和人工评分栏的 Markdown 报告。
- 使用临时空目录和只读沙箱，避免模型读取或修改项目文件。

验证结果：TypeScript 类型检查通过，5 个自动测试全部通过，应用与学习站点构建通过；dry run 正确显示 16 次计划调用且未访问模型。真实模型实验尚未执行，因此尚未消耗本步骤的 Copilot AI Credits。

### 工程追问：当前代码是否直接调用 Floway？

#### 原始问题

> 当前代码有调用 floway的地方吗

#### 回答

没有直接调用。实验代码通过 `child_process.spawn` 启动 `codex exec`，并传入模型 ID；Codex CLI 再读取用户级 `~/.codex/config.toml`。当前用户配置把 `model_provider` 设为 `floway`，因此真实执行时会间接经过 Floway。

调用链为：`TypeScript 实验运行器 → Codex CLI → 用户级 Floway Provider 配置 → Floway → GitHub Copilot 模型`。

这意味着代码没有硬编码 Floway 地址或凭据，安全性和可移植性更好；同时也意味着实验结果依赖运行机器的 Codex 配置。报告必须记录实际 Provider，运行器后续应在执行前增加非敏感配置检查，避免误用其他 Provider。

### 2026-07-19 修订：增加 Floway Responses API 直连轨道

用户确认 Floway 提供 OpenAI-compatible endpoint 和 Key 后，模型对比实验新增 `FlowayResponsesAdapter`。直连轨道复用本地 `.env` 中的 `FLOWAY_BASE_URL` 与 `FLOWAY_API_KEY`，不经过 Codex Agent 外壳。

模型集合使用 Provider 无关的 `MODEL_COMPARISON_MODELS`，按逗号分割、清理空白、拒绝重复并要求至少两个模型。`--models=...` 优先于环境变量，配置几个模型就比较几个；总调用数为任务数 × 模型数 × 重复次数。

当 Floway 连接完整时默认选择直连轨道；`--adapter=codex-cli` 可显式复现旧基线。旧结果与直连结果分别标记 `floway-via-codex-cli` 和 `floway-direct`，不得合并成同一实验结论。

### 2026-07-19 二次修订：移除 Codex CLI 执行路径

用户决定模型对比只保留 Floway Responses API 直连。代码中的 Codex CLI Adapter、`--adapter` 选项和 `CODEX_BIN` 配置已删除；Day 1 已产生的 Codex Agent 外壳结果继续作为历史记录保留，不覆盖、不重写，也不与新的直连结果合并。

### 2026-07-19 Floway 直连三模型实测

使用 `gpt-5.6-terra`、`gpt-5-mini` 和 `claude-sonnet-4-5` 完成 4 类任务 × 2 次重复，共 24 次真实调用，24/24 成功。`gpt-5.6-terra` 平均延迟 3,284 ms，低于 Claude 的 7,014 ms 和 Mini 的 10,294 ms；平均输出 Token 分别为 201、319 和 854。

三个模型在事实问答上均通过；三个模型的代码解释都超过 300 字。行动项提取中 Terra 一次误提、一次准确，Mini 和 Claude 两次都误提既有目标；Claude 两次都添加 Markdown JSON 围栏。完整分析见 [Floway 直连三模型对比报告](./day-01-floway-direct-comparison-report.md)。

### 评测追问：小型文档和简单任务能否区分强模型？

#### 原始问题

> 哦，这样啊。但是现在的模型都是挺强的，你的文档内容才那么点，能看出差距吗

#### 判断

这个质疑正确。当前四个任务很可能产生天花板效应：两个前沿模型都答对，正确性指标接近满分，无法据此得出哪个模型能力更强。

#### 回答

当前实验仍能验证运行器、格式遵循、延迟、Token 使用、输出长度和拒绝猜测等差异，但只能视为烟雾实验，不能作为模型选型基准。增加文档长度并不自动增加区分度；关键是加入能够暴露失败模式的代表性边界样本，例如修正过的行动项、相互冲突的资料、无答案问题、强干扰段落、严格 Schema、隐蔽代码缺陷和受数量限制的澄清问题。

Day 1 的合理边界是先证明评测链路可重复，并明确“不足以下模型强弱结论”。需要做真实模型选型时，再建立每类多个难度等级的 Challenge Set，采用盲评和逐项评分，并覆盖真实业务分布。

### 真实实验执行结果

#### 执行授权

> 那你运行一下真实实验试试？

#### 结果

2026-07-18 完成四类任务、两个模型、两次重复，共 16 次真实调用；16 次全部成功。自动指标、人工评分与关键失败案例见[模型能力对比实验报告](./day-01-model-comparison-report.md)。

- `gpt-5.6-sol`：平均延迟 9435 ms，平均输出 123 Token；8 次均满足当前显式标准。
- `claude-opus-4-7`：平均延迟 10882 ms，平均输出 354 Token；事实问答和需求澄清满足标准，但两次行动项提取都多提取 1 项并添加代码围栏，两次代码解释均超过 300 字限制。
- 两个模型的重复结果都高度一致，说明本次观察到的差异不是单次偶然输出。

结论仅限当前小型烟雾实验：GPT 在格式遵循、简洁性和平均延迟上表现更好；不能据此推断 GPT 的一般能力强于 Claude。不同模型的 Token 统计还受 Tokenizer 和 Agent 上下文影响，不能直接按 Token 数比较成本。

## 实践追问：GitHub Copilot 订阅是否包含 Web Search？

### 原始问题

> github copilot的订阅有web search吗

### 结论

GitHub Copilot CLI 适用于所有 Copilot 计划，但组织提供订阅时需要管理员启用 CLI 策略。CLI 明确内置 `web_fetch`，用于读取指定网页；当前本机 Copilot CLI 1.0.72 还通过内置 GitHub MCP 暴露 `web_search`，用于按查询搜索网页。

GitHub 官方计划页面没有把 Web Search 单独列为独立订阅权益，因此其实际可用性还可能受 CLI 版本、组织策略、GitHub MCP 策略和 AI Credits 余额影响。Copilot CLI 的每次交互会按处理 Token 消耗 AI Credits。

核验日期：2026-07-18。

- [About GitHub Copilot CLI](https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-copilot-cli)
- [Configuring GitHub Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/set-up-copilot-cli/configure-copilot-cli)
