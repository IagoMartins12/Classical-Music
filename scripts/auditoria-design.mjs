// scripts/auditoria-design.mjs — mede o front contra o design system.
//
// Uso: node scripts/auditoria-design.mjs            (resumo por área)
//      node scripts/auditoria-design.mjs --exemplos (até 6 exemplos por item)
//
// Compila o CSS de verdade (Tailwind v4 via @tailwindcss/postcss) e percorre
// os .tsx pela árvore do TypeScript. Conta, por área (público, admin,
// aluno/prof): cor fora da paleta, branco/preto cru, classe que não gera CSS,
// z-index solto, pulso contínuo, card que cresce sob o cursor, bolha
// desfocada, borda para agrupar, emoji e 'use client' fora do topo. As
// regras estão no cérebro de front, "Design system/Auditoria".
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');
const path = require('path');
const R = process.cwd();
const ts = require(path.join(R, 'node_modules/typescript'));
const postcss = require(path.join(R, 'node_modules/postcss'));
const tw = require(
  path.join(R, 'node_modules/@tailwindcss/postcss/dist/index.js')
);
const CSS = (
  await postcss([tw({ base: R })]).process(
    fs.readFileSync(path.join(R, 'src/app/globals.css'), 'utf8'),
    { from: path.join(R, 'src/app/globals.css') }
  )
).css;
const glob = (d) =>
  fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(d, e.name);
    return e.isDirectory()
      ? glob(p)
      : /\.tsx$/.test(p) && !/\.backup|\.test\.|\/styleguide\//.test(p)
        ? [p]
        : [];
  });
const area = (f) =>
  /\((teacher|student)\)|TeacherSystem|StudentSystem|\/student\/|\/teacher\//i.test(
    f
  )
    ? 'aluno/prof'
    : /\/admin\/|\/Admin\/|blog\/admin|\/moderation\//.test(f)
      ? 'admin'
      : 'público';
const esc = (c) => c.replace(/([:/.\[\]%#(),!&=>'*@])/g, '\\$1');
const gera = (t) => {
  const e = '.' + esc(t);
  return [' ', '{', ',', ':', '\n', '.', ')'].some((x) => CSS.includes(e + x));
};
const UTIL =
  /^((?:[\w\[\]&*>=\/.-]+:)*)!?-?(bg|text|border|from|via|to|ring|shadow|fill|stroke|divide|placeholder|outline|decoration|z)-/;
const COR_FORA =
  /^((?:[\w-]+:)*)!?(bg|text|border|from|via|to|ring|shadow|fill|stroke|divide)-(red|green|blue|purple|pink|indigo|yellow|orange|amber|emerald|teal|cyan|sky|violet|fuchsia|rose|lime|gray|slate|zinc|neutral|stone)-\d{2,3}/;
const BRANCO = /^((?:[\w-]+:)*)!?(bg|text|border)-(white|black)(\/\d+)?$/;
const EMOJI =
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2705}\u{274C}\u{26A0}]/u;
const res = {};
const ex = {};
const conta = (a, k, loc, t) => {
  res[a] = res[a] || {};
  res[a][k] = (res[a][k] || 0) + 1;
  ex[a + k] = ex[a + k] || [];
  if (ex[a + k].length < 6) ex[a + k].push(loc + ' ' + (t || ''));
};
for (const f of glob(path.join(R, 'src'))) {
  const rel = path.relative(R, f);
  const a = area(rel);
  const src = fs.readFileSync(f, 'utf8');
  const sf = ts.createSourceFile(
    f,
    src,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  // use client fora do topo: alguma instrução antes da diretiva
  {
    const pr = src
      .split('\n')
      .find((l) =>
        /^(import|export|const|function|let|var|['"]use client)/.test(l)
      );
    if (/^['"]use client['"]/m.test(src) && pr && !/use client/.test(pr))
      conta(a, 'use client fora do topo', rel);
  }
  const linha = (n) =>
    rel + ':' + (sf.getLineAndCharacterOfPosition(n.getStart()).line + 1);
  const v = (n) => {
    // strings de classe
    if (
      (ts.isStringLiteral(n) ||
        ts.isNoSubstitutionTemplateLiteral(n) ||
        n.kind === ts.SyntaxKind.TemplateHead ||
        n.kind === ts.SyntaxKind.TemplateMiddle ||
        n.kind === ts.SyntaxKind.TemplateTail) &&
      !(
        n.parent &&
        (ts.isImportDeclaration(n.parent) || ts.isExportDeclaration(n.parent))
      )
    ) {
      const txt = n.text ?? '';
      if (
        /^[\s\w\[\]&*>=\/.:%#!()-]*$/.test(txt) &&
        /\s|-/.test(txt) &&
        !/https?:/.test(txt)
      ) {
        const toks = txt.split(/\s+/).filter(Boolean);
        const pareceClasse = toks.some(
          (t) =>
            UTIL.test(t) ||
            /^(flex|grid|p[xytrbl]?-|m[xytrbl]?-|rounded|w-|h-)/.test(t)
        );
        if (pareceClasse)
          for (const t of toks) {
            if (COR_FORA.test(t)) conta(a, 'cor fora da paleta', linha(n), t);
            else if (BRANCO.test(t)) conta(a, 'branco/preto cru', linha(n), t);
            if (UTIL.test(t) && !gera(t) && !/\[/.test(t))
              conta(a, 'classe que não gera CSS', linha(n), t);
            if (/^((?:[\w-]+:)*)z-\[?\d{2,}/.test(t) && !/^z-(10|0)$/.test(t))
              conta(a, 'z-index arbitrário', linha(n), t);
            if (/^animate-pulse$/.test(t) && !/skeleton|esqueleto/i.test(txt))
              conta(a, 'pulso contínuo', linha(n), t);
            if (/^((?:[\w-]+:)*)hover:scale-10[5-9]|hover:scale-11/.test(t))
              conta(a, 'cresce sob o cursor', linha(n), t);
            if (/^blur-(2xl|3xl|xl)$/.test(t))
              conta(a, 'bolha desfocada', linha(n), t);
          }
        // borda para agrupar: border + padding + rounded na mesma string
        if (
          toks.includes('border') &&
          toks.some((t) => /^rounded/.test(t)) &&
          toks.some((t) => /^p[xy]?-\d/.test(t)) &&
          !toks.some((t) => /^(border-(t|b|l|r|x|y)|input-|btn-|focus)/.test(t))
        )
          conta(a, 'borda para agrupar', linha(n), txt.slice(0, 60));
      }
    }
    if (ts.isJsxText(n) && EMOJI.test(n.text))
      conta(a, 'emoji em texto', linha(n), n.text.trim().slice(0, 30));
    ts.forEachChild(n, v);
  };
  v(sf);
}
// emoji nas traduções
for (const f of fs
  .readdirSync(path.join(R, 'public/translations/pages'))
  .map((x) => path.join(R, 'public/translations/pages', x))) {
  const d = fs.readFileSync(f, 'utf8');
  const m = d.match(new RegExp(EMOJI.source, 'gu'));
  if (m) conta('traduções', 'emoji', path.basename(f), m.length + '');
}
for (const [a, o] of Object.entries(res)) {
  console.log('== ' + a);
  for (const [k, n] of Object.entries(o).sort((x, y) => y[1] - x[1])) {
    console.log(String(n).padStart(5), k);
  }
}
if (process.argv.includes('--exemplos'))
  for (const [k, v] of Object.entries(ex)) {
    console.log('\n# ' + k);
    v.forEach((x) => console.log('  ' + x));
  }
