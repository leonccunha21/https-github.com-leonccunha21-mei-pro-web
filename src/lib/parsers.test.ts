import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { SheetRows } from './parsers';
import {
  stripAccents,
  parseProductsSheet,
  parseCategoriesSheet,
  parseSalesSheet,
  parseLoansSheet,
  parseCustomersSheet,
} from './sheetParsers';

test('stripAccents normalizes accents and case', () => {
  assert.equal(stripAccents('CATEGORIA'), 'categoria');
  assert.equal(stripAccents('Vendé'), 'vende');
  assert.equal(stripAccents('ESTOQUE Mínimo'), 'estoque minimo');
});

test('parseCategoriesSheet extracts unique categories', () => {
  const rows: SheetRows = [
    ['Categoria'],
    ['Bebidas'],
    ['BEBIDAS'],
    ['Limpeza'],
  ];
  const result = parseCategoriesSheet(rows);
  assert.deepEqual(result, ['Bebidas', 'Limpeza']);
});

test('parseProductsSheet maps columns to a Product', () => {
  const rows: SheetRows = [
    ['Código', 'Nome', 'Categoria', 'Custo', 'Preço Venda', 'Estoque', 'Mínimo'],
    ['SKU1', 'Camiseta', 'Vestuário', '10,50', 'R$ 25,90', '12', '3'],
  ];
  const { importedProducts, categoriesFromProducts } = parseProductsSheet(rows);
  assert.equal(importedProducts.length, 1);
  const p = importedProducts[0];
  assert.equal(p.name, 'Camiseta');
  assert.equal(p.code, 'SKU1');
  assert.equal(p.category, 'Vestuário');
  assert.equal(p.costPrice, 10.5);
  assert.equal(p.salePrice, 25.9);
  assert.equal(p.stock, 12);
  assert.equal(p.minStock, 3);
  assert.equal(p.status, 'disponivel');
  assert.deepEqual(categoriesFromProducts, ['Vestuário']);
});

test('parseProductsSheet throws on empty/invalid input', () => {
  assert.throws(() => parseProductsSheet([]));
  assert.throws(() => parseProductsSheet([['only', 'header']]));
});

test('parseProductsSheet infers name when name column is missing', () => {
  const rows: SheetRows = [
    ['Código', 'Descrição', 'Custo', 'Venda', 'Qtd'],
    ['X1', 'Notebook', '100', '200', '5'],
  ];
  const { importedProducts } = parseProductsSheet(rows);
  assert.equal(importedProducts[0].name, 'Notebook');
});

test('parseSalesSheet parses items written as "Product (Nx)"', () => {
  const rows: SheetRows = [
    ['ID Venda', 'Data', 'Cliente', 'Pagamento', 'Itens', 'Total'],
    ['v1', '12/07/2026', 'Maria', 'pix', 'Camiseta (2x), Boné (1x)', '119,80'],
  ];
  const products = [
    { id: 'p1', code: 'C1', name: 'Camiseta', category: 'Geral', costPrice: 10, salePrice: 50, stock: 5, minStock: 1, status: 'disponivel' as const, createdAt: '' },
  ];
  const sales = parseSalesSheet(rows, products as never);
  assert.equal(sales.length, 1);
  assert.equal(sales[0].items.length, 2);
  const camiseta = sales[0].items.find(i => i.productName === 'Camiseta')!;
  assert.equal(camiseta.quantity, 2);
  assert.equal(camiseta.total, 100);
  assert.equal(sales[0].total, 119.8);
});

test('parseSalesSheet handles per-item rows grouped by id', () => {
  const rows: SheetRows = [
    ['ID', 'Data', 'Produto', 'Qtd', 'Pagamento'],
    ['v1', '12/07/2026', 'Camiseta', '2', 'pix'],
    ['v1', '12/07/2026', 'Boné', '1', 'pix'],
  ];
  const sales = parseSalesSheet(rows, []);
  assert.equal(sales.length, 1);
  assert.equal(sales[0].items.length, 2);
});

test('parseLoansSheet maps status keywords', () => {
  const rows: SheetRows = [
    ['ID', 'Nome', 'Valor', 'Situação'],
    ['e1', 'João', '100', 'Pago'],
    ['e2', 'Ana', '200', 'Em aberto'],
  ];
  const loans = parseLoansSheet(rows);
  assert.equal(loans.length, 2);
  assert.equal(loans[0].status, 'paid');
  assert.equal(loans[1].status, 'open');
  assert.equal(loans[0].principal, 100);
});

test('parseCustomersSheet requires id and name', () => {
  const rows: SheetRows = [
    ['ID', 'Nome', 'Telefone'],
    ['c1', 'Maria', '999'],
    ['', 'Sem ID', '123'],
    ['c2', '', '456'],
  ];
  const customers = parseCustomersSheet(rows);
  assert.equal(customers.length, 1);
  assert.equal(customers[0].id, 'c1');
  assert.equal(customers[0].name, 'Maria');
});
