---
title: "重命名用户"
sidebar_label: "重命名用户"
description: "为有权用户提供修改账号名称的管理入口。"
---

# 重命名用户

为有权用户提供修改账号名称的管理入口。

## 权限语义

- **「重命名用户」组**（`GROUP_RENAME_USER`）才能改名；匿名 / 无权限用户 401 / 403；
- 管理员**不会自动获得**该组（需要显式授予，与 MediaWiki 的 `renameuser` 权限一致）；
- 用户名规则与注册一致（禁止 `# < > [ ] | { } /`）；重名 / 同名 / 不存在都有本地化提示。


## 与 MediaWiki Renameuser 的差异

- **动作句目标显示旧用户名**：账号已改名（`wiki_user.username` 已是新名），日志动作句里的目标用
  日志保存的旧用户名（`LogFormatter` 对 `renameuser` 类型特判），与迁移前 core 行为一致；
- **没有日志页专属筛选器**：`特殊:日志?type=renameuser` 照常可用（类型由插件注册），
  与 MediaWiki 的 `Special:Log/rename` 对应；
- **移动用户页不留重定向**（与迁移前 core 一致；MediaWiki 的 `moveUserPages` 默认也不留）。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/rename-user)
