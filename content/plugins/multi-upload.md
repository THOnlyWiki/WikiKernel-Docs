---
title: "批量上传"
sidebar_label: "批量上传"
description: "在上传页和编辑器中一次选择多个文件，逐个上传并插入正文。"
---

# 批量上传

在上传页和编辑器中一次选择多个文件，逐个上传并插入正文。


## 使用

多文件批量上传：**上传页**可以一次选择多个文件，已选文件显示成可改名 / 可移除的列表，
提交时逐个上传（每个文件独立成文件页，单个失败不影响其它），完成后把新文件插进「最近上传」画廊；
**编辑页工具栏**的「上传并插入图片」对话框同样可以多选，逐个上传后把 `[[文件:名|thumb]]` 全部插到光标处；
还可以**直接把文件拖进编辑器**（拖入时显示虚框与「松开即可上传并插入到正文」提示，上传完成自动插入链接）。

| 部分 | 说明 |
| --- | --- |
| 开关 | `features.multi-upload`（**默认关闭**；`/init`、`特殊:权限配置 → 站点设置`、`LocalSettings.yaml` 都可改）。core 维护这个键，插件经 `SiteConfig` 读它 |
| 上传接口 | 仍走 core 的 `POST /api/files/upload`（权限、审核、大小上限、类型限制都在 core 侧） |
| 前端脚本 | `/plugins/multi-upload/multi-upload.js`（站点级注入；脚本自己判断页面上有没有上传表单 / 编辑器工具栏） |
| 文案 | `files.multi*` / `files.chooseMany` / `toolbar.uploadChooseMany`（键与迁移前 core 一致，core 里已删除） |

## 与 MediaWiki 的差异

- MediaWiki 的 MsUpload 是**小工具 / Gadget**（要自己写定义页），这里是随站点分发的插件；
- 没有分块上传 / 断点续传（`UploadWizard` 的能力），单个文件仍受 `wikikernel.max-file-size-mb` 限制；
- 上传逐个串行（与迁移前一致），没有并发上传与取消队列。

> **功能开关**：`features.multi-upload`（默认值见插件描述文件）。开关由本插件在自己的
> `META-INF/wiki-plugin.properties` 里声明（`plugin.featureKey` / `plugin.featureDefault`），
> core 自动在「特殊:权限配置 → 站点设置 → 插件设置」与 `/init` 的插件 tab 里渲染 / 保存；
> 插件用 `common.service.SiteConfig` 读同一个键——core 里没有本功能的开关代码，
> 插件未加载时开关也不出现。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/multi-upload)
