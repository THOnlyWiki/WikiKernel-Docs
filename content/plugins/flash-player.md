---
title: "Flash 播放器"
sidebar_label: "Flash 播放器"
description: "使用 Ruffle 在文件页和正文中播放 SWF 文件。"
---

# Flash 播放器

使用 Ruffle 在文件页和正文中播放 SWF 文件。

## 功能

- `<flash-player file="[[文件:X.swf]] 或 URL" … />` 生成播放器占位：
  - `file` 支持外部 URL、`[[文件:X.swf]]` 与裸文件名；
  - 参数：`width` / `height` / `autoplay` / `loop` / `fullscreen` / `letterbox` / `menu` / `bgcolor` /
    `quality` / `scale` / `wmode` / `allowscriptaccess` / `unmute` / `flashvars` / `base`，
    说明文字可用标签内容或 `caption`；
- 前端脚本 `static/plugins/flash-player/flash-player.js`（经 `/plugins/flash-player/flash-player.js` 提供）
  懒加载 **Ruffle**（`/vendor/ruffle/…`，随 core 分发；页面里没有 Flash 时不下载 wasm）；
- 功能开启时由 `HtmlHeadProvider` 注入脚本（词条阅读页）。


## 兼容性

- 功能开关沿用 **`features.flash-player`**（`特殊:权限配置 → 站点设置` 或 `LocalSettings.yaml`）：
  关闭时退化成文件链接（与迁移前一致）；
- 文件解析走 `common.service.FileStore` 桥接（等价于 core 的 `FileService.findByName/urlOf/pageUrlOf`）；
- 提示文案沿用 core 消息键（`flashPlayer.missingFile` / `flashPlayer.unavailable` / `flashPlayer.missing` /
  `flashPlayer.disabled`）；
- 播放器占位属性（`data-flash-*` / 回退链接 / `flash-player-caption`）与迁移前逐字节一致；
  `WIKI_CONFIG.flashPlayer` 开关仍由 core 注入。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/flash-player)
