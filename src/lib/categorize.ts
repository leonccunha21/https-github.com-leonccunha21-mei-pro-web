// Classificação automática de produtos por categoria com base no nome.
// As regras priorizam marcas/termos específicos para evitar falsos positivos.

export const DEFAULT_CATEGORY = 'Geral';

export function categorizeProduct(name: string): string {
  const n = (name || '').toLowerCase();

  // Apple / iPhone
  if (/(iphone|ipad|macbook|airpods|apple|ios|lightning)|(capa iphone)|(fone iphone)|(cabo iphone)|(carregador.*iphone)|(apple watch)/.test(n)) {
    return 'IPHONE';
  }

  // Samsung
  if (/(samsung|galaxy)/.test(n)) {
    return 'SAMSUNG';
  }

  // Motorola
  if (/(motorola|moto\b|moto )/.test(n)) {
    return 'MOTOROLA';
  }

  // Xiaomi (Redmi/Poco + fones série M)
  if (/(xiaomi|redmi|poco)/.test(n) || /\bfone m1[0-9]\b|\bfone m20\b/.test(n)) {
    return 'XIAOMI';
  }

  // Películas / Vidro / Privacidade
  if (/(privacidade|pelicula|película|vidro temperado|protetor de tela|proteção de tela)/.test(n)) {
    return 'Privacidade';
  }

  return DEFAULT_CATEGORY;
}
