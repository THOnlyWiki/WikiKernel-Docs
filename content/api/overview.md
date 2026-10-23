---
title: API 概览
sidebar_label: API 概览
sidebar_position: 1
description: WikiKernel 的 MediaWiki 兼容 Action API、REST API、认证流程与示例。
---

# API 概览

WikiKernel 提供两套接口：

1. **MediaWiki Action API 兼容层**：`/api.php?action=...`，适合机器人、pywikibot 风格脚本和旧工具。
2. **站点自己的 REST API**：`/api/*`，由 core 和插件分别提供，例如评论、私信、头像、审核、AI 代理。

本页讲最小可用流程；完整动作与参数见 [API 参考](/docs/api/reference)。

## MediaWiki 兼容入口

| 入口 | 用途 |
| --- | --- |
| `/api.php` | Action API，返回 JSON / JSONFM / XML |
| `/index.php?title=...` | 兼容旧链接，重定向到 `/wiki/...` |
| `/load.php?modules=...` | ResourceLoader 风格的最小兼容层 |
| `/js/mediawiki.js` | `mw`、`mw.loader`、`mw.Api` 等前端兼容层 |

通用参数：

```text
format=json
formatversion=2
callback=name
```

错误格式与 MediaWiki 对齐：

```json
{
  "error": {
    "code": "unknown_action",
    "info": "..."
  }
}
```

## 查询页面

```bash
curl 'http://localhost:18080/api.php?action=query&prop=revisions&rvprop=content&titles=首页&formatversion=2'
```

常用查询：

- `meta=siteinfo|userinfo|tokens`
- `prop=info|revisions|categories|imageinfo`
- `list=allpages|search|recentchanges|users|usercontribs|categorymembers|logevents`
- `redirects=1` 跟随重定向

## 登录与 token

写操作需要 CSRF token。登录本身需要一个 login token：

```bash
# 1. 取 login token，并保存 cookie
curl -c cookies.txt \
  'http://localhost:18080/api.php?action=query&meta=tokens&type=login&format=json'

# 2. 登录（把 lgtoken 替换成上一步的值）
curl -b cookies.txt -c cookies.txt \
  --data-urlencode 'action=login' \
  --data-urlencode 'lgname=Bot' \
  --data-urlencode "lgpassword=$WIKI_PASSWORD" \
  --data-urlencode 'lgtoken=...' \
  'http://localhost:18080/api.php'

# 3. 取 CSRF token
curl -b cookies.txt \
  'http://localhost:18080/api.php?action=query&meta=tokens&type=csrf&format=json'
```

## 编辑页面

```bash
curl -b cookies.txt \
  --data-urlencode 'action=edit' \
  --data-urlencode 'title=沙盒' \
  --data-urlencode 'text=来自 API 的内容' \
  --data-urlencode 'summary=API 测试' \
  --data-urlencode 'token=...' \
  'http://localhost:18080/api.php'
```

支持的常用编辑语义：

- `appendtext`：追加正文
- `section=N`：编辑指定段落
- `section=new` + `sectiontitle=`：追加新段落
- `baserevid`：编辑冲突检测
- `nocreate` / `createonly`
- `bot=1`：机器人组编辑

## 一个完整的 curl 示例

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

## 原始页面与导出

- `GET /index.php?title=页面&action=raw`：返回 wikitext。
- `GET /index.php?title=页面&action=raw&ctype=text/javascript`：指定 Content-Type。
- `特殊:导出页面` / `Special:Export`：导出页面、完整历史或引用模板。
- `特殊:导入页面` / `Special:Import`：导入 XML。

## 前端 `mw` 兼容层

页面默认加载 `/js/mediawiki.js`。在页面脚本、Widgets 或 Gadgets 中可以直接使用：

```js
mw.loader.using(['mediawiki.api'], function () {
  new mw.Api().get({
    action: 'query',
    meta: 'siteinfo',
    formatversion: '2'
  }).done(function (data) {
    console.log(data.query.general.sitename);
  });
});
```

可用的兼容模块与限制见 [完整 API 参考](/docs/api/reference)。

## REST API

站点自己的接口通常位于 `/api/` 下，例如：

```text
POST /api/comments
POST /api/comments/delete
POST /api/messages/send
POST /api/user/avatar
POST /api/ai-agent/...
```

它们使用站点的登录会话与 CSRF 校验，具体参数由 core 或插件文档定义。

## 下一步

- [完整 API 参考](/docs/api/reference)
- [插件开发](/docs/development/plugin-development)
- [第三方登录](/docs/administration/third-party-login)
