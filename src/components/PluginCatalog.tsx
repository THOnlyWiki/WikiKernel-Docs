import React, {useMemo, useState} from 'react';
import PluginCard, {type Plugin} from './PluginCard';
import pluginsData from '@site/src/data/plugins.json';
import categoriesData from '@site/src/data/plugin-categories.json';
import styles from './PluginCatalog.module.css';

const plugins = pluginsData as Plugin[];
const categories = categoriesData as {id: string; label: string; count: number}[];

export default function PluginCatalog() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return plugins.filter((plugin) => {
      if (category !== 'all' && plugin.category !== category) return false;
      if (!needle) return true;
      return [plugin.id, plugin.name, plugin.title, plugin.description, plugin.categoryLabel]
        .join(' ')
        .toLowerCase()
        .includes(needle);
    });
  }, [category, query]);

  return (
    <div className={styles.catalog}>
      <div className={styles.controls}>
        <label className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">⌕</span>
          <input
            className={styles.search}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜索插件、能力或关键词…"
            aria-label="搜索插件"
          />
        </label>
        <div className={styles.chips} role="group" aria-label="按分类筛选插件">
          <button
            type="button"
            className={category === 'all' ? `${styles.chip} ${styles.active}` : styles.chip}
            onClick={() => setCategory('all')}
            aria-pressed={category === 'all'}>
            全部 <span>{plugins.length}</span>
          </button>
          {categories.map((item) => (
            <button
              key={item.id}
              type="button"
              className={category === item.id ? `${styles.chip} ${styles.active}` : styles.chip}
              onClick={() => setCategory(item.id)}
              aria-pressed={category === item.id}>
              {item.label} <span>{item.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.resultLine}>
        <strong>{filtered.length}</strong> 个插件
        {query ? <> · 搜索 “{query}”</> : null}
      </div>

      {filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map((plugin) => (
            <PluginCard key={plugin.id} plugin={plugin} />
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          <h3>没有匹配的插件</h3>
          <p>换一个关键词，或查看全部插件。</p>
          <button type="button" className={styles.reset} onClick={() => { setQuery(''); setCategory('all'); }}>
            清除筛选
          </button>
        </div>
      )}
    </div>
  );
}
