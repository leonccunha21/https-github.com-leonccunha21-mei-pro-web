// Utilitário para compactar imagens antes de salvar no banco (base64).
// Mantém as fotos leves para não estourar limites do Firestore/IndexedDB.

export async function compactarImagem(file: File, maxLado = 1024, qualidade = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Arquivo de imagem inválido.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxLado) {
          height = Math.round((height * maxLado) / width);
          width = maxLado;
        } else if (height >= width && height > maxLado) {
          width = Math.round((width * maxLado) / height);
          height = maxLado;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas não suportado.'));
        ctx.drawImage(img, 0, 0, width, height);
        // Tenta webp, cai para jpeg se o navegador não suportar.
        const url = canvas.toDataURL('image/webp', qualidade);
        if (url.length < 50000 || !url.startsWith('data:image/webp')) {
          // webp não suportado ou muito pequeno: jpeg
          resolve(canvas.toDataURL('image/jpeg', qualidade));
        } else {
          resolve(url);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
