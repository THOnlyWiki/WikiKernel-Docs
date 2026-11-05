---
title: "输入框"
sidebar_label: "输入框"
description: "通过 inputbox 标签插入页面创建或搜索表单。"
---

# 输入框

通过 inputbox 标签插入页面创建或搜索表单。

## 功能

- `<inputbox>…</inputbox>`（标签内容为 `key=value` 行）→ 创建 / 搜索表单：
  - `type=create`（默认）/ `type=search` / `type=fulltext`；
  - `default` / `placeholder` / `id` / `buttonlabel` / `width`；
  - `prefix` / `preload` / `editintro`（前端脚本组装目标标题）；
- 前端脚本：`static/plugins/input-box/inputbox.js`，经 core 的插件资源端点 `/plugins/input-box/inputbox.js` 提供，
  仅在功能开启时由 `HtmlHeadProvider` 注入词条阅读页。


## 兼容性

- 功能开关沿用 **`features.input-box`**（`特殊:权限配置 → 站点设置` 或 `LocalSettings.yaml`）；
  关闭时标签按原文转义显示（与迁移前一致）。
- 按钮缺省文案沿用 core 消息键 `common.search` / `special.createPage`（跟随界面语言）。
- 表单结构与提交目标（`特殊:创建页面` / `特殊:搜索`）与迁移前完全一致。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/input-box)
