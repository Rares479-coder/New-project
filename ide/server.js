// IDE C/C++ - server local
// Serveste interfata (Monaco + xterm), lucreaza cu fisierele din spatiul de lucru,
// compileaza cu gcc/g++ si ruleaza programele interactiv (prin WebSocket).
//
// Pornire:  node server.js [--retea] [folder-spatiu-de-lucru]   (implicit: folderul parinte)
//   --retea  IDE-ul devine accesibil de pe telefon/tableta din aceeasi retea Wi-Fi,
//            protejat de o cheie secreta (afisata ca link si cod QR).
// Port:     variabila de mediu PORT (implicit 3000)

'use strict';
const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const os = require('os');
const crypto = require('crypto');
const { spawn, execFile } = require('child_process');
const { WebSocketServer } = require('ws');

const cliArgs = process.argv.slice(2);
const LAN = cliArgs.includes('--retea') || cliArgs.includes('--lan') || process.env.IDE_RETEA === '1';
const PORT = Number(process.env.PORT) || 3000;
// Implicit doar local. In modul retea ascultam pe toate interfetele, dar cerem cheia.
const HOST = process.env.HOST || (LAN ? '0.0.0.0' : '127.0.0.1');
const WORKSPACE = path.resolve(cliArgs.find(a => !a.startsWith('--')) || path.join(__dirname, '..'));
const ACCESS_KEY = LAN ? crypto.randomBytes(9).toString('base64url') : null;
const COOKIE = 'ide_cheie';
const PUBLIC = path.join(__dirname, 'public');
const NM = path.join(__dirname, 'node_modules');
const BUILD_DIR = path.join(os.tmpdir(), 'cpp-ide-build');
const IS_WIN = process.platform === 'win32';
const IGNORED = new Set(['.git', 'node_modules', 'build', '.vscode', '.idea']);

fs.mkdirSync(BUILD_DIR, { recursive: true });

// Antet inclus automat la compilare: dezactiveaza buffer-ul lui stdout,
// ca printf-urile din C sa apara imediat in terminal (inainte de scanf).
const UNBUFFER_H = path.join(BUILD_DIR, 'ide_unbuffer.h');
fs.writeFileSync(UNBUFFER_H,
  '#include <stdio.h>\n' +
  'static void __attribute__((constructor)) __ide_unbuffer(void) {\n' +
  '  setvbuf(stdout, NULL, _IONBF, 0);\n' +
  '}\n');

// ---------------------------------------------------------------- utilitare

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.ttf': 'font/ttf',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.map': 'application/json',
};

// Transforma o cale relativa (venita din browser) intr-una absoluta,
// verificand ca ramane in interiorul spatiului de lucru.
function safePath(rel) {
  const abs = path.resolve(WORKSPACE, String(rel || '').replace(/^[/\\]+/, ''));
  if (abs !== WORKSPACE && !abs.startsWith(WORKSPACE + path.sep)) {
    throw httpError(403, 'Cale în afara spațiului de lucru');
  }
  return abs;
}
function toRel(abs) { return path.relative(WORKSPACE, abs).split(path.sep).join('/'); }
function httpError(status, message) { const e = new Error(message); e.status = status; return e; }

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-store' });
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
}

function readBody(req, limit = 5 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = []; let size = 0;
    req.on('data', c => {
      size += c.length;
      if (size > limit) { reject(httpError(413, 'Fișier prea mare')); req.destroy(); }
      else chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function readTree(dir) {
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const out = [];
  for (const e of entries) {
    if (IGNORED.has(e.name)) continue;
    if (dir === WORKSPACE && e.name === 'ide') continue; // codul IDE-ului insusi
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) out.push({ name: e.name, path: toRel(abs), type: 'dir', children: await readTree(abs) });
    else if (e.isFile()) out.push({ name: e.name, path: toRel(abs), type: 'file' });
  }
  out.sort((a, b) => (a.type !== b.type ? (a.type === 'dir' ? -1 : 1) : a.name.localeCompare(b.name, 'ro', { numeric: true })));
  return out;
}

// ---------------------------------------------------------------- acces din retea (cheie)

function cookieKey(req) {
  const m = new RegExp('(?:^|;\\s*)' + COOKIE + '=([^;]+)').exec(req.headers.cookie || '');
  return m ? decodeURIComponent(m[1]) : '';
}
function keyMatches(k) {
  if (!ACCESS_KEY || !k) return false;
  const a = Buffer.from(String(k)), b = Buffer.from(ACCESS_KEY);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
function isLocal(req) {
  const ip = req.socket.remoteAddress || '';
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}
// Cine are voie: oricine de pe calculatorul local; din retea doar cine are cheia (cookie).
function authorized(req) { return !LAN || isLocal(req) || keyMatches(cookieKey(req)); }

function lanAddresses() {
  const out = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const a of list || []) if (a.family === 'IPv4' && !a.internal) out.push(a.address);
  }
  return out;
}

const NO_KEY_PAGE = `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>IDE C/C++</title><body style="font-family:system-ui,sans-serif;background:#1e1e1e;color:#ccc;padding:24px;line-height:1.5">
<h2>🔒 Ai nevoie de cheia de acces</h2>
<p>Deschide link-ul complet afișat pe calculator (cel care se termină cu <code>?cheie=…</code>) sau scanează codul QR din terminal.</p></body>`;

// ---------------------------------------------------------------- compilatoare

function which(cmd) {
  return new Promise(resolve => {
    execFile(cmd, ['--version'], { timeout: 5000 }, (err, stdout) => {
      resolve(err ? null : String(stdout).split('\n')[0].trim());
    });
  });
}

// Cauta compilatoarele o singura data: g++/gcc, altfel clang (ex. Termux pe Android, macOS)
let compilersCache = null;
async function compilers() {
  if (compilersCache) return compilersCache;
  const pick = async names => {
    for (const n of names) { const v = await which(n); if (v) return { cmd: n, version: v }; }
    return null;
  };
  const [cpp, c] = await Promise.all([pick(['g++', 'clang++', 'c++']), pick(['gcc', 'clang', 'cc'])]);
  compilersCache = { cpp, c };
  if (!cpp || !c) setTimeout(() => { compilersCache = null; }, 10000); // reincearca dupa instalare
  return compilersCache;
}

// ---------------------------------------------------------------- API HTTP

async function api(req, res, url) {
  const route = url.pathname;
  const q = url.searchParams;

  if (route === '/api/info' && req.method === 'GET') {
    const c = await compilers();
    return send(res, 200, { workspace: WORKSPACE, workspaceName: path.basename(WORKSPACE), platform: process.platform, gpp: c.cpp && c.cpp.version, gcc: c.c && c.c.version, lan: LAN });
  }

  if (route === '/api/tree' && req.method === 'GET') {
    return send(res, 200, await readTree(WORKSPACE));
  }

  if (route === '/api/file' && req.method === 'GET') {
    const abs = safePath(q.get('path'));
    const st = await fsp.stat(abs).catch(() => null);
    if (!st || !st.isFile()) throw httpError(404, 'Fișierul nu există');
    if (st.size > 5 * 1024 * 1024) throw httpError(413, 'Fișier prea mare pentru editor');
    return send(res, 200, await fsp.readFile(abs), 'text/plain; charset=utf-8');
  }

  if (route === '/api/file' && req.method === 'PUT') {
    const abs = safePath(q.get('path'));
    const text = await readBody(req);
    await fsp.mkdir(path.dirname(abs), { recursive: true });
    await fsp.writeFile(abs, text, 'utf8');
    return send(res, 200, { ok: true });
  }

  if (route === '/api/new' && req.method === 'POST') {
    const { path: rel, type, content } = JSON.parse(await readBody(req));
    const abs = safePath(rel);
    if (fs.existsSync(abs)) throw httpError(409, 'Există deja un fișier sau folder cu acest nume');
    if (type === 'dir') await fsp.mkdir(abs, { recursive: true });
    else {
      await fsp.mkdir(path.dirname(abs), { recursive: true });
      await fsp.writeFile(abs, content || '', 'utf8');
    }
    return send(res, 200, { ok: true, path: toRel(abs) });
  }

  if (route === '/api/rename' && req.method === 'POST') {
    const { from, to } = JSON.parse(await readBody(req));
    const a = safePath(from), b = safePath(to);
    if (a === WORKSPACE) throw httpError(403, 'Nu poți redenumi spațiul de lucru');
    if (fs.existsSync(b)) throw httpError(409, 'Există deja un fișier sau folder cu acest nume');
    await fsp.mkdir(path.dirname(b), { recursive: true });
    await fsp.rename(a, b);
    return send(res, 200, { ok: true, path: toRel(b) });
  }

  if (route === '/api/delete' && req.method === 'POST') {
    const { path: rel } = JSON.parse(await readBody(req));
    const abs = safePath(rel);
    if (abs === WORKSPACE) throw httpError(403, 'Nu poți șterge spațiul de lucru');
    await fsp.rm(abs, { recursive: true, force: true });
    return send(res, 200, { ok: true });
  }

  throw httpError(404, 'Rută necunoscută');
}

// ---------------------------------------------------------------- fisiere statice

const STATIC_ROOTS = {
  '/lib/monaco/': path.join(NM, 'monaco-editor', 'min'),
  '/lib/xterm/': path.join(NM, '@xterm', 'xterm'),
  '/lib/xterm-fit/': path.join(NM, '@xterm', 'addon-fit', 'lib'),
  '/lib/marked/': path.join(NM, 'marked', 'lib'),
};

async function serveStatic(req, res, url) {
  let root = PUBLIC, rel = url.pathname;
  for (const [prefix, dir] of Object.entries(STATIC_ROOTS)) {
    if (rel.startsWith(prefix)) { root = dir; rel = rel.slice(prefix.length); break; }
  }
  if (rel === '/' || rel === '') rel = 'index.html';
  const abs = path.resolve(root, '.' + path.sep + decodeURIComponent(rel));
  if (!abs.startsWith(root)) return send(res, 403, 'Interzis', 'text/plain');
  try {
    const data = await fsp.readFile(abs);
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(abs)] || 'application/octet-stream',
      'Cache-Control': root === PUBLIC ? 'no-cache' : 'max-age=86400',
    });
    res.end(data);
  } catch {
    send(res, 404, 'Nu există', 'text/plain');
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  try {
    if (LAN && !isLocal(req)) {
      // prima vizita de pe telefon: ?cheie=... -> o pastram intr-un cookie si curatam adresa
      const k = url.searchParams.get('cheie');
      if (k != null) {
        if (!keyMatches(k)) return send(res, 403, NO_KEY_PAGE, 'text/html; charset=utf-8');
        res.writeHead(302, {
          'Set-Cookie': `${COOKIE}=${encodeURIComponent(k)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
          Location: url.pathname,
        });
        return res.end();
      }
      const isLib = url.pathname.startsWith('/lib/');
      if (!isLib && !authorized(req)) {
        return url.pathname.startsWith('/api/')
          ? send(res, 401, { error: 'Lipsește cheia de acces' })
          : send(res, 401, NO_KEY_PAGE, 'text/html; charset=utf-8');
      }
    }
    if (url.pathname.startsWith('/api/')) await api(req, res, url);
    else await serveStatic(req, res, url);
  } catch (err) {
    send(res, err.status || 500, { error: err.message || String(err) });
  }
});

// ---------------------------------------------------------------- compilare + rulare

// Mesaje de eroare frecvente, explicate pe intelesul unui incepator
const HINTS = [
  [/expected .*['‘];['’].* (before|after)|expected ['‘];['’] (at end|after)/, 'Lipsește un punct și virgulă (;) la finalul instrucțiunii de pe rândul de dinainte.'],
  [/['‘](cout|cin|endl|string|vector)['’] was not declared|['‘](cout|cin|endl)['’] is not a member/, 'Pentru cin/cout ai nevoie de #include <iostream> și de using namespace std; (sau std::cout).'],
  [/['‘](printf|scanf)['’]|implicit declaration of function ['‘](printf|scanf|puts)/, 'Pentru printf/scanf ai nevoie de #include <stdio.h> (sau <cstdio> în C++).'],
  [/['‘](strlen|strcpy|strcmp|strcat|strtok|strchr|strstr)['’] was not declared|implicit declaration of function ['‘]str/, 'Pentru funcțiile pe șiruri ai nevoie de #include <cstring> (în C: <string.h>).'],
  [/['‘](sqrt|pow|abs|floor|ceil)['’] was not declared/, 'Pentru funcțiile matematice ai nevoie de #include <cmath> (în C: <math.h>).'],
  [/use of undeclared identifier ['‘](cout|cin|endl)['’]/, 'Pentru cin/cout ai nevoie de #include <iostream> și de using namespace std; (sau std::cout).'],
  [/was not declared in this scope|undeclared \(first use|implicit declaration of function|use of undeclared identifier/, 'Folosești un nume (variabilă/funcție) care nu a fost declarat. Verifică scrierea, declararea înainte de folosire sau #include-ul necesar.'],
  [/expected ['‘]?\}['’]? at end of input/, 'Lipsește o acoladă de închidere }. Numără acoladele deschise și închise.'],
  [/expected ['‘]?\)['’]? before|expected primary-expression/, 'Expresie incompletă: verifică parantezele și operatorii.'],
  [/No such file or directory/, 'Fișierul inclus nu există. Verifică numele bibliotecii din #include.'],
  [/invalid conversion|cannot convert/, 'Tipuri incompatibile: încerci să pui o valoare de un tip într-o variabilă de alt tip.'],
  [/redeclaration|conflicting declaration|redefinition/, 'Același nume a fost declarat de două ori în același bloc.'],
  [/unused variable/, 'Ai declarat o variabilă pe care nu o folosești (doar avertisment).'],
  [/may be used uninitialized|is used uninitialized/, 'Variabila e folosită înainte să primească o valoare. Inițializeaz-o (ex: int s = 0;).'],
  [/comparison of integer expressions of different signedness/, 'Compari un int cu un unsigned (ex: i < s.size()). Doar avertisment; poți folosi (int)s.size().'],
  [/suggest parentheses around assignment/, 'Ai scris = (atribuire) într-o condiție. Pentru comparare se folosește ==.'],
  [/control reaches end of non-void function/, 'Funcția trebuie să returneze o valoare pe toate ramurile (lipsește un return).'],
  [/undefined reference to [`']?(WinMain|main)/, 'Programul nu are funcția main(). Fiecare program trebuie să aibă int main().'],
  [/undefined reference/, 'O funcție a fost declarată, dar nu și definită (lipsește corpul ei).'],
  [/too few arguments|too many arguments/, 'Numărul de argumente din apel nu corespunde cu cel din definiția funcției.'],
  [/lvalue required/, 'În stânga unei atribuiri trebuie să fie o variabilă (ex: ai scris 5 = x în loc de x = 5).'],
  [/array subscript|subscripted value is neither array/, 'Folosești [] pe ceva care nu este vector sau indicele nu e valid.'],
];
function hintFor(msg) { for (const [re, h] of HINTS) if (re.test(msg)) return h; return null; }

const ANSI = /\x1b\[[0-9;]*[A-Za-z]/g;

function parseDiagnostics(stderr, srcAbs) {
  const list = [];
  const re = /^(.*?):(\d+):(\d+): (fatal error|error|warning|note): (.*)$/;
  for (const line of stderr.replace(ANSI, '').split(/\r?\n/)) {
    const m = re.exec(line);
    if (m) {
      const file = path.resolve(path.dirname(srcAbs), m[1]);
      list.push({
        file: file.startsWith(WORKSPACE) ? toRel(file) : m[1],
        line: +m[2], column: +m[3],
        severity: m[4] === 'fatal error' ? 'error' : m[4],
        message: m[5],
        hint: m[4] === 'note' ? null : hintFor(m[5]),
      });
    } else if (/undefined reference|ld returned/.test(line)) {
      list.push({ file: toRel(srcAbs), line: 1, column: 1, severity: 'error', message: line.trim(), hint: hintFor(line) });
    }
  }
  return list;
}

wssHandler();

function wssHandler() {
  const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 1024 * 1024 });

  wss.on('connection', (ws, req) => {
    // Acceptam doar conexiuni din pagina servita de noi (protectie impotriva altor site-uri)
    // Acceptam doar pagina servita de noi (aceeasi gazda) si, in modul retea, doar cu cheie
    const origin = req.headers.origin || '';
    let sameHost = !origin;
    try { sameHost = sameHost || new URL(origin).host === req.headers.host; } catch { /* origine invalida */ }
    if (!sameHost || !authorized(req)) { ws.close(1008, 'Neautorizat'); return; }

    let proc = null;      // procesul care ruleaza (compilator sau program)
    let phase = 'idle';   // idle | compiling | running

    const msg = obj => { if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(obj)); };
    const kill = () => {
      if (!proc) return;
      try { IS_WIN ? spawn('taskkill', ['/pid', String(proc.pid), '/T', '/F']) : proc.kill('SIGKILL'); } catch { /* deja oprit */ }
    };

    ws.on('message', async raw => {
      let m; try { m = JSON.parse(raw); } catch { return; }

      if (m.type === 'stdin' && phase === 'running' && proc && proc.stdin.writable) proc.stdin.write(m.data);
      else if (m.type === 'eof' && phase === 'running' && proc) proc.stdin.end();
      else if (m.type === 'stop') kill();
      else if (m.type === 'run') {
        if (phase !== 'idle') return msg({ type: 'error', message: 'Un program rulează deja. Oprește-l mai întâi.' });
        try { await compileAndRun(m); } catch (e) { phase = 'idle'; proc = null; msg({ type: 'error', message: e.message }); msg({ type: 'done' }); }
      }
    });
    ws.on('close', kill);

    async function compileAndRun({ path: rel, std, optimize, runOnly }) {
      const src = safePath(rel);
      const ext = path.extname(src).toLowerCase();
      const isC = ext === '.c';
      if (!['.c', '.cpp', '.cc', '.cxx', '.c++'].includes(ext)) throw new Error('Pot rula doar fișiere .c sau .cpp');
      if (!fs.existsSync(src)) throw new Error('Fișierul nu există: ' + rel);

      const id = crypto.createHash('md5').update(src).digest('hex').slice(0, 10);
      const outDir = path.join(BUILD_DIR, id);
      await fsp.mkdir(outDir, { recursive: true });
      const exe = path.join(outDir, path.basename(src, ext) + (IS_WIN ? '.exe' : ''));
      // fisierul se compileaza din folderul lui; daca numele incepe cu '-' il prefixam cu ./
      const srcArg = (path.basename(src).startsWith('-') ? './' : '') + path.basename(src);

      const found = await compilers();
      const compiler = (isC ? found.c : found.cpp)?.cmd || (isC ? 'gcc' : 'g++');
      const standard = isC ? (/^(c89|c99|c11|c17|c23|gnu\d+)$/.test(std) ? std : 'c11')
                           : (/^(c\+\+(11|14|17|20|23)|gnu\+\+\d+)$/.test(std) ? std : 'c++17');
      const args = [
        `-std=${standard}`, '-Wall', '-Wextra', optimize ? '-O2' : '-g',
        '-fdiagnostics-color=always', '-include', UNBUFFER_H,
        srcArg, '-o', exe, ...(isC ? ['-lm'] : []),
      ];

      if (!runOnly) {
        phase = 'compiling';
        msg({ type: 'compile-start', command: `${compiler} ${args.filter(a => a !== '-include' && a !== UNBUFFER_H && a !== '-fdiagnostics-color=always').map(a => a === exe ? path.basename(exe) : a).join(' ')}` });

        const t0 = Date.now();
        const result = await new Promise(resolve => {
          let stderr = '';
          let p;
          try { p = spawn(compiler, args, { cwd: path.dirname(src) }); }
          catch (e) { return resolve({ code: -1, stderr: e.message }); }
          proc = p;
          p.stdout.on('data', d => { stderr += d; });
          p.stderr.on('data', d => { stderr += d; });
          p.on('error', e => resolve({ code: -1, stderr: e.code === 'ENOENT' ? `Nu găsesc compilatorul "${compiler}". Instalează-l (vezi ide/README.md) și asigură-te că e în PATH.` : e.message }));
          p.on('close', code => resolve({ code, stderr }));
        });
        proc = null;
        const diagnostics = parseDiagnostics(result.stderr, src);
        msg({ type: 'compile-end', ok: result.code === 0, output: result.stderr, diagnostics, time: Date.now() - t0 });
        if (result.code !== 0) { phase = 'idle'; return msg({ type: 'done' }); }
      } else if (!fs.existsSync(exe)) {
        throw new Error('Programul nu a fost compilat încă.');
      }

      // ---- rulare
      phase = 'running';
      const t1 = Date.now();
      msg({ type: 'run-start', cwd: toRel(path.dirname(src)) || '.' });
      const p = spawn(exe, [], { cwd: path.dirname(src), env: { ...process.env, TERM: 'dumb' } });
      proc = p;
      p.stdout.on('data', d => msg({ type: 'out', data: d.toString('utf8') }));
      p.stderr.on('data', d => msg({ type: 'out', data: d.toString('utf8'), stream: 'err' }));
      p.stdin.on('error', () => { /* programul s-a terminat inainte sa citeasca */ });
      p.on('error', e => { msg({ type: 'error', message: e.message }); });
      p.on('close', (code, signal) => {
        proc = null; phase = 'idle';
        msg({ type: 'exit', code, signal, time: Date.now() - t1 });
        msg({ type: 'done' });
      });
    }
  });
}

server.listen(PORT, HOST, () => {
  console.log('\n  IDE C/C++ pornit!');
  console.log(`  Pe acest calculator:  http://localhost:${PORT}`);
  console.log(`  Spațiu de lucru:      ${WORKSPACE}`);
  if (LAN) {
    const ips = lanAddresses();
    if (!ips.length) console.log('\n  ⚠ Nu am găsit nicio rețea. Conectează calculatorul la Wi-Fi.');
    else {
      const url = `http://${ips[0]}:${PORT}/?cheie=${ACCESS_KEY}`;
      console.log('\n  📱 Pe telefon (aceeași rețea Wi-Fi), scanează codul QR sau deschide:');
      for (const ip of ips) console.log(`     http://${ip}:${PORT}/?cheie=${ACCESS_KEY}`);
      try { require('qrcode-terminal').generate(url, { small: true }, q => console.log('\n' + q.replace(/^/gm, '     '))); } catch { /* fara QR */ }
      console.log('  Cheia se schimbă la fiecare pornire. Nu o da altor persoane:');
      console.log('  cine o are poate rula programe pe calculatorul tău.');
    }
  }
  console.log('\n  (Ctrl+C pentru oprire)\n');
});
server.on('error', e => {
  if (e.code === 'EADDRINUSE') console.error(`Portul ${PORT} este ocupat. Încearcă: PORT=3001 npm start`);
  else console.error(e);
  process.exit(1);
});
