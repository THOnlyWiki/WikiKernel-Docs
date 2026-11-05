---
title: "合并用户"
sidebar_label: "合并用户"
description: "为有权用户提供账号合并和相关数据迁移入口。"
---

# 合并用户

为有权用户提供账号合并和相关数据迁移入口。

## 权限语义

- **「核查员」组**（`GROUP_CHECKUSER`）才能合并；匿名 / 无权限用户 401 / 403；
- 用户页「工具」侧栏的「用户合并」入口（`tools.userMerge`）仍由 core 提供。


## 与 MediaWiki UserMerge 的差异

- **用户页不自动移动**（与 MediaWiki UserMerge 一致，迁移前后都不移）；
- **源账号可选删除**：`deleteOld` 勾选才删除；不勾选保留空账号（源账号的登录 / 邮箱令牌仍会作废）；
- **没有「重命名到新账号」模式**：MediaWiki UserMerge 允许把合并目标设为一个尚不存在的新账号并顺带改名；
  这里目标必须是已存在账号（与迁移前 core 行为一致）；
- **日志只记源账号名 + 是否删除**（详情键 `log.usermerge.source` / `log.usermerge.deleted` / `log.usermerge.kept`），
  与迁移前 core 一致。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/user-merge)
