---
title: "分类树"
sidebar_label: "分类树"
description: "在页面中嵌入可展开的分类树，按需加载子分类和页面。"
---

# 分类树

在页面中嵌入可展开的分类树，按需加载子分类和页面。

## 安装与配置

插件 jar 放进 `plugins/`（`gradlew installPlugins`），配置写在 `LocalSettings.yaml`：

```yaml
wikikernel:
  plugins:
    settings:
      category-tree:
        allow-tag: true                 # false = 不注册标签与解析器函数（特殊页 / API 仍可用）
        max-children: 200               # 每个节点最多渲染多少直接成员（$wgCategoryTreeMaxChildren）
        max-depth-categories: 2         # mode=categories 的深度上限（$wgCategoryTreeMaxDepth.categories）
        max-depth-pages: 1              # mode=pages（$wgCategoryTreeMaxDepth.pages）
        max-depth-all: 1                # mode=all / parents（$wgCategoryTreeMaxDepth.all）
        default-mode: categories        # $wgCategoryTreeDefaultMode
        default-hideprefix: categories  # $wgCategoryTreeOmitNamespace
        default-showcount: false        # 原版固定 false，这里做成配置项
```

`/init` 安装向导里有同名 tab（`CategoryTreeSetup`）；`default-mode` / `default-hideprefix` 用下拉框选择。


## 选项（对齐原版 `OptionManager`）

| 选项 | 取值 | 默认 |
| --- | --- | --- |
| `mode` | `categories`（别名 `sub`，旧数值 `0`）、`pages`（`10`）、`all`（`20`）、`parents`（别名 `super`/`inverse`，`100`）、`default` | 配置 `default-mode`（`categories`） |
| `hideprefix` | `never`（`0`）、`always`（`10`）、`categories`（别名 `category`/`smart`，`20`）、`auto`（`30`）、`yes/true/on/1` → always、`no/false/off/0` → never | 配置 `default-hideprefix`（`categories`） |
| `namespaces` | 编号 `0/6/14/…`，`-`/`_`/`*`/`main` = 0，也接受中英文命名空间名；分隔符空格 / `#` / `:` / `|`。设置后自动调整 mode：只有 14 → `categories`；不含 6 → `pages`；含 6 → `all`；`parents` 模式忽略 | 无 |
| `showcount` | 布尔 | 配置 `default-showcount` |
| `hideroot` | 布尔（只影响标签 / 函数，不进 `data-ct-options`） | false |
| `depth` | 整数，按 mode 截断（`capDepth`） | 1 |
| `class` / `style` / `id` | 直接写到根 `<div>` 上 | 无 |
| `notranslations` | 会被解析并写入 `data-ct-options`，但**不生效**（WikiKernel 没有 Translate 扩展） | false |

用法示例：

```wikitext
<categorytree mode="all" depth="2" hideroot showcount>生物学</categorytree>
{{#categorytree:分类:生物学|mode=pages|namespaces=0|14|showcount}}
```


## 前端 AJAX 契约

- 服务端渲染 `.CategoryTreeSection` / `.CategoryTreeItem` / `.CategoryTreeBullet` / `.CategoryTreeToggle`
  （`data-ct-title`、`aria-expanded`、depth>0 时 `data-ct-loaded`）/ `.CategoryTreeChildren` / `.CategoryTreePageBullet`
  / `.CategoryTreeEmptyBullet` / `.CategoryTreeNotice`；
- 点击（或 Enter / Space）折叠箭头：先显示同级的 `.CategoryTreeChildren`，未加载时请求
  `GET /api.php?action=categorytree&category=<标题>&options=<data-ct-options>&formatversion=2`，
  取 `data.categorytree.html` 填入；空串 → 按 mode 显示 `categorytree-no-*` 提示；请求失败 → 「加载数据出错。 + 重试」；
- 文案来自服务端内联的 `window.CategoryTreeMessages`（`CategoryTreeHeadProvider` / 特殊页模板），JS 不再依赖 `mw.*`。


## 与 MediaWiki 原版的差异

### 未移植

1. **侧栏 portlet**（`SkinBuildSidebar` / `SkinAfterPortlet`，`$wgCategoryTreeSidebarRoot` / `SidebarOptions`）：
   WikiKernel 没有插件侧栏钩子（侧栏由 core 生成）。替代做法：在需要的页面写 `<categorytree hideroot depth="1">…</categorytree>`。
2. **`CategoryTreeHijackPageCategories`**（`OutputPageRenderCategoryLink`：把页面底部的分类链接换成可展开的树）：
   WikiKernel 的分类行由 core 渲染，没有对应钩子。
3. **分类页的子分类树按钮**（`CategoryViewer::doCategoryQuery` / `CategoryViewerGenerateLink`、`?notree`、`?mode=`、
   `$wgCategoryTreeCategoryPageOptions` / `CategoryPageMode`）：WikiKernel 的 `/特殊:分类` 由 core 渲染。
4. **`SpecialTrackingCategories::preprocess` / `generateCatLink`**：WikiKernel 没有「特殊:追踪分类」。
5. **解析缓存失效**（`$wgCategoryTreeDisableCache`、`ParserOutput::updateCacheExpiry`）与
   **`CategoryTreeHijackPageCategories` 的 categories 钩子**：core 未向插件暴露缓存 / 失效接口。
6. **Translate 扩展的 `notranslations`**：选项仍会被解析、写进 `data-ct-options`（保持契约），但不会过滤任何页面。
7. **`prefixSearchSubpages`**（特殊页子页搜索建议）与 `CategoryCache` / `WANObjectCache` 的
   `categorytree-html-ajax` 缓存、`last-modified` 条件请求：core 未暴露这些能力，API 每次都重新渲染。
8. **`$wgCategoryTreeUseCategoryTable`** 开关：成员统计统一走 core 的 `CategoryStore`。

### 行为差异（有意为之 / 环境所限）

1. **`{{#categorytree:…}}` 的实现方式**：core 的解析器函数返回值会继续按 wikitext 处理（HTML 白名单会剥掉
   `data-ct-*` / `aria-*`），所以插件输出的是等价的 `<categorytree …>分类</categorytree>` 标签文本，再由
   `CategoryTreeNestedTag`（`expandBody=true`）渲染成可信 HTML。最终 DOM 与原版一致。
2. **标签在模板里 / 由解析器函数生成时，标签内容会先随正文展开**：core 只在正文展开前保护「页面正文里直接书写」的
   raw 标签，展开后才出现的标签由另一个实现兜底。页面正文里直接书写的 `<categorytree>…</categorytree>`
   与原版一致（内容不展开，属性即选项）。
3. **裸属性 = true**：`<categorytree hideroot showcount>` 里的空属性值按 `true` 处理
   （原版 PHP 会把空串按 `decodeBoolean("") = false` 处理）。
4. **`hideprefix=1` 按布尔 true 处理**（→ always）；原版会先走 `is_numeric` 命中旧数值表兜底成 `never`。
   `0`（→ never）与旧数值 `10` / `20` / `30` 的语义不变。
5. **`namespaces` 支持命名空间名称**（`文件` / `分类` / `file` / `category` …）；原版走 `Language::getNsIndex`，
   这里内置一张中英文名称表。
6. **成员过滤在内存里做**：core 的 `CategoryStore.members(title, limit)` 只有 limit 参数，没有 SQL 侧的类型 /
   命名空间过滤，所以设置 `mode`（非 `all`）或 `namespaces` 时会全量取回再过滤 + 按 `max-children` 截断；
   不过滤时（`mode=all` 且无 `namespaces`）直接把 `max-children` 交给 core。
   原版在 SQL 里过滤，超大分类的渲染会更快、更省内存。
7. **成员统计按节点单独查询**：`CategoryStore` 没有批量接口，每个子分类节点都会查一次 `counts()`；
   红链判断（`class="new"`）也是每个节点一次 `WikiPageStore.byTitle`。原版一次 `category` 表查询批量取回统计、
   用 `LinkBatch` 批量查存在性。非常大的分类树会比原版明显更慢。
8. **`showcount` 的数字语义**：`mode=pages` 用 `all - files`（等价原版 `getMemberCount() - getFileCount()`）；
   但 core 的 `pages` 只统计主命名空间成员，其它命名空间页面只计入 `all`（原版 `cat_pages` 含所有非文件/非子分类页面）。
9. **depth 负数按 0 处理**：原版会渲染成「已加载但空的节点」，这里退化为「折叠 + `display:none`」。
10. **特殊页表单多一个 `showcount` 复选**（原版只能通过 URL 传参），且 `showcount` 默认值取配置
    `default-showcount`（原版特殊页默认 `true`，来自 `$wgCategoryTreeSpecialPageOptions`）。
11. **文案内置在插件里**，不注册到 core 的消息系统：按 JVM 默认语言选中文 / 英文（zh → 中文，其余 → 英文），
    与 wiki 的界面语言无关。（core 新出现了 `MessageBundle` 扩展点，插件将来可以改用它 + `#{…}` 模板键，
    本插件为了自包含仍使用内置消息表，见「疑点」第 7 条。）
12. **红链**：分类页面不存在时链接带 `class="new"`（core 的红链样式）。
13. **上级分类链接**带 `target` / `mode` / `hideprefix` / `showcount` / `namespaces` 查询参数，用「 | 」分隔
    （对应原版 `renderParents` + `pipe-separator`）。
14. **前端**不依赖 `mw.*` / ResourceLoader：消息由服务端内联为 `window.CategoryTreeMessages`，
    请求用 `fetch`（`credentials: same-origin`），事件用 `document` 上的委托。

[源码与开发说明](https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/category-tree)
