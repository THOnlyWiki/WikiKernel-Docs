#!/usr/bin/env node
/**
 * One-time migration helper for the legacy Markdown files imported from the
 * main repository. The old docs used links relative to the repository root.
 */
import {access, readFile, readdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(here, '..');
const contentRoot = path.join(docsRoot, 'content');
const pluginIds = new Set(
  (await readdir(path.join(contentRoot, 'plugins')))
    .filter((file) => file.endsWith('.md') && file !== 'index.md')
    .map((file) => file.slice(0, -3)),
);

const docsMap = {
  'API.md': '/docs/api/reference',
  'CONFIG.md': '/docs/administration/configuration-reference',
  'FEATURES.md': '/docs/guides/features',
  'MIXIN.md': '/docs/development/mixin',
  'PLUGIN-DEV.md': '/docs/development/plugin-development',
  'SKIN.md': '/docs/development/skins',
  'THIRD-PARTY-LOGIN.md': '/docs/administration/third-party-login',
  'WIKITEXT.md': '/docs/guides/wikitext',
};

async function walk(dir) {
  const result = [];
  for (const entry of await readdir(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...await walk(full));
    else if (entry.name.endsWith('.md')) result.push(full);
  }
  return result;
}

for (const file of await walk(contentRoot)) {
  if (file.includes(`${path.sep}plugins${path.sep}`)) continue;
  let text = await readFile(file, 'utf8');
  const original = text;

  text = text.replace(/\.\.\/README\.md(#[\w\u4e00-\u9fff%-]+)?/g,
    (_m, hash = '') => `https://github.com/THOnlyWiki/WikiKernel${hash}`);
  text = text.replace(/\.\.\/README\.md/g, 'https://github.com/THOnlyWiki/WikiKernel');

  for (const [name, target] of Object.entries(docsMap)) {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    text = text.replace(new RegExp(`\\./${escaped}(#[^)\\s]*)?`, 'g'),
      (_m, hash = '') => `${target}${hash}`);
  }

  text = text.replace(/\.\.\/plugin\/([a-z0-9-]+)\/README\.md/g,
    (_m, id) => pluginIds.has(id)
      ? `/docs/plugins/${id}`
      : `https://github.com/THOnlyWiki/WikiKernel/tree/master/plugin/${id}`);

  // These are placeholders in a documentation example of the 404 page.
  text = text.replace(/href="\$SEARCH_URL\$"/g, 'href="#search"');
  text = text.replace(/href="\$LOGS_URL\$"/g, 'href="#logs"');
  text = text.replace(/href="\$CREATE_URL\$"/g, 'href="#create"');

  if (text !== original) {
    await writeFile(file, text, 'utf8');
    console.log(`updated ${path.relative(docsRoot, file)}`);
  }
}
