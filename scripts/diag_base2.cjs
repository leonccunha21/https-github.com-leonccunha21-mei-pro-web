const XLSX = require('xlsx');
const path = require('path');
const PROJECT_ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(PROJECT_ROOT, 'data', 'excel', 'BASE 2.xlsx');
const wb = XLSX.readFile(INPUT);

const n = (v) => (v === '' || v == null ? 0 : Number(v));
const str = (v) => (v == null ? '' : String(v).trim());

const vRaw = XLSX.utils.sheet_to_json(wb.Sheets['Vendas'], { defval: '' });
const iRaw = XLSX.utils.sheet_to_json(wb.Sheets['Itens Vendidos'], { defval: '' });

// Lucros negativos na aba Vendas
let negVendas = 0, negItens = 0;
const vendasByLucroNeg = [];
for (const r of vRaw) {
  const lucro = n(r['Lucro']);
  if (lucro < 0) { negVendas++; if (vendasByLucroNeg.length < 15) vendasByLucroNeg.push({ id: str(r['ID']), prod: str(r['Produto']), venda: n(r[' Valor Venda ']), custo: n(r[' Custo ']), lucro }); }
}
for (const r of iRaw) {
  if (n(r['Lucro do Item']) < 0) negItens++;
}
console.log('Lucros negativos -> Vendas:', negVendas, '| Itens Vendidos:', negItens);

// Comparar Vendas vs Itens Vendidos por Venda ID
const itensMap = new Map();
for (const r of iRaw) {
  const id = str(r['Venda ID']);
  if (!itensMap.has(id)) itensMap.set(id, []);
  itensMap.get(id).push(r);
}

let mismVenda=0, mismCusto=0, mismLucro=0, onlyVendas=0, onlyItens=0;
const exMismatch=[];
for (const r of vRaw) {
  const id = str(r['ID']);
  const iList = itensMap.get(id);
  if (!iList) { onlyVendas++; continue; }
  // soma itens
  let sumVenda=0, sumCusto=0, sumLucro=0;
  for (const it of iList){ sumVenda+=n(it['Total do Item']); sumCusto+=n(it['Custo Unitário'])*n(it['Quantidade']); sumLucro+=n(it['Lucro do Item']); }
  const vVenda=n(r[' Valor Venda ']), vCusto=n(r[' Custo ']), vLucro=n(r['Lucro']);
  if (Math.abs(sumVenda - vVenda) > 0.01) mismVenda++;
  if (Math.abs(sumCusto - vCusto) > 0.01) mismCusto++;
  if (Math.abs(sumLucro - vLucro) > 0.01) mismLucro++;
  if ((Math.abs(sumVenda - vVenda) > 0.01 || Math.abs(sumLucro - vLucro) > 0.01) && exMismatch.length < 15) {
    exMismatch.push({ id, prod: str(r['Produto']), vVenda, iVenda: sumVenda, vCusto, iCusto: sumCusto, vLucro, iLucro: sumLucro });
  }
}
for (const id of itensMap.keys()){ if (!vRaw.find(r=>str(r['ID'])===id)) onlyItens++; }

console.log('IDs só em Vendas:', onlyVendas, '| IDs só em Itens Vendidos:', onlyItens);
console.log('Discrepâncias Venda: Valor', mismVenda, '| Custo', mismCusto, '| Lucro', mismLucro);
console.log('\nExemplos de discrepância (Vendas vs Itens Vendidos):');
console.table(exMismatch);

