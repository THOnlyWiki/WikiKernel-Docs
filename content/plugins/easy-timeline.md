---
title: "时间轴"
sidebar_label: "时间轴"
description: "使用 timeline 标签在正文中绘制时间轴。"
---

# 时间轴

使用 timeline 标签在正文中绘制时间轴。

## 功能

- `<timeline>…</timeline>`：把 EasyTimeline 文本定义解析成**内联 SVG**（服务端渲染，不依赖 Ploticus / Perl / 外部服务）；
- 支持常用命令：`ImageSize` / `PlotArea` / `AlignBars` / `DateFormat` / `Period` / `TimeAxis` /
  `ScaleMajor` / `ScaleMinor` / `Colors` / `BackgroundColors` / `PlotData`（含 `barset`）/ `TextData`；
- 所有文字做 XML 转义、颜色白名单校验，输出直接作为可信块插入页面。


## 兼容性

- 功能开关沿用 **`features.timeline`**（`特殊:权限配置 → 站点设置` 或 `LocalSettings.yaml`）：
  关闭时标签按原文转义显示（与迁移前一致）；
- 解析失败提示沿用 core 消息键 `timeline.invalid`；
- 生成的 SVG（`class="mw-timeline"` / `mw-timeline-svg`）与迁移前逐字节一致（渲染器代码原样搬迁）。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/easy-timeline)
