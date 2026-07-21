import { UserRole } from '../types';

type Feature = 'dashboard' | 'pdv' | 'sales_history' | 'products' | 'customers' | 'expenses' | 'purchases' |
  'cash_flow' | 'cash_closing' | 'dre' | 'debtors' | 'reports' | 'settings' |
  'nfe' | 'boletos' | 'leads' | 'whatsapp' | 'funnel' | 'ai' | 'loans' | 'os_orcamento' |
  'bank_conciliation' | 'users' | 'bills' | 'internet_sharing';

const rolePermissions: Record<UserRole, Feature[]> = {
  admin: ['dashboard', 'pdv', 'sales_history', 'products', 'customers', 'expenses', 'purchases',
    'cash_flow', 'cash_closing', 'dre', 'debtors', 'reports', 'settings', 'nfe', 'boletos',
    'leads', 'whatsapp', 'funnel', 'ai', 'loans', 'os_orcamento', 'bank_conciliation', 'users',
    'bills', 'internet_sharing'],
  gerente: ['dashboard', 'pdv', 'sales_history', 'products', 'customers', 'expenses', 'purchases',
    'cash_flow', 'cash_closing', 'dre', 'debtors', 'reports', 'settings', 'nfe', 'boletos',
    'loans', 'os_orcamento', 'bank_conciliation', 'bills', 'internet_sharing'],
  vendedor: ['dashboard', 'pdv', 'sales_history', 'customers', 'debtors'],
};

export function canAccess(feature: Feature, role: UserRole): boolean {
  return rolePermissions[role]?.includes(feature) ?? false;
}

export function useCurrentRole(): UserRole {
  return (localStorage.getItem('zm_current_role') as UserRole) || 'admin';
}
