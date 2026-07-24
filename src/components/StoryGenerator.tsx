import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Download, Copy, Image, Sparkles, Tag, Zap, Star, ShoppingBag, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Product, StoreInfo } from '../types';

type TemplateType = 'novidade' | 'promocao' | 'ultimas' | 'depimento';

interface TemplateConfig {
  id: TemplateType;
  name: string;
  icon: React.ReactNode;
  gradient: string;
  accentColor: string;
  badge: string;
  badgeColor: string;
}

const TEMPLATES: TemplateConfig[] = [
  {
    id: 'novidade',
    name: 'Novidade',
    icon: <Sparkles className="h-4 w-4" />,
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    accentColor: '#667eea',
    badge: 'NOVIDADE',
    badgeColor: '#667eea',
  },
  {
    id: 'promocao',
    name: 'Promoção',
    icon: <Tag className="h-4 w-4" />,
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    accentColor: '#f5576c',
    badge: 'PROMOÇÃO',
    badgeColor: '#f5576c',
  },
  {
    id: 'ultimas',
    name: 'Últimas Unidades',
    icon: <Zap className="h-4 w-4" />,
    gradient: 'linear-gradient(135deg, #FFD200 0%, #F7971E 100%)',
    accentColor: '#F7971E',
    badge: 'ÚLTIMAS UNIDADES',
    badgeColor: '#F7971E',
  },
  {
    id: 'depimento',
    name: 'Produto em Destaque',
    icon: <Star className="h-4 w-4" />,
    gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    accentColor: '#11998e',
    badge: 'EM DESTAQUE',
    badgeColor: '#11998e',
  },
];

interface StoryGeneratorProps {
  product: Product;
  storeInfo: StoreInfo;
  onClose: () => void;
}

export default function StoryGenerator({ product, storeInfo, onClose }: StoryGeneratorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('novidade');
  const [productImage, setProductImage] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const template = TEMPLATES.find(t => t.id === selectedTemplate)!;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setProductImage(ev.target?.result as string);
      toast.success('Imagem carregada!');
    };
    reader.readAsDataURL(file);
  };

  const generateStory = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setIsGenerating(true);
    const ctx = canvas.getContext('2d');
    if (!ctx) { setIsGenerating(false); return; }

    // Polyfill for roundRect (compatibility with older browsers)
    if (!ctx.roundRect) {
      CanvasRenderingContext2D.prototype.roundRect = function(x: number, y: number, w: number, h: number, r: number) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        this.moveTo(x + r, y);
        this.arcTo(x + w, y, x + w, y + h, r);
        this.arcTo(x + w, y + h, x, y + h, r);
        this.arcTo(x, y + h, x, y, r);
        this.arcTo(x, y, x + w, y, r);
        this.closePath();
        return this;
      };
    }

    // Story dimensions (1080x1920)
    const W = 1080;
    const H = 1920;
    canvas.width = W;
    canvas.height = H;

    // 1. Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    const colors = template.gradient.match(/#[a-fA-F0-9]{6}/g) || ['#667eea', '#764ba2'];
    grad.addColorStop(0, colors[0]);
    grad.addColorStop(1, colors[1] || colors[0]);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // 2. Subtle pattern overlay
    ctx.fillStyle = 'rgba(255,255,255,0.03)';
    for (let i = 0; i < W; i += 40) {
      for (let j = 0; j < H; j += 40) {
        if ((i + j) % 80 === 0) {
          ctx.beginPath();
          ctx.arc(i, j, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 3. White card area (top)
    const cardY = 80;
    const cardH = 600;
    const cardRadius = 30;
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath();
    ctx.roundRect(60, cardY, W - 120, cardH, cardRadius);
    ctx.fill();

    // 4. Product image or placeholder
    if (productImage) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve) => {
        img.onload = () => {
          // Fit image in card with padding
          const imgPad = 40;
          const imgW = W - 120 - imgPad * 2;
          const imgH = cardH - imgPad * 2;
          const scale = Math.min(imgW / img.width, imgH / img.height);
          const drawW = img.width * scale;
          const drawH = img.height * scale;
          const imgX = 60 + (imgW - drawW) / 2 + imgPad;
          const imgY = cardY + (imgH - drawH) / 2 + imgPad;

          // Clip rounded rect for image
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(imgX, imgY, drawW, drawH, 20);
          ctx.clip();
          ctx.drawImage(img, imgX, imgY, drawW, drawH);
          ctx.restore();
          resolve();
        };
        img.onerror = () => resolve();
        img.src = productImage;
      });
    } else {
      // Placeholder with icon
      const placeholderY = cardY + 150;
      ctx.fillStyle = '#e2e8f0';
      ctx.beginPath();
      ctx.roundRect(W / 2 - 100, placeholderY, 200, 200, 20);
      ctx.fill();
      // Shopping bag icon (simplified)
      ctx.fillStyle = '#94a3b8';
      ctx.font = '80px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📦', W / 2, placeholderY + 130);
      ctx.font = '24px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('Adicione uma foto', W / 2, placeholderY + 240);
    }

    // 5. Badge
    const badgeY = cardY + cardH + 30;
    ctx.font = 'bold 28px sans-serif';
    const badgeText = template.badge;
    const badgeWidth = ctx.measureText(badgeText).width + 40;
    ctx.fillStyle = template.badgeColor;
    ctx.beginPath();
    ctx.roundRect(W / 2 - badgeWidth / 2, badgeY, badgeWidth, 50, 25);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(badgeText, W / 2, badgeY + 25);

    // 6. Product name
    const nameY = badgeY + 100;
    ctx.font = 'bold 48px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // Word wrap product name
    const maxWidth = W - 160;
    const words = product.name.split(' ');
    let line = '';
    let lineY = nameY;
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, W / 2, lineY);
        line = word;
        lineY += 56;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, W / 2, lineY);

    // 7. Price
    const priceY = lineY + 80;
    ctx.font = 'bold 72px sans-serif';
    ctx.fillStyle = '#ffffff';
    const priceText = product.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    ctx.fillText(priceText, W / 2, priceY);

    // 8. Optional custom text
    let descY = priceY + 100;
    if (customText.trim()) {
      ctx.font = '28px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      const descWords = customText.split(' ');
      let descLine = '';
      for (const word of descWords) {
        const testLine = descLine + (descLine ? ' ' : '') + word;
        if (ctx.measureText(testLine).width > maxWidth && descLine) {
          ctx.fillText(descLine, W / 2, descY);
          descLine = word;
          descY += 36;
        } else {
          descLine = testLine;
        }
      }
      ctx.fillText(descLine, W / 2, descY);
      descY += 50;
    }

    // 9. Store name at bottom
    const storeY = H - 180;
    ctx.font = 'bold 32px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(storeInfo.name || 'ZM Store', W / 2, storeY);

    // 10. Contact info
    ctx.font = '24px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    if (storeInfo.phone) {
      ctx.fillText(`📱 ${storeInfo.phone}`, W / 2, storeY + 45);
    }
    if (storeInfo.address) {
      ctx.fillText(`📍 ${storeInfo.address}`, W / 2, storeY + 80);
    }

    // 11. Swipe up hint
    ctx.font = '22px sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.fillText('Deslize para cima para mais detalhes ↑', W / 2, H - 60);

    // Generate preview
    const dataUrl = canvas.toDataURL('image/png', 0.95);
    setPreviewUrl(dataUrl);
    setIsGenerating(false);
  }, [product, productImage, customText, template, storeInfo]);

  useEffect(() => {
    generateStory();
  }, [generateStory]);

  const handleDownload = () => {
    if (!previewUrl) return;
    const link = document.createElement('a');
    link.download = `Story_${product.name.replace(/\s+/g, '_')}_${Date.now()}.png`;
    link.href = previewUrl;
    link.click();
    toast.success('Imagem baixada!');
  };

  const handleCopyText = () => {
    const text = generatePostText();
    navigator.clipboard.writeText(text);
    toast.success('Texto copiado!');
  };

  const generatePostText = (): string => {
    const emoji = template.id === 'novidade' ? '🆕' :
                  template.id === 'promocao' ? '🔥' :
                  template.id === 'ultimas' ? '⚡' : '⭐';
    
    const badge = template.id === 'novidade' ? 'ACABOU DE CHEGAR!' :
                  template.id === 'promocao' ? 'OFERTA IMPERDÍVEL!' :
                  template.id === 'ultimas' ? 'ÚLTIMAS UNIDADES!' : 'PRODUTO EM DESTAQUE!';

    let text = `${emoji} ${badge} ${emoji}\n\n`;
    text += `📱 ${product.name}\n`;
    text += `💰 ${product.salePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;
    
    if (product.description) {
      text += `\n📝 ${product.description}\n`;
    }
    
    if (customText.trim()) {
      text += `\n${customText}\n`;
    }
    
    text += `\n✅ Garantia de qualidade`;
    text += `\n💳 PIX com desconto`;
    
    if (storeInfo.phone) {
      text += `\n\n📲 Chama no WhatsApp: ${storeInfo.phone}`;
    }
    
    text += `\n\n🏷️ ${storeInfo.name || 'ZM Store'}`;
    
    return text;
  };

  const handleShareWhatsApp = () => {
    const text = generatePostText();
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Image className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Gerar Story</h2>
              <p className="text-xs text-slate-500">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Controls */}
            <div className="space-y-5">
              {/* Template Selection */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Escolha o template</label>
                <div className="grid grid-cols-2 gap-2">
                  {TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        selectedTemplate === t.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${selectedTemplate === t.id ? 'bg-indigo-500' : 'bg-slate-400'}`}>
                        {t.icon}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Foto do Produto</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full p-4 border-2 border-dashed border-slate-300 rounded-xl hover:border-indigo-400 hover:bg-indigo-50/50 transition-all flex flex-col items-center gap-2"
                >
                  {productImage ? (
                    <>
                      <img src={productImage} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                      <span className="text-sm text-indigo-600 font-medium">Trocar imagem</span>
                    </>
                  ) : (
                    <>
                      <Image className="h-8 w-8 text-slate-400" />
                      <span className="text-sm text-slate-500">Clique para adicionar foto</span>
                      <span className="text-xs text-slate-400">JPG, PNG (máx. 5MB)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Custom Text */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Texto adicional (opcional)</label>
                <textarea
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Ex: Frete grátis! PIX com 10% OFF!"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none"
                  rows={3}
                />
              </div>

              {/* Store Info Preview */}
              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 mb-1">Informações da loja ( Configurações )</p>
                <p className="text-sm font-medium text-slate-700">{storeInfo.name || 'ZM Store'}</p>
                {storeInfo.phone && <p className="text-xs text-slate-600">📱 {storeInfo.phone}</p>}
                {storeInfo.address && <p className="text-xs text-slate-600">📍 {storeInfo.address}</p>}
              </div>
            </div>

            {/* Right: Preview */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-semibold text-slate-700 mb-3">Preview</label>
              <div className="relative">
                <canvas ref={canvasRef} className="rounded-xl shadow-lg max-h-[500px] w-auto" style={{ maxHeight: '500px' }} />
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                    <div className="text-white font-medium">Gerando...</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={handleDownload}
              disabled={!previewUrl}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              Baixar Imagem
            </button>
            <button
              onClick={handleCopyText}
              className="px-5 py-2.5 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copiar Texto
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Enviar no WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
