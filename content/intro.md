---
title: "WikiKernel 文档"
description: "WikiKernel 文档"
---

# WikiKernel 文档

WikiKernel 是使用 Java 21 和 Spring Boot 4 开发的 Wiki 引擎，提供页面编辑、修订历史、命名空间、模板和特殊页面。评论、审核、社交资料等功能由插件提供。

## 安装与运行

第一次搭建站点，从[安装与启动](/docs/getting-started/quickstart)开始。它使用 SQLite，不需要另装数据库。使用容器部署时，见 [Docker](/docs/deployment/docker)。

已经在运行的站点，可以直接查[配置文件](/docs/deployment/configuration)、[页面权限](/docs/administration/permissions)或[备份与升级](/docs/deployment/maintenance)。

## 编辑内容

[页面与修订](/docs/guides/pages)介绍创建、移动、重定向和历史版本；[Wikitext](/docs/guides/wikitext)提供正文与模板语法。[账号与个人设置](/docs/guides/accounts)说明登录、邮箱和时区。

## 配置站点

- [界面与系统页面](/docs/administration/interface)：侧边栏、公告、页面 CSS 和 JS。
- [缓存](/docs/administration/cache)：内置内存缓存与 Redis。
- [插件安装](/docs/plugins)：安装、启用和更新扩展；[插件目录](/plugins)可按功能查找。

## 接口与开发

机器人和外部程序从 [API 使用](/docs/api/overview)开始。开发扩展时，先读[插件开发](/docs/development/plugin-development)，再查[扩展点与服务](/docs/development/extensions)。

WikiKernel 实现了部分 MediaWiki 语法和接口。导入模板或接入既有工具前，请对照[接口参考](/docs/api/reference)及对应插件的兼容范围。
