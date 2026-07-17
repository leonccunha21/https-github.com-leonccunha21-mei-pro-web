const XLSX = require('xlsx');
const fs = require('fs');
const { classify } = require('./classificar_final.cjs');

const MODELO = 'data/excel/Dados coletas/Modelo_Importacao.xlsx';
const BASE1 = 'data/excel/BASE 1.xlsx';
const BAK = 'data/excel/Dados coletas/Modelo_Importacao.bak7.xlsx';

const SHOPEE_CODE = /^(?:(?:19|2[0-6])\d{2}[A-Za-z0-9]*[A-Za-z][A-Za-z0-9]*)|(?:\d{15,})$/;

function num(v) {
  if (v == null) return 0;
  const s = String(v).replace(/[^0-9.]/g, '');
  if (s === '') return 0;
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

// ---------- backup ----------
fs.copyFileSync(MODELO, BAK);
console.log('Backup: ' + BAK);

const wb = XLSX.readFile(MODELO);
const vSheet = wb.Sheets['Vendas'];
const vRows = XLSX.utils.sheet_to_json(vSheet, { header: 1, defval: null });
const vHeader = vRows[0];
const V = {};
vHeader.forEach((h, i) => V[h] = i);

// ---------- 1) corrige código Shopee preso no Cliente -> ID da Venda ----------
let fixed = 0, fixedByYear = {};
for (let i = 1; i < vRows.length; i++) {
  const r = vRows[i];
  const cli = String(r[V['Cliente']] || '').trim();
  if (SHOPEE_CODE.test(cli)) {
    // extrai ano para estatística
    const m = cli.match(/^(\d{4})/);
    const ano = m ? m[1] : 'outro';
    // apenas se ainda não tiver um ID da Venda com cara de código
    const curId = String(r[V['ID da Venda']] || '').trim();
    r[V['ID da Venda']] = cli;
    r[V['Cliente']] = '';
    fixed++;
    fixedByYear[ano] = (fixedByYear[ano] || 0) + 1;
  }
}
console.log('Cliente->ID da Venda corrigidos: ' + fixed, fixedByYear);

// ---------- 2) carrega BASE 1 e filtra as vendas adicionadas (ID >= v_2734) ----------
const bwb = XLSX.readFile(BASE1);
const bRows = XLSX.utils.sheet_to_json(bwb.Sheets['Vendas'], { header: 1, defval: null });
const bHeader = bRows[0];
const bi = {};
bHeader.forEach((hh, i) => { bi[String(hh).trim()] = i; });

function added(r) {
  const id = String(r[bi['ID']] || '');
  const m = id.match(/v_(\d+)/);
  if (!m) return false;
  return parseInt(m[1], 10) >= 2734;
}

let addedCount = 0, withShopee = 0;
for (let i = 1; i < bRows.length; i++) {
  const r = bRows[i];
  if (!added(r)) continue;
  const idPed = String(r[bi['ID Pedido']] || '').trim();
  const idVenda = idPed || String(r[bi['ID']] || '').trim();
  const canalAdd = idPed ? 'Shopee' : 'Loja Física';
  if (idPed) withShopee++;
  const out = new Array(vHeader.length).fill(null);
  out[V['ID da Venda']] = idVenda;
  out[V['Data']] = String(r[bi['Data']] || '').trim();
  out[V['Hora']] = String(r[bi['Hora']] || '').trim();
  out[V['Cliente']] = String(r[bi['Cliente']] || '').trim();
  out[V['Telefone']] = String(r[bi['Telefone']] || '').trim();
  out[V['Forma de Pagamento']] = String(r[bi['Pagamento']] || '').trim();
  out[V['Tipo']] = String(r[bi['Tipo']] || '').trim();
  out[V['Produto']] = String(r[bi['Produto']] || '').trim();   // nome original do BASE 1
  out[V['QTD']] = num(r[bi['QTD']]);
  out[V['Custo (R$)']] = num(r[bi['Custo']]);
  out[V['Faturamento (R$)']] = num(r[bi['Valor Venda']]);
  out[V['Lucro (R$)']] = num(r[bi['Lucro']]);
  out[V['Status']] = String(r[bi['Status']] || '').trim();
  out[V['Canal']] = canalAdd;
  vRows.push(out);
  addedCount++;
}
console.log('Vendas BASE 1 adicionadas: ' + addedCount + ' (com ID Shopee: ' + withShopee + ')');

// grava Vendas
wb.Sheets['Vendas'] = XLSX.utils.aoa_to_sheet(vRows);

// ---------- 3) reconstrói Produtos (estoque=0) + Categorias a partir das Vendas ----------
const pRows = XLSX.utils.sheet_to_json(wb.Sheets['Produtos'], { header: 1, defval: null });
const pHeader = pRows[0];
const P = {};
pHeader.forEach((h, i) => P[h] = i);

const agg = new Map(); // nome -> {qtd, custo, fat, ordem}
let ordem = 0;
for (let i = 1; i < vRows.length; i++) {
  const r = vRows[i];
  const nome = String(r[V['Produto']] || '').trim();
  if (!nome) continue;
  const q = num(r[V['QTD']]);
  const c = num(r[V['Custo (R$)']]);
  const f = num(r[V['Faturamento (R$)']]);
  if (!agg.has(nome)) agg.set(nome, { qtd: 0, custo: 0, fat: 0, ordem: ordem++ });
  const a = agg.get(nome);
  a.qtd += q; a.custo += c; a.fat += f;
}

const newProd = [pHeader.slice()];
let skuN = 2001;
const catSet = new Set();
const sorted = [...agg.entries()].sort((x, y) => x[1].ordem - y[1].ordem);
for (const [nome, a] of sorted) {
  const custo = a.qtd ? a.custo / a.qtd : 0;
  const venda = a.qtd ? a.fat / a.qtd : 0;
  const cat = classify(nome);
  catSet.add(cat);
  newProd.push([
    'SKU-' + skuN++,
    nome,
    cat,
    Math.round(custo * 100) / 100,
    Math.round(venda * 100) / 100,
    0,           // Estoque
    0            // Estoque Mínimo
  ]);
}
wb.Sheets['Produtos'] = XLSX.utils.aoa_to_sheet(newProd);
console.log('Produtos reconstruídos: ' + (newProd.length - 1));

// Categorias tab
const catsUnicas = require('./classificar_final.cjs').CATS.map(c => c[0]).concat(['Diversos']);
const catAoa = [['Nome da Categoria']].concat(catsUnicas.map(c => [c]));
wb.Sheets['Categorias'] = XLSX.utils.aoa_to_sheet(catAoa);

XLSX.writeFile(wb, MODELO);

// ---------- relatório ----------
let totQ = 0, totC = 0, totF = 0;
for (let i = 1; i < vRows.length; i++) {
  totQ += num(vRows[i][V['QTD']]);
  totC += num(vRows[i][V['Custo (R$)']]);
  totF += num(vRows[i][V['Faturamento (R$)']]);
}
console.log('\n=== RESULTADO ===');
console.log('Vendas total: ' + (vRows.length - 1));
console.log('QTD: ' + totQ + ' | Custo: ' + totC.toFixed(2) + ' | Faturamento: ' + totF.toFixed(2));
console.log('Produtos únicos: ' + agg.size);
console.log('GRAVADO em ' + MODELO);
