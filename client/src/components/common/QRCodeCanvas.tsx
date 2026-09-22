import React from 'react';

interface BarcodeProps {
  code: string;
  className?: string;
}

export const BarcodeGenerator: React.FC<BarcodeProps> = ({ code, className = '' }) => {
  const bars = Array.from(code).map((char: string, index) => {
    const codeNum = char.charCodeAt(0);
    const width = (codeNum % 3) + 1;
    const isDark = (codeNum + index) % 2 === 0;
    return { width, isDark };
  });

  return (
    <div className={`flex flex-col items-center p-2 bg-white rounded-lg border border-slate-200 shadow-xs ${className}`}>
      <div className="flex items-center gap-0.5 h-10 px-2 bg-white w-full justify-center">
        {bars.map((bar, i) => (
          <div
            key={i}
            className={`h-full ${bar.isDark ? 'bg-slate-900' : 'bg-transparent'}`}
            style={{ width: `${bar.width * 2}px` }}
          />
        ))}
      </div>
      <span className="text-[10px] font-mono tracking-widest text-slate-700 font-bold mt-1">
        *{code}*
      </span>
    </div>
  );
};

export const QRCodeVisual: React.FC<{ value: string; size?: number }> = ({ value, size = 80 }) => {
  const grid = Array.from({ length: 9 }).map((_, row) => 
    Array.from({ length: 9 }).map((_, col) => {
      const isTopLeft = row < 3 && col < 3;
      const isTopRight = row < 3 && col > 5;
      const isBottomLeft = row > 5 && col < 3;
      if (isTopLeft || isTopRight || isBottomLeft) return true;
      const valCode = (value.charCodeAt((row * 3 + col) % value.length) || 0);
      return (valCode + row + col) % 2 === 0;
    })
  );

  return (
    <div 
      className="bg-white p-2 rounded-lg border border-slate-200 inline-block shadow-xs"
      style={{ width: size + 16, height: size + 16 }}
    >
      <div className="grid grid-cols-9 gap-0.5 h-full w-full bg-white">
        {grid.flatMap((row, rIdx) => 
          row.map((cell, cIdx) => (
            <div
              key={`${rIdx}-${cIdx}`}
              className={`${cell ? 'bg-emerald-950' : 'bg-emerald-50'} rounded-[1px]`}
            />
          ))
        )}
      </div>
    </div>
  );
};
