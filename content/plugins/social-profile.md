---
title: "用户资料与社交"
sidebar_label: "用户资料与社交"
description: "提供头像、资料卡、私信、留言板、好友、礼物和积分等级。"
---

# 用户资料与社交

提供头像、资料卡、私信、留言板、好友、礼物和积分等级。

## 使用入口

安装并启用 `features.social-profile` 后，用户页显示资料卡，相关特殊页面提供头像、私信、留言板、好友、礼物和积分功能。旧键 `features.user-interaction` 仍兼容，新键优先。

头像在“特殊:上传头像”中上传；“特殊:删除头像”可移除头像。本人可以管理自己的头像，管理其他用户头像需要相应权限。

## 页面中引用头像

提供 `avatar`、`newusers`、`randomuserswithavatars` 解析器扩展，用于展示头像和用户列表。原图不生成多套物理尺寸副本。

## 私信与留言

私信是站内消息，不等同于电子邮件。留言板、好友关系、礼物和积分由插件自己的功能页面管理。关闭插件后账号和已有数据仍保留。

## 与原版的差距

尚未完整实现 UserWiki / UserProfile 命名空间切换、BoardBlast、原版全部邮件与 Echo 通知事件、礼物图片管理及全部资料字段。资料页支持窄屏布局，但不能将原版所有用户页定制直接导入。

具体实现和功能清单见[源码目录](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/social-profile)。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/social-profile)
