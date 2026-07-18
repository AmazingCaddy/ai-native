# 团队知识与任务助手 Day 1 骨架设计

## 目标

在现有 Docusaurus 学习站仓库中增加一个独立的 TypeScript + Node.js 应用工作区，证明主线项目可以安装、启动和自动测试。Day 1 不调用模型、不连接数据库，也不实现 RAG、工具调用、Agent 或界面。

## 技术选择

- Node.js 24 LTS，与仓库 `.nvmrc` 和 CI 一致。
- TypeScript，启用严格类型检查。
- Fastify，提供轻量 HTTP 服务和无需监听端口的请求注入测试。
- Node.js 内置 `node:test` 与 `assert`，通过 `tsx` 执行 TypeScript 测试。
- npm workspaces，将课程站点和应用保持在同一仓库但拥有独立包边界。

## 目录与接口

应用位于 `apps/assistant/`：

- `src/app.ts`：构建 Fastify 实例并注册路由，便于测试。
- `src/server.ts`：读取 `HOST`、`PORT` 并启动网络监听。
- `test/health.test.ts`：通过 `app.inject()` 验证 `GET /health`。
- `data/documents/`：五份虚构团队文档。
- `data/meetings/`：三份虚构会议记录。
- `eval/questions.json`：十个问答评测样本，其中三个无答案。
- `eval/action-items.json`：会议行动项的人工参考标注。

`GET /health` 返回稳定 JSON：服务名、`ok` 状态和版本。健康检查不访问外部依赖，因此既能验证进程，也能作为后续部署探针。

## 错误处理与安全

端口必须是合法整数，否则启动失败并输出错误。真实凭据只允许写入被忽略的 `.env`；仓库仅提交 `.env.example`。所有 Day 1 文档均为明确标记的虚构合成数据，后续替换为真实资料时必须先获得授权并脱敏。

## 验收

- `npm run assistant:typecheck` 通过。
- `npm run assistant:test` 通过。
- `npm run assistant:build` 生成可运行 JavaScript。
- 启动后 `GET /health` 返回 HTTP 200 和预期 JSON。
- 学习站 `npm run build` 继续通过。
