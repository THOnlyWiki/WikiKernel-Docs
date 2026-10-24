# WikiKernel Docs

WikiKernel 的文档与项目网站，使用 [Docusaurus](https://docusaurus.io/) 构建。

这个仓库是主仓库 `THOnlyWiki/WikiKernel` 的 `docs/` 子模块。文档内容与主仓库代码分开管理，但插件页面的来源仍然是主仓库的 `plugin/*/README.md`。

## 本地开发

需要 Node.js 20+。

```bash
npm install
npm start
```

默认打开 <http://localhost:3000>。

## 构建

```bash
npm run build
npm run serve
```

构建产物在 `build/`。

## 同步插件文档

在包含主仓库的目录结构中运行：

```bash
npm run sync:plugins
```

默认读取 `../plugin`。也可以指定：

```bash
WIKIKERNEL_PLUGIN_DIR=/path/to/WikiKernel/plugin npm run sync:plugins
```

脚本会：

- 为每个公开插件生成 `content/plugins/<id>.md`
- 生成插件目录数据 `src/data/plugins.json`
- 跳过私有仓库/皮肤 `kawaii-timeless` 与 `thonly-wiki-extensions`

生成结果需要提交；这样 docs 仓库单独 clone 时也能直接构建。

## 目录

```text
content/                 Markdown 文档
  getting-started/       快速开始
  deployment/            Docker、配置
  guides/                Wikitext、完整功能
  administration/        配置参考、第三方登录
  development/           插件、皮肤、Mixin
  api/                   API 概览与完整参考
  plugins/               插件页面（生成）
src/
  pages/                 首页与插件目录
  components/            插件卡片、筛选器
  data/                  生成的数据
  css/                   主题样式
examples/docker/         Docker 示例
scripts/sync-plugins.mjs 插件同步脚本
```

## 部署

### 首次发布

如果远端仓库尚未创建，请先在 GitHub 创建空的 `THOnlyWiki/WikiKernel-Docs`，然后：

```bash
git remote add origin https://github.com/THOnlyWiki/WikiKernel-Docs.git
git push -u origin main
```

### GitHub Pages

`.github/workflows/deploy.yml` 已配置 GitHub Pages 构建与发布。推送到 `main` 后启用仓库的 Pages（Source 选 GitHub Actions）即可。

站点使用 Hash Router，页面地址形如：

```text
https://thonlywiki.github.io/WikiKernel-Docs/#/docs/getting-started/quickstart
```

因此即使部署在 `/WikiKernel-Docs/` 子路径，路由也不需要服务器做 SPA fallback。

### Cloudflare Pages / 其他静态托管

构建命令：

```bash
npm ci
npm run build
```

输出目录：`build`

Hash Router 下 `baseUrl` 保持 `/`，即使站点部署在子路径（例如 `/docs/`）也不要改；页面路由在 hash 中：

```bash
DOCUSAURUS_URL=https://example.com npm run build
```

产物只有 `build/index.html` 和静态资源，上传整个 `build/` 即可。

## 内容约定

- 中文为主，代码、配置键和 API 参数保持英文。
- 每篇操作文档尽量包含：目标、前置条件、步骤、验证方式、常见错误。
- 长文档按任务拆分；不要把所有功能堆在一个页面。
- 配置键和插件说明优先链接到单一事实来源，避免复制后失同步。

## 许可证

文档内容与 WikiKernel 主项目一致，使用 GPLv3；第三方资源遵循各自许可证。
