// IDE C/C++ - logica interfetei
'use strict';

// ================================================================ utilitare

const $ = sel => document.querySelector(sel);
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
const store = {
  get(k, d) { try { const v = localStorage.getItem('cppide.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('cppide.' + k, JSON.stringify(v)); } catch { /* ignorat */ } },
};
const ext = p => (p.match(/\.([^./]+)$/) || [, ''])[1].toLowerCase();
const base = p => p.split('/').pop();
const dirname = p => p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '';
const join = (...parts) => parts.filter(Boolean).join('/').replace(/\/+/g, '/');
const isRunnable = p => ['c', 'cpp', 'cc', 'cxx'].includes(ext(p));
function normalize(p) {
  const out = [];
  for (const s of p.split('/')) { if (s === '..') out.pop(); else if (s && s !== '.') out.push(s); }
  return out.join('/');
}

async function apiGet(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r;
}
async function apiPost(url, body, method = 'POST') {
  const r = await fetch(url, {
    method, body: typeof body === 'string' ? body : JSON.stringify(body),
    headers: { 'Content-Type': typeof body === 'string' ? 'text/plain' : 'application/json' },
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || r.statusText);
  return data;
}

function languageOf(p) {
  return ({
    c: 'c', h: 'cpp', cpp: 'cpp', cc: 'cpp', cxx: 'cpp', hpp: 'cpp', md: 'markdown', json: 'json',
    sh: 'shell', bat: 'bat', js: 'javascript', py: 'python', html: 'html', css: 'css',
  })[ext(p)] || 'plaintext';
}
function iconOf(name, isDir) {
  if (isDir) return ['▸', 'ic-dir'];
  const e = ext(name);
  return ({
    cpp: ['C++', 'ic-cpp'], cc: ['C++', 'ic-cpp'], cxx: ['C++', 'ic-cpp'], c: ['C', 'ic-c'],
    h: ['h', 'ic-h'], hpp: ['h', 'ic-h'], md: ['M↓', 'ic-md'], sh: ['$', 'ic-sh'],
    in: ['in', 'ic-txt'], out: ['out', 'ic-txt'], txt: ['≡', 'ic-txt'],
  })[e] || ['·', 'ic-txt'];
}

const TEMPLATES = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Salut, lume!" << endl;
    return 0;
}
`,
  c: `#include <stdio.h>

int main(void) {
    printf("Salut, lume!\\n");
    return 0;
}
`,
  empty: '',
};

// ================================================================ starea aplicatiei

const state = {
  info: null,
  tree: [],
  expanded: new Set(store.get('expanded', [])),
  selected: null,             // calea selectata in explorator
  tabs: [],                   // { id, path, mode: 'code' | 'preview' }
  active: null,               // id-ul tabului activ
  models: new Map(),          // path -> { model, savedVersion }
  running: false,
  diagnostics: [],
  std: store.get('std', 'c++17'),
  theme: store.get('theme', 'dark'),
};

let monaco, editor, term, fitAddon, ws;

// ================================================================ pornire

require.config({ paths: { vs: '/lib/monaco/vs' } });
window.MonacoEnvironment = { getWorkerUrl: () => '/lib/monaco/vs/base/worker/workerMain.js' };

require(['vs/editor/editor.main'], async m => {
  monaco = m;
  applyTheme(state.theme);
  setupEditor();
  setupTerminal();
  setupLayout();
  setupUI();
  connect();

  state.info = await (await apiGet('/api/info')).json();
  $('#ws-name').textContent = state.info.workspaceName;
  const compiler = state.info.gpp || state.info.gcc;
  $('#st-compiler').textContent = compiler ? '⚙ ' + compiler.replace(/\s*\(.*?\)\s*/, ' ') : '⚠ compilator negăsit';
  if (!compiler) {
    termWrite('\x1b[31mNu am găsit g++/gcc. Instalează un compilator (vezi ide/README.md) și repornește IDE-ul.\x1b[0m\r\n');
  }

  await refreshTree();
  await buildLessons();

  // redeschide tab-urile din sesiunea trecuta
  const saved = store.get('tabs', null);
  if (saved && saved.length) {
    for (const t of saved) await openFile(t.path, { mode: t.mode, silent: true }).catch(() => {});
    const act = store.get('active', null);
    const t = state.tabs.find(x => x.id === act) || state.tabs[0];
    if (t) activate(t.id);
  } else if (findNode('README.md')) {
    await openFile('README.md', { mode: 'preview' });
  }
  render();
});

// ================================================================ editor (Monaco)

function setupEditor() {
  editor = monaco.editor.create($('#editor'), {
    model: null,
    automaticLayout: true,
    fontSize: store.get('fontSize', 14),
    fontFamily: 'Consolas, "Cascadia Code", "Fira Code", "DejaVu Sans Mono", monospace',
    minimap: { enabled: true },
    tabSize: 4,
    insertSpaces: true,
    renderWhitespace: 'selection',
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true, indentation: true },
    smoothScrolling: true,
    cursorSmoothCaretAnimation: 'on',
    scrollBeyondLastLine: false,
    mouseWheelZoom: true,
    stickyScroll: { enabled: true },
    suggest: { showWords: true },
  });

  editor.onDidChangeCursorPosition(e => {
    $('#st-cursor').textContent = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
  });
  editor.onDidChangeConfiguration(() => store.set('fontSize', editor.getOption(monaco.editor.EditorOption.fontSize)));

  registerCompletions();
}

// Fragmente de cod (snippets) + cuvinte cheie, pentru autocompletare
function registerCompletions() {
  const S = monaco.languages.CompletionItemKind.Snippet;
  const K = monaco.languages.CompletionItemKind.Keyword;
  const F = monaco.languages.CompletionItemKind.Function;
  const rule = monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet;

  const cppSnippets = [
    ['main', 'Programul principal', '#include <iostream>\nusing namespace std;\n\nint main() {\n\t$0\n\treturn 0;\n}'],
    ['for', 'Buclă for de la 1 la n', 'for (int ${1:i} = ${2:1}; ${1:i} <= ${3:n}; ${1:i}++) {\n\t$0\n}'],
    ['for0', 'Buclă for de la 0 la n-1', 'for (int ${1:i} = 0; ${1:i} < ${2:n}; ${1:i}++) {\n\t$0\n}'],
    ['forr', 'Buclă for descrescătoare', 'for (int ${1:i} = ${2:n}; ${1:i} >= ${3:1}; ${1:i}--) {\n\t$0\n}'],
    ['while', 'Buclă while', 'while (${1:conditie}) {\n\t$0\n}'],
    ['do', 'Buclă do-while', 'do {\n\t$0\n} while (${1:conditie});'],
    ['if', 'Instrucțiunea if', 'if (${1:conditie}) {\n\t$0\n}'],
    ['ife', 'if / else', 'if (${1:conditie}) {\n\t$2\n} else {\n\t$0\n}'],
    ['switch', 'Instrucțiunea switch', 'switch (${1:x}) {\ncase ${2:1}:\n\t$0\n\tbreak;\ndefault:\n\tbreak;\n}'],
    ['cout', 'Afișare', 'cout << ${1:x} << ${2:"\\n"};'],
    ['cin', 'Citire de la tastatură', 'cin >> ${1:x};'],
    ['fin', 'Citire din fișier', 'ifstream fin("${1:date.in}");\n$0'],
    ['fout', 'Scriere în fișier', 'ofstream fout("${1:date.out}");\n$0'],
    ['readv', 'Citește un vector', 'cin >> ${1:n};\nfor (int i = 1; i <= ${1:n}; i++) cin >> ${2:v}[i];'],
    ['printv', 'Afișează un vector', 'for (int i = 1; i <= ${1:n}; i++) cout << ${2:v}[i] << " ";\ncout << "\\n";'],
    ['readm', 'Citește o matrice', 'cin >> ${1:n} >> ${2:m};\nfor (int i = 1; i <= ${1:n}; i++)\n\tfor (int j = 1; j <= ${2:m}; j++)\n\t\tcin >> ${3:a}[i][j];'],
    ['func', 'Funcție', '${1:int} ${2:nume}(${3:int x}) {\n\t$0\n}'],
    ['struct', 'Structură', 'struct ${1:Elev} {\n\t${2:char nume[30];}\n\t$0\n};'],
    ['prim', 'Funcție: număr prim', 'bool prim(int x) {\n\tif (x < 2) return false;\n\tfor (int d = 2; d * d <= x; d++)\n\t\tif (x % d == 0) return false;\n\treturn true;\n}'],
    ['cmmdc', 'Funcție: cmmdc (Euclid)', 'int cmmdc(int a, int b) {\n\twhile (b) {\n\t\tint r = a % b;\n\t\ta = b;\n\t\tb = r;\n\t}\n\treturn a;\n}'],
    ['inc', '#include', '#include <${1:iostream}>'],
  ];
  const cSnippets = [
    ['main', 'Programul principal (C)', '#include <stdio.h>\n\nint main(void) {\n\t$0\n\treturn 0;\n}'],
    ['printf', 'Afișare (C)', 'printf("${1:%d}\\n", ${2:x});'],
    ['scanf', 'Citire (C)', 'scanf("${1:%d}", &${2:x});'],
    ...cppSnippets.filter(s => ['for', 'for0', 'forr', 'while', 'do', 'if', 'ife', 'switch', 'func', 'struct', 'prim', 'cmmdc', 'inc'].includes(s[0])),
  ];
  const keywords = ['int', 'long long', 'double', 'float', 'char', 'bool', 'void', 'unsigned', 'const', 'return', 'break', 'continue',
    'true', 'false', 'struct', 'sizeof', 'else', 'using namespace std;', 'endl', 'nullptr', 'auto', 'static'];
  const functions = ['sqrt', 'pow', 'abs', 'swap', 'max', 'min', 'sort', 'strlen', 'strcpy', 'strcat', 'strcmp', 'strchr', 'strstr',
    'strtok', 'toupper', 'tolower', 'isdigit', 'isalpha', 'getline', 'memset'];

  for (const [lang, snippets] of [['cpp', cppSnippets], ['c', cSnippets]]) {
    monaco.languages.registerCompletionItemProvider(lang, {
      provideCompletionItems(model, position) {
        const w = model.getWordUntilPosition(position);
        const range = { startLineNumber: position.lineNumber, endLineNumber: position.lineNumber, startColumn: w.startColumn, endColumn: w.endColumn };
        return {
          suggestions: [
            ...snippets.map(([label, doc, body]) => ({ label, kind: S, documentation: doc, detail: doc, insertText: body, insertTextRules: rule, range })),
            ...keywords.map(k => ({ label: k, kind: K, insertText: k, range })),
            ...(lang === 'cpp' ? functions : functions.filter(f => !['swap', 'max', 'min', 'sort', 'getline'].includes(f)))
              .map(f => ({ label: f, kind: F, insertText: f + '($0)', insertTextRules: rule, range })),
          ],
        };
      },
    });
  }
}

// ================================================================ fisiere si tab-uri

async function getModel(p) {
  if (state.models.has(p)) return state.models.get(p);
  const text = await (await apiGet('/api/file?path=' + encodeURIComponent(p))).text();
  const model = monaco.editor.createModel(text, languageOf(p), monaco.Uri.parse('file:///' + p));
  const entry = { model, savedVersion: model.getAlternativeVersionId() };
  model.onDidChangeContent(() => { renderTabs(); renderDirtyInTree(); if (activeTab()?.mode === 'preview') renderPreview(); });
  state.models.set(p, entry);
  return entry;
}
const isDirty = p => { const e = state.models.get(p); return !!e && e.model.getAlternativeVersionId() !== e.savedVersion; };
const activeTab = () => state.tabs.find(t => t.id === state.active);

async function openFile(p, { mode, silent } = {}) {
  mode = mode || (ext(p) === 'md' ? 'preview' : 'code');
  const id = mode + ':' + p;
  if (!state.tabs.find(t => t.id === id)) {
    await getModel(p);
    const idx = state.tabs.findIndex(t => t.id === state.active);
    state.tabs.splice(idx + 1, 0, { id, path: p, mode });
  }
  if (!silent) activate(id);
}

function activate(id) {
  state.active = id;
  const t = activeTab();
  if (t) { state.selected = t.path; revealInTree(t.path); }
  render();
  if (t && t.mode === 'code') setTimeout(() => editor.focus(), 0);
}

async function closeTab(id) {
  const t = state.tabs.find(x => x.id === id);
  if (!t) return;
  const otherViews = state.tabs.filter(x => x.path === t.path && x.id !== id);
  if (!otherViews.length && isDirty(t.path)) {
    const r = await choice(`Salvezi modificările din „${base(t.path)}”?`, ['Salvează', 'Nu salva', 'Anulează']);
    if (r === 2 || r == null) return;
    if (r === 0) await saveFile(t.path);
  }
  const idx = state.tabs.indexOf(t);
  state.tabs.splice(idx, 1);
  if (!otherViews.length) { state.models.get(t.path)?.model.dispose(); state.models.delete(t.path); }
  if (state.active === id) state.active = (state.tabs[idx] || state.tabs[idx - 1] || {}).id || null;
  render();
}

async function saveFile(p) {
  const e = state.models.get(p);
  if (!e) return;
  const version = e.model.getAlternativeVersionId();
  await apiPost('/api/file?path=' + encodeURIComponent(p), e.model.getValue(), 'PUT');
  e.savedVersion = version;
  renderTabs(); renderDirtyInTree();
}
async function saveAll() { for (const p of state.models.keys()) if (isDirty(p)) await saveFile(p); }

// ================================================================ randare

function render() {
  renderTabs();
  const t = activeTab();
  $('#welcome').classList.toggle('hidden', !!t);
  $('#editor').classList.toggle('hidden', !t || t.mode !== 'code');
  $('#preview').classList.toggle('hidden', !t || t.mode !== 'preview');
  if (t && t.mode === 'code') {
    const m = state.models.get(t.path).model;
    if (editor.getModel() !== m) editor.setModel(m);
    $('#st-lang').textContent = ({ cpp: 'C++', c: 'C', markdown: 'Markdown', plaintext: 'Text' })[m.getLanguageId()] || m.getLanguageId();
  } else {
    $('#st-lang').textContent = t ? 'Lecție' : '';
    $('#st-cursor').textContent = '';
  }
  if (t && t.mode === 'preview') renderPreview();
  $('#btn-run').disabled = state.running || !t || !isRunnable(t.path);
  renderTreeSelection();
  renderLessonSelection();
  store.set('tabs', state.tabs.map(x => ({ path: x.path, mode: x.mode })));
  store.set('active', state.active);
  document.title = (t ? base(t.path) + ' — ' : '') + 'IDE C/C++';
}

function renderTabs() {
  const box = $('#tabs');
  box.innerHTML = '';
  for (const t of state.tabs) {
    const [ic, cls] = t.mode === 'preview' ? ['📖', ''] : iconOf(t.path);
    const tab = el('div', 'tab' + (t.id === state.active ? ' active' : '') + (isDirty(t.path) && t.mode === 'code' ? ' dirty' : '') + (t.mode === 'preview' ? ' preview' : ''));
    tab.title = t.path + (t.mode === 'preview' ? ' (previzualizare)' : '');
    const icon = el('span', 'ficon ' + cls, ic);
    const name = el('span', 'tname', base(t.path));
    if (state.tabs.some(o => o !== t && base(o.path) === base(t.path) && o.path !== t.path)) {
      const d = el('span', null, ' ' + (base(dirname(t.path)) || '/'));
      d.style.cssText = 'opacity:.6;font-size:11px';
      name.appendChild(d);
    }
    const close = el('span', 'tclose'); close.appendChild(el('span', null, '✕'));
    close.title = 'Închide (Alt+W)';
    close.onclick = e => { e.stopPropagation(); closeTab(t.id); };
    tab.onmousedown = e => { if (e.button === 1) { e.preventDefault(); closeTab(t.id); } };
    tab.onclick = () => activate(t.id);
    tab.append(icon, name, close);
    box.appendChild(tab);
    if (t.id === state.active) setTimeout(() => tab.scrollIntoView({ block: 'nearest', inline: 'nearest' }), 0);
  }
}

// ---- previzualizare markdown (lectii)

function renderPreview() {
  const t = activeTab();
  if (!t || t.mode !== 'preview') return;
  const box = $('#preview');
  const scroll = box.dataset.path === t.path ? box.scrollTop : 0;
  const md = state.models.get(t.path).model.getValue();
  box.innerHTML = '';
  box.dataset.path = t.path;

  const bar = el('div', 'md-toolbar');
  const btnEdit = el('button', null, '✎ Editează sursa');
  btnEdit.onclick = () => openFile(t.path, { mode: 'code' });
  bar.appendChild(btnEdit);
  box.appendChild(bar);

  const content = el('div');
  content.innerHTML = marked.parse(md, { gfm: true });
  box.appendChild(content);

  // link-uri relative -> deschise in IDE
  for (const a of content.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href');
    if (/^[a-z]+:/i.test(href) || href.startsWith('#')) { a.target = '_blank'; a.rel = 'noopener'; continue; }
    a.onclick = e => { e.preventDefault(); openLink(normalize(join(dirname(t.path), decodeURIComponent(href.split('#')[0])))); };
  }
  // butoane pe blocurile de cod
  for (const pre of content.querySelectorAll('pre')) {
    const code = pre.querySelector('code');
    if (!code) continue;
    const langMatch = /language-(\w+)/.exec(code.className);
    const raw = code.textContent;
    if (!langMatch || ['cpp', 'c', 'c++'].includes(langMatch[1])) { code.dataset.lang = langMatch?.[1] === 'c' ? 'c' : 'cpp'; code.textContent = raw.replace(/\n$/, ''); monaco.editor.colorizeElement(code, { tabSize: 4 }); }
    const actions = el('div', 'code-actions');
    const copy = el('button', null, 'Copiază');
    copy.onclick = () => { navigator.clipboard?.writeText(raw); copy.textContent = 'Copiat ✓'; setTimeout(() => (copy.textContent = 'Copiază'), 1200); };
    actions.appendChild(copy);
    if (!langMatch || ['cpp', 'c', 'c++'].includes(langMatch[1])) {
      const tryIt = el('button', 'primary', '▶ Încearcă');
      tryIt.title = 'Creează un fișier nou cu acest exemplu, ca să-l poți rula și modifica';
      tryIt.onclick = () => tryExample(raw, langMatch?.[1] === 'c' ? 'c' : 'cpp');
      actions.appendChild(tryIt);
    }
    pre.appendChild(actions);
  }
  box.scrollTop = scroll;
}

async function openLink(p) {
  const node = findNode(p);
  if (!node) return toast(`Nu găsesc „${p}”`);
  if (node.type === 'dir') {
    state.expanded.add(p); saveExpanded();
    const readme = node.children.find(c => /^readme\.md$/i.test(c.name));
    if (readme) await openFile(readme.path, { mode: 'preview' });
    else { state.selected = p; renderTree(); }
  } else await openFile(p);
}

async function tryExample(code, lang) {
  let text = code.replace(/\s+$/, '') + '\n';
  if (!/\bmain\s*\(/.test(text)) {
    const header = lang === 'c'
      ? '#include <stdio.h>\n#include <string.h>\n#include <math.h>\n\n'
      : '#include <iostream>\n#include <fstream>\n#include <cstring>\n#include <cmath>\nusing namespace std;\n\n';
    const note = '// Exemplu din lecție. Dacă apar erori „was not declared”, declară variabilele lipsă.\n';
    const hasFunction = /^[A-Za-z_][\w\s*&<>:,]*\s+[A-Za-z_]\w*\s*\([^;{]*\)\s*\{/m.test(text) && !/^\s+/.test(text.split('\n')[0]) && !/^\s*(if|for|while|switch)\b/.test(text);
    text = hasFunction
      ? note + header + text + '\nint main() {\n    // apelează aici funcția de mai sus\n    return 0;\n}\n'
      : note + header + 'int main() {\n' + text.split('\n').map(l => (l ? '    ' + l : l)).join('\n') + '    return 0;\n}\n';
  } else if (!/#include/.test(text)) {
    text = (lang === 'c' ? '#include <stdio.h>\n\n' : '#include <iostream>\nusing namespace std;\n\n') + text;
  }
  const dir = 'incercari';
  let i = 1;
  while (findNode(`${dir}/exemplu_${i}.${lang}`)) i++;
  const p = `${dir}/exemplu_${i}.${lang}`;
  await apiPost('/api/new', { path: p, type: 'file', content: text });
  state.expanded.add(dir); saveExpanded();
  await refreshTree();
  await openFile(p);
  toast(`Am creat ${p}. Apasă F5 ca să-l rulezi.`);
}

// ================================================================ explorator

async function refreshTree() {
  state.tree = await (await apiGet('/api/tree')).json();
  renderTree();
}
function findNode(p, nodes = state.tree) {
  for (const n of nodes) {
    if (n.path === p) return n;
    if (n.type === 'dir' && p.startsWith(n.path + '/')) { const r = findNode(p, n.children); if (r) return r; }
  }
  return null;
}
function saveExpanded() { store.set('expanded', [...state.expanded]); }

function renderTree() {
  const box = $('#tree');
  box.innerHTML = '';
  const walk = (nodes, depth) => {
    for (const n of nodes) {
      const row = el('div', 'node');
      row.dataset.path = n.path;
      row.style.paddingLeft = (8 + depth * 12) + 'px';
      const open = state.expanded.has(n.path);
      row.appendChild(el('span', 'twisty', n.type === 'dir' ? (open ? '▾' : '▸') : ''));
      if (n.type === 'file') { const [ic, cls] = iconOf(n.name); row.appendChild(el('span', 'ficon ' + cls, ic)); }
      row.appendChild(el('span', 'fname', n.name));
      row.title = n.path;
      row.onclick = () => {
        state.selected = n.path;
        if (n.type === 'dir') { open ? state.expanded.delete(n.path) : state.expanded.add(n.path); saveExpanded(); renderTree(); }
        else openFile(n.path);
        renderTreeSelection();
      };
      row.ondblclick = () => { if (n.type === 'file' && ext(n.path) === 'md') openFile(n.path, { mode: 'code' }); };
      row.oncontextmenu = e => { e.preventDefault(); e.stopPropagation(); state.selected = n.path; renderTreeSelection(); nodeMenu(e, n); };
      box.appendChild(row);
      if (n.type === 'dir' && open) walk(n.children, depth + 1);
    }
  };
  walk(state.tree, 0);
  if (!state.tree.length) box.appendChild(el('div', 'empty', 'Folderul e gol. Creează un fișier cu ＋'));
  renderTreeSelection();
  renderDirtyInTree();
}
function renderTreeSelection() {
  for (const r of document.querySelectorAll('#tree .node')) r.classList.toggle('selected', r.dataset.path === state.selected);
}
function renderDirtyInTree() {
  for (const r of document.querySelectorAll('#tree .node')) r.classList.toggle('dirty', isDirty(r.dataset.path));
}
function revealInTree(p) {
  let changed = false;
  for (let d = dirname(p); d; d = dirname(d)) if (!state.expanded.has(d)) { state.expanded.add(d); changed = true; }
  if (changed) { saveExpanded(); renderTree(); }
  setTimeout(() => document.querySelector(`#tree .node[data-path="${CSS.escape(p)}"]`)?.scrollIntoView({ block: 'nearest' }), 0);
}
function targetDir() {
  const n = state.selected && findNode(state.selected);
  if (!n) return '';
  return n.type === 'dir' ? n.path : dirname(n.path);
}

function nodeMenu(e, n) {
  const dir = n ? (n.type === 'dir' ? n.path : dirname(n.path)) : '';
  const items = [
    ['Fișier nou…', () => newFile(dir)],
    ['Folder nou…', () => newFolder(dir)],
  ];
  if (n) {
    items.push('-');
    if (n.type === 'file' && isRunnable(n.path)) items.unshift(['▶ Rulează', async () => { await openFile(n.path); run(); }], '-');
    if (n.type === 'file' && ext(n.path) === 'md') items.unshift(['Deschide ca lecție', () => openFile(n.path, { mode: 'preview' })], ['Deschide sursa', () => openFile(n.path, { mode: 'code' })], '-');
    items.push(['Redenumește…', () => renameNode(n)], ['Șterge', () => deleteNode(n)], '-', ['Copiază calea', () => navigator.clipboard?.writeText(n.path)]);
  }
  contextMenu(e.clientX, e.clientY, items);
}

async function newFile(dir = targetDir()) {
  const r = await prompt('Fișier nou', dir ? dir + '/' : '', 'ex: problema1.cpp', true);
  if (!r) return;
  let p = normalize(r.value);
  if (!p || p.endsWith('/')) return;
  if (!ext(p)) p += r.template === 'c' ? '.c' : '.cpp';
  const tpl = ext(p) === 'c' ? (r.template === 'empty' ? '' : TEMPLATES.c) : ['cpp', 'cc', 'cxx'].includes(ext(p)) ? (r.template === 'empty' ? '' : TEMPLATES.cpp) : '';
  try {
    await apiPost('/api/new', { path: p, type: 'file', content: tpl });
    await refreshTree();
    await openFile(p);
    if (tpl) editor.setPosition({ lineNumber: tpl.split('\n').findIndex(l => /Salut/.test(l)) + 1 || 1, column: 5 });
  } catch (e) { toast(e.message); }
}
async function newFolder(dir = targetDir()) {
  const r = await prompt('Folder nou', dir ? dir + '/' : '', 'ex: exercitii');
  if (!r) return;
  const p = normalize(r.value);
  if (!p) return;
  try { await apiPost('/api/new', { path: p, type: 'dir' }); state.expanded.add(p); saveExpanded(); state.selected = p; await refreshTree(); }
  catch (e) { toast(e.message); }
}
async function renameNode(n) {
  const r = await prompt('Redenumește', n.path, '', false, n.path.length - (ext(n.path) && n.type === 'file' ? ext(n.path).length + 1 : 0));
  if (!r) return;
  const to = normalize(r.value);
  if (!to || to === n.path) return;
  try {
    await apiPost('/api/rename', { from: n.path, to });
    // muta tab-urile si modelele deschise
    for (const [p, entry] of [...state.models]) {
      if (p !== n.path && !p.startsWith(n.path + '/')) continue;
      const np = to + p.slice(n.path.length);
      const nm = monaco.editor.createModel(entry.model.getValue(), languageOf(np), monaco.Uri.parse('file:///' + np));
      const dirty = isDirty(p);
      entry.model.dispose();
      const ne = { model: nm, savedVersion: dirty ? -1 : nm.getAlternativeVersionId() };
      nm.onDidChangeContent(() => { renderTabs(); renderDirtyInTree(); if (activeTab()?.mode === 'preview') renderPreview(); });
      state.models.delete(p); state.models.set(np, ne);
      for (const t of state.tabs) if (t.path === p) { const wasActive = t.id === state.active; t.path = np; t.id = t.mode + ':' + np; if (wasActive) state.active = t.id; }
    }
    state.selected = to;
    await refreshTree();
    render();
  } catch (e) { toast(e.message); }
}
async function deleteNode(n) {
  const r = await choice(`Ștergi ${n.type === 'dir' ? 'folderul' : 'fișierul'} „${n.name}”${n.type === 'dir' ? ' cu tot conținutul' : ''}? Nu se poate anula.`, ['Șterge', 'Anulează']);
  if (r !== 0) return;
  try {
    await apiPost('/api/delete', { path: n.path });
    for (const t of [...state.tabs]) if (t.path === n.path || t.path.startsWith(n.path + '/')) {
      const e = state.models.get(t.path); if (e) e.savedVersion = e.model.getAlternativeVersionId(); // fisierul nu mai exista

      await closeTab(t.id);
    }
    await refreshTree();
  } catch (e) { toast(e.message); }
}

// ================================================================ lectii

async function buildLessons() {
  const box = $('#lessons');
  box.innerHTML = '';
  const lessons = [];
  if (findNode('README.md')) {
    const md = await (await apiGet('/api/file?path=README.md')).text();
    // randuri de tabel:  | 01 | [Titlu](folder) | proiect | ce inveti |
    for (const line of md.split('\n')) {
      const m = /^\|\s*([^|]*?)\s*\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|(.*)\|\s*$/.exec(line);
      if (!m) continue;
      const cells = m[4].split('|').map(s => s.trim().replace(/`/g, ''));
      const dir = normalize(decodeURIComponent(m[3]));
      const node = findNode(dir);
      if (node && node.type === 'dir') lessons.push({ num: m[1], title: m[2], desc: cells.filter(Boolean).join(' — '), dir });
    }
  }
  if (!lessons.length) {
    for (const n of state.tree) if (n.type === 'dir' && n.children.some(c => /^readme\.md$/i.test(c.name))) lessons.push({ num: '', title: n.name, desc: '', dir: n.path });
  }
  if (findNode('README.md')) {
    const intro = el('div', 'lesson');
    intro.dataset.path = 'README.md';
    intro.append(el('div', 'num', 'START'), el('div', 'lt', 'Cum folosești materialul'));
    intro.onclick = () => openFile('README.md', { mode: 'preview' });
    box.appendChild(intro);
  }
  for (const l of lessons) {
    const item = el('div', 'lesson');
    const readme = findNode(l.dir).children.find(c => /^readme\.md$/i.test(c.name));
    item.dataset.path = readme ? readme.path : l.dir;
    item.append(el('div', 'num', l.num ? 'CAPITOLUL ' + l.num : ''), el('div', 'lt', l.title), el('div', 'ld', l.desc));
    item.onclick = () => openLink(l.dir);
    box.appendChild(item);
  }
  if (!box.children.length) box.appendChild(el('div', 'empty', 'Nu am găsit lecții (foldere cu README.md).'));
}
function renderLessonSelection() {
  const t = activeTab();
  for (const l of document.querySelectorAll('#lessons .lesson')) l.classList.toggle('active', !!t && l.dataset.path === t.path);
}

// ================================================================ terminal

function setupTerminal() {
  term = new Terminal({
    convertEol: true,
    cursorBlink: true,
    fontSize: 13,
    fontFamily: 'Consolas, "Cascadia Mono", "DejaVu Sans Mono", monospace',
    scrollback: 5000,
    theme: termTheme(state.theme),
  });
  fitAddon = new FitAddon.FitAddon();
  term.loadAddon(fitAddon);
  term.open($('#terminal'));
  new ResizeObserver(() => { try { fitAddon.fit(); } catch { /* ascuns */ } }).observe($('#terminal'));

  term.writeln('\x1b[1;36mIDE C/C++\x1b[0m — apasă \x1b[1mF5\x1b[0m ca să compilezi și să rulezi fișierul deschis.');
  term.writeln('\x1b[90mCând programul cere date, scrie-le aici și apasă Enter. Ctrl+C oprește programul, Ctrl+D trimite „sfârșit de fișier”.\x1b[0m');

  // „disciplina de linie”: editam local randul curent, il trimitem la Enter
  let line = '';
  term.onData(data => {
    if (!state.running) return;
    for (const ch of data.replace(/\r\n/g, '\r')) {
      if (ch === '\r' || ch === '\n') { term.write('\r\n'); send({ type: 'stdin', data: line + '\n' }); line = ''; }
      else if (ch === '\x7f' || ch === '\b') {
        if (line) { const chars = Array.from(line); chars.pop(); line = chars.join(''); term.write('\b \b'); }
      }
      else if (ch === '\x03') { term.write('^C'); line = ''; stop(); }
      else if (ch === '\x04') { if (line) { send({ type: 'stdin', data: line }); line = ''; } send({ type: 'eof' }); term.write('^D'); }
      else if (ch === '\x15') { term.write('\b \b'.repeat(Array.from(line).length)); line = ''; } // Ctrl+U
      else if (ch >= ' ' && ch !== '\x7f' && !/^\x1b/.test(ch)) { line += ch; term.write(ch); }
    }
  });
  term.attachCustomKeyEventHandler(e => !(e.type === 'keydown' && (e.key === 'F5' || (e.ctrlKey && e.key === 'Enter') || (e.ctrlKey && e.key === '`'))));
  setupTerminal.resetLine = () => { line = ''; };
}
function termWrite(s) { term.write(s); }
function termTheme(theme) {
  return theme === 'light'
    ? { background: '#ffffff', foreground: '#333333', cursor: '#333333', selectionBackground: '#add6ff', black: '#000000', brightBlack: '#666666' }
    : { background: '#1e1e1e', foreground: '#cccccc', cursor: '#cccccc', selectionBackground: '#264f78' };
}

// ================================================================ compilare + rulare

let reconnectTimer;
function connect() {
  ws = new WebSocket(`${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/ws`);
  ws.onopen = () => setStatus('Gata');
  ws.onclose = () => {
    if (state.running) { termWrite('\r\n\x1b[31mConexiunea cu serverul s-a pierdut.\x1b[0m\r\n'); setRunning(false); }
    setStatus('⚠ Deconectat de la server — reîncerc…');
    clearTimeout(reconnectTimer); reconnectTimer = setTimeout(connect, 2000);
  };
  ws.onmessage = e => onMessage(JSON.parse(e.data));
}
function send(obj) { if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj)); }

let lastOutputEndsWithNewline = true;
let currentRunPath = null;

async function run() {
  const t = activeTab();
  if (state.running) return toast('Un program rulează deja. Oprește-l cu Shift+F5.');
  if (!t) return toast('Deschide un fișier .cpp sau .c');
  if (!isRunnable(t.path)) return toast('Doar fișierele .cpp și .c pot fi rulate.');
  if (!ws || ws.readyState !== WebSocket.OPEN) return toast('Nu sunt conectat la server.');
  try { await saveAll(); } catch (e) { return toast('Nu am putut salva: ' + e.message); }

  currentRunPath = t.path;
  setRunning(true);
  showPanel('terminal');
  setupTerminal.resetLine();
  setDiagnostics([]);
  termWrite(`\r\n\x1b[1;34m━━━ ${t.path} ━━━\x1b[0m\r\n`);
  send({ type: 'run', path: t.path, std: ext(t.path) === 'c' ? 'c11' : state.std });
}
function stop() { if (state.running) { stopRequested = true; send({ type: 'stop' }); } }

function onMessage(m) {
  switch (m.type) {
    case 'compile-start':
      setStatus('⚙ Compilez…');
      termWrite(`\x1b[90m$ ${m.command}\x1b[0m\r\n`);
      break;
    case 'compile-end': {
      if (m.output) termWrite(m.output.replace(/\n?$/, '\n'));
      setDiagnostics(m.diagnostics);
      const errs = m.diagnostics.filter(d => d.severity === 'error').length;
      const warns = m.diagnostics.filter(d => d.severity === 'warning').length;
      if (m.ok) {
        termWrite(`\x1b[32m✓ Compilat cu succes\x1b[0m\x1b[90m (${(m.time / 1000).toFixed(1)} s${warns ? `, ${warns} avertismente — vezi PROBLEME` : ''})\x1b[0m\r\n`);
      } else {
        termWrite(`\x1b[1;31m✗ Compilarea a eșuat: ${errs || 'câteva'} ${errs === 1 ? 'eroare' : 'erori'}.\x1b[0m Vezi tab-ul \x1b[1mPROBLEME\x1b[0m pentru explicații.\r\n`);
        showPanel('problems');
        const first = m.diagnostics.find(d => d.severity === 'error');
        if (first) goToDiagnostic(first, false);
      }
      break;
    }
    case 'run-start':
      setStatus('▶ Rulează — scrie datele în terminal');
      termWrite(`\x1b[90m── programul rulează (folder: ${m.cwd}) ──\x1b[0m\r\n`);
      lastOutputEndsWithNewline = true;
      term.focus();
      break;
    case 'out':
      termWrite(m.stream === 'err' ? `\x1b[31m${m.data}\x1b[0m` : m.data);
      lastOutputEndsWithNewline = /\n$/.test(m.data);
      break;
    case 'exit': {
      const secs = (m.time / 1000).toFixed(2);
      if (!lastOutputEndsWithNewline) termWrite('\r\n');
      let text, color = '90';
      if (m.signal === 'SIGKILL' || (m.code === 1 && m.signal == null && stopRequested)) text = 'Program oprit.';
      else if (m.signal) { text = `Programul s-a oprit brusc (${m.signal}). ${explainCrash(m.signal)}`; color = '31'; }
      else if (m.code === 0) text = `Programul s-a terminat normal (cod 0) în ${secs} s.`;
      else { text = `Programul s-a terminat cu codul ${m.code} în ${secs} s. ${explainCrash(m.code)}`; color = '33'; }
      termWrite(`\x1b[${color}m── ${text.trim()} ──\x1b[0m\r\n`);
      break;
    }
    case 'error':
      termWrite(`\x1b[31m${m.message}\x1b[0m\r\n`);
      break;
    case 'done':
      setRunning(false);
      break;
  }
}
let stopRequested = false;
function explainCrash(x) {
  const s = String(x);
  if (/SIGSEGV|^139$|3221225477/.test(s)) return 'Acces la memorie invalidă (Segmentation fault): probabil un indice în afara vectorului sau recursivitate infinită.';
  if (/SIGFPE|^136$|3221225620/.test(s)) return 'Eroare aritmetică: probabil împărțire la zero (sau % 0).';
  if (/SIGABRT|^134$|3221226505/.test(s)) return 'Programul a fost abandonat (abort): verifică assert-urile sau memoria.';
  if (/3221225725/.test(s)) return 'Stiva s-a umplut (stack overflow): recursivitate prea adâncă sau vector local prea mare.';
  return '';
}

function setRunning(on) {
  state.running = on;
  stopRequested = false;
  $('#statusbar').classList.toggle('running', on);
  $('#btn-stop').disabled = !on;
  const t = activeTab();
  $('#btn-run').disabled = on || !t || !isRunnable(t.path);
  if (!on) setStatus('Gata');
}
function setStatus(s) { $('#st-state').textContent = s; }

// ---- probleme (erori de compilare)

function setDiagnostics(list) {
  state.diagnostics = list;
  // marcaje in editor
  const byFile = new Map();
  for (const d of list) { if (!byFile.has(d.file)) byFile.set(d.file, []); byFile.get(d.file).push(d); }
  for (const [p, entry] of state.models) {
    const ds = byFile.get(p) || [];
    monaco.editor.setModelMarkers(entry.model, 'gcc', ds.map(d => ({
      startLineNumber: d.line, startColumn: d.column, endLineNumber: d.line,
      endColumn: wordEnd(entry.model, d.line, d.column),
      message: d.message + (d.hint ? '\n\n💡 ' + d.hint : ''),
      severity: d.severity === 'error' ? monaco.MarkerSeverity.Error : d.severity === 'warning' ? monaco.MarkerSeverity.Warning : monaco.MarkerSeverity.Info,
      source: 'gcc',
    })));
  }
  // lista din panou
  const box = $('#problems');
  box.innerHTML = '';
  const errs = list.filter(d => d.severity === 'error').length;
  const warns = list.filter(d => d.severity === 'warning').length;
  if (!list.length) box.appendChild(el('div', 'empty', 'Nicio problemă. 🎉'));
  for (const d of list) {
    const row = el('div', 'problem ' + d.severity);
    row.appendChild(el('span', 'sev', d.severity === 'error' ? '⊗' : d.severity === 'warning' ? '⚠' : 'ℹ'));
    const msg = el('span', 'pmsg', d.message);
    if (d.hint) msg.appendChild(el('span', 'phint', d.hint));
    row.appendChild(msg);
    row.appendChild(el('span', 'ploc', `${base(d.file)} [${d.line}, ${d.column}]`));
    row.onclick = () => goToDiagnostic(d, true);
    box.appendChild(row);
  }
  const badge = $('#problem-count');
  badge.textContent = errs + warns;
  badge.classList.toggle('hidden', !(errs + warns));
  $('#st-problems').textContent = `⊗ ${errs} ⚠ ${warns}`;
}
function wordEnd(model, line, col) {
  if (line > model.getLineCount()) return col + 1;
  const w = model.getWordAtPosition({ lineNumber: line, column: col });
  return w ? w.endColumn : col + 1;
}
async function goToDiagnostic(d, focus) {
  if (!findNode(d.file)) return;
  await openFile(d.file, { mode: 'code' });
  editor.revealLineInCenter(d.line);
  editor.setPosition({ lineNumber: d.line, column: d.column });
  if (focus) editor.focus();
}

// ================================================================ layout + UI

function setupLayout() {
  const sidebar = $('#sidebar'), panel = $('#panel');
  sidebar.style.width = store.get('sidebarW', 260) + 'px';
  panel.style.height = store.get('panelH', 260) + 'px';
  if (store.get('panelHidden', false)) togglePanel(false);
  if (store.get('sidebarHidden', false)) sidebar.classList.add('hidden');

  drag($('#split-sidebar'), (dx, start) => {
    const w = Math.max(150, Math.min(window.innerWidth * 0.6, start.w + dx));
    sidebar.style.width = w + 'px'; store.set('sidebarW', w);
  }, () => ({ w: sidebar.offsetWidth }), 'x');
  drag($('#split-panel'), (dy, start) => {
    const h = Math.max(80, Math.min(window.innerHeight * 0.8, start.h - dy));
    panel.style.height = h + 'px'; store.set('panelH', h);
  }, () => ({ h: panel.offsetHeight }), 'y');
}
function drag(handle, onMove, getStart, axis) {
  handle.addEventListener('mousedown', e => {
    e.preventDefault();
    const s = getStart(), x0 = e.clientX, y0 = e.clientY;
    handle.classList.add('dragging');
    document.body.style.cursor = axis === 'x' ? 'col-resize' : 'row-resize';
    const move = ev => onMove(axis === 'x' ? ev.clientX - x0 : ev.clientY - y0, s);
    const up = () => { handle.classList.remove('dragging'); document.body.style.cursor = ''; removeEventListener('mousemove', move); removeEventListener('mouseup', up); };
    addEventListener('mousemove', move); addEventListener('mouseup', up);
  });
}
function togglePanel(show) {
  const p = $('#panel');
  show = show ?? p.classList.contains('hidden');
  p.classList.toggle('hidden', !show);
  $('#split-panel').classList.toggle('hidden', !show);
  store.set('panelHidden', !show);
  if (show) setTimeout(() => { try { fitAddon.fit(); } catch { /* */ } }, 0);
}
function showPanel(name) {
  togglePanel(true);
  for (const b of document.querySelectorAll('.ptab')) b.classList.toggle('active', b.dataset.panel === name);
  $('#panel-terminal').classList.toggle('hidden', name !== 'terminal');
  $('#panel-problems').classList.toggle('hidden', name !== 'problems');
  if (name === 'terminal') setTimeout(() => { try { fitAddon.fit(); } catch { /* */ } }, 0);
}
function showView(name) {
  const sidebar = $('#sidebar');
  const btn = document.querySelector(`.act[data-view="${name}"]`);
  if (btn.classList.contains('active') && !sidebar.classList.contains('hidden')) {
    sidebar.classList.add('hidden'); $('#split-sidebar').classList.add('hidden'); store.set('sidebarHidden', true); return;
  }
  sidebar.classList.remove('hidden'); $('#split-sidebar').classList.remove('hidden'); store.set('sidebarHidden', false);
  for (const b of document.querySelectorAll('.act')) b.classList.toggle('active', b === btn);
  for (const v of document.querySelectorAll('.view')) v.classList.toggle('hidden', v.id !== 'view-' + name);
  store.set('view', name);
}
function applyTheme(theme) {
  state.theme = theme;
  document.documentElement.dataset.theme = theme;
  monaco.editor.setTheme(theme === 'light' ? 'vs' : 'vs-dark');
  if (term) term.options.theme = termTheme(theme);
  store.set('theme', theme);
}

function setupUI() {
  $('#btn-run').onclick = run;
  $('#btn-stop').onclick = () => { stopRequested = true; stop(); };
  $('#btn-theme').onclick = () => applyTheme(state.theme === 'dark' ? 'light' : 'dark');
  $('#btn-help').onclick = showHelp;
  $('#btn-new-file').onclick = () => newFile();
  $('#btn-new-folder').onclick = () => newFolder();
  $('#btn-welcome-new').onclick = () => newFile('incercari');
  $('#btn-refresh').onclick = async () => { await refreshTree(); await buildLessons(); renderLessonSelection(); };
  $('#btn-collapse').onclick = () => { state.expanded.clear(); saveExpanded(); renderTree(); };
  $('#btn-clear').onclick = () => term.clear();
  $('#btn-panel-close').onclick = () => togglePanel(false);
  $('#st-problems').onclick = () => showPanel('problems');
  $('#tree').oncontextmenu = e => { e.preventDefault(); state.selected = null; renderTreeSelection(); nodeMenu(e, null); };
  for (const b of document.querySelectorAll('.ptab')) b.onclick = () => showPanel(b.dataset.panel);
  for (const b of document.querySelectorAll('.act')) b.onclick = () => showView(b.dataset.view);
  const view = store.get('view', 'explorer');
  if (view !== 'explorer') { for (const b of document.querySelectorAll('.act')) b.classList.toggle('active', b.dataset.view === view); for (const v of document.querySelectorAll('.view')) v.classList.toggle('hidden', v.id !== 'view-' + view); }

  const sel = $('#std-select');
  sel.value = state.std;
  sel.onchange = () => { state.std = sel.value; store.set('std', state.std); };

  // scurtaturi de tastatura (in faza de "capture", inaintea editorului)
  window.addEventListener('keydown', e => {
    if (!$('#modal').classList.contains('hidden')) return;
    const ctrl = e.ctrlKey || e.metaKey;
    let handled = true;
    if (e.key === 'F5' && e.shiftKey) { stopRequested = true; stop(); }
    else if (e.key === 'F5' || (ctrl && e.key === 'Enter')) run();
    else if (ctrl && !e.shiftKey && e.key.toLowerCase() === 's') { const t = activeTab(); if (t) saveFile(t.path).catch(err => toast(err.message)); }
    else if (ctrl && e.shiftKey && e.key.toLowerCase() === 's') saveAll().catch(err => toast(err.message));
    else if ((ctrl || e.altKey) && e.key.toLowerCase() === 'n' && !e.shiftKey) newFile();
    else if (e.altKey && e.key.toLowerCase() === 'w') { if (state.active) closeTab(state.active); }
    else if (ctrl && (e.key === '`' || e.code === 'Backquote')) togglePanel();
    else if (ctrl && e.shiftKey && e.key.toLowerCase() === 'e') showView('explorer');
    else if (ctrl && e.key.toLowerCase() === 'b') { $('#sidebar').classList.toggle('hidden'); $('#split-sidebar').classList.toggle('hidden'); }
    else if (e.altKey && /^[1-9]$/.test(e.key)) { const t = state.tabs[+e.key - 1]; if (t) activate(t.id); }
    else handled = false;
    if (handled) { e.preventDefault(); e.stopPropagation(); }
  }, true);

  window.addEventListener('beforeunload', e => {
    if ([...state.models.keys()].some(isDirty)) { e.preventDefault(); e.returnValue = ''; }
  });
  document.addEventListener('click', () => $('#ctxmenu').classList.add('hidden'));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') $('#ctxmenu').classList.add('hidden'); });
}

// ================================================================ meniu contextual, dialoguri, notificari

function contextMenu(x, y, items) {
  const m = $('#ctxmenu');
  m.innerHTML = '';
  for (const it of items) {
    if (it === '-') { if (m.lastChild && m.lastChild.className !== 'sep') m.appendChild(el('div', 'sep')); continue; }
    const row = el('div', 'item', it[0]);
    row.onclick = () => { m.classList.add('hidden'); it[1](); };
    m.appendChild(row);
  }
  if (m.lastChild?.className === 'sep') m.lastChild.remove();
  m.classList.remove('hidden');
  m.style.left = Math.min(x, innerWidth - m.offsetWidth - 4) + 'px';
  m.style.top = Math.min(y, innerHeight - m.offsetHeight - 4) + 'px';
}

function modal(build) {
  return new Promise(resolve => {
    const wrap = $('#modal'), box = wrap.querySelector('.modal-box');
    box.innerHTML = '';
    const close = v => { wrap.classList.add('hidden'); document.removeEventListener('keydown', esc, true); resolve(v); };
    const esc = e => { if (e.key === 'Escape') { e.stopPropagation(); close(null); } };
    document.addEventListener('keydown', esc, true);
    wrap.onmousedown = e => { if (e.target === wrap) close(null); };
    build(box, close);
    wrap.classList.remove('hidden');
    (box.querySelector('input[type=text]') || box.querySelector('button.primary'))?.focus();
  });
}
function prompt(title, value, placeholder, withTemplate, selectEnd) {
  return modal((box, close) => {
    box.appendChild(el('h3', null, title));
    const input = el('input'); input.type = 'text'; input.value = value; input.placeholder = placeholder || '';
    box.appendChild(input);
    let tpl = 'cpp';
    if (withTemplate) {
      const row = el('div', 'tpl');
      for (const [v, label] of [['cpp', 'Program C++'], ['c', 'Program C'], ['empty', 'Fișier gol']]) {
        const l = el('label'); const r = el('input'); r.type = 'radio'; r.name = 'tpl'; r.value = v; r.checked = v === 'cpp';
        r.onchange = () => { tpl = v; input.focus(); };
        l.append(r, document.createTextNode(label)); row.appendChild(l);
      }
      box.appendChild(row);
    }
    const ok = el('button', 'primary', 'OK'), cancel = el('button', null, 'Anulează');
    ok.onclick = () => close({ value: input.value.trim(), template: tpl });
    cancel.onclick = () => close(null);
    input.onkeydown = e => { if (e.key === 'Enter') ok.click(); };
    const row = el('div', 'row'); row.append(cancel, ok); box.appendChild(row);
    setTimeout(() => {
      input.focus();
      if (selectEnd != null) input.setSelectionRange(input.value.lastIndexOf('/') + 1, selectEnd); // selecteaza numele, fara extensie
      else input.setSelectionRange(input.value.length, input.value.length);
    }, 0);
  });
}
function choice(text, buttons) {
  return modal((box, close) => {
    box.appendChild(el('h3', null, text));
    const row = el('div', 'row');
    buttons.forEach((b, i) => { const btn = el('button', i === 0 ? 'primary' : null, b); btn.onclick = () => close(i); row.appendChild(btn); });
    box.appendChild(row);
  });
}
function showHelp() {
  modal((box, close) => {
    box.appendChild(el('h3', null, 'Scurtături de tastatură'));
    const table = el('table');
    for (const [k, d] of [
      ['F5 / Ctrl+Enter', 'Compilează și rulează'], ['Shift+F5', 'Oprește programul'], ['Ctrl+S', 'Salvează'],
      ['Ctrl+Shift+S', 'Salvează tot'], ['Alt+N', 'Fișier nou'], ['Alt+W', 'Închide tab-ul'], ['Alt+1…9', 'Mergi la tab-ul N'],
      ['Ctrl+`', 'Arată / ascunde terminalul'], ['Ctrl+B', 'Arată / ascunde bara laterală'], ['Ctrl+Space', 'Sugestii (ex: scrie „for” și alege)'],
      ['Ctrl+F / Ctrl+H', 'Caută / înlocuiește'], ['Ctrl+/', 'Comentează linia'], ['Alt+↑ / Alt+↓', 'Mută linia'],
      ['Shift+Alt+↓', 'Duplică linia'], ['F2', 'Redenumește peste tot'], ['Ctrl+rotiță', 'Mărește / micșorează textul'],
    ]) { const tr = el('tr'); tr.append(el('td', null, k), el('td', null, d)); table.appendChild(tr); }
    box.appendChild(table);
    const ok = el('button', 'primary', 'Am înțeles'); ok.onclick = () => close();
    const row = el('div', 'row'); row.appendChild(ok); box.appendChild(row);
  });
}
function toast(text) {
  setStatus(text);
  clearTimeout(toast.t);
  toast.t = setTimeout(() => setStatus(state.running ? '▶ Rulează' : 'Gata'), 4000);
}
