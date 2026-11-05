---
title: "插件依赖示例"
sidebar_label: "插件依赖示例"
description: "演示插件依赖、启动顺序和共享服务，供开发时参考。"
---

# 插件依赖示例

演示插件依赖、启动顺序和共享服务，供开发时参考。

## 描述文件（`META-INF/wiki-plugin.properties`）

```properties
plugin.id=dep-demo
plugin.requires=                 # 运行期依赖（本插件留空 = 不依赖其它插件）
plugin.requiresCore=>=0.0.1      # core 版本约束（数字段比较，0.0.1-SNAPSHOT 也满足）
plugin.clientRequires=comments   # 前端资源依赖：comments 的 head 片段先注入
plugin.aop=true                  # 声明需要插件 AOP 桥（默认 auto 只有声明了才启用）
```


## 它做了什么

| 扩展点 | 作用 |
| --- | --- |
| `CoreAopHook`（`hook/DepDemoAopHook`） | 提供两个 `DefaultPointcutAdvisor`：① 环绕 core 的 `SiteSettingsService#get(String, String)` 并计数（`GET_CALLS`）——演示「插件对 core / common 加切面」，且**对已经注入到其它 Bean 的引用同样生效**；② 环绕插件自己的 `DepDemoService#greet(String)` 并计数（`GREET_CALLS`）——演示「插件对自己插件里的 Bean 加切面」（core 在插件子容器里也挂了一份 AOP 桥） |
| `HtmlHeadProvider`（`hook/DepDemoHeadProvider`） | 站点级 `<head>` 片段（注释 + `<meta name="dep-demo">`），用来观察 `plugin.clientRequires` 决定的注入顺序 |
| `MessageBundle`（`DepDemoMessages`） | 插件名 / 描述的本地化文案（`i18n/messages*.properties`，中英键集合一致） |
| `@Component DepDemoService` | 插件自己的业务 Bean（被上面第 ② 个切面命中） |


## 需要注意

- 插件 AOP 桥默认「安全优先」：`wikikernel.plugins.aop-bridge=auto` 只有在有插件声明 `plugin.aop=true`
  （本插件就是这样）时才启用；也可以在启动参数里 `--wikikernel.plugins.aop-bridge=true` 强制打开给所有插件用。
  框架 / Web 基础设施 Bean（Servlet Filter、Servlet、HandlerInterceptor、数据源、事务管理器、
  带 `final` 方法的类等）永远不会被代理 —— 这是为了不让代理破坏容器生命周期（`GenericFilterBean.init()` 是 final）；
- core 不带 `aspectjweaver`，所以 pointcut 用 Spring 原生实现（`NameMatchMethodPointcut` + `ClassFilter`），
  不能用 `@Aspect` / `execution(...)`（`AspectJExpressionPointcut`）；
- 统计值放在静态字段上，是为了让 core 侧测试在**没有编译期依赖**的前提下读回来（插件与 core 只共享 `common`）。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/dep-demo)
