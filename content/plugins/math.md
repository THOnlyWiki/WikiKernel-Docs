---
title: "数学公式"
sidebar_label: "数学公式"
description: "使用 math 标签编写并显示数学公式。"
---

# 数学公式

使用 math 标签编写并显示数学公式。

## 功能

- `<math>TeX</math>`（`display="block"` 为独立公式）与 `<chem>…</chem>`（mhchem 化学式）：
  服务端生成占位 `<span class="mw-math" data-tex="…">`，标签内容原样作为 TeX（不做 wikitext 解析，与 MediaWiki 一致）；
- 前端脚本 `static/plugins/math/math.js`（经 `/plugins/math/math.js` 提供）懒加载
  **KaTeX**（`/vendor/katex/…`，随 core 分发）渲染，失败时显示 TeX 源码（`mw-math-fallback`）；
- 功能开启时由 `HtmlHeadProvider` **站点级**注入开关与脚本（所有页面，含编辑预览；
  KaTeX 运行时仍然只在页面真的出现公式时才下载）。


## 兼容性

- 功能开关沿用 **`features.math`**（`特殊:权限配置 → 站点设置` 或 `LocalSettings.yaml`）；
  关闭时标签按原文转义显示（与迁移前一致）；
- 空公式提示沿用 core 消息键 `math.empty`；
- 占位 HTML（`mw-math` / `mw-math-block` / `data-tex` / `data-display` / `data-chem` / `mw-math-fallback`）
  与迁移前逐字节一致；`WIKI_CONFIG.math` 开关由插件自己**站点级**注入
  （必须在 core 初始化 `window.WIKI_CONFIG` 之后写入，否则会被页头重置覆盖、
  脚本拿不到开关就不渲染——公式只剩 TeX 源码回退）。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/math)
