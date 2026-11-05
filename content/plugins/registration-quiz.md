---
title: "注册问答"
sidebar_label: "注册问答"
description: "注册时随机显示一道站点配置的问题，并验证答案。"
---

# 注册问答

注册时随机显示一道站点配置的问题，并验证答案。

## 设置题库

在站点设置中开启 `features.registration-quiz`，并填写 `registration.quiz`。每行一道题，竖线分隔问题和可接受的答案：

```text
1 + 1 = ? | 2 | 二
本站名称？ | WikiKernel
```

注册页随机抽一道题。答案忽略首尾空格和大小写；开启但没有有效题目时不拦截注册。旧的 `registration.questions` / `registration.answers` 格式仍兼容。

## App 与接口

App 1.5.4 已接入问答。`GET /api/registration-quiz/challenge` 返回 `required`，需要验证时另含 `index` 和 `question`，不返回答案。客户端注册时向 `/api/user/register` 提交 `registerQuizIndex`、`registerAnswer`。

旧服务器没有该题目接口时，App 自动读取注册表单；网络失败或无法识别表单时提示重试。

## 校验范围

网页和接口注册都由注册钩子检查，包括管理员代建账号。该插件不提供图片验证码、题目语言分组或答错次数限制。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/registration-quiz)
