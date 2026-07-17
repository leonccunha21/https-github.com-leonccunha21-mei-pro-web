const XLSX = require('xlsx');
const fs = require('fs');

const unifPath = 'data/excel/Vendas Unificadas.xlsx';
const modeloPath = 'data/excel/Dados coletas/Modelo_Importacao.xlsx';

// ---------- 1. Estatísticas e grupos ----------
const rows = XLSX.utils.sheet_to_json(XLSX.readFile(unifPath).Sheets['Vendas'], { header: 1, defval: null });
const H = rows[0];
const ip = H.indexOf('Produto');
const iq = H.indexOf('QTD');
const ifa = H.indexOf('Faturamento (R$)');

const stat = new Map();
for (let i = 1; i < rows.length; i++) {
  const p = rows[i][ip];
  if (!p) continue;
  const nome = String(p).trim();
  if (!stat.has(nome)) stat.set(nome, { qtd: 0, fat: 0 });
  const s = stat.get(nome);
  s.qtd += Number(rows[i][iq]) || 0;
  s.fat += typeof rows[i][ifa] === 'number' ? rows[i][ifa] : 0;
}
const nomes = [...stat.keys()];
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

// Grupos exatos por normalização
const byNorm = new Map();
for (const n of nomes) {
  const k = norm(n);
  if (!byNorm.has(k)) byNorm.set(k, []);
  byNorm.get(k).push(n);
}
// Mapa norm -> canônico (variante mais frequente)
const mapCanon = new Map();
const exatosAplicados = [];
for (const [k, lista] of byNorm) {
  if (lista.length > 1) {
    lista.sort((a, b) => stat.get(b).qtd - stat.get(a).qtd);
    const canon = lista[0];
    for (const v of lista) mapCanon.set(v, canon);
    exatosAplicados.push({ canon, variantes: lista });
  }
}

// ---------- 2. Pares fuzzy (sugestão p/ revisão manual) ----------
function lev(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      d[i][j] = a[i - 1] === b[j - 1] ? d[i - 1][j - 1] : 1 + Math.min(d[i - 1][j], d[i][j - 1], d[i - 1][j - 1]);
  return d[m][n];
}
const pares = [];
for (let i = 0; i < nomes.length; i++) {
  for (let j = i + 1; j < nomes.length; j++) {
    const a = norm(nomes[i]), b = norm(nomes[j]);
    if (a === b) continue;
    const dist = lev(a, b);
    const mx = Math.max(a.length, b.length);
    const r = mx ? 1 - dist / mx : 1;
    const lr = Math.min(a.length, b.length) / mx;
    if (r >= 0.9 && lr >= 0.6) {
      const sug = stat.get(nomes[i]).qtd >= stat.get(nomes[j]).qtd ? nomes[i] : nomes[j];
      pares.push({ a: nomes[i], b: nomes[j], sim: +r.toFixed(3), sug });
    }
  }
}
pares.sort((x, y) => y.sim - x.sim);

// Aviso: diferença aparentemente é só especificação (tamanho/cor/modelo)?
const SPEC = /^\d+([.,]\d+)?(m|cm|mm|km|ml|l|g|kg|mg|gb|mb|kb|w|v|hz|khz|px|mp|pol|inch|cm)?$/i;
const SPECWORDS = new Set(['preto','branco','azul','vermelho','verde','rosa','amarelo','cinza','prata','dourado','gold','rosa','colorido','colorida','plus','pro','max','mini','grande','pequeno','1m','2m','3m','4m','5m','1m','10m','20w','25w','15w','220v','110v','12v','24v','ps2','ps3','ps4','xbox','iphone','android','cpf','cnpj']);
function avisoSpec(a, b) {
  const ta = (a.match(/[a-z0-9]+/g) || []);
  const tb = (b.match(/[a-z0-9]+/g) || []);
  const sa = new Set(ta), sb = new Set(tb);
  const diff = [...new Set([...ta.filter(x => !sb.has(x)), ...tb.filter(x => !sa.has(x))])];
  if (diff.length === 0) return '';
  const todosSpec = diff.every(t => SPEC.test(t) || SPECWORDS.has(t));
  return todosSpec ? 'ATENÇÃO: diferença é especificação (tamanho/cor/modelo) — provável PRODUTO DIFERENTE' : '';
}
for (const p of pares) p.aviso = avisoSpec(p.a.toLowerCase(), p.b.toLowerCase());

// ---------- 3. Aplica mapa nos arquivos ----------
function aplicar(path) {
  const wb = XLSX.readFile(path);
  const ws = wb.Sheets['Vendas'];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null });
  const hi = data[0].indexOf('Produto');
  let mudou = 0;
  for (let i = 1; i < data.length; i++) {
    const v = data[i][hi];
    if (v == null) continue;
    const key = String(v).trim();
    if (mapCanon.has(key)) {
      const novo = mapCanon.get(key);
      if (novo !== key) { data[i][hi] = novo; mudou++; }
    }
  }
  wb.Sheets['Vendas'] = XLSX.utils.aoa_to_sheet(data);
  XLSX.writeFile(wb, path);
  return mudou;
}
const m1 = aplicar(unifPath);
const m2 = aplicar(modeloPath);

// ---------- 4. Arquivos de saída ----------
let outEx = 'CANONICO;VARIANTES_ANTIGAS;QTD_TOTAL;FATURAMENTO_TOTAL\n';
for (const g of exatosAplicados) {
  const qtd = g.variantes.reduce((s, v) => s + stat.get(v).qtd, 0);
  const fat = g.variantes.reduce((s, v) => s + stat.get(v).fat, 0);
  outEx += `${g.canon};${g.variantes.join(' | ')};${qtd};${fat.toFixed(2)}\n`;
}
fs.writeFileSync('data/excel/mapeamento_exatos_aplicado.csv', outEx, 'utf8');

let outFz = 'NOME_A;NOME_B;SIMILARIDADE;QTD_A;QTD_B;SUGESTAO_CANONICA;AVISO;FUNDIR_SIM_NAO;NOME_CANONICO_FINAL\n';
for (const p of pares) {
  outFz += `${p.a};${p.b};${p.sim};${stat.get(p.a).qtd};${stat.get(p.b).qtd};${p.sug};${p.aviso};;\n`;
}
fs.writeFileSync('data/excel/mapeamento_nomes.csv', outFz, 'utf8');

// Novo total de nomes únicos após padronização
const novoSet = new Set();
for (const n of nomes) novoSet.add(mapCanon.get(n) || n);
console.log('Grupos exatos aplicados:', exatosAplicados.length, '(variantes fundidas)');
console.log('Células alteradas em Vendas Unificadas:', m1);
console.log('Células alteradas em Modelo_Importacao:', m2);
console.log('Nomes únicos antes:', nomes.length, '-> depois:', novoSet.size);
console.log('Fuzzy pares p/ revisão:', pares.length);
console.log('Gerado: mapeamento_exatos_aplicado.csv e mapeamento_nomes.csv');
