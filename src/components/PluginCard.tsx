import React from 'react';
import Link from '@docusaurus/Link';
import styles from './PluginCard.module.css';

export type Plugin = {
  id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  categoryLabel: string;
  status: string;
  distribution: boolean;
  docs: string;
  source: string;
};

export default function PluginCard({plugin}: {plugin: Plugin}) {
  return (
    <Link className={styles.card} to={plugin.docs}>
      <div className={styles.topline}>
        <span className={styles.category}>{plugin.categoryLabel}</span>
        {plugin.status === 'demo' ? (
          <span className={styles.demo}>演示</span>
        ) : null}
      </div>
      <h3 className={styles.name}>{plugin.name}</h3>
      <p className={styles.description}>{plugin.description || plugin.title}</p>
      <div className={styles.footer}>
        <code>{plugin.id}</code>
        <span className={styles.arrow}>→</span>
      </div>
    </Link>
  );
}
