# WikiKernel 文档站

本站使用 Docusaurus。正文位于 `content/`，首页和插件目录位于 `src/pages/`，导航在 `sidebars.ts`。

## 本地预览

需要 Node.js 20 或更新版本。在文档目录运行：

```bash
npm ci
npm start
```

默认地址为 `http://localhost:3000`。

提交前运行：

```bash
npm run check:links
npm run typecheck
npm run build
```

产物在 `build/`。用 `npm run serve` 可预览构建结果。

## 内容维护

安装、使用、管理、API 和开发资料分别放在对应目录中。操作说明直接写入口、步骤和结果；接口参数和配置表留在参考页，避免在多处复制。

插件页面的正文在本站维护。运行 `npm run sync:plugins` 会读取主仓库的插件列表、更新目录数据；已有文档不会被 README 覆盖。新插件首次导入后需要人工整理，源码目录的 README 保留实现和开发记录。

默认从 `../plugin` 读取插件，也可设置环境变量 `WIKIKERNEL_PLUGIN_DIR` 指定目录。目录同步后需检查新增页面、侧栏分类和链接。`kawaii-timeless` 与 `thonly-wiki-extensions` 不在公开目录中。

不要把迁移过程、临时排查记录或未验证的兼容性承诺写进使用说明。需要说明限制时，写出受影响的操作与实际支持范围。

## 发布

构建并上传完整的 `build/`。站点使用 Hash Router，文档链接形如 `/#/docs/intro`；不要自行改写为普通路径路由。

`.github/workflows/deploy.yml` 提供 GitHub Pages 发布流程。其他静态托管使用 `npm ci`、`npm run build`，输出目录为 `build`。站点域名由 `DOCUSAURUS_URL` 配置；部署到子目录前应核对托管路径、静态资源地址和路由。

文档站是主仓库的 `docs/` 子模块，修改在文档仓库内单独管理。
