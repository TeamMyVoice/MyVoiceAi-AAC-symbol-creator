import React from 'react';
import { GeneratedIcon } from '../types';
import { Download, Loader2, AlertCircle } from 'lucide-react';
import { translations, translateOption } from '../translations';
import { Language } from '../App';

interface IconGridProps {
  icons: GeneratedIcon[];
  onRegenerate: (actionId: string) => void;
  lang: Language;
}

export function IconGrid({ icons, onRegenerate, lang }: IconGridProps) {
  const t = translations[lang];

  const handleDownload = (icon: GeneratedIcon) => {
    if (!icon.imageUrl) return;
    const link = document.createElement('a');
    link.href = icon.imageUrl;
    link.download = `aac-${icon.label.toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (icons.length === 0) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-12 text-center">
        <div className="mb-4 rounded-full bg-purple-100 p-3">
          <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{t.noIcons}</h3>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          {t.noIconsDesc}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5">
      {icons.map((icon) => (
        <div key={icon.id} className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
          <div className="relative aspect-square w-full bg-gray-50 flex items-center justify-center p-4">
            {icon.isLoading ? (
              <div className="flex flex-col items-center gap-3 text-purple-600">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-xs font-medium text-gray-500">{t.generating}</span>
              </div>
            ) : icon.error ? (
              <div className="flex flex-col items-center gap-2 text-red-500 text-center p-4">
                <AlertCircle className="h-8 w-8" />
                <span className="text-xs font-medium">{icon.error}</span>
                <button 
                  onClick={() => onRegenerate(icon.actionId)}
                  className="mt-2 text-xs font-semibold text-purple-600 hover:text-purple-800 underline"
                >
                  {t.retry}
                </button>
              </div>
            ) : icon.imageUrl ? (
              <img 
                src={icon.imageUrl} 
                alt={translateOption(icon.label, lang)} 
                className="h-full w-full object-contain"
                referrerPolicy="no-referrer"
              />
            ) : null}
            
            {/* Hover Actions */}
            {icon.imageUrl && !icon.isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => handleDownload(icon)}
                  className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  {t.save}
                </button>
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-100 bg-white p-3 text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-gray-900">
              {translateOption(icon.label, lang)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
