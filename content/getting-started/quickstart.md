---
title: 5 分钟快速开始
sidebar_label: 快速开始
sidebar_position: 1
description: 从源码构建 WikiKernel，用 SQLite 启动，并完成安装向导。
---

# 5 分钟快速开始

这一页只做一件事：**从源码构建并跑起一个可以编辑的 WikiKernel**。默认使用 SQLite，不需要 Docker，也不需要单独安装数据库。

## 前置条件

- JDK 21 或更高版本
- Git
- 能访问 Maven Central（首次构建需要下载依赖）

检查 Java：

```bash
java -version
```

## 1. 获取源码

```bash
git clone https://github.com/THOnlyWiki/WikiKernel.git
cd WikiKernel
```

## 2. 构建发行包

Windows：

```powershell
.\gradlew.bat dist
```

Linux / macOS：

```bash
./gradlew dist
```

首次构建会下载 Gradle 与依赖，可能需要几分钟。成功后生成：

```text
build/dist/
  wikikernel-server.jar
  plugins/*.jar
  run.bat
  stop.bat
  LocalSettings.example.yaml
```

## 3. 启动

Windows：

```powershell
cd build\dist
.\run.bat
```

Linux / macOS：

```bash
cd build/dist
java -jar wikikernel-server.jar
```

默认端口是 **18080**。如果使用 JDK 24/25，遇到 `sun.misc.Unsafe` 相关提示时可以加上：

```bash
java --sun-misc-unsafe-memory-access=allow -jar wikikernel-server.jar
```

## 4. 完成安装向导

浏览器打开：

```text
http://localhost:18080/init
```

按向导填写：

1. **站点名称**
2. **数据库**：第一次使用选 SQLite，数据文件默认 `./data/wiki.db`
3. **初始管理员账号**
4. 可选的 SMTP、功能开关、插件设置

完成后会生成 `build/dist/LocalSettings.yaml`。这个文件包含本地配置，**不要提交到 Git**。

## 5. 创建第一个页面

登录后，在地址栏访问一个还不存在的标题，例如：

```text
http://localhost:18080/wiki/测试页面
```

WikiKernel 会显示创建入口。写入内容并保存，然后试试：

- 用 `[[链接]]` 创建内部链接
- 用 `{{模板}}` 调用模板
- 在讨论页用 `~~~~` 留下签名
- 打开 `特殊:最近更改` 查看编辑记录

## 数据放在哪里

从 `build/dist` 启动时，运行数据默认都在这个目录下：

```text
build/dist/
  LocalSettings.yaml    # 安装向导生成的本地配置
  data/wiki.db          # SQLite 数据库
  run/files/            # 上传文件
  run/logs/             # 日志
  plugins/              # 插件 jar
```

备份时至少备份 `LocalSettings.yaml`、`data/`、`run/files/` 和 `plugins/`。

## 停止

- Windows：在启动窗口按 `Ctrl+C`，或运行 `build\dist\stop.bat`
- Linux / macOS：在终端按 `Ctrl+C`

## 常见问题

### 端口被占用

换一个端口启动：

```powershell
.\run.bat 18081
```

或直接：

```bash
java -jar wikikernel-server.jar --server.port=18081
```

### 启动后没有插件

确认你是从 `build/dist` 目录启动，并且 `plugins/` 与 `wikikernel-server.jar` 在同一层。直接 `java -jar build/dist/wikikernel-server.jar` 时，工作目录仍是当前目录，插件目录可能不是 `build/dist/plugins`。

### 忘记管理员密码

查看 `LocalSettings.yaml` 与启动日志；生产环境建议直接通过数据库或后续的账号恢复流程处理，不要删除 `data/` 目录。

## 下一步

- [Docker 部署](/docs/deployment/docker)
- [配置速查](/docs/deployment/configuration)
- [插件目录](/plugins)
- [API 概览](/docs/api/overview)
