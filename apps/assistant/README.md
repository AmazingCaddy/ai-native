# 团队知识与任务助手

14 天 AI Native 课程的主线项目。Day 1 只建立可运行、可测试的 Fastify 骨架和合成评测素材。

## 当前能力

- `GET /health`：返回服务状态、名称和版本
- 五份虚构团队文档
- 三份虚构会议记录及人工行动项标注
- 十条初始问答评测问题，其中三条应拒绝回答

## 明确不做

- 主线 Fastify 服务运行时不调用模型 API；模型对比实验作为独立工具显式执行
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

## 验证

```bash
npm run assistant:typecheck
npm run assistant:test
npm run assistant:build
npm run assistant:start
```

## Day 1 模型能力对比实验

先执行 dry run，确认模型、任务和调用次数；该命令不会调用模型：

```bash
npm run assistant:experiment:model-comparison
```

确认会消耗 GitHub Copilot AI Credits 后，再显式执行：

```bash
npm run assistant:experiment:model-comparison -- --execute
```

实验固定比较 `gpt-5.6-sol` 与 `claude-opus-4-7`，包含四类任务，每类重复两次。运行器通过 Codex CLI 复用 Floway 认证，逐条把原始结果写入 `eval/model-comparison/results/*.jsonl`，并生成待人工评分的 Markdown 报告。它比较的是模型在相同 Codex Agent 外壳中的表现，不代表裸模型 API 基准。

若 `codex` 不在 `PATH`，通过 `CODEX_BIN` 指定可执行文件路径。不要把令牌或订阅凭据写入仓库。

## 数据说明

`data/` 和 `eval/` 中的内容均为虚构合成数据，不包含真实公司、客户或个人信息。后续替换真实资料前必须获得授权并脱敏。
