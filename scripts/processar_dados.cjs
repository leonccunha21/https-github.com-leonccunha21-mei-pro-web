const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const SPREADSHEET_PATH = path.join(PROJECT_ROOT, 'data', 'excel', 'Relatório de Vendas.xlsx');
const OUTPUT_EXCEL = path.join(PROJECT_ROOT, 'data', 'excel', 'Backup_Dados_Completos.xlsx');
const OUTPUT_DATA_TS = path.join(PROJECT_ROOT, 'src', 'data.ts');
const OUTPUT_DATA_JSON = path.join(PROJECT_ROOT, 'src', 'data.json');
const VENDAS_2023_PATH = path.join(PROJECT_ROOT, 'data', 'excel', 'Vendas 2023.xlsx');
// Inline categorize logic from src/lib/categorize.ts
const DEFAULT_CATEGORY = 'Diversos';
function categorizeProduct(name) {
  const n = (name || '').toLowerCase();
  if (/(capa|capinha|película|pelicula|privacidade|vidro temperado|protetor de tela|proteção de tela|pelicular)/.test(n)) return 'Capas e Películas';
  if (/(cabo|adaptador|hub |hubusb|hub usb|extensor|conversor)/.test(n)) return 'Cabos e Adaptadores';
  if (/(fone|earphone|airpods|headphone|ouvido)/.test(n)) return 'Fones de Ouvido';
  if (/(carregador|fontes?|carreg)/.test(n)) return 'Carregadores';
  if (/(suporte|suportecelular|ventosa|magnetico|magnético|veicular|retrovisor|suporte moto|suporte veicular|suporte celular|suporte de celular|suporte de mesa|suporte braço|suporte gancho|suporte triplo|suporte de tv|suporte fone|imã|cordinha|cordão|crachá|porta crachá|estoj|luvinha|luva|capa de chuva|capa a prova|selfie|tripé|tripe)/.test(n)) return 'Acessórios para Celular';
  if (/(mouse|teclado|keyboard|monitor|computador|pc |notebook|laptop|cool|hub.*porta|placa de som|hdmi|vga|displayport|mousepad|mouse pad|gamer.*mouse|gamer.*teclado)/.test(n)) return 'Computador e Periféricos';
  if (/(memória|memoria|cartão de memória|cartao de memoria|micro sd|memory card|pendrive|pen drive|hd |ssd|case.*hd|cartão|cartao)/.test(n)) return 'Memória e Armazenamento';
  if (/(som automotivo|radio automotivo|rádio automotivo|auto radio|auto rádio|autoradio|subwoofer|subwofer|modulo amplificador|módulo amplificador|amplificador automotivo|falante automotivo|tweeter automotivo|crossover|caixa automotiva|auto falante|auto-falante|mid bass|midbass|corneta|driver automotivo|car audio|car áudio)/.test(n)) return 'Som Automotivo';
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

function normalizeNameKey(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]/g, '') // keep only alphanumeric
    .replace(/\s+/g, ''); // remove spaces
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

  const nameKey = normalizeNameKey(name);
  if (productMap.has(nameKey)) {
    const existing = productMap.get(nameKey);
    existing.stock += product.stock;
    existing.purchases += product.purchases;
    existing.sales += product.sales;
    if (product.salePrice > existing.salePrice) existing.salePrice = product.salePrice;
  } else {
    productMap.set(nameKey, product);
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
    
    // Determine saleType based on channel
    let saleType = 'CPF';
    if (saleChannel !== 'Loja Física') saleType = 'CNPJ';
    
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
    // 2026 "Recebido loja" is at column 12 (Transferido = PIX/transferência)
    let paymentMethod = 'money';
    if (year === 2026) {
      if (String(row[12] || '').trim().toLowerCase() === 'transferido') paymentMethod = 'pix';
    } else {
const forma = row[13];
    if (forma === 'Transferido' || forma === 'Pix') paymentMethod = 'pix';
    else if (forma === 'Cartão' || forma === 'Cartao' || forma === 'Crédito' || forma === 'Débito') paymentMethod = 'card_credit';
    }

    // Parse payment status from "Recebido Loja" column
    // 2024/2025: col 15, 2026: col 12
    const recebidoIdx = year === 2026 ? 12 : 15;
    const recebidoRaw = row[recebidoIdx];
    let paymentStatus = 'completed'; // default
    if (recebidoRaw) {
      const val = String(recebidoRaw).toLowerCase().trim();
      if (val === 'aguardando' || val === 'ainda n\u00e3o' || val === 'ainda nao' || val === 'pendente') {
        paymentStatus = 'pending';
      }
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
      saleType,
      year,
      paymentStatus
    });
  }
  
  const totalItems = totalQty;
  console.log(`${sheetName}: ${sales.length} rows, ${totalItems} itens (qty sum)`);
  return sales;
}

// Parse the separate "Vendas 2023.xlsx" (monthly format, no daily date)
function parseVendas2023Sheet() {
  if (!fs.existsSync(VENDAS_2023_PATH)) {
    console.log('Vendas 2023.xlsx nao encontrado - pulando 2023');
    return [];
  }
  const wb23 = XLSX.readFile(VENDAS_2023_PATH);
  const ws = wb23.Sheets['Vendas'];
  if (!ws) { console.log('Aba Vendas nao encontrada em Vendas 2023.xlsx'); return []; }

  const raw = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const sales = [];
  let totalQty = 0;
  const monthMap = {
    'janeiro': 1, 'fevereiro': 2, 'março': 3, 'marco': 3, 'abril': 4, 'maio': 5,
    'junho': 6, 'julho': 7, 'agosto': 8, 'setembro': 9, 'outubro': 10,
    'novembro': 11, 'dezembro': 12
  };

  for (let i = 1; i < raw.length; i++) {
    const row = raw[i];
    if (!row || row.length < 6) continue;
    const productName = normalizeName(row[2]);
    if (!productName || productName === 'Total') continue;

    const qty = Number(row[3]) || 1;
    if (qty <= 0) continue;
    const totalCost = Number(row[4]) || 0;
    const totalValue = Number(row[5]) || 0;
    totalQty += qty;

    const mes = String(row[1] || '').toLowerCase().trim();
    const monthIdx = monthMap[mes] || 1;
    const date = `2023-${String(monthIdx).padStart(2, '0')}-15T00:00:00.000Z`;

    const situacao = String(row[7] || '').toLowerCase().trim();
    const plataforma = normalizeName(row[8]) || 'Loja Física';
    const plataformaLower = plataforma.toLowerCase();

    let saleChannel = 'Loja Física';
    let ecommerceOrderId = undefined;
    let client = '';
    if (plataformaLower.includes('shopee') || plataformaLower.includes('tiktok') || plataformaLower.includes('olx')) {
      saleChannel = plataforma;
    }
    const saleType = saleChannel !== 'Loja Física' ? 'CNPJ' : 'CPF';

    let paymentMethod = 'money';
    if (situacao === 'transferido' || situacao === 'pix') paymentMethod = 'pix';
    else if (situacao === 'cartão' || situacao === 'cartao' || situacao === 'crédito' || situacao === 'credito' || situacao === 'débito' || situacao === 'debito') paymentMethod = 'card_credit';

    let paymentStatus = 'completed';
    if (situacao === 'aguardando' || situacao === 'ainda não' || situacao === 'ainda nao') paymentStatus = 'pending';

    const unitCost = qty > 0 ? roundCurrency(totalCost / qty) : 0;
    const unitPrice = qty > 0 ? roundCurrency(totalValue / qty) : 0;
    const finalTotalCost = totalCost || 0;
    const finalTotalValue = totalValue || 0;
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
      seller: '',
      paymentMethod,
      saleChannel,
      ecommerceOrderId,
      saleType,
      year: 2023,
      paymentStatus
    });
  }

  console.log(`Vendas 2023: ${sales.length} rows, ${totalQty} itens (qty sum)`);
  return sales;
}

const sales2024 = parseSalesSheet('Vendas 2024', 2024);
const sales2025 = parseSalesSheet('Vendas 2025', 2025);
const sales2026 = parseSalesSheet('Vendas 2026', 2026);
const sales2023 = parseVendas2023Sheet();
const allSales = [...sales2024, ...sales2025, ...sales2026, ...sales2023];

console.log(`\nTotal sales items: ${allSales.length}`);
console.log(`2023: ${sales2023.length}, 2024: ${sales2024.length}, 2025: ${sales2025.length}, 2026: ${sales2026.length}`);

// 3. Cross-reference: Add sale items not in products to product list
const productNames = new Set(productMap.keys());
let addedFromSales = 0;

// Also collect sale prices per product for calculating average
const salePriceMap = new Map(); // name -> { sum: totalValue, qty: totalQty }
// Track cost data from sales for products with missing costPrice
const costFromSalesMap = new Map(); // name -> { sum: totalCost, qty: totalQty }

for (const sale of allSales) {
  const name = sale.productName;
  const nameKey = normalizeNameKey(name);
  // Track sale prices for average calculation
  if (!salePriceMap.has(nameKey)) {
    salePriceMap.set(nameKey, { sum: 0, qty: 0 });
  }
  const sp = salePriceMap.get(nameKey);
  sp.sum += sale.totalValue;
  sp.qty += sale.qty;

  // Track cost data from sales for backup cost prices
  if (sale.totalCost > 0) {
    if (!costFromSalesMap.has(nameKey)) {
      costFromSalesMap.set(nameKey, { sum: 0, qty: 0 });
    }
    const c = costFromSalesMap.get(nameKey);
    c.sum += sale.totalCost;
    c.qty += sale.qty;
  }

  if (!productNames.has(nameKey)) {
    productMap.set(nameKey, {
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
    productNames.add(nameKey);
    addedFromSales++;
  } else {
    const existing = productMap.get(nameKey);
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

// Fill missing costPrice from sales data
for (const [name, c] of costFromSalesMap) {
  if (productMap.has(name)) {
    const p = productMap.get(name);
    if (p.costPrice === 0 && c.qty > 0) {
      p.costPrice = Math.round((c.sum / c.qty) * 100) / 100;
    }
  }
}

console.log(`Products added from sales (missing in PROD): ${addedFromSales}`);
console.log(`Total unique products: ${productMap.size}`);

// 4. Build final product array
const finalProducts = [];
let pid = 1;
for (const [name, p] of productMap) {
  const isService = p.category && (p.category.toLowerCase() === 'serviços' || p.category.toLowerCase() === 'servico' || p.category.toLowerCase() === 'serviço');
  finalProducts.push({
    id: `p_${pid}`,
    code: `PROD-${String(pid).padStart(4, '0')}`,
    name: p.name,
    category: p.category,
    costPrice: p.costPrice || 0,
    salePrice: p.salePrice || 0,
    // Serviços não possuem quantidade em estoque
    stock: isService ? 0 : (p.stock || 0),
    minStock: isService ? 0 : 0,
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
    saleType: sale.saleType,
    saleChannel: sale.saleChannel,
    notes: sale.saleChannel !== 'Loja Física' ? `[client_data]{"channel":"${sale.saleChannel}"}` : undefined,
    status: sale.paymentStatus === 'pending' ? 'pending' : 'completed'
  });
  vid++;
}

console.log(`Final sales for data.ts: ${finalSales.length}`);

// 6. Parse expenses from Devedores sheet
const expenses2024 = [];
try {
  const devWb = XLSX.readFile(SPREADSHEET_PATH);
  const devSheet = devWb.Sheets['Devedores'];
  if (devSheet) {
    const devRows = XLSX.utils.sheet_to_json(devSheet, { header: 1 });
    // Deviadores sheet structure:
    // Row 0: headers - "Contas a pagar 03" at col 8
    // Rows 2-13: monthly data with expense name at col 8, amount at col 9
    // Credit card info: bank at col 18, value at col 20
    const monthNames = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
    for (let i = 2; i <= 13; i++) {
      const row = devRows[i];
      if (!row) continue;
      const month = typeof row[0] === 'number' ? row[0] : 0;
      const monthName = row[1] || '';
      const monthIdx = month > 0 && month <= 12 ? month : monthNames.indexOf(monthName) + 1;
      
      // Expense at col 8-9
      const expenseName = row[8];
      const expenseAmount = Number(row[9]) || 0;
      if (expenseName && expenseAmount > 0) {
        expenses2024.push({
          id: `exp_2024_${monthIdx}_${i}`,
          date: `2024-${String(monthIdx).padStart(2, '0')}-01T00:00:00.000Z`,
          category: String(expenseName).trim(),
          description: `Despesa fixa ${monthName} 2024`,
          amount: expenseAmount,
          status: 'paid'
        });
      }

      // Credit card at col 18-20
      const cardBank = row[18];
      const cardValue = Number(row[20]) || Number(row[19]) || 0;
      if (cardBank && cardValue > 0) {
        expenses2024.push({
          id: `exp_card_2024_${monthIdx}_${i}`,
          date: `2024-${String(monthIdx).padStart(2, '0')}-01T00:00:00.000Z`,
          category: 'Cartão de Crédito',
          description: `Fatura ${cardBank} - ${monthName} 2024`,
          amount: cardValue,
          status: 'paid'
        });
      }
    }
  }
} catch (e) {
  console.log('Expense parsing skipped:', e.message);
}
console.log(`Expenses extracted: ${expenses2024.length}`);

// data.ts generation function (must be defined before use)
function writeDataTs(products, sales, categories, expenses) {
  const dataJson = JSON.stringify({ products, sales, categories, expenses });
  fs.writeFileSync(OUTPUT_DATA_JSON, dataJson, 'utf-8');
  
  let output = `import { Product, Sale, Category, Expense } from './types';\n\n`;
  output += `import raw from './data.json';\n\n`;
  output += `const d = raw as { categories: Category[]; products: Product[]; sales: Sale[]; expenses: Expense[] };\n\n`;
  output += `export const initialCategories = d.categories;\n`;
  output += `export const initialProducts = d.products;\n`;
  output += `export const initialSales = d.sales;\n`;
  output += `export const initialExpenses = d.expenses;\n`;
  
  fs.writeFileSync(OUTPUT_DATA_TS, output, 'utf-8');
  console.log(`data.ts generated: ${OUTPUT_DATA_TS} (${(Buffer.byteLength(output) / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`data.json generated: ${OUTPUT_DATA_JSON} (${(Buffer.byteLength(dataJson) / 1024 / 1024).toFixed(2)} MB)`);
}

// Preserve operational data (CRM, Compras, Fechamento) when (re)writing local-db.json.
// The running app stores its live state in data/local-db.json; regenerating from the
// spreadsheet must NOT wipe customers/suppliers/purchases/cashSessions/orders/storeInfo.
function writeLocalDb(products, sales, categories, expenses) {
  const LOCAL_DB_PATH = path.join(PROJECT_ROOT, 'data', 'local-db.json');
  const preserved = {
    customers: [],
    suppliers: [],
    purchases: [],
    cashSessions: [],
    orders: [],
    storeInfo: null,
    initialized: true
  };
  if (fs.existsSync(LOCAL_DB_PATH)) {
    try {
      const existing = JSON.parse(fs.readFileSync(LOCAL_DB_PATH, 'utf-8'));
      preserved.customers = existing.customers || [];
      preserved.suppliers = existing.suppliers || [];
      preserved.purchases = existing.purchases || [];
      preserved.cashSessions = existing.cashSessions || [];
      preserved.orders = existing.orders || [];
      preserved.storeInfo = existing.storeInfo !== undefined ? existing.storeInfo : null;
      preserved.initialized = existing.initialized !== undefined ? existing.initialized : true;
      console.log(`local-db.json existente: preservando ${preserved.customers.length} clientes, ${preserved.suppliers.length} fornecedores, ${preserved.purchases.length} compras, ${preserved.cashSessions.length} fechamentos.`);
    } catch (e) {
      console.log('local-db.json existente inválido, será recriado:', e.message);
    }
  }
  const db = {
    products,
    sales,
    categories,
    expenses,
    customers: preserved.customers,
    suppliers: preserved.suppliers,
    purchases: preserved.purchases,
    cashSessions: preserved.cashSessions,
    orders: preserved.orders,
    storeInfo: preserved.storeInfo,
    initialized: preserved.initialized
  };
  fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
  console.log(`local-db.json atualizado (dados operacionais preservados): ${LOCAL_DB_PATH}`);
}

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

// Generate data.ts / data.json FIRST (before backup Excel, so it works even if Excel is open)
writeDataTs(finalProducts, finalSales, finalCategories, expenses2024);

// Refresh local-db.json preserving operational data (CRM, Compras, Fechamento)
writeLocalDb(finalProducts, finalSales, finalCategories, expenses2024);

// 7. Generate Backup Excel (with error handling so it doesn't block data generation)
try {
  const backupWb = XLSX.utils.book_new();

// Identification sheet
const identData = [
  ['INFORMAÇÕES DA LOJA'],
  ['Nome', ''],
  ['CNPJ', ''],
  ['Telefone', ''],
  ['Email', ''],
  ['Endereço', ''],
  ['Cidade', ''],
  ['Estado', ''],
  ['Proprietário', ''],
  ['Observações', ''],
  [],
  ['RESUMO DO ESTOQUE'],
  ['Total de Produtos', finalProducts.length],
  ['Produtos com Estoque', finalProducts.filter(p => p.stock > 0).length],
  ['Produtos sem Estoque', finalProducts.filter(p => p.stock === 0).length],
  ['Valor Total em Estoque (Custo)', 'R$ ' + roundCurrency(finalProducts.reduce((a, p) => a + (p.costPrice * p.stock), 0)).toFixed(2)],
  [],
  ['RESUMO DAS VENDAS'],
  ['Total de Itens Vendidos', finalSales.reduce((a, s) => a + s.items.reduce((iacc, item) => iacc + item.quantity, 0), 0)],
  ['Total de Vendas', finalSales.length],
  ['Faturamento Total', 'R$ ' + roundCurrency(finalSales.reduce((a, s) => a + s.total, 0)).toFixed(2)],
  ['Custo Total', 'R$ ' + roundCurrency(finalSales.reduce((a, s) => a + s.totalCost, 0)).toFixed(2)],
  ['Lucro Total', 'R$ ' + roundCurrency(finalSales.reduce((a, s) => a + s.profit, 0)).toFixed(2)]
];
const identSheet = XLSX.utils.aoa_to_sheet(identData);
identSheet['!cols'] = [{ wch: 30 }, { wch: 20 }];
XLSX.utils.book_append_sheet(backupWb, identSheet, 'Identificação');

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
  'Pagamento': s.paymentMethod,
  'Tipo': s.saleType === 'CNPJ' ? 'CNPJ' : 'CPF',
  'ID Pedido': s.ecommerceOrderId || '',
  'Status': s.status === 'completed' ? 'Pago' : 'Pendente',
  'Canal': s.saleChannel || 'Loja Física'
}));
const saleSheet = XLSX.utils.json_to_sheet(saleExport);
XLSX.utils.book_append_sheet(backupWb, saleSheet, 'Vendas');

// Expenses sheet
const expensesExport = expenses2024.map(e => ({
  'ID': e.id,
  'Data': e.date.substring(0, 10),
  'Categoria': e.category,
  'Descrição': e.description,
  'Valor': e.amount,
  'Status': e.status === 'paid' ? 'Pago' : 'Pendente'
}));
const expSheet = XLSX.utils.json_to_sheet(expensesExport);
XLSX.utils.book_append_sheet(backupWb, expSheet, 'Despesas');

try {
  XLSX.writeFile(backupWb, OUTPUT_EXCEL);
  console.log(`\nBackup Excel saved: ${OUTPUT_EXCEL}`);
} catch (e) {
  console.log(`\nBackup Excel could not be saved (file may be open): ${e.message}`);
}

// data.ts generation function (must be defined before first call)
function writeDataTs(products, sales, categories, expenses) {
  const dataJson = JSON.stringify({ products, sales, categories, expenses });
  fs.writeFileSync(OUTPUT_DATA_JSON, dataJson, 'utf-8');
  
  let output = `import { Product, Sale, Category, Expense } from './types';\n\n`;
  output += `import raw from './data.json';\n\n`;
  output += `const d = raw as { categories: Category[]; products: Product[]; sales: Sale[]; expenses: Expense[] };\n\n`;
  output += `export const initialCategories = d.categories;\n`;
  output += `export const initialProducts = d.products;\n`;
  output += `export const initialSales = d.sales;\n`;
  output += `export const initialExpenses = d.expenses;\n`;
  
  fs.writeFileSync(OUTPUT_DATA_TS, output, 'utf-8');
  console.log(`data.ts generated: ${OUTPUT_DATA_TS} (${(Buffer.byteLength(output) / 1024 / 1024).toFixed(2)} MB)`);
  console.log(`data.json generated: ${OUTPUT_DATA_JSON} (${(Buffer.byteLength(dataJson) / 1024 / 1024).toFixed(2)} MB)`);
}

// 9. Summary
console.log('\n========== RESUMO ==========');
console.log(`Produtos: ${finalProducts.length}`);
console.log(`Categorias: ${finalCategories.length} (${[...categorySet].join(', ')})`);
console.log(`Vendas: ${finalSales.length}`);
console.log(`  2023: ${sales2023.length} itens`);
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
for (const year of [2023, 2024, 2025, 2026]) {
  const yearSales = allSales.filter(s => s.year === year);
  const totalVal = yearSales.reduce((a, s) => a + s.totalValue, 0);
  const totalCost = yearSales.reduce((a, s) => a + s.totalCost, 0);
  const totalProfit = yearSales.reduce((a, s) => a + s.profit, 0);
  const totalQty = yearSales.reduce((a, s) => a + s.qty, 0);
console.log(`\n${year}: ${yearSales.length} itens / R$ ${totalVal.toFixed(2)} / Custo: R$ ${totalCost.toFixed(2)} / Lucro: R$ ${totalProfit.toFixed(2)}`);
  }

} catch (e) {
  console.log(`\nBackup Excel could not be saved (file may be open): ${e.message}`);
}
