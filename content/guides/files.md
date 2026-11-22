---
title: "文件与媒体"
description: "文件与媒体"
---

# 文件与媒体

## 上传文件

打开“特殊:上传文件”，选择文件并填写说明。上传大小、类型和权限受站点配置限制。如果启用了[审核](/docs/plugins/moderation)，文件需经审核通过后才会公开展示。

上传后会生成“文件:文件名”页面，用于预览文件、查看说明和历史。批量上传需要 [multi-upload](/docs/plugins/multi-upload) 插件。

## 插入正文

```text
[[文件:示例.png|thumb|图片说明]]
[[文件:示例.png|300px|图片说明]]
```

在正文中保存后检查预览。仅链接到文件说明页时，可写 `[[:文件:示例.png]]`。

## 音视频与外部存储

音视频播放器由 [media-viewer](/docs/plugins/media-viewer) 提供，Flash 文件由 [flash-player](/docs/plugins/flash-player) 处理。播放支持由客户端浏览器的媒体解码能力与具体文件编码决定。

[oss-extension](/docs/plugins/oss-extension) 可将文件同步到对象存储。启用后仍需按插件说明保留数据库及相关存储配置；数据库备份不包含文件内容。
