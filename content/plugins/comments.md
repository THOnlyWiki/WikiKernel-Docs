---
title: "评论"
sidebar_label: "评论"
description: "在词条下方显示评论区，支持发表、回复和删除评论。"
---

# 评论

在词条下方显示评论区，支持发表、回复和删除评论。

## 显示评论区

安装插件后，评论区默认自动显示。用 `<comment />` 或 `<comments />` 手动开启；用 `<comment disabled />` 关闭某页的评论。

站点设置 `features.comments` 控制总开关，`comments.auto-display` 控制未写标签的页面是否自动显示。

## 发表与删除

发表评论需要登录、未被封禁，并能查看该页。评论支持回复和 Wikitext。作者本人、评论管理员、管理员和行政员可以删除评论；删除后保留占位。

## 时间显示

评论时间按当前用户的时区显示。北京时间在个人参数设置中选择 `Asia/Shanghai`。未设置个人时区时跟随服务器时区；改变显示时区不会重写旧评论。

## 接口

`POST /api/comments` 发表评论，参数为 `page`、`content` 和可选 `parentId`。`POST /api/comments/delete` 使用 `id` 删除评论。两者使用站点登录会话。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/comments)
