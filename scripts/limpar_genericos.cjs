const XLSX = require('xlsx');
const fs = require('fs');
const MODELO = 'data/excel/Dados coletas/Modelo_Importacao.xlsx';
const BAK = 'data/excel/Dados coletas/Modelo_Importacao.bak8.xlsx';

fs.copyFileSync(MODELO, BAK);
const wb = XLSX.readFile(MODELO);

// abas que só têm dados genéricos de exemplo -> limpar linhas, manter cabeçalho
const limpar = ['Empréstimos', 'Clientes', 'Fornecedores'];
for (const nome of limpar) {
  const sh = wb.Sheets[nome];
  if (!sh) { console.log('Aba ausente: ' + nome); continue; }
  const rows = XLSX.utils.sheet_to_json(sh, { header: 1, defval: null });
  const header = rows[0] || [];
  const nova = [header]; // só cabeçalho
  wb.Sheets[nome] = XLSX.utils.aoa_to_sheet(nova);
  console.log(nome + ': ' + (rows.length - 1) + ' linhas genéricas removidas (mantido cabeçalho).');
}

XLSX.writeFile(wb, MODELO);
console.log('GRAVADO em ' + MODELO + ' (backup: ' + BAK + ')');
