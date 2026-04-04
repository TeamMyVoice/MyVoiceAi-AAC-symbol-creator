import React, { useState, useEffect } from 'react';
import { Customizer } from './components/Customizer';
import { IconGrid } from './components/IconGrid';
import { CharacterAttributes, GeneratedIcon } from './types';
import { AAC_ACTIONS } from './constants';
import { generateIconImage } from './services/ai';
import { MessageSquare, Globe, Download, LogIn, LogOut } from 'lucide-react';
import { translations, translateOption } from './translations';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { auth, db, signInWithGoogle, logOut } from './firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

export type Language = 'en' | 'he';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo?: any[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const getAttributesHash = (attrs: CharacterAttributes) => {
  return `${attrs.gender}_${attrs.age}_${attrs.skinColor}_${attrs.hairLength}_${attrs.hairColor || 'none'}_${attrs.eyeColor}_${attrs.clothesColor}_${attrs.bodySize}`.replace(/[^a-zA-Z0-9]/g, '');
};

const PRESETS = [
  {
    labelEn: 'Boy (Brown Hair)',
    labelHe: 'בן (שיער חום)',
    attributes: { gender: 'Male', age: 'Child', skinColor: 'Medium Light', hairColor: 'Brown', hairLength: 'Short', eyeColor: 'Brown', clothesColor: 'Blue', bodySize: 'Average' }
  },
  {
    labelEn: 'Boy (Blonde Hair)',
    labelHe: 'בן (שיער בלונדיני)',
    attributes: { gender: 'Male', age: 'Child', skinColor: 'Medium Light', hairColor: 'Blonde', hairLength: 'Short', eyeColor: 'Blue', clothesColor: 'Blue', bodySize: 'Average' }
  },
  {
    labelEn: 'Girl (Brown Hair)',
    labelHe: 'בת (שיער חום)',
    attributes: { gender: 'Female', age: 'Child', skinColor: 'Medium Light', hairColor: 'Brown', hairLength: 'Long', eyeColor: 'Brown', clothesColor: 'Blue', bodySize: 'Average' }
  },
  {
    labelEn: 'Girl (Blonde Hair)',
    labelHe: 'בת (שיער בלונדיני)',
    attributes: { gender: 'Female', age: 'Child', skinColor: 'Medium Light', hairColor: 'Blonde', hairLength: 'Long', eyeColor: 'Blue', clothesColor: 'Blue', bodySize: 'Average' }
  }
];

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];

  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

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
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

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

  const generateBoard = async (targetAttributes: CharacterAttributes) => {
    if (!user) {
      alert(lang === 'en' ? 'Please sign in to generate and save characters.' : 'אנא התחבר כדי ליצור ולשמור דמויות.');
      return;
    }

    setIsGenerating(true);
    
    const hash = getAttributesHash(targetAttributes);
    const docRef = doc(db, 'character_boards', hash);
    let existingIcons: Record<string, string> = {};

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        existingIcons = docSnap.data().icons || {};
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `character_boards/${hash}`);
    }

    // Initialize the grid with loading states or existing icons
    const initialIcons: GeneratedIcon[] = AAC_ACTIONS.map(action => ({
      id: `${action.id}-${Date.now()}`,
      actionId: action.id,
      label: action.label,
      imageUrl: existingIcons[action.id] || null,
      isLoading: !existingIcons[action.id],
      error: null,
    }));
    
    setIcons(initialIcons);

    const newlyGeneratedIcons: Record<string, string> = {};

    // Generate missing icons sequentially
    for (let i = 0; i < AAC_ACTIONS.length; i++) {
      const action = AAC_ACTIONS[i];
      if (existingIcons[action.id]) continue; // Skip if already in DB

      try {
        const imageUrl = await generateIconImage(targetAttributes, action.action);
        newlyGeneratedIcons[action.id] = imageUrl;
        setIcons(prev => prev.map(icon => 
          icon.actionId === action.id 
            ? { ...icon, imageUrl, isLoading: false } 
            : icon
        ));
        
        // Add a 4.2s delay between requests to respect the 15 RPM free tier limit
        if (i < AAC_ACTIONS.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 4200));
        }
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
    
    // Save newly generated icons to DB
    if (Object.keys(newlyGeneratedIcons).length > 0) {
      try {
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          await updateDoc(docRef, {
            icons: { ...existingIcons, ...newlyGeneratedIcons },
            updatedAt: serverTimestamp()
          });
        } else {
          await setDoc(docRef, {
            attributesHash: hash,
            attributes: targetAttributes,
            icons: newlyGeneratedIcons,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `character_boards/${hash}`);
      }
    }

    setIsGenerating(false);
  };

  const handleLoadPreset = async (preset: typeof PRESETS[0]) => {
    setAttributes(preset.attributes as CharacterAttributes);
    
    const hash = getAttributesHash(preset.attributes as CharacterAttributes);
    const docRef = doc(db, 'character_boards', hash);
    let existingIcons: Record<string, string> = {};
    
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        existingIcons = docSnap.data().icons || {};
      }
    } catch (error) {
      console.error("Failed to fetch preset from DB", error);
    }

    const newIcons: GeneratedIcon[] = AAC_ACTIONS.map(action => ({
      id: `${action.id}-${Date.now()}`,
      actionId: action.id,
      label: action.label,
      imageUrl: existingIcons[action.id] || null,
      isLoading: false,
      error: null,
    }));
    
    setIcons(newIcons);
  };

  const handleGenerateAll = () => generateBoard(attributes);

  const handleRegenerateSingle = async (actionId: string) => {
    if (!user) {
      alert(lang === 'en' ? 'Please sign in to generate and save characters.' : 'אנא התחבר כדי ליצור ולשמור דמויות.');
      return;
    }

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

      // Update DB
      const hash = getAttributesHash(attributes);
      const docRef = doc(db, 'character_boards', hash);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const currentIcons = docSnap.data().icons || {};
        await updateDoc(docRef, {
          icons: { ...currentIcons, [actionId]: imageUrl },
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(docRef, {
          attributesHash: hash,
          attributes,
          icons: { [actionId]: imageUrl },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
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

  const handleDownloadAll = async () => {
    const completedIcons = icons.filter(icon => icon.imageUrl && !icon.isLoading && !icon.error);
    if (completedIcons.length === 0) return;

    setIsDownloadingAll(true);
    try {
      const zip = new JSZip();
      const folder = zip.folder("aac-symbols");

      if (!folder) throw new Error("Could not create zip folder");

      // Fetch all images and add to zip
      const promises = completedIcons.map(async (icon) => {
        if (!icon.imageUrl) return;
        const response = await fetch(icon.imageUrl);
        const blob = await response.blob();
        const translatedName = translateOption(icon.label, lang);
        folder.file(`aac-${translatedName}.png`, blob);
      });

      await Promise.all(promises);

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "aac-symbols.zip");
    } catch (error) {
      console.error("Failed to download zip:", error);
      alert("Failed to download zip file. Please try downloading individually.");
    } finally {
      setIsDownloadingAll(false);
    }
  };

  const toggleLanguage = () => {
    setLang(prev => prev === 'en' ? 'he' : 'en');
  };

  const completedIconsCount = icons.filter(icon => icon.imageUrl && !icon.isLoading && !icon.error).length;

  if (!isAuthReady) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>;
  }

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
              <button 
                onClick={toggleLanguage}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-sm font-medium transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span className="hidden sm:inline">{lang === 'en' ? 'עברית' : 'English'}</span>
              </button>
              
              {user ? (
                <button 
                  onClick={logOut}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md text-gray-600 hover:bg-gray-100 text-sm font-medium transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{lang === 'en' ? 'Sign Out' : 'התנתק'}</span>
                </button>
              ) : (
                <button 
                  onClick={signInWithGoogle}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-purple-600 text-white hover:bg-purple-700 text-sm font-medium transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  <span className="hidden sm:inline">{lang === 'en' ? 'Sign In' : 'התחבר'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!user && (
          <div className="mb-8 bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
            <p className="text-purple-800 font-medium">
              {lang === 'en' 
                ? 'Please sign in to generate, save, and access community characters from the database.' 
                : 'אנא התחבר כדי ליצור, לשמור ולגשת לדמויות קהילה ממאגר הנתונים.'}
            </p>
          </div>
        )}
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-80 flex-shrink-0">
            <div className="sticky top-24">
              <div className="mb-6 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
                  {lang === 'en' ? 'Basic Characters' : 'דמויות בסיסיות'}
                </h3>
                <div className="flex flex-col gap-2">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleLoadPreset(preset)}
                      className="text-left px-4 py-2.5 text-sm rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition-colors border border-blue-100"
                    >
                      {lang === 'en' ? preset.labelEn : preset.labelHe}
                    </button>
                  ))}
                </div>
              </div>

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
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{t.yourSymbolBoard}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  {t.boardDesc}
                </p>
              </div>
              
              {completedIconsCount > 0 && (
                <button
                  onClick={handleDownloadAll}
                  disabled={isDownloadingAll}
                  className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  <Download className={`h-4 w-4 ${isDownloadingAll ? 'animate-bounce' : ''}`} />
                  {isDownloadingAll ? t.updating : (lang === 'en' ? 'Choose & Download Packet' : 'בחר והורד חבילה')}
                </button>
              )}
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
