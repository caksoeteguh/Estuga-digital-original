import React, { useEffect, useRef } from 'react';
import { Download } from 'lucide-react';
import QRCode from 'qrcode';

interface StudentBarcodeProps {
  value: string;
  width?: number;
  height?: number;
  showText?: boolean;
  onPngGenerated?: (url: string) => void;
  isDark?: boolean;
}

export default function StudentBarcode({
  value,
  width = 120,
  height = 120,
  showText = true,
  onPngGenerated,
  isDark = false
}: StudentBarcodeProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawQrCode = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      // Draw QR code on canvas using the installed qrcode library
      await QRCode.toCanvas(canvas, value, {
        width: width,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });

      // Fire callback with the base64 URL of the PNG
      if (onPngGenerated) {
        onPngGenerated(canvas.toDataURL('image/png'));
      }
    } catch (err) {
      console.error('Error rendering QR code:', err);
    }
  };

  useEffect(() => {
    drawQrCode();
  }, [value, width, height, showText]);

  const downloadQrPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = `qrcode_${value}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col items-center space-y-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
      <canvas ref={canvasRef} className="max-w-full rounded-lg" />
      {showText && (
        <span className="text-[10px] font-mono font-bold text-gray-600 dark:text-slate-300">
          QR-ID: {value}
        </span>
      )}
      <button
        onClick={downloadQrPng}
        type="button"
        className="text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/60 dark:text-indigo-400 px-3 py-1.5 rounded-md flex items-center gap-1 transition-all"
        title="Download QR Code as PNG"
      >
        <Download size={10} />
        <span>Download QR Code PNG</span>
      </button>
    </div>
  );
}
