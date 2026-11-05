import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './index.module.css';
const chapters = [
  {title: '安装与部署', text: '构建发行包、初始化站点、配置数据库和备份。', links: [
    ['安装与启动', '/docs/getting-started/quickstart'], ['Docker', '/docs/deployment/docker'],
    ['配置文件', '/docs/deployment/configuration'], ['备份与升级', '/docs/deployment/maintenance']]},
  {title: '编辑与使用', text: '创建页面、编写模板，管理账号和文件。', links: [
    ['页面与修订', '/docs/guides/pages'], ['Wikitext 与模板', '/docs/guides/wikitext'],
    ['账号与个人设置', '/docs/guides/accounts'], ['文件与媒体', '/docs/guides/files']]},
  {title: '站点管理', text: '设置阅读和编辑权限，修改界面，安装扩展。', links: [
    ['页面权限', '/docs/administration/permissions'], ['界面与系统页面', '/docs/administration/interface'],
    ['页面缓存', '/docs/administration/cache'], ['插件安装', '/docs/plugins']]},
  {title: '接口与开发', text: '接入机器人，开发插件和皮肤。', links: [
    ['API 使用', '/docs/api/overview'], ['插件开发', '/docs/development/plugin-development'],
    ['扩展点与服务', '/docs/development/extensions'], ['皮肤与前端', '/docs/development/skins']]},
];
export default function Home() {
  return (
    <Layout title="文档" description="WikiKernel 的安装、使用、管理与开发说明。">
      <main className={styles.page}>
        <header className={styles.header}>
          <p className={styles.label}>WikiKernel 文档</p>
          <h1>安装、使用和维护一个 Wiki</h1>
          <p className={styles.intro}>WikiKernel 使用 Java 21 和 Spring Boot 4 开发，提供页面编辑、修订历史、模板和特殊页面。评论、审核等功能通过插件安装。</p>
          <div className={styles.actions}>
            <Link className="button button--primary" to="/docs/getting-started/quickstart">安装与启动</Link>
            <Link className="button button--secondary" to="/docs/intro">文档目录</Link>
          </div>
        </header>
        <div className={styles.chapters}>
          {chapters.map(chapter => (
            <section className={styles.chapter} key={chapter.title}>
              <h2>{chapter.title}</h2><p>{chapter.text}</p>
              <ul>{chapter.links.map(([label, href]) => <li key={href}><Link to={href}>{label}</Link></li>)}</ul>
            </section>
          ))}
        </div>
        <section className={styles.reference}>
          <h2>查阅功能和配置</h2>
          <p><Link to="/plugins">插件目录</Link>可按名称和用途筛选。部署选项见<Link to="/docs/administration/configuration-reference">配置参考</Link>，接口参数见<Link to="/docs/api/reference">API 参考</Link>。</p>
          <p>WikiKernel 实现了部分 MediaWiki 语法与接口。迁移模板或工具前，请检查对应功能的支持范围。</p>
        </section>
      </main>
    </Layout>
  );
}
