#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const stitchDir = path.join(root, 'stitch-export');
const reportPath = path.join(root, 'stitch-export', 'REUSE_REPORT.md');

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files = files.concat(walk(full));
    else files.push(full);
  }
  return files;
}

function extractClasses(html) {
  const matches = [...html.matchAll(/class\s*=\s*["']([^"']+)["']/gi)];
  const classes = [];
  for (const m of matches) {
    classes.push(...m[1].split(/\s+/).filter(Boolean));
  }
  return classes;
}

if (!fs.existsSync(stitchDir)) {
  console.error('stitch-export not found');
  process.exit(1);
}

const htmlFiles = walk(stitchDir)
  .filter((f) => f.endsWith('.html'))
  .filter((f) => !f.includes(`${path.sep}assets${path.sep}`));

if (htmlFiles.length === 0) {
  const content = `# Stitch Reuse Report\n\nNo HTML files found under \`stitch-export\`.\n\n## Next Step\nPaste exported Google Stitch HTML files, then run:\n\n\`node scripts/analyze-stitch-export.js\`\n`;
  fs.writeFileSync(reportPath, content);
  console.log('Generated empty reuse report:', path.relative(root, reportPath));
  process.exit(0);
}

const classCount = new Map();
const fileSummaries = [];
const motifCounts = {
  sidebars: 0,
  headers: 0,
  cards: 0,
  grids: 0,
  buttons: 0,
  progressBars: 0,
  gameTiles: 0,
};

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const classes = extractClasses(html);
  classes.forEach((c) => classCount.set(c, (classCount.get(c) || 0) + 1));
  motifCounts.sidebars += /aside\b/gi.test(html) ? 1 : 0;
  motifCounts.headers += /header\b/gi.test(html) ? 1 : 0;
  motifCounts.cards += (html.match(/rounded-xl|rounded-lg|shadow-\[/gi) || []).length;
  motifCounts.grids += (html.match(/grid-cols-/gi) || []).length;
  motifCounts.buttons += (html.match(/<button\b/gi) || []).length;
  motifCounts.progressBars += (html.match(/progress|w-\[\d+%]|h-2 w-full/gi) || []).length;
  motifCounts.gameTiles += (html.match(/casino|sports_esports|military_tech|query_stats|monetization_on/gi) || []).length;
  fileSummaries.push({
    file: path.relative(root, file),
    classes: new Set(classes).size,
    sections: (html.match(/<section\b/gi) || []).length,
    forms: (html.match(/<form\b/gi) || []).length,
    buttons: (html.match(/<button\b/gi) || []).length,
  });
}

const topClasses = [...classCount.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 30);

let md = '# Stitch Reuse Report\n\n';
md += `Generated from ${htmlFiles.length} HTML files in \`stitch-export\`.\n\n`;
md += '## Most Valuable Reusable Patterns\n\n';
md += '| Pattern | Signals |\n|---|---:|\n';
md += `| Shells (sidebars + headers) | ${motifCounts.sidebars + motifCounts.headers} |\n`;
md += `| Card and panel treatments | ${motifCounts.cards} |\n`;
md += `| Dense content grids | ${motifCounts.grids} |\n`;
md += `| CTA/button styling | ${motifCounts.buttons} |\n`;
md += `| Progress/status affordances | ${motifCounts.progressBars} |\n`;
md += `| Game-specific iconography/tile motifs | ${motifCounts.gameTiles} |\n`;

md += '## High-Reuse CSS Classes\n\n';
md += '| Class | Occurrences |\n|---|---:|\n';
for (const [name, count] of topClasses) {
  md += `| \`${name}\` | ${count} |\n`;
}

md += '\n## Per-Page Structural Summary\n\n';
md += '| File | Unique Classes | Sections | Forms | Buttons |\n|---|---:|---:|---:|---:|\n';
for (const s of fileSummaries) {
  md += `| ${s.file} | ${s.classes} | ${s.sections} | ${s.forms} | ${s.buttons} |\n`;
}

md += '\n## Reuse Guidance\n\n';
md += '- Keep the visual hierarchy: bold headline font, gold/cyan accents, glassy dark panels, and compact metric chips.\n';
md += '- Reuse the patterns, not the raw HTML. Convert them into React primitives for cards, hero panels, status pills, and game tiles.\n';
md += '- Prioritize Stitch ideas that map to real product surfaces: dashboard hero, games directory, stats snapshots, settings sections, and slot-machine framing.\n';
md += '- Keep raw exports as reference files; production UI belongs in `src/renderer`.\n';

fs.writeFileSync(reportPath, md);
console.log('Generated reuse report:', path.relative(root, reportPath));
