# 团队知识与任务助手

14 天 AI Native 课程的主线项目。Day 1 只建立可运行、可测试的 Fastify 骨架和合成评测素材。

## 当前能力

- `GET /health`：返回服务状态、名称和版本
- 五份虚构团队文档
- 三份虚构会议记录及人工行动项标注
- 十条初始问答评测问题，其中三条应拒绝回答

## 明确不做

- 不调用模型 API
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

## 数据说明

`data/` 和 `eval/` 中的内容均为虚构合成数据，不包含真实公司、客户或个人信息。后续替换真实资料前必须获得授权并脱敏。
