const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const str = (v) => (v == null ? '' : String(v).trim());
const n = (v) => {
  if (v === '' || v == null) return 0;
  if (typeof v === 'number') return v;
  let s = String(v).replace(/R\$/g, '').replace(/\s/g, '');
  const lastComma = s.lastIndexOf(',');
  const lastDot = s.lastIndexOf('.');
  if (lastComma > lastDot) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (lastDot > lastComma) {
    s = s.replace(/,/g, '');
  } else {
    s = s.replace(',', '.');
  }
  const val = parseFloat(s);
  return isNaN(val) ? 0 : val;
};

function getField(row, ...keys) {
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== '') return row[k];
    for (const rk of Object.keys(row)) {
      if (rk.trim() === k.trim() && row[rk] !== undefined && row[rk] !== '') return row[rk];
    }
  }
  return '';
}

const file1 = path.join(__dirname, '..', 'data', 'excel', 'BASE 1.xlsx');
const file2 = path.join(__dirname, '..', 'data', 'excel', 'BASE 2.xlsx');

const wb1 = XLSX.readFile(file1);
const wb2 = XLSX.readFile(file2);

const vSheet1 = wb1.Sheets['Vendas'];
const vSheet2 = wb2.Sheets['Vendas'];

const vRaw1 = XLSX.utils.sheet_to_json(vSheet1, { defval: '' });
const vRaw2 = XLSX.utils.sheet_to_json(vSheet2, { defval: '' });

const map1 = new Map(vRaw1.map(r => [str(getField(r, 'ID')), r]));

const range = XLSX.utils.decode_range(vSheet2['!ref']);

const headers = [];
for (let c = range.s.c; c <= range.e.c; c++) {
  const cellRef = XLSX.utils.encode_cell({ r: range.s.r, c });
  headers.push(vSheet2[cellRef] ? str(vSheet2[cellRef].v) : '');
}

const colIdIdx = headers.findIndex(h => h.trim() === 'ID');
const colVendaIdx = headers.findIndex(h => h.trim() === 'Valor Venda');
const colCustoIdx = headers.findIndex(h => h.trim() === 'Custo');
const colLucroIdx = headers.findIndex(h => h.trim() === 'Lucro');

let fixCount = 0;

for (let r = range.s.r + 1; r <= range.e.r; r++) {
  const idCellRef = XLSX.utils.encode_cell({ r, c: colIdIdx });
  const idVal = vSheet2[idCellRef] ? str(vSheet2[idCellRef].v) : '';
  if (!idVal) continue;

  const r1 = map1.get(idVal);
  if (!r1) continue;

  const v2CellRef = XLSX.utils.encode_cell({ r, c: colVendaIdx });
  const c2CellRef = XLSX.utils.encode_cell({ r, c: colCustoIdx });
  const l2CellRef = XLSX.utils.encode_cell({ r, c: colLucroIdx });

  const valVenda2 = vSheet2[v2CellRef] ? n(vSheet2[v2CellRef].v) : 0;
  const valCusto2 = vSheet2[c2CellRef] ? n(vSheet2[c2CellRef].v) : 0;

  const valVenda1 = n(getField(r1, 'Valor Venda', ' Valor Venda '));
  const valCusto1 = n(getField(r1, 'Custo', ' Custo '));
  const valLucro1 = n(getField(r1, 'Lucro', ' Lucro '));

  // Novo critério: Se o custo na BASE 2 está zerado mas na BASE 1 existe, OU se o valor de venda difere
  if ((valCusto2 === 0 && valCusto1 > 0) || Math.abs(valVenda2 - valVenda1) > 0.01) {
    console.log(`Corrigindo ID ${idVal}:`);
    console.log(`  Valor Venda: ${valVenda2} -> ${valVenda1}`);
    console.log(`  Custo:       ${valCusto2} -> ${valCusto1}`);
    console.log(`  Lucro:       ${vSheet2[l2CellRef] ? vSheet2[l2CellRef].v : 0} -> ${valLucro1}`);

    vSheet2[v2CellRef] = { t: 'n', v: valVenda1 };
    vSheet2[c2CellRef] = { t: 'n', v: valCusto1 };
    vSheet2[l2CellRef] = { t: 'n', v: valLucro1 };
    
    fixCount++;
  }
}

if (fixCount > 0) {
  XLSX.writeFile(wb2, file2);
  console.log(`\nSucesso! ${fixCount} vendas corrigidas e gravadas em ${path.basename(file2)}.`);
} else {
  console.log('\nNenhuma venda precisou de correção.');
}
