---
title: "链接预览"
sidebar_label: "链接预览"
description: "悬停内部链接时预览目标页面的摘要。"
---

# 链接预览

悬停内部链接时预览目标页面的摘要。

## 功能

- 桌面端（宽度 ≥ 720px）鼠标悬停正文区页面链接 0.5 秒 → 显示该页摘要与缩略图浮层；
- 键盘可达（Tab 聚焦链接同样显示）；红链 / 特殊页 / `?action=`、`?oldid=` 链接与 `.no-preview` 不预览；
- 数据来自 **core 的通用 API** `GET /api/page-preview?title=…`（保留在 core：含读权限校验与 404 语义，
  相当于 MediaWiki 里由 API 提供摘要、Popups 只做界面）；
- 静态资源：`/plugins/popups/popups.js`（脚本）与 `/plugins/popups/popups.css`（浮层样式，原 core `base.css`
  的 `.mw-popup` 区块），功能开启时由 `HtmlHeadProvider` 注入词条阅读页。


## 兼容性

- 功能开关沿用 **`features.popups`**（`特殊:权限配置 → 站点设置` 或 `LocalSettings.yaml`）：
  关闭时不注入脚本与样式（与迁移前一致）；`WIKI_CONFIG.popups` 开关仍由 core 注入；
- 预览 API（`/api/page-preview`）、摘要 / 缩略图生成、负缓存与权限语义不变；
- 浮层类名（`.mw-popup*`）与交互行为不变。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/popups)
