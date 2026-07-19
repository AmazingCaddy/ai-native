# 团队知识与任务助手

14 天 AI Native 课程的主线项目。当前已完成 Day 1 骨架和 Day 2 行动项结构化提取。

## 当前能力

- `GET /health`：返回服务状态、名称和版本
- `POST /actions/extract`：使用版本化 Prompt、Structured Outputs、Zod 和证据校验提取行动项
- 五份虚构团队文档
- 三份虚构会议记录及人工行动项标注
- 十条行动项评测用例与确定性评分器
- 十条初始问答评测问题，其中三条应拒绝回答

## 明确不做

- 未配置完整的 Floway 或 OpenAI-compatible 连接时不调用模型 API；行动项接口返回稳定的未配置错误
- 不实现文档索引或 RAG
- 不执行真实任务系统写操作
- 不实现 Agent 或复杂界面

## 运行

在仓库根目录执行：

```bash
nvm use
npm install
npm run assistant:dev
```

默认监听 `http://127.0.0.1:3001`。验证：

```bash
curl http://127.0.0.1:3001/health
```

使用 Floway 时，在不会提交到 Git 的 `apps/assistant/.env` 中配置：

```bash
FLOWAY_BASE_URL=https://your-floway-endpoint/v1
FLOWAY_API_KEY=...
FLOWAY_MODEL=...
```

`FLOWAY_BASE_URL` 应是兼容 OpenAI Responses API 的 Base URL。应用启动和评测 CLI 会自动读取本地 `.env`；进程环境变量仍然可用。不要把 `.env`、API Key 或真实会议内容提交到仓库。

如需使用其他 OpenAI-compatible 服务，也支持 `OPENAI_BASE_URL`、`OPENAI_API_KEY` 和 `OPENAI_MODEL`。Floway 变量只要出现一个，就必须完整提供三项，应用不会把两个 Provider 的半套配置混合使用。

## 验证

```bash
npm run assistant:typecheck
npm run assistant:test
npm run assistant:build
npm run assistant:start
```

校验 10 条行动项评测数据与评分器，不调用模型：

```bash
npm run assistant:eval:actions
```

显式运行真实模型评测：

```bash
npm run assistant:eval:actions -- --execute
```

真实评测要求配置完整的 Floway 或 OpenAI-compatible 连接，并会产生代理或模型用量。

修改人工标签或评分规则后，可以对已保存的原始结果重新评分，不产生模型调用：

```bash
npm run assistant:eval:actions:regrade -- eval/action-extraction/results/<run>.json
```

## Day 1 模型能力对比实验

模型列表由 `MODEL_COMPARISON_MODELS` 控制，使用逗号分隔：

```bash
MODEL_COMPARISON_MODELS=gpt-5.6-terra,claude-opus-4-7
```

配置几个唯一模型就比较几个，至少需要两个。总调用数为“任务数 × 模型数 × 重复次数”。临时运行可以使用 `--models=...` 覆盖环境变量。

先执行 dry run，确认模型、任务和调用次数；该命令不会调用模型：

```bash
npm run assistant:experiment:model-comparison
```

存在完整 Floway endpoint 和 Key 时，默认使用直连 Responses API。确认会产生模型用量后，再显式执行：

```bash
npm run assistant:experiment:model-comparison -- --execute
```

模型对比只使用 Floway Responses API 直连，不包含 Codex Agent 外壳。实验包含四类任务，每类默认重复两次；运行器逐条把原始结果写入 `eval/model-comparison/results/*.jsonl`，并生成待人工评分的 Markdown 报告。

Day 1 已生成的 Codex CLI 历史结果继续保留，但当前代码不再提供该执行路径。不要把令牌或订阅凭据写入仓库。

## 数据说明

`data/` 和 `eval/` 中的内容均为虚构合成数据，不包含真实公司、客户或个人信息。后续替换真实资料前必须获得授权并脱敏。
