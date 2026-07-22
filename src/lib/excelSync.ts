import { parseProductsSheet, parseCategoriesSheet, parseSalesSheet, parseLoansSheet, parseOrdersSheet, parsePurchasesSheet, parseCustomersSheet, parseSuppliersSheet, parseCashSheet } from './sheetParsers';
import type { Product, Category, Sale, Loan, ServiceOrder, Purchase, Customer, Supplier, CashSession, Expense } from '../types';

export type ExcelData = {
  products: Product[];
  categories: Category[];
  sales: Sale[];
  loans?: Loan[];
  orders?: ServiceOrder[];
  purchases?: Purchase[];
  customers?: Customer[];
  suppliers?: Supplier[];
  cashSessions?: CashSession[];
  expenses?: Expense[];
};

/** Parse the uploaded Excel file using existing sheet parsers */
export async function parseExcel(file: File): Promise<ExcelData> {
  const XLSX = await import('xlsx');
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const data: Partial<ExcelData> = {};

  for (const sheetName of workbook.SheetNames) {
    const ws = workbook.Sheets[sheetName];
    const rows: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });
    if (!rows || rows.length < 2) continue;
    const name = sheetName.toLowerCase();
    if (name.includes('prod') || rows[0][0]?.toString().toLowerCase().includes('nome do produto')) {
      const parsedProds = parseProductsSheet(rows);
      data.products = parsedProds.importedProducts;
    } else if (name.includes('cat') || rows[0][0]?.toString().toLowerCase().includes('nome da categoria')) {
      const parsedCats = parseCategoriesSheet(rows);
      data.categories = parsedCats.map((cat, idx) => ({ id: `cat_${Date.now()}_${idx}`, name: cat, createdAt: new Date().toISOString() }));
    } else if (name.includes('vend') || rows[0][0]?.toString().toLowerCase().includes('id da venda')) {
      data.sales = parseSalesSheet(rows, data.products || []);
    } else if (name.includes('emprest') || name.includes('loan')) {
      data.loans = parseLoansSheet?.(rows);
    } else if (name.includes('ord') || name.includes('servi') || name.includes('orcamento')) {
      data.orders = parseOrdersSheet?.(rows);
    } else if (name.includes('compra') || name.includes('purchase')) {
      data.purchases = parsePurchasesSheet?.(rows, data.suppliers || []);
    } else if (name.includes('cliente') || name.includes('customer')) {
      data.customers = parseCustomersSheet?.(rows);
    } else if (name.includes('fornecedor') || name.includes('supplier')) {
      data.suppliers = parseSuppliersSheet?.(rows);
    } else if (name.includes('caixa') || name.includes('cash')) {
      data.cashSessions = parseCashSheet?.(rows);
    }
  }

  return data as ExcelData;
}
