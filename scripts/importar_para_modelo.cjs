const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const src = 'data/excel/Vendas Unificadas.xlsx';
const dst = 'data/excel/Dados coletas/Modelo_Importacao.xlsx';
const bak = 'data/excel/Dados coletas/Modelo_Importacao.bak.xlsx';

const modeloHdr = ['ID da Venda','Data','Hora','Cliente','Telefone','Forma de Pagamento','Tipo','Produto','QTD','Custo (R$)','Faturamento (R$)','Lucro (R$)','Status','Canal'];

// Backup
fs.copyFileSync(dst, bak);
console.log('Backup salvo:', bak);

// Lê dados unificados
const wbSrc = XLSX.readFile(src);
const sRows = XLSX.utils.sheet_to_json(wbSrc.Sheets['Vendas'], { header: 1, defval: null });
const sHdr = sRows[0];
const idx = modeloHdr.map(m => sHdr.indexOf(m));
if (idx.some(j => j < 0)) throw new Error('Coluna do Modelo não encontrada no unificado: ' + modeloHdr.filter((m, i) => idx[i] < 0).join(', '));

const out = [modeloHdr];
for (let i = 1; i < sRows.length; i++) {
  const r = sRows[i];
  out.push(idx.map(j => (j < 0 ? '' : r[j])));
}

// Lê o modelo e substitui apenas a aba Vendas
const wbDst = XLSX.readFile(dst);
const ws = XLSX.utils.aoa_to_sheet(out);
wbDst.Sheets['Vendas'] = ws;
wbDst.SheetNames = wbDst.SheetNames; // mantém ordem/demais abas
XLSX.writeFile(wbDst, dst);

console.log('Linhas de venda gravadas no Modelo_Importacao (aba Vendas):', out.length - 1);
console.log('Abas preservadas:', wbDst.SheetNames.join(', '));
