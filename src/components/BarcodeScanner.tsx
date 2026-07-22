import React, { useEffect, useRef, useState, useCallback } from 'react';
import Quagga from '@ericblade/quagga2';
import { X, ScanBarcode, Volume2, VolumeX } from 'lucide-react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onDetected: (code: string) => void;
}

export default function BarcodeScanner({ isOpen, onClose, onDetected }: BarcodeScannerProps) {
  const scannerRef = useRef<HTMLDivElement>(null);
  const [lastCode, setLastCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastDetectedRef = useRef<string>('');
  const cooldownRef = useRef(false);

  const playBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 1200;
      osc.type = 'sine';
      gain.gain.value = 0.3;
      osc.start();
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.stop(ctx.currentTime + 0.15);
    } catch { /* silent */ }
  }, [soundEnabled]);

  const handleDetected = useCallback((result: { codeResult?: { code: string } }) => {
    if (cooldownRef.current) return;
    const code = result?.codeResult?.code;
    if (!code || code.length < 4) return;
    if (code === lastDetectedRef.current) return;

    lastDetectedRef.current = code;
    cooldownRef.current = true;
    setLastCode(code);
    playBeep();
    onDetected(code);

    setTimeout(() => {
      cooldownRef.current = false;
      lastDetectedRef.current = '';
    }, 2000);
  }, [onDetected, playBeep]);

  useEffect(() => {
    if (!isOpen) return;

    let stopped = false;

    const start = async () => {
      setError(null);
      setIsScanning(false);
      setLastCode('');
      lastDetectedRef.current = '';
      cooldownRef.current = false;

      await new Promise(r => setTimeout(r, 100));

      if (stopped || !scannerRef.current) return;

      try {
        Quagga.init({
          inputStream: {
            type: 'LiveStream',
            target: scannerRef.current,
            constraints: {
              facingMode: 'environment',
              width: { ideal: 640 },
              height: { ideal: 480 },
            },
          },
          decoder: {
            readers: [
              'ean_reader',
              'ean_8_reader',
              'code_128_reader',
              'code_39_reader',
              'upc_reader',
              'upc_e_reader',
            ],
          },
          locate: true,
          frequency: 10,
        }, (err) => {
          if (stopped) return;
          if (err) {
            setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
            return;
          }
          Quagga.start();
          setIsScanning(true);
        });

        Quagga.onDetected(handleDetected);
      } catch {
        setError('Erro ao inicializar o scanner.');
      }
    };

    start();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      stopped = true;
      window.removeEventListener('keydown', handleKey);
      try {
        Quagga.stop();
        Quagga.offDetected(handleDetected);
        const el = scannerRef.current;
        if (el) el.innerHTML = '';
      } catch { /* silent */ }
    };
  }, [isOpen, onClose, handleDetected]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={onClose}>
      <div
        className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
          <div className="flex items-center gap-2 text-white">
            <ScanBarcode className="h-5 w-5 text-emerald-400" />
            <span className="font-semibold text-sm">Scanner de Código de Barras</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              title={soundEnabled ? 'Desativar som' : 'Ativar som'}
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Scanner viewport */}
        <div className="relative bg-black aspect-[4/3]">
          <div ref={scannerRef} className="w-full h-full [&>video]:w-full [&>video]:h-full [&>video]:object-cover" />

          {/* Scan line overlay */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[80%] h-0.5 bg-emerald-400/70 animate-pulse rounded-full shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
              <div className="absolute w-[80%] h-32 border-2 border-white/20 rounded-xl" />
            </div>
          )}

          {/* Error overlay */}
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white px-6 text-center">
              <ScanBarcode className="h-12 w-12 text-slate-500 mb-3" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Loading overlay */}
          {!isScanning && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
              <div className="h-8 w-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-slate-400">Iniciando câmera...</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-700">
          {lastCode ? (
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <ScanBarcode className="h-4 w-4" />
              <span className="text-sm font-mono font-bold">{lastCode}</span>
            </div>
          ) : (
            <p className="text-xs text-slate-500 mb-2">
              {isScanning ? 'Aproxime o código de barras da câmera...' : 'Aguardando câmera...'}
            </p>
          )}
          <p className="text-[11px] text-slate-600">
            Pressione <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-400 text-[10px]">ESC</kbd> para fechar
          </p>
        </div>
      </div>
    </div>
  );
}
