import type { Product, Sale, Category, SaleItem } from '../types';

/** A single spreadsheet cell (or a whole row) as produced by xlsx/json parsing. */
export type Cell = string | number | null | undefined;
export type SheetRows = Cell[][];

function parseProductsSheet(rows: SheetRows): { importedProducts: Product[]; categoriesFromProducts: string[] } {
  if (!rows || rows.length < 2) {
    throw new Error('A planilha de produtos está vazia ou não possui cabeçalho.');
  }

  let headerRowIndex = 0;
  let maxMatches = -1;
  const allKeywords = [
    'nome', 'produto', 'descrição', 'descricao', 'item', 'name', 'titulo', 'título',
    'código', 'codigo', 'sku', 'ref', 'id', 'referência', 'referencia', 'cod',
    'categoria', 'grupo', 'setor', 'tipo', 'category',
    'custo', 'compra', 'cost',
    'venda', 'preço', 'preco', 'price', 'valor',
    'estoque', 'qtd', 'quantidade', 'stock', 'saldo'
  ];

  for (let r = 0; r < Math.min(rows.length, 15); r++) {
    const row = rows[r];
    if (!row) continue;
    let matches = 0;
    for (const cell of row) {
      const val = String(cell || '').trim().toLowerCase();
      if (val && allKeywords.some(kw => val.includes(kw))) {
        matches++;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      headerRowIndex = r;
    }
  }

  const headerRow = rows[headerRowIndex].map((h: Cell) => String(h || '').trim().toLowerCase());

  const findColIndex = (keywords: string[]) => {
    return headerRow.findIndex(h => keywords.some(keyword => h.includes(keyword)));
  };

  let codeIdx = findColIndex(['código', 'codigo', 'sku', 'ref', 'id', 'referência', 'referencia', 'cod']);
  let nameIdx = findColIndex(['nome', 'produto', 'descrição', 'descricao', 'item', 'name', 'titulo', 'título', 'artigo']);
  let categoryIdx = findColIndex(['categoria', 'grupo', 'setor', 'tipo', 'category', 'família', 'familia', 'departamento']);
  let costPriceIdx = findColIndex(['custo', 'preço custo', 'preco custo', 'compra', 'cost', 'vlr custo', 'valor custo']);
  let salePriceIdx = findColIndex(['venda', 'preço venda', 'preco venda', 'valor', 'price', 'preço', 'preco', 'vlr venda', 'valor venda']);
  let stockIdx = findColIndex(['estoque', 'qtd', 'quantidade', 'stock', 'saldo', 'atual', 'quant', 'qnt']);
  let minStockIdx = findColIndex(['mínimo', 'minimo', 'estoque mínimo', 'estoque minimo', 'min', 'est. min', 'est.min', 'est min', 'mín', 'min ']);

  if (codeIdx === -1) codeIdx = 0;
  if (nameIdx === -1) {
    nameIdx = headerRow.findIndex((h, idx) => idx !== codeIdx && h !== '');
    if (nameIdx === -1) nameIdx = 1;
  }
  if (categoryIdx === -1) categoryIdx = 2;
  if (costPriceIdx === -1) costPriceIdx = 3;
  if (salePriceIdx === -1) salePriceIdx = 4;
  if (stockIdx === -1) stockIdx = 5;
  if (minStockIdx === -1) minStockIdx = 6;

  const importedProducts: Product[] = [];
  const categoriesFromProducts: string[] = [];

  const getFloatVal = (row: SheetRows[number], idx: number) => {
    if (idx === -1 || idx >= row.length || row[idx] === undefined || row[idx] === null) return 0;
    if (typeof row[idx] === 'number') return row[idx];
    const raw = String(row[idx]).trim();
    if (!raw) return 0;
    if (!isNaN(Number(raw))) return Number(raw);
    let clean = raw.replace(/[R$\s]/g, '');
    if (clean.includes('.') && clean.includes(',')) {
      if (clean.indexOf('.') < clean.indexOf(',')) {
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else {
        clean = clean.replace(/,/g, '');
      }
    } else if (clean.includes(',')) {
      clean = clean.replace(/,/g, '.');
    } else if (clean.includes('.')) {
      const parts = clean.split('.');
      if (parts.length === 2 && parts[1].length === 3) {
        clean = clean.replace(/\./g, '');
      } else if (parts.length > 2) {
        clean = clean.replace(/\./g, '');
      }
    }
    clean = clean.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
  };

  const getIntVal = (row: SheetRows[number], idx: number) => {
    if (idx === -1 || idx >= row.length || row[idx] === undefined || row[idx] === null) return 0;
    if (typeof row[idx] === 'number') return Math.round(row[idx]);
    const raw = String(row[idx]).trim();
    if (!raw) return 0;
    const clean = raw.replace(/[^0-9]/g, '');
    return parseInt(clean, 10) || 0;
  };

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    const nonEmulatorCells = row.filter(cell => cell !== undefined && String(cell).trim() !== '');
    if (nonEmulatorCells.length === 0) continue;

    let name = '';
    if (nameIdx !== -1 && nameIdx < row.length && row[nameIdx] !== undefined) {
      name = String(row[nameIdx]).trim();
    }
    if (!name) {
      for (let col = 0; col < row.length; col++) {
        if (col !== codeIdx && row[col] !== undefined && String(row[col]).trim() !== '' && isNaN(Number(row[col]))) {
          name = String(row[col]).trim();
          break;
        }
      }
    }
    if (!name) continue;

    let code = '';
    if (codeIdx !== -1 && codeIdx < row.length && row[codeIdx] !== undefined) {
      code = String(row[codeIdx]).trim();
    }
    if (!code) code = `SKU-${1000 + i}`;

    let categoryName = 'Geral';
    if (categoryIdx !== -1 && categoryIdx < row.length && row[categoryIdx] !== undefined) {
      const rawCat = String(row[categoryIdx]).trim();
      if (rawCat) categoryName = rawCat;
    }
    if (categoryName && !categoriesFromProducts.some(c => c.toLowerCase() === categoryName.toLowerCase())) {
      categoriesFromProducts.push(categoryName);
    }

    importedProducts.push({
      id: `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${i}`,
      code,
      name,
      category: categoryName,
      costPrice: Math.max(0, getFloatVal(row, costPriceIdx)),
      salePrice: Math.max(0, getFloatVal(row, salePriceIdx)),
      stock: Math.max(0, getIntVal(row, stockIdx)),
      minStock: Math.max(0, getIntVal(row, minStockIdx)),
      status: 'disponivel',
      createdAt: new Date().toISOString()
    });
  }

  return { importedProducts, categoriesFromProducts };
}

function parseCategoriesSheet(rows: SheetRows): string[] {
  let headerRowIndex = 0;
  for (let r = 0; r < Math.min(rows.length, 10); r++) {
    const row = rows[r];
    if (!row) continue;
    if (row.some(cell => String(cell || '').toLowerCase().includes('categoria'))) {
      headerRowIndex = r;
      break;
    }
  }
  const categories: string[] = [];
  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    const catName = String(row[0] || '').trim();
    if (catName && !categories.some(c => c.toLowerCase() === catName.toLowerCase())) {
      categories.push(catName);
    }
  }
  return categories;
}

function parseSalesSheet(rows: SheetRows, productsList: Product[]): Sale[] {
  let headerRowIndex = 0;
  let maxMatches = -1;
  const keywords = ['id da venda', 'venda', 'cliente', 'pagamento', 'itens', 'faturamento', 'total', 'status'];

  for (let r = 0; r < Math.min(rows.length, 15); r++) {
    const row = rows[r];
    if (!row) continue;
    let matches = 0;
    for (const cell of row) {
      const val = String(cell || '').trim().toLowerCase();
      if (val && keywords.some(kw => val.includes(kw))) {
        matches++;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      headerRowIndex = r;
    }
  }

  const headerRow = rows[headerRowIndex].map((h: Cell) => String(h || '').trim().toLowerCase());

  const findColIndex = (kwList: string[]) => {
    return headerRow.findIndex(h => kwList.some(kw => h.includes(kw)));
  };

  const idIdx = findColIndex(['id', 'código', 'codigo', 'venda']);
  const dateIdx = findColIndex(['data', 'data/hora', 'date']);
  const clientIdx = findColIndex(['cliente', 'nome', 'client']);
  const phoneIdx = findColIndex(['telefone', 'celular', 'fone', 'phone']);
  const paymentIdx = findColIndex(['pagamento', 'forma', 'meio', 'method']);
  const itemsIdx = findColIndex(['itens', 'produtos', 'item', 'descrição', 'descricao']);
  const produtoIdx = findColIndex(['produto']);
  const qtdIdx = findColIndex(['qtd', 'quantidade']);
  const horaIdx = findColIndex(['hora']);
  const costIdx = findColIndex(['custo', 'custo total', 'total cost']);
  const revenueIdx = findColIndex(['faturamento', 'valor', 'total', 'venda total', 'revenue']);
  const statusIdx = findColIndex(['status', 'situação', 'situacao']);
  const tipoIdx = findColIndex(['tipo', 'cpf', 'cnpj', 'tipo venda', 'sale type']);
  const orderIdIdx = findColIndex(['id pedido', 'pedido', 'order id', 'ecommerce', 'shopee', 'tiktok']);
  const channelIdx = findColIndex(['canal', 'channel', 'origem', 'marketplace']);

  const getFloatVal = (row: SheetRows[number], idx: number) => {
    if (idx === -1 || idx >= row.length || row[idx] === undefined || row[idx] === null) return 0;
    if (typeof row[idx] === 'number') return row[idx];
    const raw = String(row[idx]).trim();
    if (!raw) return 0;
    if (!isNaN(Number(raw))) return Number(raw);
    let clean = raw.replace(/[R$\s]/g, '');
    if (clean.includes('.') && clean.includes(',')) {
      if (clean.indexOf('.') < clean.indexOf(',')) {
        clean = clean.replace(/\./g, '').replace(',', '.');
      } else {
        clean = clean.replace(/,/g, '');
      }
    } else if (clean.includes(',')) {
      clean = clean.replace(/,/g, '.');
    } else if (clean.includes('.')) {
      const parts = clean.split('.');
      if (parts.length === 2 && parts[1].length === 3) {
        clean = clean.replace(/\./g, '');
      } else if (parts.length > 2) {
        clean = clean.replace(/\./g, '');
      }
    }
    clean = clean.replace(/[^0-9.]/g, '');
    return parseFloat(clean) || 0;
  };

  const parseDate = (row: SheetRows[number]): string => {
    let rawDate = (dateIdx !== -1 && dateIdx < row.length && row[dateIdx]) ? String(row[dateIdx]).trim() : '';
    if (horaIdx !== -1 && horaIdx < row.length && row[horaIdx]) {
      const h = String(row[horaIdx]).trim();
      if (h) rawDate = rawDate ? `${rawDate} ${h}` : h;
    }
    if (!rawDate) return new Date().toISOString();
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) return d.toISOString();
    const match = rawDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[^\d]*(\d{1,2}):(\d{2}))?/);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const year = parseInt(match[3], 10);
      const hh = match[4] ? parseInt(match[4], 10) : 12;
      const mm = match[5] ? parseInt(match[5], 10) : 0;
      const parsed = new Date(year, month, day, hh, mm, 0);
      if (!isNaN(parsed.getTime())) return parsed.toISOString();
    }
    return new Date().toISOString();
  };

  const parsePayment = (row: SheetRows[number]): Sale['paymentMethod'] => {
    let paymentMethod: Sale['paymentMethod'] = 'pix';
    if (paymentIdx !== -1 && paymentIdx < row.length && row[paymentIdx]) {
      const pLower = String(row[paymentIdx]).trim().toLowerCase();
      if (pLower.includes('dinheiro') || pLower.includes('money')) paymentMethod = 'money';
      else if (pLower.includes('crédito') || pLower.includes('credito') || pLower.includes('credit')) paymentMethod = 'card_credit';
      else if (pLower.includes('débito') || pLower.includes('debito') || pLower.includes('debit')) paymentMethod = 'card_debit';
      else if (pLower.includes('transf') || pLower.includes('banc')) paymentMethod = 'transfer';
    }
    return paymentMethod;
  };

  const parseStatus = (row: SheetRows[number]): 'completed' | 'cancelled' | 'pending' => {
    let status: 'completed' | 'cancelled' | 'pending' = 'completed';
    if (statusIdx !== -1 && statusIdx < row.length && row[statusIdx]) {
      const sLower = String(row[statusIdx]).trim().toLowerCase();
      if (sLower.includes('canc') || sLower.includes('estor')) status = 'cancelled';
      else if (sLower.includes('pend') || sLower.includes('abert') || sLower.includes('aguar')) status = 'pending';
    }
    return status;
  };

  const makeItem = (pNameRaw: Cell, qtyRaw: Cell): SaleItem => {
    const pName = String(pNameRaw || '').trim();
    let qty = parseInt(String(qtyRaw || '1'), 10);
    if (isNaN(qty) || qty <= 0) qty = 1;
    const pNameLower = pName.toLowerCase().trim();
    let matchedProd = productsList.find(pr =>
      pr.name.toLowerCase().trim() === pNameLower ||
      pr.code.toLowerCase().trim() === pNameLower
    );
    if (!matchedProd) {
      matchedProd = productsList.find(pr =>
        pr.name.toLowerCase().includes(pNameLower) ||
        pNameLower.includes(pr.name.toLowerCase())
      );
    }
    const costPrice = matchedProd ? matchedProd.costPrice : 0;
    const salePrice = matchedProd ? matchedProd.salePrice : 0;
    return {
      productId: matchedProd ? matchedProd.id : `p_temp_${Math.random().toString(36).substring(2, 6)}`,
      productName: matchedProd ? matchedProd.name : pName,
      quantity: qty,
      costPrice,
      salePrice,
      total: salePrice * qty
    };
  };

  const sales: Sale[] = [];
  const perItemMode = itemsIdx === -1 && produtoIdx !== -1 && qtdIdx !== -1;

  // Novo formato: uma linha por item (colunas Produto/QTD separadas)
  if (perItemMode) {
    const groups = new Map<string, SheetRows>();
    for (let i = headerRowIndex + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || row.length === 0) continue;
      if (row.every(c => c === null || c === undefined || String(c).trim() === '')) continue;
      const id = (idIdx !== -1 && idIdx < row.length && row[idIdx]) ? String(row[idIdx]).trim() : `venda_${Date.now()}_${i}`;
      if (!groups.has(id)) groups.set(id, []);
      groups.get(id)!.push(row);
    }
    for (const [id, groupRows] of groups) {
      const first = groupRows[0];
      const items = groupRows.map(r => makeItem(r[produtoIdx], r[qtdIdx]));
      let totalCost = 0;
      let total = 0;
      if (costIdx !== -1 || revenueIdx !== -1) {
        for (const r of groupRows) {
          totalCost += getFloatVal(r, costIdx);
          total += getFloatVal(r, revenueIdx);
        }
      }
      if (totalCost === 0) totalCost = items.reduce((s, it) => s + it.costPrice * it.quantity, 0);
      if (total === 0) total = items.reduce((s, it) => s + it.total, 0);
      const clientName = (clientIdx !== -1 && clientIdx < first.length && first[clientIdx]) ? String(first[clientIdx]).trim() : undefined;
      const clientPhone = (phoneIdx !== -1 && phoneIdx < first.length && first[phoneIdx]) ? String(first[phoneIdx]).trim() : undefined;
      let saleType = 'CPF';
      if (tipoIdx !== -1 && tipoIdx < first.length && first[tipoIdx]) {
        const t = String(first[tipoIdx]).trim().toLowerCase();
        if (t.includes('cnpj')) saleType = 'CNPJ';
      }
      const ecommerceOrderId = (orderIdIdx !== -1 && orderIdIdx < first.length && first[orderIdIdx]) ? String(first[orderIdIdx]).trim() : undefined;
      const saleChannel = (channelIdx !== -1 && channelIdx < first.length && first[channelIdx]) ? String(first[channelIdx]).trim() : undefined;
      sales.push({
        id,
        date: parseDate(first),
        clientName,
        clientPhone,
        paymentMethod: parsePayment(first),
        items,
        totalCost,
        total,
        profit: total - totalCost,
        saleType: saleType as 'CPF' | 'CNPJ',
        ecommerceOrderId,
        saleChannel,
        status: parseStatus(first),
        createdAt: new Date().toISOString(),
      });
    }
    return sales;
  }

  for (let i = headerRowIndex + 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue;
    if (row.every(c => c === null || c === undefined || String(c).trim() === '')) continue;

    const id = (idIdx !== -1 && idIdx < row.length && row[idIdx]) ? String(row[idIdx]).trim() : `venda_${Date.now()}_${i}`;

    let rawDate = (dateIdx !== -1 && dateIdx < row.length && row[dateIdx]) ? String(row[dateIdx]).trim() : '';
    let saleDate = new Date().toISOString();
    if (rawDate) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) {
        saleDate = d.toISOString();
      } else {
        const match = rawDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})(?:[^\d]*(\d{1,2}):(\d{2}))?/);
        if (match) {
          const day = parseInt(match[1], 10);
          const month = parseInt(match[2], 10) - 1;
          const year = parseInt(match[3], 10);
          const hh = match[4] ? parseInt(match[4], 10) : 12;
          const mm = match[5] ? parseInt(match[5], 10) : 0;
          const parsed = new Date(year, month, day, hh, mm, 0);
          if (!isNaN(parsed.getTime())) {
            saleDate = parsed.toISOString();
          }
        }
      }
    }

    const clientName = (clientIdx !== -1 && clientIdx < row.length && row[clientIdx]) ? String(row[clientIdx]).trim() : undefined;
    const clientPhone = (phoneIdx !== -1 && phoneIdx < row.length && row[phoneIdx]) ? String(row[phoneIdx]).trim() : undefined;

    let paymentMethod: Sale['paymentMethod'] = 'pix';
    if (paymentIdx !== -1 && paymentIdx < row.length && row[paymentIdx]) {
      const pLower = String(row[paymentIdx]).trim().toLowerCase();
      if (pLower.includes('dinheiro') || pLower.includes('money')) paymentMethod = 'money';
      else if (pLower.includes('crédito') || pLower.includes('credito') || pLower.includes('credit')) paymentMethod = 'card_credit';
      else if (pLower.includes('débito') || pLower.includes('debito') || pLower.includes('debit')) paymentMethod = 'card_debit';
      else if (pLower.includes('transf') || pLower.includes('banc')) paymentMethod = 'transfer';
    }

    const itemsStr = (itemsIdx !== -1 && itemsIdx < row.length && row[itemsIdx]) ? String(row[itemsIdx]).trim() : '';
    const saleItems: SaleItem[] = [];

    if (itemsStr) {
      const parts = itemsStr.split(',');
      for (const p of parts) {
        const itemStr = p.trim();
        if (!itemStr) continue;

        const match = itemStr.match(/(.+?)\s*\((\d+)\s*x\b[^)]*\)/i) || itemStr.match(/(.+?)\s*\((\d+)\s*x?\)/i) || itemStr.match(/(.+?)\s*x\s*(\d+)/i) || itemStr.match(/(\d+)\s*x\s*(.+)/i);
        let pName = itemStr;
        let qty = 1;

        if (match) {
          if (isNaN(Number(match[1]))) {
            pName = match[1].trim();
            qty = parseInt(match[2], 10) || 1;
          } else {
            qty = parseInt(match[1], 10) || 1;
            pName = match[2].trim();
          }
        }

        const pNameLower = pName.toLowerCase().trim();
        let matchedProd = productsList.find(pr =>
          pr.name.toLowerCase().trim() === pNameLower ||
          pr.code.toLowerCase().trim() === pNameLower
        );

        if (!matchedProd) {
          matchedProd = productsList.find(pr =>
            pr.name.toLowerCase().includes(pNameLower) ||
            pNameLower.includes(pr.name.toLowerCase())
          );
        }

        const costPrice = matchedProd ? matchedProd.costPrice : 0;
        const salePrice = matchedProd ? matchedProd.salePrice : 0;

        saleItems.push({
          productId: matchedProd ? matchedProd.id : `p_temp_${Math.random().toString(36).substring(2, 6)}`,
          productName: matchedProd ? matchedProd.name : pName,
          quantity: qty,
          costPrice,
          salePrice,
          total: salePrice * qty
        });
      }
    }

    const totalCost = getFloatVal(row, costIdx) || saleItems.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    const total = getFloatVal(row, revenueIdx) || saleItems.reduce((sum, item) => sum + item.total, 0);

    let status: 'completed' | 'cancelled' | 'pending' = 'completed';
    if (statusIdx !== -1 && statusIdx < row.length && row[statusIdx]) {
      const sLower = String(row[statusIdx]).trim().toLowerCase();
      if (sLower.includes('canc') || sLower.includes('estor')) {
        status = 'cancelled';
      } else if (sLower.includes('pend') || sLower.includes('abert') || sLower.includes('aguar')) {
        status = 'pending';
      }
    }

    const tipoIdx2 = findColIndex(['tipo', 'cpf', 'cnpj', 'tipo venda', 'sale type']);
    const orderIdIdx2 = findColIndex(['id pedido', 'pedido', 'order id', 'ecommerce', 'shopee', 'tiktok']);
    const channelIdx2 = findColIndex(['canal', 'channel', 'origem', 'marketplace']);

    let saleType = 'CPF';
    if (tipoIdx2 !== -1 && tipoIdx2 < row.length && row[tipoIdx2]) {
      const t = String(row[tipoIdx2]).trim().toLowerCase();
      if (t.includes('cnpj')) saleType = 'CNPJ';
    }

    const ecommerceOrderId = (orderIdIdx2 !== -1 && orderIdIdx2 < row.length && row[orderIdIdx2]) ? String(row[orderIdIdx2]).trim() : undefined;
    const saleChannel = (channelIdx2 !== -1 && channelIdx2 < row.length && row[channelIdx2]) ? String(row[channelIdx2]).trim() : undefined;

    sales.push({
      id,
      date: saleDate,
      clientName,
      clientPhone,
      paymentMethod,
      items: saleItems,
      totalCost,
      total,
      profit: total - totalCost,
      saleType: saleType as 'CPF' | 'CNPJ',
      ecommerceOrderId,
      saleChannel,
      status,
      createdAt: new Date().toISOString(),
    });
  }

  return sales;
}

export { parseProductsSheet, parseCategoriesSheet, parseSalesSheet };
