const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SPREADSHEET_PATH = path.join(PROJECT_ROOT, 'data', 'excel', 'arquivo princial.xlsx');
const OUTPUT_EXCEL = path.join(PROJECT_ROOT, 'data', 'excel', 'Backup_Dados_Completos.xlsx');
const OUTPUT_DATA_TS = path.join(PROJECT_ROOT, 'src', 'data.ts');
// Inline categorize logic from src/lib/categorize.ts
const DEFAULT_CATEGORY = 'Diversos';
function categorizeProduct(name) {
  const n = (name || '').toLowerCase();
  if (/(capa|capinha|película|pelicula|privacidade|vidro temperado|protetor de tela|proteção de tela|pelicular)/.test(n)) return 'Capas e Películas';
  if (/(cabo|adaptador|hub |hubusb|hub usb|extensor|conversor)/.test(n)) return 'Cabos e Adaptadores';
  if (/(fone|earphone|airpods|headphone|ouvido)/.test(n)) return 'Fones de Ouvido';
  if (/(carregador|fonte |fonte\n|fonte\s|carreg)/.test(n)) return 'Carregadores';
  if (/(suporte|suportecelular|ventosa|magnetico|magnético|veicular|retrovisor|suporte moto|suporte veicular|suporte celular|suporte de celular|suporte de mesa|suporte braço|suporte gancho|suporte triplo|suporte de tv|suporte fone|imã|cordinha|cordão|crachá|porta crachá|estoj|luvinha|luva|capa de chuva|capa a prova|selfie|tripé|tripe)/.test(n)) return 'Acessórios para Celular';
  if (/(mouse|teclado|keyboard|monitor|computador|pc |notebook|laptop|cool|hub.*porta|placa de som|hdmi|vga|displayport|mousepad|mouse pad|gamer.*mouse|gamer.*teclado)/.test(n)) return 'Computador e Periféricos';
  if (/(memória|memoria|cartão de memória|cartao de memoria|micro sd|memory card|pendrive|pen drive|hd |ssd|case.*hd|cartão|cartao)/.test(n)) return 'Memória e Armazenamento';
  if (/(caixa de som|alto falante|parafuso|som|tweeter|evok|fluxo|áudio|audio|bluetooth.*speaker|mini caixa|impressora|impressão|impressao|xerox|lousa|projetor)/.test(n)) return 'Áudio e Vídeo';
  if (/(lanterna|câmera|camera|ip cam|detector|isqueiro|bateria|pilha|fusível|fusivel|antena|wifi|router|roteador|mini router|controle.*tv|controle.*universal|tv box|unitv|chip|sim card|globo de luz|led|lâmpada|lampada|luminária|luminaria|refletor|módulo|modulo)/.test(n)) return 'Eletrônicos Diversos';
  if (/(garrafa|stanley|kit.*forma|kit.*colher|kit.*talher|kit.*facas|kit.*pote|kit.*banheiro|kit.*taboa|ralador|fatiador|triturador|processador|liquidificador|mini liquidificado|máquina de costura|mini máquina|dispenser|bucha|porta detergente|balança|balâ|tapete|massageador|escova|depilador|cortador|desentupidor|lixas?|canivete|alicate|chave|chaveiro|tork)/.test(n)) return 'Casa e Utensílios';
  if (/(lego|boneco|brinquedo|jogo.*ps|jogo.*xbox|jogo.*game|game boy|controle.*ps|controle.*xbox|pen drive.*jogo|pop it|card.*jogo|figurinha|baralho|lousa|mochila|caderno|bobbie)/.test(n)) return 'Brinquedos e Jogos';
  if (/(relógio|relogio|smartband|pulseira|watch|xiaomi.*band|laxasfit)/.test(n)) return 'Relógios e Wearables';
  if (/(formatação|formatacao|restauração|restauracao|serviço|servico|impressão|impressao|xerox|gravação|gravacao|manutenção|manutencao|instalação|instalacao)/.test(n)) return 'Serviços';
  return DEFAULT_CATEGORY;
}

// --- HELPERS ---
function excelSerialToDate(serial) {
  if (typeof serial === 'number' && serial > 40000) {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString();
  }
  if (typeof serial === 'string' && serial.includes('T')) return serial;
  if (typeof serial === 'string' && serial.includes('-')) return new Date(serial).toISOString();
  return new Date().toISOString();
}

function roundCurrency(v) {
  return Math.round((v + Number.EPSILON) * 100) / 100;
}

function normalizeName(name) {
  if (!name || typeof name !== 'string') return '';
  return name.trim().replace(/\s+/g, ' ');
}

// --- MAIN ---
const wb = XLSX.readFile(SPREADSHEET_PATH);

// 1. Parse Products from PROD sheet
const prodRaw = XLSX.utils.sheet_to_json(wb.Sheets['PROD'], { header: 1 });
const productMap = new Map(); // name -> product
const productList = [];

for (let i = 1; i < prodRaw.length; i++) {
  const row = prodRaw[i];
  const name = normalizeName(row[0]);
  if (!name) continue;

  const purchases = Number(row[1]) || 0;
  const stock = Number(row[2]) || 0;
  const sales = Number(row[3]) || 0;
  const price = Number(row[4]) || 0;
  const owner = row[5] || 'Loja';
  const brand = row[7] || '';
  const model = row[8] || '';
  const q = Number(row[9]) || 1;

  const product = {
    name,
    purchases,
    stock: Math.max(0, stock),
    sales,
    costPrice: price,
    salePrice: 0,
    owner,
    brand: normalizeName(brand),
    model: normalizeName(model),
    category: categorizeProduct(name)
  };

  if (productMap.has(name)) {
    const existing = productMap.get(name);
    existing.stock += product.stock;
    existing.purchases += product.purchases;
    existing.sales += product.sales;
    if (product.salePrice > existing.salePrice) existing.salePrice = product.salePrice;
  } else {
    productMap.set(name, product);
  }
}

console.log(`Products parsed: ${productList.length} raw, ${productMap.size} unique after dedup`);

// 2. Parse Sales from all 3 sheets
function parseSalesSheet(sheetName, year) {
  const sheet = wb.Sheets[sheetName];
  if (!sheet) { console.log(`Sheet ${sheetName} not found`); return []; }
  
  const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  const sales = [];
  let totalQty = 0;
  
  for (let i = 1; i < raw.length; i++) {
    const row = raw[i];
    if (!row || row.length < 3) continue;
    const productName = normalizeName(row[2]);
    if (!productName || productName === 'Total') continue;
    
    const qty = Number(row[3]) || 1;
    if (qty <= 0) continue;
    totalQty += qty;
    
    const unitCost = Number(row[6]) || 0;
    const totalCost = Number(row[7]) || 0;
    const unitPrice = Number(row[8]) || 0;
    const clientRaw = normalizeName(row[4]) || '';
    const seller = normalizeName(row[5]) || '';
    const dateSerial = row[1];
    const date = excelSerialToDate(dateSerial);
    
    // Detect e-commerce channel and extract order ID
    // In 2026, Shopee/TikTok orders have the order ID in the client column
    // and the seller column indicates the channel.
    // In 2024/2025, client may contain "Shopee" but no order ID.
    const sellerLower = seller.toLowerCase();
    const clientLower = clientRaw.toLowerCase();
    
    let saleChannel = 'Loja Física';
    let ecommerceOrderId = undefined;
    let client = clientRaw;
    
    if (sellerLower === 'shopee' || sellerLower === 'tiktok' || sellerLower === 'olx') {
      saleChannel = seller;
      // The client column may contain the order ID or a placeholder
      const placeholders = ['shopee', 'tiktok', 'olx', 'shopee cpf', 'aleatorio', ''];
      if (placeholders.includes(clientLower)) {
        client = '';
      } else {
        // Client field contains the order ID
        ecommerceOrderId = clientRaw;
        client = '';
      }
    } else if (clientLower.includes('shopee')) {
      // 2024/2025 pattern: seller is Leonardo/Fisica, client says "Shopee" or "jhonatan shopee"
      saleChannel = 'Shopee';
      if (clientLower === 'shopee' || clientLower === 'shopee cpf') {
        client = '';
      } else {
        // Keep client name but mark as Shopee sale
      }
    }
    
    // Columns differ by year:
    // 2024/2025: [0]Mes [1]Data [2]Produto [3]QT [4]Cliente [5]Vendedor [6]CustoUn [7]ValorGasto [8]ValorUniVenda [9]ValorVenda [10]TipoVenda [11]ValorCNPJ [12]Lucro [13]FormaPagam [14]%Lucro [15]RecebidoLoja
    // 2026:      [0]Mes [1]Data [2]Produto [3]QT [4]Cliente [5]Vendedor [6]CustoUn [7]ValorGasto [8]ValorUniVenda [9]entrada [10]ValorVenda [11]Lucro [12]Coluna2 [13]RecebidoLoja
    let totalValue = 0;
    let profit = 0;
    
    if (year === 2026) {
      totalValue = Number(row[9]) || 0;  // col 9 = entrada (valor real recebido)
    } else {
      totalValue = Number(row[9]) || 0;
    }
    
    // Determine payment method
    let paymentMethod = 'money';
    if (year === 2026) {
      if (row[13] === 'Transferido') paymentMethod = 'pix';
    } else {
      const forma = row[13];
      if (forma === 'Transferido' || forma === 'Pix') paymentMethod = 'pix';
      else if (forma === 'Cartão' || forma === 'Cartao' || forma === 'Crédito' || forma === 'Débito') paymentMethod = 'card_credit';
    }
    
    const finalTotalCost = totalCost || roundCurrency(unitCost * qty);
    const finalTotalValue = totalValue || roundCurrency(unitPrice * qty);
    const finalProfit = roundCurrency(finalTotalValue - finalTotalCost);
    
    sales.push({
      date,
      productName,
      qty,
      unitCost,
      totalCost: finalTotalCost,
      unitPrice: unitPrice || roundCurrency(finalTotalValue / qty),
      totalValue: finalTotalValue,
      profit: finalProfit,
      client,
      seller,
      paymentMethod,
      saleChannel,
      ecommerceOrderId,
      year
    });
  }
  
  const totalItems = totalQty;
  console.log(`${sheetName}: ${sales.length} rows, ${totalItems} itens (qty sum)`);
  return sales;
}

const sales2024 = parseSalesSheet('Vendas 2024', 2024);
const sales2025 = parseSalesSheet('Vendas 2025', 2025);
const sales2026 = parseSalesSheet('Vendas 2026', 2026);
const allSales = [...sales2024, ...sales2025, ...sales2026];

console.log(`\nTotal sales items: ${allSales.length}`);
console.log(`2024: ${sales2024.length}, 2025: ${sales2025.length}, 2026: ${sales2026.length}`);

// 3. Cross-reference: Add sale items not in products to product list
const productNames = new Set(productMap.keys());
let addedFromSales = 0;

// Also collect sale prices per product for calculating average
const salePriceMap = new Map(); // name -> { sum: totalValue, qty: totalQty }

for (const sale of allSales) {
  const name = sale.productName;
  // Track sale prices for average calculation
  if (!salePriceMap.has(name)) {
    salePriceMap.set(name, { sum: 0, qty: 0 });
  }
  const sp = salePriceMap.get(name);
  sp.sum += sale.totalValue;
  sp.qty += sale.qty;

  if (!productNames.has(name)) {
    productMap.set(name, {
      name,
      purchases: 0,
      stock: 0,
      sales: sale.qty,
      costPrice: sale.unitCost,
      salePrice: 0,
      brand: '',
      model: '',
      category: categorizeProduct(name)
    });
    productNames.add(name);
    addedFromSales++;
  } else {
    const existing = productMap.get(name);
    existing.sales = (existing.sales || 0) + sale.qty;
  }
}

// Calculate average sale price for each product from actual sales
for (const [name, sp] of salePriceMap) {
  const avgPrice = sp.qty > 0 ? Math.round((sp.sum / sp.qty) * 100) / 100 : 0;
  if (productMap.has(name)) {
    productMap.get(name).salePrice = avgPrice;
  }
}

console.log(`Products added from sales (missing in PROD): ${addedFromSales}`);
console.log(`Total unique products: ${productMap.size}`);

// 4. Build final product array
const finalProducts = [];
let pid = 1;
for (const [name, p] of productMap) {
  finalProducts.push({
    id: `p_${pid}`,
    code: `PROD-${String(pid).padStart(4, '0')}`,
    name: p.name,
    category: p.category,
    costPrice: p.costPrice || 0,
    salePrice: p.salePrice || 0,
    stock: p.stock || 0,
    minStock: 5,
    status: 'disponivel',
    createdAt: new Date().toISOString()
  });
  pid++;
}

console.log(`Final products for data.ts: ${finalProducts.length}`);

// 5. Build final sales array
const finalSales = [];
let vid = 1;
for (const sale of allSales) {
  finalSales.push({
    id: `v_${vid}`,
    date: sale.date,
    items: [{
      productId: '',
      productName: sale.productName,
      quantity: sale.qty,
      costPrice: sale.unitCost,
      salePrice: sale.unitPrice,
      total: sale.totalValue
    }],
    clientName: sale.client || undefined,
    paymentMethod: sale.paymentMethod,
    total: roundCurrency(sale.totalValue),
    totalCost: roundCurrency(sale.totalCost),
    profit: roundCurrency(sale.profit),
    ecommerceOrderId: sale.ecommerceOrderId || undefined,
    notes: sale.saleChannel !== 'Loja Física' ? `[client_data]{"channel":"${sale.saleChannel}"}` : undefined,
    status: 'completed'
  });
  vid++;
}

console.log(`Final sales for data.ts: ${finalSales.length}`);

// 6. Generate categories list
const categorySet = new Set(finalProducts.map(p => p.category));
const finalCategories = [];
let cid = 1;
for (const cat of categorySet) {
  finalCategories.push({
    id: `cat_${cid}`,
    name: cat
  });
  cid++;
}

// 7. Generate Backup Excel
const backupWb = XLSX.utils.book_new();

// Products sheet
const prodExport = finalProducts.map(p => ({
  'ID': p.id,
  'Código': p.code,
  'Produto': p.name,
  'Categoria': p.category,
  'Preço Custo': p.costPrice,
  'Preço Venda': p.salePrice,
  'Estoque': p.stock,
  'Estoque Mínimo': p.minStock,
  'Status': p.status === 'disponivel' ? 'Disponível' : 'Indisponível'
}));
const prodSheet = XLSX.utils.json_to_sheet(prodExport);
XLSX.utils.book_append_sheet(backupWb, prodSheet, 'Produtos');

// Sales sheet
const saleExport = finalSales.map(s => ({
  'ID': s.id,
  'Data': s.date,
  'Produto': s.items[0].productName,
  'QTD': s.items[0].quantity,
  'Valor Venda': s.total,
  'Custo': s.totalCost,
  'Lucro': s.profit,
  'Cliente': s.clientName || '',
  'Pagamento': s.paymentMethod
}));
const saleSheet = XLSX.utils.json_to_sheet(saleExport);
XLSX.utils.book_append_sheet(backupWb, saleSheet, 'Vendas');

XLSX.writeFile(backupWb, OUTPUT_EXCEL);
console.log(`\nBackup Excel saved: ${OUTPUT_EXCEL}`);

// 8. Generate data.ts
function writeDataTs(products, sales, categories) {
  let output = `import { Product, Sale, Category } from './types';\n\n`;
  output += `export const initialCategories: Category[] = ${JSON.stringify(categories, null, 2)};\n\n`;
  output += `export const initialProducts: Product[] = ${JSON.stringify(products, null, 2)};\n\n`;
  output += `export const initialSales: Sale[] = ${JSON.stringify(sales, null, 2)};\n`;
  
  fs.writeFileSync(OUTPUT_DATA_TS, output, 'utf-8');
  console.log(`data.ts generated: ${OUTPUT_DATA_TS} (${(Buffer.byteLength(output) / 1024 / 1024).toFixed(2)} MB)`);
}

writeDataTs(finalProducts, finalSales, finalCategories);

// 9. Summary
console.log('\n========== RESUMO ==========');
console.log(`Produtos: ${finalProducts.length}`);
console.log(`Categorias: ${finalCategories.length} (${[...categorySet].join(', ')})`);
console.log(`Vendas: ${finalSales.length}`);
console.log(`  2024: ${sales2024.length} itens`);
console.log(`  2025: ${sales2025.length} itens`);
console.log(`  2026: ${sales2026.length} itens`);

// Count unique sales by grouping by date+client
const saleGroups = new Map();
for (const s of allSales) {
  const key = s.date.substring(0, 10) + '|' + s.client;
  if (!saleGroups.has(key)) saleGroups.set(key, []);
  saleGroups.get(key).push(s);
}
console.log(`\nVendas únicas (agrupadas por data+cliente): ${saleGroups.size}`);

// Total values by year
for (const year of [2024, 2025, 2026]) {
  const yearSales = allSales.filter(s => s.year === year);
  const totalVal = yearSales.reduce((a, s) => a + s.totalValue, 0);
  const totalCost = yearSales.reduce((a, s) => a + s.totalCost, 0);
  const totalProfit = yearSales.reduce((a, s) => a + s.profit, 0);
  const totalQty = yearSales.reduce((a, s) => a + s.qty, 0);
  console.log(`\n${year}: ${yearSales.length} itens / R$ ${totalVal.toFixed(2)} / Custo: R$ ${totalCost.toFixed(2)} / Lucro: R$ ${totalProfit.toFixed(2)}`);
}
