---
title: 用 Docker 部署
sidebar_label: Docker 部署
sidebar_position: 2
description: 用官方 JRE 镜像运行 WikiKernel 发行包，并配置数据持久化与反向代理。
---

# 用 Docker 部署

WikiKernel 的发行包本身就是一个可执行 jar，所以不需要为它单独维护一个复杂镜像。推荐做法是：**把 `build/dist` 作为持久化目录挂载进 JRE 容器**。

这样升级时只替换 jar 和插件，数据、上传文件与配置都留在宿主机。

## 1. 准备发行目录

在服务器上构建，或从 Releases 下载发行包后解压：

```bash
# 示例目录
mkdir -p /srv/wikikernel
cd /srv/wikikernel
```

目录中至少要有：

```text
wikikernel-server.jar
plugins/
LocalSettings.example.yaml
```

首次启动时如果没有 `LocalSettings.yaml`，浏览器访问 `/init` 完成安装向导。

## 2. 直接运行容器

```bash
docker run -d \
  --name wikikernel \
  --restart unless-stopped \
  -p 18080:18080 \
  -w /opt/wikikernel \
  -v /srv/wikikernel:/opt/wikikernel \
  eclipse-temurin:21-jre \
  java -jar wikikernel-server.jar
```

关键点：

- `-w /opt/wikikernel`：让插件目录、`data/`、`run/` 相对这个目录解析。
- `-v`：把整个发行目录挂载进去，数据不会随容器删除。
- 不要把 `LocalSettings.yaml` 以只读方式挂载；安装向导需要创建它。

打开：

```text
http://服务器地址:18080/init
```

## 3. 使用 Compose

仓库文档提供了一个可直接复制的示例：

```yaml
services:
  wikikernel:
    image: eclipse-temurin:21-jre
    container_name: wikikernel
    working_dir: /opt/wikikernel
    command: ["java", "-jar", "wikikernel-server.jar"]
    ports:
      - "18080:18080"
    volumes:
      - ./wikikernel:/opt/wikikernel
    restart: unless-stopped
```

启动：

```bash
docker compose up -d
docker compose logs -f wikikernel
```

## 4. 配置反向代理与 HTTPS

生产环境建议把 18080 只监听内网，由反向代理负责 HTTPS。

### Caddy

```caddyfile
wiki.example.com {
    reverse_proxy 127.0.0.1:18080
}
```

### Nginx

```nginx
server {
    listen 443 ssl http2;
    server_name wiki.example.com;

    ssl_certificate     /etc/letsencrypt/live/wiki.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/wiki.example.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:18080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

如果使用第三方登录，回调地址必须与反向代理后的公网地址一致，例如：

```text
https://wiki.example.com/auth/github/callback
```

## 5. 升级

```bash
# 1. 备份数据
docker compose stop wikikernel
tar czf wikikernel-backup-$(date +%F).tar.gz wikikernel/

# 2. 替换 jar 与 plugins/
# 3. 启动
docker compose up -d
```

如果新版本包含数据库结构变化，先看 [配置与部署参考](/docs/administration/configuration-reference) 和对应版本的 Release Notes。

## 6. 生产检查清单

- [ ] 已经设置 `wikikernel.time.zone`（例如 `Asia/Shanghai`）
- [ ] 管理后台已修改默认管理员密码
- [ ] 反向代理已传递 `Host`、`X-Forwarded-For`、`X-Forwarded-Proto`
- [ ] 已配置 HTTPS
- [ ] 已备份 `data/`、`run/files/`、`plugins/`、`LocalSettings.yaml`
- [ ] 没有把 `/init` 暴露给未授权用户
- [ ] 上传目录和 `LocalSettings.yaml` 的权限只给运行用户

## 示例文件

本站仓库的 `examples/docker/` 下有可复制的 `compose.yaml` 和 `Dockerfile`。它们假设你已经在 `examples/docker/wikikernel/` 放入了 `build/dist` 的内容。

## 下一步

- [配置速查](/docs/deployment/configuration)
- [配置与部署参考](/docs/administration/configuration-reference)
- [第三方登录](/docs/administration/third-party-login)
