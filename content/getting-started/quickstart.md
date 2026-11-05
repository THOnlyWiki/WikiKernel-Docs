---
title: "安装与启动"
description: "安装与启动"
---

# 安装与启动

以下步骤从源码构建发行目录，使用 SQLite 启动本地站点。需要 JDK 21、Git，以及首次下载构建依赖所需的网络连接。

## 获取并构建

```bash
git clone https://github.com/THOnlyWiki/WikiKernel.git
cd WikiKernel
git submodule update --init --recursive
```

子模块包含独立维护的插件和文档；未拉取的插件不会有完整源码。

在 Linux / macOS 上运行：

```bash
./gradlew dist
```

Windows 使用 PowerShell：

```powershell
.\gradlew.bat dist
```

成功后，发行文件位于 `build/dist/`：

```text
build/dist/
  wikikernel-server.jar
  plugins/
  run.bat
  stop.bat
  LocalSettings.example.yaml
```

## 启动并初始化

先进入发行目录，再启动，确保插件和数据库的相对路径正确：

```bash
cd build/dist
java -jar wikikernel-server.jar
```

Windows 也可以在该目录运行 `run.bat`。

浏览器访问 `http://localhost:18080/init`，填写站点名称、数据库和初始管理员。首次使用可选择 SQLite，默认数据库文件是 `data/wiki.db`。完成后，向导会在启动目录生成 `LocalSettings.yaml`。

登录后访问 `http://localhost:18080/wiki/沙盒`，点击创建入口，写入内容并保存。打开该页的历史记录，应能看到这次编辑。

## 停止与重新启动

前台运行时按 `Ctrl+C` 停止。下次仍从同一目录启动，会读取原有配置和数据。

端口被占用时，可改用：

```bash
java -jar wikikernel-server.jar --server.port=18081
```

如果页面能打开但插件没有加载，检查启动目录下的 `plugins/`，并查看启动日志中的插件加载错误。运行 `java -jar build/dist/wikikernel-server.jar` 不会自动切换工作目录。

正式部署前，安排好[数据备份](/docs/deployment/maintenance)，再按[配置文件说明](/docs/deployment/configuration)设置数据库和站点参数。
