---
title: WikiKernel 文档
sidebar_label: 文档首页
sidebar_position: 1
description: WikiKernel 的快速开始、使用手册、部署指南、插件目录与开发文档。
---

# WikiKernel 文档

WikiKernel 是一个用 **Java 21** 和 **Spring Boot 4** 重写的 MediaWiki 风格 Wiki 引擎。它按 MediaWiki 的方式组织内容：页面与修订、命名空间、Wikitext 与模板、特殊页面，以及兼容 MediaWiki 的 `/api.php` 和 `mw` JS API。

皮肤、扩展语法和治理功能都做成插件，core 在编译期不依赖任何插件。

## 从这里开始

- **第一次运行？** 跟着 [5 分钟快速开始](/docs/getting-started/quickstart)，用 SQLite 在本地跑起来。
- **准备上线？** 看 [Docker 部署](/docs/deployment/docker) 和 [配置速查](/docs/deployment/configuration)。
- **想扩展功能？** 浏览 [插件目录](/plugins)，或从 [插件开发](/docs/development/plugin-development) 开始。
- **要接机器人？** 从 [API 概览](/docs/api/overview) 进入 MediaWiki 兼容 API。

## WikiKernel 是什么

- **熟悉的 MediaWiki 习惯**：标题、命名空间、模板、特殊页面、最近更改、参数设置。
- **插件化**：core 只提供 SPI 和扩展点，插件单独编译、可在运行时装卸。
- **一个 jar 就能跑**：默认 SQLite，不需要额外安装数据库；也支持 MySQL / MariaDB。
- **中英双语**：界面文案在 core 与各插件自己的 `messages*.properties` 中。
- **可移植的 API**：`/api.php`、`mw` / `mw.loader`、`/index.php`、`/load.php` 兼容入口。

## 文档地图

| 你想做什么 | 推荐入口 |
| --- | --- |
| 安装并启动 | [快速开始](/docs/getting-started/quickstart) |
| 用 Docker 跑 | [Docker 部署](/docs/deployment/docker) |
| 改端口、数据库、时区 | [配置速查](/docs/deployment/configuration) |
| 查所有配置键 | [配置与部署参考](/docs/administration/configuration-reference) |
| 编辑词条、模板、解析器函数 | [Wikitext](/docs/guides/wikitext) |
| 看特殊页面、权限、文件、日志 | [功能详述](/docs/guides/features) |
| 装插件、看插件能力 | [插件目录](/plugins) |
| 写插件 / 皮肤 / Mixin | [插件开发](/docs/development/plugin-development) |
| 对接机器人、脚本、旧工具 | [API 概览](/docs/api/overview) |

:::tip 文档还在持续补齐
当前 Docs 站点是第一阶段版本，重点覆盖“跑起来、部署、插件目录、API 入口”。使用手册中的长章节会继续拆分到更小的任务页面。
:::

## 技术栈

| 组件 | 说明 |
| --- | --- |
| Java 21+ | 运行 core 与插件 |
| Spring Boot 4 | Web、配置、依赖注入 |
| SQLite / MariaDB / MySQL | SQLite 零安装起步；生产可用 MariaDB/MySQL |
| Gradle Wrapper | 仓库自带，不需要单独安装 Gradle |
| 插件 jar | 每个插件独立类加载器，按依赖拓扑启动 |

## 项目

- 源码与 Issue：<https://github.com/THOnlyWiki/WikiKernel>
- 发布包：<https://github.com/THOnlyWiki/WikiKernel/releases>
- 许可证：GPLv3
