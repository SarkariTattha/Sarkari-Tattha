import React, { useState } from 'react';
import { useTheme, THEMES, ThemeId } from '../context/ThemeContext';
import { Palette, Check, Sparkles, X } from 'lucide-react';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme, themeConfig } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3.5 py-2 bg-white border-2 border-orange-200 hover:border-orange-400 rounded-xl text-slate-800 text-xs font-black uppercase tracking-wider transition shadow-2xs hover:shadow-xs active:scale-95 cursor-pointer"
        title="Change Website Theme"
      >
        <Palette className="w-4 h-4 text-orange-600 shrink-0" />
        <span className="hidden sm:inline-block font-extrabold text-slate-800">
          Theme: <span className="text-orange-600">{THEMES[theme]?.name.split(' ')[0] || 'Theme'}</span>
        </span>
        <div className="flex -space-x-1 shrink-0 ml-1">
          {THEMES[theme]?.colorPreview.map((hex, idx) => (
            <div
              key={idx}
              className="w-2.5 h-2.5 rounded-full border border-slate-300"
              style={{ backgroundColor: hex }}
            />
          ))}
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-80 bg-white border-2 border-orange-200 text-slate-900 rounded-3xl shadow-xl z-50 p-4 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-orange-600" />
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-900">Select Theme Palette</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Customize the look and feel of Sarkari Tattha portal instantly:
            </p>

            <div className="space-y-2 pt-1 max-h-80 overflow-y-auto pr-1">
              {(Object.keys(THEMES) as ThemeId[]).map((tKey) => {
                const t = THEMES[tKey];
                const isSelected = theme === tKey;
                return (
                  <button
                    key={tKey}
                    onClick={() => {
                      setTheme(tKey);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-2xl border transition flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? 'bg-orange-50/80 border-orange-500 shadow-xs ring-1 ring-orange-500'
                        : 'bg-slate-50/80 border-slate-200 hover:border-orange-300 hover:bg-orange-50/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                          {t.name}
                        </span>
                        {isSelected && (
                          <span className="px-2 py-0.5 bg-orange-600 text-white text-[9px] font-black rounded-full uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{t.description}</p>
                    </div>

                    {/* Swatch & Checkmark */}
                    <div className="flex items-center space-x-2 shrink-0">
                      <div className="flex -space-x-1.5">
                        {t.colorPreview.map((hex, idx) => (
                          <div
                            key={idx}
                            className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs"
                            style={{ backgroundColor: hex }}
                          />
                        ))}
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-orange-600 ml-1" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
