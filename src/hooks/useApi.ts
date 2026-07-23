import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product, Sale, Customer, Expense, Category, ServiceOrder } from '../types';
import { newId } from '../manicure/localDb';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => fetchJson<Product[]>('/products'),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => fetchJson<Product>(`/products/${id}`),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) =>
      fetchJson<Product>('/products', {
        method: 'POST',
        body: JSON.stringify({ ...product, id: newId('prod'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (product: Product) =>
      fetchJson<Product>(`/products/${product.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...product, updatedAt: new Date().toISOString() }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson<void>(`/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });
}

export function useSales() {
  return useQuery({
    queryKey: ['sales'],
    queryFn: () => fetchJson<Sale[]>('/sales'),
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sale: Omit<Sale, 'id' | 'createdAt' | 'updatedAt'>) =>
      fetchJson<Sale>('/sales', {
        method: 'POST',
        body: JSON.stringify({ ...sale, id: newId('sale'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales'] }),
  });
}

export function useCustomers() {
  return useQuery({
    queryKey: ['customers'],
    queryFn: () => fetchJson<Customer[]>('/customers'),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) =>
      fetchJson<Customer>('/customers', {
        method: 'POST',
        body: JSON.stringify({ ...customer, id: newId('cust'), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (customer: Customer) =>
      fetchJson<Customer>(`/customers/${customer.id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...customer, updatedAt: new Date().toISOString() }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });
}

export function useExpenses() {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: () => fetchJson<Expense[]>('/expenses'),
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchJson<Category[]>('/categories'),
  });
}

export function useServiceOrders() {
  return useQuery({
    queryKey: ['serviceOrders'],
    queryFn: () => fetchJson<ServiceOrder[]>('/service-orders'),
  });
}