import { getFirestore, collection, doc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
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

/** Upload entire Excel data as a single backup document */
export async function uploadAsSingleDoc(file: File, uid: string): Promise<void> {
  const data = await parseExcel(file);
  const backupRef = doc(collection(db, 'excelBackups'));
  await setDoc(backupRef, { uid, timestamp: serverTimestamp(), data });
}

/** Upload data as regular collections using existing incremental logic */
export async function uploadAsDocuments(file: File, uid: string): Promise<{ uploaded: number; deleted: number }> {
  const { clearSyncCache, saveUserDbIncremental } = await import('./dbSync');
  const data = await parseExcel(file);
  // Clear local sync cache to force full write
  clearSyncCache(uid);
  // Force full write (writes all docs)
  const result = await saveUserDbIncremental(uid, data as any, { forceFull: true });
  return result;
}
