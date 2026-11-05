import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import PluginCatalog from '@site/src/components/PluginCatalog';
import styles from './plugins.module.css';

export default function PluginsPage() {
  return (
    <Layout
      title="插件目录"
      description="WikiKernel 的公开插件目录：内容标记、编辑治理、用户社交、文件媒体、皮肤与 AI。">
      <main className={styles.page}>
        <div className={styles.hero}>
          <h1>插件目录</h1>
          <p>
            按名称或用途查找插件。每篇说明列出用法、配置和兼容范围；安装方式见插件安装文档。
          </p>
          <div className={styles.actions}>
            <Link className="button button--primary button--lg" to="/docs/plugins">
              插件系统文档
            </Link>
            <Link className="button button--secondary button--lg" to="/docs/development/plugin-development">
              写一个插件
            </Link>
          </div>
        </div>

        <section className={styles.catalogSection}>
          <PluginCatalog />
        </section>

        <section className={styles.note}>
          <h2>开发与问题反馈</h2>
          <p>
            此目录列出公开插件。
            你可以在 <a href="https://github.com/THOnlyWiki/WikiKernel/issues">GitHub Issues</a>
            提出需求，或直接按 <Link to="/docs/development/plugin-development">插件开发指南</Link> 写一个。
          </p>
        </section>
      </main>
    </Layout>
  );
}
