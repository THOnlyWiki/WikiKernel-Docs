---
title: "跨 Wiki 链接"
description: "跨 Wiki 链接"
---

# 跨 Wiki 链接


仿 MediaWiki 的 [Interwiki](https://www.mediawiki.org/wiki/Manual:Interwiki) 功能：用**前缀**把
`[[前缀:页面]]` 指向另一个 wiki，或在多语言站点之间建立**跨语言链接**。

- **三种前缀语义**（在 `特殊:跨Wiki` 里维护，表 `wiki_interwiki`）：

  | 前缀类型 | 写法 | 效果 |
  | --- | --- | --- |
  | 普通前缀 | `[[w:示例页面]]`、`[[commons:File:X.svg]]` | 渲染成外部链接（`class="external mw-interwiki"`，新窗口打开），显示名默认是「前缀:页面」，可用 `[[w:页面\|显示名]]` 覆盖 |
  | 语言前缀（填了语言码） | `[[en:Interwiki demo]]` | **跨语言链接**：从正文剥离，收集到侧栏「语言」区块（显示语言名，如「英语」）；同一语言只保留第一次出现 |
  | 本地前缀（勾选「本地前缀」） | `[[专题:某某]]` | 生成站内链接 `/wiki/专题:某某`（照常判断红链） |

- **前导冒号**（仿 MediaWiki 的「强制链接」）：`[[:en:Page]]` 不当作跨语言链接，
  `[[:分类:X]]` 只显示链接而不归类；`[[:w:Page]]` 同样渲染成跨 Wiki 外链；
- **URL 模板**：`$1` 会替换成页面名，编码规则**对齐 MediaWiki 的 `wfUrlencode`**
  （空格 → `_`，保留 `: / ' , $ @`），所以 `[[commons:File:Example.svg]]` 得到
  `https://commons.wikimedia.org/wiki/File:Example.svg`；模板里没有 `$1` 时页面名追加到末尾；
- **本地命名空间优先**：`[[帮助:X]]`、`[[分类:X]]` 这类真实命名空间仍按站内处理，
  跨 Wiki 前缀只接管不冲突的前缀（所以前缀别取成已有命名空间名）；
- **默认前缀表**（`InterwikiSeeder`，只在**表为空**时写入，之后不会被启动流程覆盖）：
  `wikipedia` / `w`、`wiktionary` / `wikt`、`wikibooks`、`wikinews`、`wikiquote`、`wikisource`、
  `wikiversity`、`wikispecies`、`commons`、`meta`、`mw`、`wikidata` / `d`，
  以及语言前缀 `zh` / `en` / `ja` / `ko` / `de` / `fr` / `es` / `ru` / `it` / `pt` / `ar` / `vi`
  （默认指向对应语言的维基百科——**自建多语言 wiki 时请改成自己的地址**）；
- **`特殊:跨Wiki`**（`Special:Interwiki`）：前缀 / URL 模板 / 语言 / 标志（本地、可嵌入）列表，
  可新增 / 编辑（`?edit=编号`）/ 删除，并支持**文本导出 / 导入**
  （每行：`前缀 URL [本地 0/1] [可嵌入 0/1] [语言码]`，`#` 开头是注释）；
  表格所有人都能看，增删改需要**管理员 / 行政员**（API：`POST /api/interwiki/save|delete|import`）；
- **未实现**：`可嵌入（iw_trans）`只记录标志，尚不支持 `{{前缀:页面}}` 的**远端模板嵌入**
  （MediaWiki 需要远端 wiki 的 API，本地实现会引入外网依赖与缓存问题）；
- 演示页 **`跨Wiki演示页`**；回归测试 `InterwikiTest`。

```text
[[w:示例页面]]              →  https://zh.wikipedia.org/wiki/示例页面
[[wikt:word|词典]]          →  https://zh.wiktionary.org/wiki/word（显示「词典」）
[[commons:File:X.svg]]      →  https://commons.wikimedia.org/wiki/File:X.svg
[[en:Interwiki demo]]       →  正文不显示；侧栏「语言」出现「英语 → en 版页面」
[[:en:Interwiki demo]]      →  正文里显示成链接（强制链接）
[[专题:某某]]                →  /wiki/专题:某某（本地前缀，站内链接）
```

