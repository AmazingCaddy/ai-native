# AI Native

面向软件工程师的 14 天 AI Native 学习站，覆盖模型、Prompt、Context、RAG、工具、MCP、Agent、自动化、AI 产品、评测、安全和生产工程。

站点使用 [Docusaurus](https://docusaurus.io/) 构建，支持 Mermaid 图表、Markdown/MDX 文档和 GitHub Pages 自动部署。

## 本地预览

```bash
nvm use
npm ci
npm run start
```

默认地址是 `http://localhost:3000/ai-native/`。

## 构建

```bash
npm run build
```

构建产物输出到 `build/`。

## 内容结构

- `docs/course/`：14 天每日课程
- `docs/project/`：主线项目说明
- `docs/reference/`：资料索引
- `docs/templates/`：技术地图、判断矩阵、复盘和评测模板
- `planning/`：不发布到网站的内部计划
- `static/downloads/`：可下载资料

## GitHub Pages

`.github/workflows/deploy.yml` 会在 `main` 分支 Push 后构建并部署站点。首次使用时，需要在 GitHub 仓库设置中把 Pages source 配置为 **GitHub Actions**。

当前配置假设仓库地址为 `AmazingCaddy/ai-native`。如果最终仓库所有者或仓库名不同，需要同步修改 `docusaurus.config.js` 中的 `url`、`baseUrl`、`organizationName` 和 `projectName`。
