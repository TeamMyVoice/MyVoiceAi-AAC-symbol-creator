import React from 'react';
import { CharacterAttributes } from '../types';
import { AGES, CLOTHES_COLORS, EYE_COLORS, GENDERS, HAIR_COLORS, HAIR_LENGTHS, SKIN_COLORS, BODY_SIZES } from '../constants';
import { Settings2, User, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { translations, translateOption } from '../translations';
import { Language } from '../App';

interface CustomizerProps {
  attributes: CharacterAttributes;
  onChange: (attributes: CharacterAttributes) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  previewImage: string | null;
  isPreviewGenerating: boolean;
  onUpdatePreview: () => void;
  previewError: string | null;
  lang: Language;
}

export function Customizer({ attributes, onChange, onGenerate, isGenerating, previewImage, isPreviewGenerating, onUpdatePreview, previewError, lang }: CustomizerProps) {
  const t = translations[lang];

  const handleChange = (key: keyof CharacterAttributes, value: string) => {
    onChange({ ...attributes, [key]: value });
  };

  const RangeScale = ({ label, value, options, fieldKey }: { label: string, value: string, options: string[], fieldKey: keyof CharacterAttributes }) => {
    const index = options.indexOf(value);
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">{label}</label>
          <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded">{translateOption(value, lang)}</span>
        </div>
        <input 
          type="range" 
          min={0} 
          max={options.length - 1} 
          value={index !== -1 ? index : 0} 
          onChange={(e) => handleChange(fieldKey, options[parseInt(e.target.value)])}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
          disabled={isGenerating}
        />
        <div className="flex justify-between text-[10px] text-gray-400 px-1">
          <span>{translateOption(options[0], lang)}</span>
          <span>{translateOption(options[options.length - 1], lang)}</span>
        </div>
      </div>
    );
  };

  const SelectField = ({ label, value, options, fieldKey }: { label: string, value: string, options: string[], fieldKey: keyof CharacterAttributes }) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <select
        value={value}
        onChange={(e) => handleChange(fieldKey, e.target.value)}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:bg-gray-100 disabled:text-gray-500"
        disabled={isGenerating}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{translateOption(opt, lang)}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="flex w-full flex-col gap-6 rounded-xl bg-white p-6 shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 border-b border-gray-100 pb-4">
        <Settings2 className="h-5 w-5 text-purple-600" />
        <h2 className="text-lg font-semibold text-gray-900">{t.characterSettings}</h2>
      </div>

      {/* Preview Section */}
      <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-100 relative overflow-hidden">
        <div className="flex justify-between items-center w-full mb-3">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.templatePreview}</div>
          <button 
            onClick={onUpdatePreview} 
            disabled={isPreviewGenerating || isGenerating}
            className="text-xs flex items-center gap-1 text-purple-600 hover:text-purple-800 disabled:opacity-50"
            title={t.updatePreview}
          >
            <RefreshCw className={`h-3 w-3 ${isPreviewGenerating ? 'animate-spin' : ''}`} />
            {t.updatePreview}
          </button>
        </div>
        
        <div className="relative w-40 h-40 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center overflow-hidden">
          {isPreviewGenerating ? (
            <div className="flex flex-col items-center gap-2 text-purple-600">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-[10px] font-medium text-gray-500">{t.updating}</span>
            </div>
          ) : previewError ? (
            <div className="flex flex-col items-center gap-2 text-red-500 text-center p-2">
              <AlertCircle className="h-6 w-6" />
              <span className="text-[10px] font-medium leading-tight">{previewError}</span>
            </div>
          ) : previewImage ? (
            <img src={previewImage} alt="Character Preview" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          ) : (
            <User className="h-12 w-12 text-gray-300" />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
        <RangeScale label={t.bodySize} value={attributes.bodySize} options={BODY_SIZES} fieldKey="bodySize" />
        <SelectField label={t.age} value={attributes.age} options={AGES} fieldKey="age" />
        <SelectField label={t.gender} value={attributes.gender} options={GENDERS} fieldKey="gender" />
        <SelectField label={t.skinColor} value={attributes.skinColor} options={SKIN_COLORS} fieldKey="skinColor" />
        <SelectField label={t.hairLength} value={attributes.hairLength} options={HAIR_LENGTHS} fieldKey="hairLength" />
        {attributes.hairLength !== 'Bald' && (
          <SelectField label={t.hairColor} value={attributes.hairColor} options={HAIR_COLORS} fieldKey="hairColor" />
        )}
        <SelectField label={t.eyeColor} value={attributes.eyeColor} options={EYE_COLORS} fieldKey="eyeColor" />
        <SelectField label={t.clothesColor} value={attributes.clothesColor} options={CLOTHES_COLORS} fieldKey="clothesColor" />
      </div>

      <div className="pt-2">
        <button
          onClick={onGenerate}
          disabled={isGenerating || isPreviewGenerating}
          className="w-full rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-purple-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? t.generating : t.generateBoard}
        </button>
      </div>
    </div>
  );
}
