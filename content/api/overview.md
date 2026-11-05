---
title: "API 使用"
description: "查询页面、登录和使用 token 编辑页面。"
---

# API 使用

WikiKernel 提供 `/api.php` 兼容接口，以及内核和插件自己的 `/api/` 接口。机器人可从兼容接口开始；具体支持的动作见 [API 参考](/docs/api/reference)。

## 读取页面

```bash
curl --get 'http://localhost:18080/api.php' \
  --data-urlencode 'action=query' \
  --data-urlencode 'prop=revisions' \
  --data-urlencode 'rvprop=content' \
  --data-urlencode 'titles=首页' \
  --data-urlencode 'formatversion=2'
```

读取内容受页面权限约束。常用查询包括 `meta=siteinfo|userinfo|tokens`、`prop=info|revisions|categories|imageinfo` 和 `list=allpages|search|recentchanges`。

## 登录和编辑

先取 login token，再携带同一份 Cookie 登录；登录后取得 CSRF token，用于写操作。下面的示例需要 curl 和 jq，将 `Bot` 替换为本站账号，并在环境变量 `WIKI_PASSWORD` 中提供密码。

```bash
BASE='http://localhost:18080'

LOGIN_TOKEN=$(curl -s -c cookies.txt \
  "$BASE/api.php?action=query&meta=tokens&type=login&format=json" \
  | jq -r '.query.tokens.logintoken')

curl -s -b cookies.txt -c cookies.txt \
  --data-urlencode 'action=login' \
  --data-urlencode 'lgname=Bot' \
  --data-urlencode "lgpassword=$WIKI_PASSWORD" \
  --data-urlencode "lgtoken=$LOGIN_TOKEN" \
  "$BASE/api.php" > /dev/null

CSRF_TOKEN=$(curl -s -b cookies.txt \
  "$BASE/api.php?action=query&meta=tokens&type=csrf&format=json" \
  | jq -r '.query.tokens.csrftoken')

curl -s -b cookies.txt \
  --data-urlencode 'action=edit' \
  --data-urlencode 'title=沙盒' \
  --data-urlencode 'text=机器人写入的内容' \
  --data-urlencode 'summary=curl 示例' \
  --data-urlencode "token=$CSRF_TOKEN" \
  "$BASE/api.php" | jq .
```

保存前检查响应。出现 `error` 时读取 `code` 和 `info`，不要仅依据 HTTP 状态码判断成功。编辑冲突检测可提交 `baserevid`；追加正文和分段编辑分别使用 `appendtext`、`section` 等参数。

## 原始内容和前端脚本

`/index.php?title=页面&action=raw` 返回页面源内容。页面级 JavaScript 可指定 `ctype=text/javascript`。这些入口同样受页面访问权限限制。

浏览器页面中的 `mw.Api`、`mw.loader` 等兼容接口见 [API 参考](/docs/api/reference)。兼容层不包含 MediaWiki 所有模块，接入旧脚本后应检查浏览器控制台。

## 插件接口

评论、头像、通知和 AI 等接口由相应插件注册；没有安装插件时接口不存在。参数和权限以各[插件说明](/plugins)为准。不要把 `/api.php` 的 token 流程直接套用到另一套接口。

JSONP 的 `callback` 仅适用于允许的匿名公开读取，不应携带登录态或用于获取 token。
