const XLSX = require('xlsx');
const parseData = d => { const x = String(d || '').split('/'); return x.length === 3 ? new Date(+x[2], +x[1] - 1, +x[0]) : null; };
const ts = d => { const t = parseData(d); return t && !isNaN(t) ? t.getTime() : null; };

// MODELO
const wbM = XLSX.readFile('data/excel/Dados coletas/Modelo_Importacao.xlsx');
const vm = XLSX.utils.sheet_to_json(wbM.Sheets['Vendas'], { header: 1, defval: null });
const Hm = vm[0];
const iDm = Hm.indexOf('Data'), iPm = Hm.indexOf('Produto'), iQm = Hm.indexOf('QTD');
const m2026 = vm.slice(1).filter(r => { const t = ts(r[iDm]); return t && new Date(2026, 0, 1) <= t && t <= new Date(2026, 11, 31); });
const mTs = m2026.map(r => ts(r[iDm])).filter(x => x);
const mMin = new Date(Math.min(...mTs)), mMax = new Date(Math.max(...mTs));
console.log('MODELO 2026: linhas=' + m2026.length + ' | ' + mMin.toLocaleDateString('pt-BR') + ' ate ' + mMax.toLocaleDateString('pt-BR'));
const corte = new Date(2026, 5, 17).getTime(); // 17/06/2026
const mDepois = m2026.filter(r => ts(r[iDm]) >= corte);
console.log('  Modelo 2026 com data >= 17/06/2026: ' + mDepois.length + ' linhas');

// BASE 1
const wbB = XLSX.readFile('data/excel/BASE 1.xlsx');
const vb = XLSX.utils.sheet_to_json(wbB.Sheets['Vendas'], { header: 1, defval: null });
const Hb = vb[0];
const iIDb = Hb.indexOf('ID'), iDb = Hb.indexOf('Data'), iPb = Hb.indexOf('Produto'), iQb = Hb.indexOf('QTD'), iStb = Hb.indexOf('Status'), iCanb = Hb.indexOf('Canal'), iPed = Hb.indexOf('ID Pedido');
// adicionadas: ID >= v_2734 (numerico apos 'v_')
const added = vb.slice(1).filter(r => { const id = String(r[iIDb] || ''); const n = parseInt(id.replace(/\D/g, ''), 10); return n >= 2734; });
console.log('\nBASE1 adicionadas (ID>=v_2734): ' + added.length + ' linhas');
const aTs = added.map(r => ts(r[iDb])).filter(x => x);
if (aTs.length) { const aMin = new Date(Math.min(...aTs)), aMax = new Date(Math.max(...aTs)); console.log('  periodo: ' + aMin.toLocaleDateString('pt-BR') + ' ate ' + aMax.toLocaleDateString('pt-BR')); }
console.log('  status: ' + JSON.stringify([...new Set(added.map(r => r[iStb]))]));
console.log('  canais: ' + JSON.stringify([...new Set(added.map(r => r[iCanb]))]));
console.log('  com ID Pedido (Shopee): ' + added.filter(r => r[iPed]).length + '/' + added.length);

// DUPLICADOS DENTRO do proprio conjunto adicionado (mesmo Data+Produto+QTD)
const nk = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
const seen = new Map(); let dupInAdded = 0;
for (const r of added) {
  const k = ts(r[iDb]) + '|' + nk(r[iPb]) + '|' + r[iQb];
  if (seen.has(k)) dupInAdded++; else seen.set(k, 1);
}
console.log('  duplicados internos (Data+Produto+QTD): ' + dupInAdded);

// DUPLICADOS entre BASE1-adicionado e MODELO 2026 (mesmo Data+Produto+QTD normalizado)
const mSig = new Set(m2026.map(r => ts(r[iDm]) + '|' + nk(r[iPm]) + '|' + r[iQm]));
let overlap = 0; const ov = [];
for (const r of added) {
  const k = ts(r[iDb]) + '|' + nk(r[iPb]) + '|' + r[iQb];
  if (mSig.has(k)) { overlap++; if (ov.length < 10) ov.push(r[iDb] + ' ' + r[iPb] + ' x' + r[iQb]); }
}
console.log('  sobreposicao com Modelo 2026 (Data+Produto+QTD): ' + overlap);
ov.forEach(s => console.log('    -> ' + s));
