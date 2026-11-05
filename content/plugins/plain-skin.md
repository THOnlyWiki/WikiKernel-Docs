---
title: "Plain 皮肤"
sidebar_label: "Plain 皮肤"
description: "提供独立的页面布局和样式，作为可安装皮肤使用。"
---

# Plain 皮肤

提供独立的页面布局和样式，作为可安装皮肤使用。

## 功能

| 部分 | 说明 |
| --- | --- |
| 皮肤 | `plain`：精简布局（居中卡片、无侧栏），所有链接与页签由 core 的皮肤上下文提供 |
| 默认皮肤 | `PlainSkinSetup`（`SetupStep`）：`/init` 的插件 tab 里可以勾选「将 plain 皮肤设为站点默认皮肤」（写站点设置） |
| 站点设置 | 皮肤在「特殊:权限配置 → 站点设置」的默认皮肤下拉里出现；用户也可以在 `特殊:参数设置 → 外观` 里自选 |

描述文件里**没有**声明 `plugin.featureKey`：皮肤不是功能开关，装了即可选。


## 与 MediaWiki 的差异

- MediaWiki 的皮肤是核心机制（`Manual:Skins`），这里做成插件，方便第三方皮肤照抄结构：
  一个 `WikiPlugin` + 一份 `layout.html` + 一份 CSS 就能提供一个皮肤；
- 皮肤名与说明走消息键（`skin.plain.name` / `skin.plain.description`），core 的内置皮肤
  （Vector 与不可禁用的 Fallback）不通过插件注册。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/plain-skin)
