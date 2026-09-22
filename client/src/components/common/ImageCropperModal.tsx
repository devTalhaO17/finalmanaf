import React, { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, RotateCw, Check, Crop, Image as ImageIcon } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedBase64: string) => void;
  aspectRatioPreset?: 'square' | 'cover' | 'banner' | 'free';
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatioPreset = 'square'
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [aspect, setAspect] = useState<'square' | 'cover' | 'banner' | 'free'>(aspectRatioPreset);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (imageSrc && isOpen) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      img.onload = () => {
        imageRef.current = img;
        setScale(1);
        setRotation(0);
        setPosition({ x: 0, y: 0 });
        renderCanvas();
      };
    }
  }, [imageSrc, isOpen]);

  useEffect(() => {
    renderCanvas();
  }, [scale, rotation, flipH, aspect, position]);

  const renderCanvas = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let targetWidth = 600;
    let targetHeight = 600;

    if (aspect === 'cover') {
      targetWidth = 400;
      targetHeight = 600;
    } else if (aspect === 'banner') {
      targetWidth = 800;
      targetHeight = 450;
    } else if (aspect === 'free') {
      targetWidth = img.naturalWidth || 600;
      targetHeight = img.naturalHeight || 600;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    ctx.clearRect(0, 0, targetWidth, targetHeight);
    ctx.save();

    ctx.translate(targetWidth / 2 + position.x, targetHeight / 2 + position.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -scale : scale, scale);

    const imgAspect = img.naturalWidth / img.naturalHeight;
    let renderW = targetWidth;
    let renderH = targetWidth / imgAspect;

    if (renderH < targetHeight) {
      renderH = targetHeight;
      renderW = targetHeight * imgAspect;
    }

    ctx.drawImage(img, -renderW / 2, -renderH / 2, renderW, renderH);
    ctx.restore();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSaveCrop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.92);
    onCropComplete(croppedDataUrl);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full overflow-hidden text-xs">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                ছবি ক্রপ, প্যান ও সাইজ ফাইন টিউন করুন
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                জুম, রোটেশন ও অ্যাসপেক্ট রেশিও এডজাস্ট করে পারফেক্ট শট তৈরি করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div 
            className="relative bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center cursor-move border border-slate-800 shadow-inner min-h-[280px]"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas ref={canvasRef} className="max-w-full max-h-[320px] object-contain" />

            <div className="absolute top-2 right-2 bg-slate-900/80 text-white px-2 py-1 rounded text-[10px] font-mono backdrop-blur-xs">
              জুম: {Math.round(scale * 100)}% | ঘোরাণো: {rotation}°
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              অ্যাসপেক্ট রেশিও (Aspect Ratio Presets)
            </label>
            <div className="grid grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setAspect('square')}
                className={`py-1.5 rounded-lg font-semibold border text-[11px] transition-all ${
                  aspect === 'square'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                1:1 স্কয়ার (লোগো/ছবি)
              </button>
              <button
                type="button"
                onClick={() => setAspect('cover')}
                className={`py-1.5 rounded-lg font-semibold border text-[11px] transition-all ${
                  aspect === 'cover'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                2:3 বইয়ের প্রচ্ছদ
              </button>
              <button
                type="button"
                onClick={() => setAspect('banner')}
                className={`py-1.5 rounded-lg font-semibold border text-[11px] transition-all ${
                  aspect === 'banner'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                16:9 হিরো ব্যানার
              </button>
              <button
                type="button"
                onClick={() => setAspect('free')}
                className={`py-1.5 rounded-lg font-semibold border text-[11px] transition-all ${
                  aspect === 'free'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                মুক্ত (Free Form)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5 text-emerald-600" />
                  <span>জুম এডজাস্টমেণ্ট</span>
                </span>
                <span className="font-mono text-[10px] text-slate-500">{scale.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div>
              <span className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ঘুরানো (Rotate)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r - 90) % 360)}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>-৯০°</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 flex items-center gap-1"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>+৯০°</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlipH((f) => !f)}
                  className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 font-semibold"
                >
                  ফ্লিপ
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-bold"
          >
            বাতিল
          </button>
          <button
            type="button"
            onClick={handleSaveCrop}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-md"
          >
            <Check className="w-4 h-4" />
            <span>ক্রপ ও প্রয়োগ করুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
