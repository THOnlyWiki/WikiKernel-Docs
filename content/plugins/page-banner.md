---
title: "页面横幅"
sidebar_label: "页面横幅"
description: "按页面设置或文件池配置，在标题上方显示横幅图片。"
---

# 页面横幅

按页面设置或文件池配置，在标题上方显示横幅图片。

## 功能

- `{{PAGEBANNER:文件名|caption=说明}}`（不带 `#`，与 MediaWiki 一致）：指定本页横幅图片与说明；
  指令只把参数写进页面属性（`pagebanner-file` / `pagebanner-caption`），自身输出空串从正文剥离；
  也接受命名参数写法 `{{PAGEBANNER:image=文件名|caption=说明}}`（`1=` / `file=` / `filename=` 同样可用，
  不支持的 `icon=` / `toc=` 忽略）；
- `<exclude-banner-page />`：本页不显示横幅（即使命中白名单 / 逐页配置）；标签从正文剥离，只写
  `pagebanner-exclude=1` 页面属性；
- 横幅 HTML：页面大标题上方（core 皮肤布局的 `#page-banner` 容器，来自
  `PageDisplayHook.beforeTitle`）：
  `<div class="page-banner"><img src="直链" alt="文件名"/>[<div class="page-banner-caption">说明</div>]</div>`，
  图片直链与文件名 / 说明都做 HTML 转义；
- 图片来源优先级：`{{PAGEBANNER:…}}` > 逐页配置 > 图片池（按轮换机制）；
  文件不存在或不是图片时不显示横幅；
- 样式：`static/plugins/page-banner/page-banner.css`（原 core `base.css` 的 `.page-banner*` 区块），
  本页**可能**显示横幅时由 `PageDisplayHook.headItems` 注入到 `<head>`。


## 与 MediaWiki 原版的差异

- 不做 Wikidata 查询（原版可从 Wikidata 取 P948 页面图片）：横幅完全来自站点设置 / 页面指令；
- 只移植 `{{PAGEBANNER:文件名|caption=说明}}` 与 `<exclude-banner-page />`：原版的其它参数（`icon=` / `toc=` 等）、
  `param=` 等展示模式与配套皮肤增强（TOC 旁的横幅等）未实现；
- 原版的 `{{PAGEBANNER:…}}` 会展开模板参数，这里按**原文**使用（与迁移前 core 抽取参数的行为一致）；
- 说明文字不做 wikitext 解析（转义后原样显示）；
- 图片按容器宽度铺满（`width:100%`、`object-fit:cover`、最高 220px），说明文字叠加在图片下缘
  （与原版「横幅 + 叠加说明」的观感一致，但没有原版的 TOC 内联 / 视差等皮肤增强）。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/page-banner)
