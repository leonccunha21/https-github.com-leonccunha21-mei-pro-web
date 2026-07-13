import { Product, Sale, Category } from './types';

import raw from './data.json';

const d = raw as { categories: Category[]; products: Product[]; sales: Sale[] };

export const initialCategories = d.categories;
export const initialProducts = d.products;
export const initialSales = d.sales;
