const XLSX = require('xlsx');
const fs = require('fs');

const srcPath = 'data/excel/Vendas Unificadas.xlsx';            // dados já padronizados
const dstPath = 'data/excel/Dados coletas/Modelo_Importacao.xlsx'; // ARQUIVO FINAL
const bakPath = 'data/excel/Dados coletas/Modelo_Importacao.bak3.xlsx';

fs.copyFileSync(dstPath, bakPath);
console.log('Backup:', bakPath);

const modeloHdr = ['ID da Venda','Data','Hora','Cliente','Telefone','Forma de Pagamento','Tipo','Produto','QTD','Custo (R$)','Faturamento (R$)','Lucro (R$)','Status','Canal'];

// lê dados padronizados (17 colunas) e extrai só as 14 do modelo
const wbSrc = XLSX.readFile(srcPath);
const srcRows = XLSX.utils.sheet_to_json(wbSrc.Sheets['Vendas'], { header: 1, defval: null });
const srcHdr = srcRows[0];
const idx = modeloHdr.map(m => srcHdr.indexOf(m));
if (idx.some(j => j < 0)) throw new Error('Coluna faltando: ' + modeloHdr.filter((m, i) => idx[i] < 0).join(', '));

const out = [modeloHdr];
for (let i = 1; i < srcRows.length; i++) {
  out.push(idx.map(j => srcRows[i][j]));
}

// grava no Modelo_Importacao: só aba Vendas (14 colunas), mantém demais abas, remove Validacao
const wbDst = XLSX.readFile(dstPath);
wbDst.Sheets['Vendas'] = XLSX.utils.aoa_to_sheet(out);
if (wbDst.Sheets['Validacao']) { delete wbDst.Sheets['Validacao']; }
wbDst.SheetNames = wbDst.SheetNames.filter(s => s !== 'Validacao');
XLSX.writeFile(wbDst, dstPath);

console.log('Abas finais:', wbDst.SheetNames.join(', '));
console.log('Vendas: 14 colunas,', out.length - 1, 'linhas de venda gravadas em', dstPath);
