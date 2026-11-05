---
title: "GitHub 登录"
sidebar_label: "GitHub 登录"
description: "使用 GitHub OAuth 登录或绑定本站账号。"
---

# GitHub 登录

使用 GitHub OAuth 登录或绑定本站账号。

在 GitHub 创建 OAuth 应用，将回调地址填写为本站公网地址加 `/auth/github/callback`。在站点设置中填写 Client ID、Client Secret 并启用 GitHub 登录。

反向代理后的协议和域名必须与回调配置一致。账号绑定、自动注册和完整配置见[第三方登录](/docs/administration/third-party-login)。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/external-auth-github)
