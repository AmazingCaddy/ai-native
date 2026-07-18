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
