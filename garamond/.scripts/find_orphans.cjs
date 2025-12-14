const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (/\.jsx?$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function readFile(fp) {
  try { return fs.readFileSync(fp, 'utf8'); } catch (e) { return null; }
}

function resolveImport(spec, fromFile) {
  if (!spec.startsWith('.')) return null;
  const fromDir = path.dirname(fromFile);
  const candidate = path.resolve(fromDir, spec);
  const tries = [candidate, candidate + '.js', candidate + '.jsx', path.join(candidate, 'index.js'), path.join(candidate, 'index.jsx')];
  for (const t of tries) {
    if (fs.existsSync(t) && fs.statSync(t).isFile()) return path.normalize(t);
  }
  return null;
}

function collectImports(files) {
  const imports = new Map();
  for (const f of files) {
    const content = readFile(f);
    if (content === null) continue;
    const set = new Set();
    const reFrom = /from\s+['"]([^'"]+)['"]/g;
    let m; while ((m = reFrom.exec(content)) !== null) set.add(m[1]);
    const reImportOnly = /import\s+['"]([^'"]+)['"]/g;
    while ((m = reImportOnly.exec(content)) !== null) set.add(m[1]);
    const reReq = /require\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((m = reReq.exec(content)) !== null) set.add(m[1]);
    const reDyn = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
    while ((m = reDyn.exec(content)) !== null) set.add(m[1]);

    const resolved = [];
    for (const s of set) {
      const r = resolveImport(s, f);
      if (r) resolved.push(r);
    }
    imports.set(path.normalize(f), resolved);
  }
  return imports;
}

function invertGraph(imports) {
  const incoming = new Map();
  for (const f of imports.keys()) incoming.set(f, new Set());
  for (const [from, tos] of imports.entries()) {
    for (const to of tos) {
      if (!incoming.has(to)) incoming.set(to, new Set());
      incoming.get(to).add(from);
    }
  }
  return incoming;
}

function main() {
  const files = walk(srcDir).map(p => path.normalize(p));
  const imports = collectImports(files);
  const incoming = invertGraph(imports);

  const roots = new Set([
    path.normalize(path.join(srcDir, 'main.jsx')),
    path.normalize(path.join(srcDir, 'App.jsx')),
    path.normalize(path.join(srcDir, 'app.jsx')),
    path.normalize(path.join(srcDir, 'index.js')),
    path.normalize(path.join(srcDir, 'index.jsx')),
    path.normalize(path.join(srcDir, 'games', 'App.jsx')),
  ]);

  const orphans = [];
  for (const f of files) {
    const inc = incoming.get(f);
    const count = inc ? inc.size : 0;
    if (count === 0 && !roots.has(f)) {
      orphans.push({ file: f, imports: imports.get(f) || [] });
    }
  }

  console.log(JSON.stringify({ orphans }, null, 2));
}

main();
