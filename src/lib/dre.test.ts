import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Sale, Expense } from '../types';

function calcDre(sales: Sale[], expenses: Expense[]) {
  const completed = sales.filter(s => s.status === 'completed');
  const receitaBruta = completed.reduce((acc, s) => acc + s.total, 0);
  const custoMercadorias = completed.reduce((acc, s) => acc + s.totalCost, 0);
  const despesas = expenses.filter(e => e.status === 'paid').reduce((acc, e) => acc + e.amount, 0);
  const receitaLiquida = receitaBruta;
  const lucroBruto = receitaLiquida - custoMercadorias;
  const margemBruta = receitaLiquida > 0 ? (lucroBruto / receitaLiquida) * 100 : 0;
  const resultadoLiquido = lucroBruto - despesas;

  return {
    receitaBruta,
    custoMercadorias,
    despesas,
    receitaLiquida,
    lucroBruto,
    margemBruta,
    resultadoLiquido,
  };
}

test('calcDre: basic DRE calculation', () => {
  const sales: Sale[] = [
    { id: 'v1', date: '2026-01-01T00:00:00.000Z', items: [], total: 1000, totalCost: 400, profit: 600, status: 'completed', paymentMethod: 'pix', saleType: 'CPF', createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'v2', date: '2026-01-02T00:00:00.000Z', items: [], total: 500, totalCost: 200, profit: 300, status: 'completed', paymentMethod: 'money', saleType: 'CPF', createdAt: '2026-01-02T00:00:00.000Z' },
  ];
  const expenses: Expense[] = [
    { id: 'e1', date: '2026-01-03T00:00:00.000Z', category: 'Aluguel', description: '', amount: 300, status: 'paid', createdAt: '2026-01-03T00:00:00.000Z' },
    { id: 'e2', date: '2026-01-04T00:00:00.000Z', category: 'Internet', description: '', amount: 100, status: 'paid', createdAt: '2026-01-04T00:00:00.000Z' },
  ];
  const dre = calcDre(sales, expenses);
  assert.equal(dre.receitaBruta, 1500);
  assert.equal(dre.custoMercadorias, 600);
  assert.equal(dre.despesas, 400);
  assert.equal(dre.lucroBruto, 900);
  assert.equal(dre.margemBruta, 60);
  assert.equal(dre.resultadoLiquido, 500);
});

test('calcDre: only completed sales', () => {
  const sales: Sale[] = [
    { id: 'v1', date: '2026-01-01T00:00:00.000Z', items: [], total: 1000, totalCost: 400, profit: 600, status: 'completed', paymentMethod: 'pix', saleType: 'CPF', createdAt: '2026-01-01T00:00:00.000Z' },
    { id: 'v2', date: '2026-01-02T00:00:00.000Z', items: [], total: 500, totalCost: 200, profit: 300, status: 'pending', paymentMethod: 'pix', saleType: 'CPF', createdAt: '2026-01-02T00:00:00.000Z' },
  ];
  const dre = calcDre(sales, []);
  assert.equal(dre.receitaBruta, 1000);
  assert.equal(dre.custoMercadorias, 400);
});

test('calcDre: empty sales returns zeros', () => {
  const dre = calcDre([], []);
  assert.equal(dre.receitaBruta, 0);
  assert.equal(dre.margemBruta, 0);
  assert.equal(dre.resultadoLiquido, 0);
});

test('calcDre: only paid expenses count', () => {
  const sales: Sale[] = [
    { id: 'v1', date: '2026-01-01T00:00:00.000Z', items: [], total: 1000, totalCost: 400, profit: 600, status: 'completed', paymentMethod: 'pix', saleType: 'CPF', createdAt: '2026-01-01T00:00:00.000Z' },
  ];
  const expenses: Expense[] = [
    { id: 'e1', date: '2026-01-03T00:00:00.000Z', category: 'Aluguel', description: '', amount: 300, status: 'paid', createdAt: '2026-01-03T00:00:00.000Z' },
    { id: 'e2', date: '2026-01-04T00:00:00.000Z', category: 'Internet', description: '', amount: 100, status: 'pending', createdAt: '2026-01-04T00:00:00.000Z' },
  ];
  const dre = calcDre(sales, expenses);
  assert.equal(dre.despesas, 300);
  assert.equal(dre.resultadoLiquido, 300);
});
