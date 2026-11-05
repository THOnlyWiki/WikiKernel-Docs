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
