// Converte data/excel/BASE 2.xlsx no formato LocalDb do app (public/seed-backup.json).
// IMPORTANTE: BASE 2.xlsx é a única fonte de verdade. Dados antigos do local-db são ignorados
// para garantir que nenhuma informação fantasma ou antiga interfira.
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const wb = XLSX.readFile('data/excel/BASE 2.xlsx');
const LOCAL_DB_PATH = 'data/local-db.json';

const num = (v) => {
  if (v === null || v === undefined || v === '') return 0;
  const s = String(v).replace(/[^\d.,-]/g, '').replace(/\.(?=\d{2}\b)/g, '').replace(',', '.');
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
};

const parseDateTime = (d, h) => {
  const ds = String(d || '').trim();
  const m = ds.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return new Date().toISOString();
  const day = +m[1], month = +m[2] - 1, year = +m[3];
  const hm = String(h || '').match(/(\d{1,2}):(\d{2})/);
  const hh = hm ? +hm[1] : 12, mm = hm ? +hm[2] : 0;
  const dt = new Date(year, month, day, hh, mm, 0);
  return isNaN(dt.getTime()) ? new Date().toISOString() : dt.toISOString();
};

const mapPayment = (p) => {
  const s = String(p || '').trim().toLowerCase();
  if (s.includes('dinheiro') || s.includes('money')) return 'money';
  if (s.includes('credito') || s.includes('crédito') || s.includes('credit')) return 'card_credit';
  if (s.includes('debito') || s.includes('débito') || s.includes('debit')) return 'card_debit';
  if (s.includes('transf') || s.includes('banc')) return 'transfer';
  return 'pix';
};

const mapStatus = (s) => {
  const t = String(s || '').trim().toLowerCase();
  if (t.includes('cancel')) return 'cancelled';
  if (t.includes('pend') || t.includes('abert') || t.includes('aguar')) return 'pending';
  return 'completed';
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

// Classificação automática (alinhada com o frontend)
function categorizeProduct(name) {
  const n = String(name || '').toLowerCase();
  if (/(som automotivo|radio automotivo|rádio automotivo|auto radio|auto rádio|autoradio|subwoofer|subwofer|modulo amplificador|módulo amplificador|amplificador automotivo|falante automotivo|tweeter automotivo|crossover|caixa automotiva|auto falante|auto-falante|mid bass|midbass|corneta|driver automotivo|car audio|car áudio)/.test(n)) {
    return 'Som Automotivo';
  }
  if (/(capa|capinha|película|pelicula|privacidade|vidro temperado|protetor de tela|proteção de tela|pelicular)/.test(n)) return 'Capas e Películas';
  if (/(cabo|adaptador|hub |hubusb|hub usb|extensor|conversor)/.test(n)) return 'Cabos e Adaptadores';
  if (/(fone|earphone|airpods|headphone|ouvido)/.test(n)) return 'Fones de Ouvido';
  if (/(carregador|fontes?|carreg)/.test(n)) return 'Carregadores';
  if (/(suporte|suportecelular|ventosa|magnetico|magnético|veicular|retrovisor|suporte moto|suporte veicular|suporte celular|suporte de celular|suporte de mesa|suporte braço|suporte gancho|suporte triplo|suporte de tv|suporte fone|imã|cordinha|cordão|crachá|porta crachá|estoj|luvinha|luva|capa de chuva|capa a prova|selfie|tripé|tripe)/.test(n)) return 'Acessórios para Celular';
  if (/(mouse|teclado|keyboard|monitor|computador|pc |notebook|laptop|cool|hub.*porta|placa de som|hdmi|vga|displayport|mousepad|mouse pad|gamer.*mouse|gamer.*teclado)/.test(n)) return 'Computador e Periféricos';
  if (/(memória|memoria|cartão de memória|cartao de memoria|micro sd|memory card|pendrive|pen drive|hd |ssd|case.*hd|cartão|cartao)/.test(n)) return 'Memória e Armazenamento';
  if (/(caixa de som|alto falante|parafuso|som|tweeter|evok|fluxo|áudio|audio|bluetooth.*speaker|mini caixa|impressora|impressão|impressao|xerox|lousa|projetor)/.test(n)) return 'Áudio e Vídeo';
  if (/(lanterna|câmera|camera|ip cam|detector|isqueiro|bateria|pilha|fusível|fusivel|antena|wifi|router|roteador|mini router|controle.*tv|controle.*universal|tv box|unitv|chip|sim card|globo de luz|led|lâmpada|lampada|luminária|luminaria|refletor|módulo|modulo)/.test(n)) return 'Eletrônicos Diversos';
  if (/(garrafa|stanley|kit.*forma|kit.*colher|kit.*talher|kit.*facas|kit.*pote|kit.*banheiro|kit.*taboa|ralador|fatiador|triturador|processador|liquidificador|mini liquidificado|máquina de costura|mini máquina|dispenser|bucha|porta detergente|balança|balâ|tapete|massageador|escova|depilador|cortador|desentupidor|lixas?|canivete|alicate|chave|chaveiro|tork)/.test(n)) return 'Casa e Utensílios';
  if (/(lego|boneco|brinquedo|jogo.*ps|jogo.*xbox|jogo.*game|game boy|controle.*ps|controle.*xbox|pen drive.*jogo|pop it|card.*jogo|figurinha|baralho|lousa|mochila|caderno|bobbie)/.test(n)) return 'Brinquedos e Jogos';
  if (/(relógio|relogio|smartband|pulseira|watch|xiaomi.*band|laxasfit)/.test(n)) return 'Relógios e Wearables';
  if (/(formatação|formatacao|restauração|restauracao|serviço|servico|impressão|impressao|xerox|gravação|gravacao|manutenção|manutencao|instalação|instalacao)/.test(n)) return 'Serviços';
  return 'Diversos';
}

// ---- Produtos ----
const pRows = XLSX.utils.sheet_to_json(wb.Sheets['Produtos'], { header: 1 });
const products = [];
const categoriesSet = new Set(['Som Automotivo']);
const seenCode = new Set();
for (let i = 1; i < pRows.length; i++) {
  const r = pRows[i];
  if (!r || r.length < 2) continue;
  const name = String(r[1] || '').trim();
  if (!name) continue;
  let code = String(r[0] || '').trim();
  if (!code || seenCode.has(code)) code = `PROD-${String(i).padStart(4, '0')}`;
  seenCode.add(code);
  const category = String(r[2] || '').trim() || categorizeProduct(name);
  if (category) categoriesSet.add(category);
  products.push({
    id: code,
    code,
    name,
    category,
    costPrice: num(r[3]),
    salePrice: num(r[4]),
    stock: num(r[5]),
    minStock: num(r[6]),
    status: num(r[5]) > 0 ? 'disponivel' : 'indisponivel',
    createdAt: new Date().toISOString(),
  });
}
const prodByName = new Map();
products.forEach(p => prodByName.set(p.name.trim().toLowerCase(), p));

// ---- Itens de venda (agrupados por Venda ID) ----
const itSheet = wb.Sheets['Itens Vendidos'];
const itRows = itSheet ? XLSX.utils.sheet_to_json(itSheet, { header: 1 }) : [];
const itemsBySale = {};

if (itRows.length > 1) {
  for (let i = 1; i < itRows.length; i++) {
    const r = itRows[i];
    if (!r || r.length < 5) continue;
    const saleId = String(r[0] || '').trim();
    if (!saleId) continue;
    const productName = String(r[3] || '').trim();
    const quantity = num(r[4]) || 1;
    const salePrice = num(r[5]) || 0;
    const costPrice = num(r[7]) || 0;
    const total = num(r[6]) || salePrice * quantity;
    const match = prodByName.get(productName.toLowerCase());
    (itemsBySale[saleId] = itemsBySale[saleId] || []).push({
      productId: match ? match.id : '',
      productName,
      quantity,
      costPrice,
      salePrice,
      total,
    });
  }
}

// ---- Cabeçalho das vendas ----
const vendaSheet = wb.Sheets['Vendas'];
const vRows = vendaSheet ? XLSX.utils.sheet_to_json(vendaSheet, { header: 1 }) : [];
const vHeader = {};
const rawVendasObjects = vendaSheet ? XLSX.utils.sheet_to_json(vendaSheet, { defval: '' }) : [];

for (let i = 1; i < vRows.length; i++) {
  const r = vRows[i];
  if (!r || r.length < 1) continue;
  const saleId = String(r[0] || '').trim();
  if (saleId) vHeader[saleId] = r;
}

// ---- Monta as vendas ----
const sales = [];
const processedSaleIds = new Set();

// Primeiro processa as vendas que possuem detalhamento de itens
for (const saleId of Object.keys(itemsBySale)) {
  const items = itemsBySale[saleId];
  const v = vHeader[saleId] || [];
  const date = parseDateTime(v[1], v[2]);
  const clientName = String(v[3] || '').trim() || undefined;
  const phoneRaw = String(v[4] || '').trim();
  const clientPhone = phoneRaw === '-' ? undefined : phoneRaw || undefined;
  const paymentMethod = mapPayment(v[5]);
  const saleType = String(v[6] || '').trim().toLowerCase().includes('cnpj') ? 'CNPJ' : 'CPF';
  const oidRaw = String(v[7] || '').trim();
  const ecommerceOrderId = oidRaw ? oidRaw : undefined;
  const status = mapStatus(v[13]);
  const saleChannel = String(v[14] || '').trim() || undefined;
  
  const total = items.reduce((s, it) => s + it.total, 0);
  const totalCost = items.reduce((s, it) => s + it.costPrice * it.quantity, 0);
  
  sales.push({
    id: saleId,
    date,
    items,
    clientName,
    clientPhone,
    paymentMethod,
    saleType,
    ecommerceOrderId,
    saleChannel,
    total,
    totalCost,
    profit: total - totalCost,
    status,
  });
  processedSaleIds.add(saleId);
}

// Segundo: fallback para Vendas que não estavam em "Itens Vendidos"
for (const row of rawVendasObjects) {
  const saleId = String(getField(row, 'ID', 'Id')).trim();
  if (!saleId || processedSaleIds.has(saleId)) continue;

  const productName = String(getField(row, 'Produto')).trim();
  if (!productName) continue;

  const qty = num(getField(row, 'QTD', 'Qtd', 'Quantidade')) || 1;
  const total = num(getField(row, 'Valor Venda', ' Valor Venda ', 'ValorVenda', 'Venda', 'Total'));
  const totalCost = num(getField(row, 'Custo', ' Custo ', 'Custo Total', 'ValorCusto'));
  const profit = num(getField(row, 'Lucro'));
  const client = String(getField(row, 'Cliente')).trim();
  const phone = String(getField(row, 'Telefone')).trim();
  
  const match = prodByName.get(productName.toLowerCase());

  const items = [{
    productId: match ? match.id : '',
    productName,
    quantity: qty,
    costPrice: qty > 0 ? (totalCost / qty) : 0,
    salePrice: qty > 0 ? (total / qty) : 0,
    total,
  }];

  sales.push({
    id: saleId,
    date: parseDateTime(getField(row, 'Data'), getField(row, 'Hora')),
    items,
    clientName: client || undefined,
    clientPhone: (phone && phone !== '-') ? phone : undefined,
    paymentMethod: mapPayment(getField(row, 'Pagamento', 'Forma Pagamento')),
    saleType: String(getField(row, 'Tipo')).toLowerCase().includes('cnpj') ? 'CNPJ' : 'CPF',
    ecommerceOrderId: String(getField(row, 'ID Pedido', 'Pedido')).trim() || undefined,
    saleChannel: String(getField(row, 'Canal')).trim() || 'Loja Física',
    total,
    totalCost,
    profit: profit || (total - totalCost),
    status: mapStatus(getField(row, 'Status', 'Situação')),
  });
}

// ---- Despesas ----
const eRows = XLSX.utils.sheet_to_json(wb.Sheets['Despesas'], { header: 1 });
const expenses = [];
for (let i = 1; i < eRows.length; i++) {
  const r = eRows[i];
  if (!r || r.length < 5) continue;
  const id = String(r[0] || '').trim();
  if (!id) continue;
  expenses.push({
    id,
    date: parseDateTime(r[1], ''),
    category: String(r[2] || '').trim(),
    description: String(r[3] || '').trim(),
    amount: num(r[4]),
    status: String(r[5] || '').trim().toLowerCase().includes('pag') ? 'paid' : 'pending',
  });
}

const categories = Array.from(categoriesSet).map((name, i) => ({
  id: `cat_${String(i).padStart(3, '0')}`,
  name,
}));

// ---- Empréstimos ----
let loans = [];
try {
  const lRows = XLSX.utils.sheet_to_json(wb.Sheets['Empréstimos'], { header: 1 });
  const normStatus = (s) => {
    const t = String(s || '').trim().toLowerCase();
    return (t === 'pago' || t === 'paid' || t === 'concluido' || t === 'concluído') ? 'paid' : 'open';
  };
  for (let i = 1; i < lRows.length; i++) {
    const r = lRows[i];
    if (!r || r.length < 2) continue;
    const borrowerName = String(r[1] || '').trim();
    if (!borrowerName) continue;
    loans.push({
      id: String(r[0] || '').trim() || `emp_${Date.now()}_${i}`,
      borrowerName,
      borrowerPhone: String(r[2] || '').trim(),
      loanDate: String(r[3] || '').trim(),
      dueDate: String(r[4] || '').trim(),
      principal: num(r[5]),
      interestRate: (r[6] !== '' && r[6] != null && num(r[6]) > 0) ? num(r[6]) : undefined,
      interest: (r[6] !== '' && r[6] != null && num(r[6]) > 0) ? Math.round(num(r[5]) * num(r[6]) / 100 * 100) / 100 : num(r[7]),
      paidAmount: num(r[8]),
      status: normStatus(r[9]),
      notes: String(r[10] || '').trim(),
      createdAt: String(r[11] || '').trim() || new Date().toISOString(),
    });
  }
} catch (e) {
  console.warn('Aba Empréstimos não encontrada, seguindo com loans vazio:', e.message);
}

// ---- Outras abas ----
const stripAccents = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const findIdx = (header, ...names) => header.findIndex(h => names.some(n => String(h || '').toLowerCase().includes(n)));
const readSheet = (...nameOptions) => {
  for (const nm of nameOptions) { if (wb.Sheets[nm]) return XLSX.utils.sheet_to_json(wb.Sheets[nm], { header: 1 }); }
  return null;
};
const parseJsonCol = (v) => { try { const a = JSON.parse(String(v || '[]')); return Array.isArray(a) ? a : []; } catch { return []; } };
const normDateStr = (v) => { const m = String(v || '').trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/); return m ? `${m[3]}-${m[1]}-${m[2]}` : String(v || ''); };

function parseExtraSheet(nameOptions, colMap, build) {
  const rows = readSheet(...nameOptions);
  if (!rows || rows.length < 2) return [];
  const header = rows[0].map(h => stripAccents(h));
  const cols = {};
  for (const [key, names] of Object.entries(colMap)) cols[key] = findIdx(header, ...names);
  const out = [];
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.every(c => c === '' || c === null || c === undefined)) continue;
    out.push(build(r, cols));
  }
  return out;
}

let orders = parseExtraSheet(['Ordens de Serviço', 'Ordens de Servico', 'OS', 'Ordem de Serviço'],
  { id: ['id'], tipo: ['tipo'], num: ['numero'], data: ['data'], cli: ['cliente'], tel: ['telefone', 'fone'], end: ['endereco', 'end'], dev: ['aparelho', 'equipamento', 'device'], def: ['defeito'], sub: ['subtotal'], desc: ['desconto'], tot: ['total'], sit: ['status', 'situacao'], obs: ['observ', 'nota'], itens: ['itens'], created: ['created', 'criado'] },
  (r, c) => {
    const tipo = String(r[c.tipo] ?? '').toLowerCase();
    return { id: String(r[c.id] ?? '').trim(), type: (tipo.includes('orc') || tipo.includes('budget')) ? 'orcamento' : 'os', number: Number(r[c.num]) || 0, date: normDateStr(r[c.data]), clientName: String(r[c.cli] ?? '').trim(), clientPhone: String(r[c.tel] ?? '').trim(), clientAddress: String(r[c.end] ?? '').trim(), device: String(r[c.dev] ?? '').trim(), defect: String(r[c.def] ?? '').trim(), items: parseJsonCol(r[c.itens]), subtotal: num(r[c.sub]), discount: num(r[c.desc]), total: num(r[c.tot]), status: String(r[c.sit] ?? '').trim().toLowerCase() || 'aberta', notes: String(r[c.obs] ?? '').trim(), createdAt: String(r[c.created] ?? '').trim() || new Date().toISOString() };
  });

let purchases = parseExtraSheet(['Compras', 'Compras de Mercadoria'],
  { id: ['id'], data: ['data'], forn: ['fornecedor', 'supplier'], tot: ['total'], obs: ['observ', 'nota'], itens: ['itens'], created: ['created', 'criado'] },
  (r, c) => ({ id: String(r[c.id] ?? '').trim(), date: normDateStr(r[c.data]), supplierName: String(r[c.forn] ?? '').trim(), items: parseJsonCol(r[c.itens]), total: num(r[c.tot]), notes: String(r[c.obs] ?? '').trim(), createdAt: String(r[c.created] ?? '').trim() || new Date().toISOString() }));

let customers = parseExtraSheet(['Clientes'],
  { id: ['id'], nome: ['nome'], tel: ['telefone', 'fone'], mail: ['email', 'e-mail'], end: ['endereco', 'end'], obs: ['observ', 'nota'], created: ['created', 'criado'] },
  (r, c) => ({ id: String(r[c.id] ?? '').trim(), name: String(r[c.nome] ?? '').trim(), phone: String(r[c.tel] ?? '').trim(), email: String(r[c.mail] ?? '').trim(), address: String(r[c.end] ?? '').trim(), notes: String(r[c.obs] ?? '').trim(), createdAt: String(r[c.created] ?? '').trim() || new Date().toISOString() }));

let suppliers = parseExtraSheet(['Fornecedores'],
  { id: ['id'], nome: ['nome'], tel: ['telefone', 'fone'], mail: ['email', 'e-mail'], obs: ['observ', 'nota'], created: ['created', 'criado'] },
  (r, c) => ({ id: String(r[c.id] ?? '').trim(), name: String(r[c.nome] ?? '').trim(), phone: String(r[c.tel] ?? '').trim(), email: String(r[c.mail] ?? '').trim(), notes: String(r[c.obs] ?? '').trim(), createdAt: String(r[c.created] ?? '').trim() || new Date().toISOString() }));

let cashSessions = parseExtraSheet(['Caixa', 'Fechamentos', 'Caixa (Fechamentos)'],
  { id: ['id'], open: ['abertura', 'open'], close: ['fechamento', 'close'], openBal: ['saldo inicial', 'abertura', 'opening'], exp: ['esperado', 'expected'], closeBal: ['final', 'fechamento', 'closing'], diff: ['diferenca', 'difference'], sit: ['status', 'situacao'], obs: ['observ', 'nota'], with: ['retirada', 'withdrawal', 'saque'] },
  (r, c) => ({ id: String(r[c.id] ?? '').trim(), openDate: normDateStr(r[c.open]), closeDate: String(r[c.close] ?? '').trim() ? normDateStr(r[c.close]) : undefined, openingBalance: num(r[c.openBal]), expectedBalance: (r[c.exp] !== '' && r[c.exp] != null) ? num(r[c.exp]) : undefined, closingBalance: (r[c.closeBal] !== '' && r[c.closeBal] != null) ? num(r[c.closeBal]) : undefined, difference: (r[c.diff] !== '' && r[c.diff] != null) ? num(r[c.diff]) : undefined, status: (String(r[c.sit] ?? '').trim().toLowerCase().includes('fech') ? 'closed' : 'open'), withdrawals: parseJsonCol(r[c.with]), notes: String(r[c.obs] ?? '').trim() }));

// Não mesclar/preservar nada antigo
const db = {
  products,
  categories,
  sales,
  expenses,
  customers,
  suppliers,
  purchases,
  cashSessions,
  orders,
  loans,
  storeInfo: null,
  initialized: true,
};

const out = path.resolve('public/seed-backup.json');
fs.writeFileSync(out, JSON.stringify(db, null, 0));
fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(db, null, 2));

console.log(`OK -> ${out} e ${LOCAL_DB_PATH} atualizados com dados EXCLUSIVOS da planilha.`);
console.log('products:', products.length);
console.log('sales:', sales.length);
console.log('categories:', categories.length);
console.log('expenses:', expenses.length);
console.log('loans:', loans.length);
