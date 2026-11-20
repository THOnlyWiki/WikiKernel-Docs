---
title: "界面与系统页面"
description: "界面与系统页面"
---

# 界面与系统页面

这些配置以 Wiki 页面保存。编辑系统脚本、样式和微件需要相应权限；普通词条的编辑权限不代表可以修改可执行脚本。

## 侧边栏

编辑 `WikiKernel:Sidebar`，每行一个菜单项：

```text
* 导航
** 首页|首页
** 特殊:最近更改|最近更改
** 特殊:随机页面|随机页面
```

一级星号创建分组，二级星号中的竖线左侧是目标，右侧是显示文字。侧边栏页面标题也可用 `wikikernel.sidebar.page` 配置。

## 公告与编辑提示

| 页面 | 用途 |
| --- | --- |
| `WikiKernel:Sitenotice` | 标题上方的站点公告 |
| `WikiKernel:Anonnotice` | 匿名公告，未定义或关闭时回退到站点公告 |
| `WikiKernel:Tagline` | 标题下方的副标题 |
| `WikiKernel:Editnotice` | 全站编辑提示 |
| `WikiKernel:Editnotice-0` | 主命名空间的编辑提示，其他编号按命名空间编号替换 |

支持 Wikitext 和语言子页，例如 `WikiKernel:Sitenotice/en`。留空或只写 `-` 可关闭相应消息；未创建这些 WikiKernel 配置页时，会尝试对应的 MediaWiki 同名页。

## 系统消息

打开 `特殊:所有消息`（英文别名 `Special:AllMessages`）可以查看 core 和已加载插件注册的消息。
页面支持前缀、语言和自定义状态筛选，以及分页。已修改的消息分两行显示默认文本与当前文本；源码按文本展示。

点击名称会打开对应界面页的编辑器。以 `common.search` 为例，中文覆盖页是 `WikiKernel:Common.search`，英文覆盖页是 `WikiKernel:Common.search/en`。
未创建覆盖页时，编辑器会载入默认文本。保存后沿用普通 Wiki 页的修订历史和权限检查；删除覆盖页后恢复资源默认值。
已有的 `MediaWiki:` 同名消息页也能读取，`WikiKernel:` 页优先。已被隐藏或当前用户不可读的覆盖内容不会通过消息列表或消息 API 泄露。

`Sidebar`、站点公告和编辑提示仍沿用各自已有的配置规则。侧边栏条目指向 `wikikernel.sidebar.page` 配置的页面，不另建一套侧栏配置。
CSS 和 JavaScript 继续使用下文的样式、脚本页面，执行权限不由消息列表改变。

也可使用 `/api.php?action=query&meta=allmessages` 读取消息，支持 `ammessages`、`amprefix`、`amfilter`、`amlang`、`amcustomised`、`amfrom`、`amto` 和 `amincludedefault`。

页面行为参考 MediaWiki 的 [SpecialAllMessages](https://doc.wikimedia.org/mediawiki-core/1.46.0/php/SpecialAllMessages_8php_source.html) 和 [AllMessagesTablePager](https://doc.wikimedia.org/mediawiki-core/REL1_39/php/AllMessagesTablePager_8php_source.html)。
列表使用本项目实际存在的消息键，不填充未安装扩展的消息。

## CSS 和 JavaScript

全站样式使用 `WikiKernel:Common.css`，全站脚本使用 `WikiKernel:Common.js`。皮肤专用页面为 `WikiKernel:<皮肤 id>.css` 和 `.js`，id 使用皮肤实际标识。

单页可创建 `页面标题/Common.css` 或 `页面标题/Common.js`。其他同类型子页也会加载，父页面可以是插件生成的虚拟页面。CSS 放在皮肤和插件样式之后；JS 以延迟执行的外部脚本加载，填写 JavaScript 源码即可。

选择器必须与页面元素匹配。例如编辑、历史标签的标识是 ID：

```css
#ca-edit,
#ca-history {
  display: none;
}
```

保存后若没有效果，先在浏览器开发者工具中检查样式是否加载、选择器是否命中，再检查更高优先级的规则。需要真正限制操作时，使用[页面权限](/docs/administration/permissions)。

## 更换皮肤

将皮肤插件安装到插件目录，再按该皮肤的配置设置。皮肤开发和前端组件变量见[皮肤与前端](/docs/development/skins)。
