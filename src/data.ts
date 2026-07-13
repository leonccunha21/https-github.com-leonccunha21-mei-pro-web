import { Product, Sale, Category, Expense } from './types';

import raw from './data.json';

const d = raw as { categories: Category[]; products: Product[]; sales: Sale[]; expenses: Expense[] };

export const initialCategories = d.categories;
export const initialProducts = d.products;
export const initialSales = d.sales;
export const initialExpenses = d.expenses;
