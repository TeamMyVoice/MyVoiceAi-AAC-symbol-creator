import React, { useState, useEffect } from 'react';
import { Customizer } from './components/Customizer';
import { IconGrid } from './components/IconGrid';
import { CharacterAttributes, GeneratedIcon } from './types';
import { AAC_ACTIONS } from './constants';
import { generateIconImage } from './services/ai';
import { MessageSquare, Globe } from 'lucide-react';
import { translations } from './translations';

export type Language = 'en' | 'he';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  const [attributes, setAttributes] = useState<CharacterAttributes>({
    gender: 'Male',
    age: 'Child',
    skinColor: 'Medium Light',
    hairColor: 'Brown',
    hairLength: 'Short',
    eyeColor: 'Brown',
    clothesColor: 'Blue',
    bodySize: 'Average',
  });

  const [icons, setIcons] = useState<GeneratedIcon[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isPreviewGenerating, setIsPreviewGenerating] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewCache, setPreviewCache] = useState<Record<string, string>>({});

  const generatePreview = async () => {
    const cacheKey = JSON.stringify(attributes);
    if (previewCache[cacheKey]) {
      setPreviewImage(previewCache[cacheKey]);
      setPreviewError(null);
      return;
    }

    setIsPreviewGenerating(true);
    setPreviewError(null);
    try {
      const imageUrl = await generateIconImage(attributes, 'looking neutral with a slight smile');
      setPreviewImage(imageUrl);
      setPreviewCache(prev => ({ ...prev, [cacheKey]: imageUrl }));
    } catch (error: any) {
      console.error('Failed to generate preview:', error);
      if (error?.message?.includes('429') || error?.message?.includes('quota') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        setPreviewError(t.rateLimit);
      } else {
        setPreviewError(t.previewError);
      }
    } finally {
      setIsPreviewGenerating(false);
    }
  };

  // Auto-update preview when attributes change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generatePreview();
    }, 1500); // 1.5s debounce

    return () => {
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributes]);

  const handleGenerateAll = async () => {
    setIsGenerating(true);
    
    // Initialize the grid with loading states
    const initialIcons: GeneratedIcon[] = AAC_ACTIONS.map(action => ({
      id: `${action.id}-${Date.now()}`,
      actionId: action.id,
      label: action.label,
      imageUrl: null,
      isLoading: true,
      error: null,
    }));
    
    setIcons(initialIcons);

    // Generate each icon sequentially to avoid rate limits
    for (let i = 0; i < AAC_ACTIONS.length; i++) {
      const action = AAC_ACTIONS[i];
      try {
        const imageUrl = await generateIconImage(attributes, action.action);
        setIcons(prev => prev.map(icon => 
          icon.actionId === action.id 
            ? { ...icon, imageUrl, isLoading: false } 
            : icon
        ));
      } catch (error: any) {
        console.error(`Failed to generate icon for ${action.label}:`, error);
        const errorMsg = error?.message?.includes('429') ? t.rateLimit : t.previewError;
        setIcons(prev => prev.map(icon => 
          icon.actionId === action.id 
            ? { ...icon, isLoading: false, error: errorMsg } 
            : icon
        ));
      }
    }
    
    setIsGenerating(false);
  };

  const handleRegenerateSingle = async (actionId: string) => {
    const action = AAC_ACTIONS.find(a => a.id === actionId);
    if (!action) return;

    setIcons(prev => prev.map(icon => 
      icon.actionId === actionId 
        ? { ...icon, isLoading: true, error: null } 
        : icon
    ));

    try {
      const imageUrl = await generateIconImage(attributes, action.action);
      setIcons(prev => prev.map(icon => 
        icon.actionId === actionId 
          ? { ...icon, imageUrl, isLoading: false } 
          : icon
      ));
    } catch (error: any) {
      console.error(`Failed to regenerate icon for ${action.label}:`, error);
      const errorMsg = error?.message?.includes('429') ? t.rateLimit : t.previewError;
      setIcons(prev => prev.map(icon => 
        icon.actionId === actionId 
          ? { ...icon, isLoading: false, error: errorMsg } 
          : icon
      ));
    }
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'he' : 'en');
  };

  // When embedded as an iframe in the main app, send the preview image + all icons to the parent
  const isEmbedded = window.self !== window.top;
  const hasGeneratedIcons = icons.some(i => i.imageUrl);

  const buildAndSendToParent = () => {
    const imgSrc = previewImage ?? icons.find(i => i.imageUrl)?.imageUrl ?? null;
    if (!imgSrc) return;
    const iconMap: Record<string, string> = {};
    icons.forEach(icon => {
      if (icon.imageUrl) iconMap[icon.actionId] = icon.imageUrl;
    });
    window.parent.postMessage({ imageDataUrl: imgSrc, iconMap }, '*');
  };

  const handleSaveToParent = buildAndSendToParent;

  // Auto-send to parent once all icons finish generating (no manual click needed)
  useEffect(() => {
    if (!isEmbedded) return;
    if (isGenerating) return;
    if (icons.length === 0) return;
    if (icons.some(i => i.isLoading)) return;
    if (!icons.some(i => i.imageUrl)) return;
    buildAndSendToParent();
    // Only fire once per generation batch
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating]);

  return (
    <div className={`min-h-screen bg-gray-50 text-gray-900 font-sans ${lang === 'he' ? 'rtl' : 'ltr'}`} dir={lang === 'he' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between relative">
            <div className="flex items-center gap-3 w-1/3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900">{t.mainTitle}</h1>
            </div>
            
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center w-1/3 text-center hidden sm:flex">
              <span className="text-sm font-bold text-purple-600 uppercase tracking-wider">{t.title}</span>
              <span className="text-xs text-gray-500 font-medium">{t.subtitle}</span>
            </div>

            <div className="flex items-center justify-end gap-4 w-1/3">
              {isEmbedded && (previewImage || hasGeneratedIcons) && (
                <button
                  onClick={handleSaveToParent}
                  className="flex items-center gap-2 px-4 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors"
                >
                  {lang === 'he' ? 'שמור דמות ✓' : 'Save Character ✓'}
                </button>
              )}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors"
              >
                <Globe className="h-4 w-4" />
                {lang === 'en' ? 'עברית' : 'English'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <Customizer 
                attributes={attributes} 
                onChange={setAttributes} 
                onGenerate={handleGenerateAll}
                isGenerating={isGenerating}
                previewImage={previewImage}
                isPreviewGenerating={isPreviewGenerating}
                onUpdatePreview={generatePreview}
                previewError={previewError}
                lang={lang}
              />
            </div>
          </div>

          {/* Grid Area */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{t.yourSymbolBoard}</h2>
              <p className="mt-1 text-sm text-gray-500">
                {t.boardDesc}
              </p>
            </div>
            <IconGrid 
              icons={icons} 
              onRegenerate={handleRegenerateSingle} 
              lang={lang}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
