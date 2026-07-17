const XLSX = require('xlsx');
const fs = require('fs');

const path = 'data/excel/Dados coletas/Modelo_Importacao.xlsx';
const bakPath = 'data/excel/Dados coletas/Modelo_Importacao.bak4.xlsx';
fs.copyFileSync(path, bakPath);
console.log('Backup:', bakPath);

const wb = XLSX.readFile(path);
const rows = XLSX.utils.sheet_to_json(wb.Sheets['Vendas'], { header: 1, defval: null });
const H = rows[0];
const ip = H.indexOf('Produto'), iq = H.indexOf('QTD'), ic = H.indexOf('Custo (R$)'), ift = H.indexOf('Faturamento (R$)');

const agg = new Map(); // nome -> {q,c,f}
for (let i = 1; i < rows.length; i++) {
  const p = rows[i][ip]; if (!p || !String(p).trim()) continue;
  const k = String(p).trim();
  const q = Number(rows[i][iq]) || 0, c = Number(rows[i][ic]) || 0, f = Number(rows[i][ift]) || 0;
  const o = agg.get(k) || { q: 0, c: 0, f: 0 }; o.q += q; o.c += c; o.f += f; agg.set(k, o);
}

const hdr = ['Código/SKU','Nome do Produto','Categoria','Preço de Custo','Preço de Venda','Estoque','Estoque Mínimo'];
const out = [hdr];
let n = 0;
for (const [nome, o] of [...agg.entries()].sort((a,b)=>a[0].localeCompare(b[0],'pt'))) {
  n++;
  const custoMed = o.q ? o.c / o.q : 0;
  const vendaMed = o.q ? o.f / o.q : 0;
  out.push([ 'SKU-' + String(2000 + n), nome, '', +custoMed.toFixed(2), +vendaMed.toFixed(2), 0, 0 ]);
}

wb.Sheets['Produtos'] = XLSX.utils.aoa_to_sheet(out);
XLSX.writeFile(wb, path);
console.log('Produtos cadastrados:', out.length - 1, '(substituiu os 5 exemplos do template)');
console.log('Estoque de todos = 0; Preço de Custo/Venda = média histórica das vendas; Categoria em branco.');
