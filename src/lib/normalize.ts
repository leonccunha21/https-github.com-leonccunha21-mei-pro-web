// Normalização de texto reutilizada em todo o app (evita duplicação e drift).
// Usada para comparar nomes de produtos/clientes e canais de venda de forma
// insensível a maiúsculas, acentos e espaços extras.

export function normalizeName(name: string): string {
  return (name || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ');
}

export function normalizeChannel(channel: string): string {
  return (channel || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}
