---
title: 配置速查
sidebar_label: 配置速查
sidebar_position: 3
description: LocalSettings.yaml、数据库、端口、时区与功能开关的最小配置示例。
---

# 配置速查

WikiKernel 的配置方式类似 MediaWiki 的 `LocalSettings.php`：主程序只带默认值，本地差异写在启动目录的 `LocalSettings.yaml` 中。

完整键名、默认值与中文说明见 [配置与部署参考](/docs/administration/configuration-reference)。

## 配置文件在哪里

默认从**启动时的工作目录**读取：

```text
LocalSettings.yaml
```

优先级：

```text
命令行参数 > 环境变量 > LocalSettings.yaml > 内置默认值
```

首次启动时如果没有这个文件，访问 `/init` 会进入安装向导。也可以复制 `LocalSettings.example.yaml` 手动修改。

## 最小示例

```yaml
wikikernel:
  site:
    name: 我的 Wiki

  time:
    zone: Asia/Shanghai

  database:
    type: sqlite
    file: ./data/wiki.db
```

改完后重启应用生效。

## 换端口

推荐使用启动参数，避免把部署细节写进配置文件：

```bash
java -jar wikikernel-server.jar --server.port=8080
```

也可以使用环境变量：

```bash
SERVER_PORT=8080 java -jar wikikernel-server.jar
```

## 使用 MariaDB / MySQL

```yaml
wikikernel:
  database:
    type: mariadb        # 或 mysql
    host: 127.0.0.1
    port: 3306
    name: wikikernel
    user: wikikernel
    password: "${MYSQL_PASSWORD:change-me}"
    pool-size: 10
```

密码建议通过环境变量传入：

```bash
export MYSQL_PASSWORD='强密码'
```

注意：

- 数据库需要提前创建，字符集建议 `utf8mb4`。
- 从 SQLite 迁移到 MariaDB 前请先备份，并阅读完整配置参考中的迁移说明。
- `wikikernel.database.auto-ddl` 默认开启，启动时会自动建表 / 补列，不会删除已有数据。

## 时区

```yaml
wikikernel:
  time:
    zone: Asia/Shanghai
```

这会影响评论时间等服务端 `LocalDateTime.now()` 写入的时间。用户个人时区仍然优先用于页面展示。

## 功能开关

很多功能既可以在 `特殊:权限配置` 里改，也可以写进 `LocalSettings.yaml`：

```yaml
wikikernel:
  features:
    comments: true
    social-profile: true
    media-viewer: true
    ai-agent: false
```

写了值的键会在每次启动时覆盖数据库设置；不写则保留管理后台当前值。

## 管理员引导

首次部署可以用配置直接提升管理员：

```yaml
wikikernel:
  permissions:
    bootstrap-admins:
      - 你的用户名
```

它只会提升权限，不会降权。更推荐在 `/init` 向导里创建初始管理员。

## 反向代理

至少传递这些头：

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

第三方登录的回调地址必须使用公网地址，并且与 OAuth 应用里登记的地址完全一致。

## 不要提交的东西

`LocalSettings.yaml` 可能包含数据库密码、OAuth Secret、SMTP 密码。不要提交到 Git。

建议只在服务器上保留，并设置文件权限：

```bash
chmod 600 LocalSettings.yaml
```

## 下一步

- [完整配置参考](/docs/administration/configuration-reference)
- [Docker 部署](/docs/deployment/docker)
- [第三方登录](/docs/administration/third-party-login)
