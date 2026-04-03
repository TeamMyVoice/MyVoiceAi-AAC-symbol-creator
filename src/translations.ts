export const translations = {
  en: {
    mainTitle: "MyVoice Ai",
    title: "AAC Symbol Creator",
    subtitle: "Clinical Grade Vector Icons",
    characterSettings: "Character Settings",
    templatePreview: "Template Preview",
    updating: "Updating...",
    generateBoard: "Generate AAC Board",
    generating: "Generating Icons...",
    yourSymbolBoard: "Your Symbol Board",
    boardDesc: "High-contrast, minimalistic symbols designed for Augmentative and Alternative Communication.",
    noIcons: "No icons generated yet",
    noIconsDesc: "Customize your character settings and click \"Generate AAC Board\" to create a set of communication symbols.",
    save: "Save",
    retry: "Retry",
    bodySize: "Body Size",
    age: "Age",
    gender: "Gender",
    skinColor: "Skin Color",
    hairLength: "Hair Length",
    hairColor: "Hair Color",
    eyeColor: "Eye Color",
    clothesColor: "Clothes Color",
    rateLimit: "Rate limit exceeded. Please wait.",
    previewError: "Preview failed",
    updatePreview: "Update Preview"
  },
  he: {
    mainTitle: "קול עולמי",
    title: "יוצר סמלי תת״ח",
    subtitle: "אייקונים וקטוריים ברמה קלינית",
    characterSettings: "הגדרות דמות",
    templatePreview: "תצוגה מקדימה",
    updating: "מעדכן...",
    generateBoard: "צור לוח תת״ח",
    generating: "יוצר אייקונים...",
    yourSymbolBoard: "לוח הסמלים שלך",
    boardDesc: "סמלים מינימליסטיים בעלי ניגודיות גבוהה המיועדים לתקשורת תומכת וחליפית.",
    noIcons: "טרם נוצרו אייקונים",
    noIconsDesc: "התאם אישית את הגדרות הדמות ולחץ על \"צור לוח תת״ח\" כדי ליצור סט סמלי תקשורת.",
    save: "שמור",
    retry: "נסה שוב",
    bodySize: "מבנה גוף",
    age: "גיל",
    gender: "מגדר",
    skinColor: "צבע עור",
    hairLength: "אורך שיער",
    hairColor: "צבע שיער",
    eyeColor: "צבע עיניים",
    clothesColor: "צבע בגדים",
    rateLimit: "חריגה ממגבלת הקצב. אנא המתן.",
    previewError: "התצוגה המקדימה נכשלה",
    updatePreview: "עדכן תצוגה מקדימה"
  }
};

const optionTranslations: Record<string, string> = {
  // Genders
  'Male': 'זכר',
  'Female': 'נקבה',
  'Non-binary': 'א-בינארי',
  // Ages
  'Child': 'ילד',
  'Teen': 'נער',
  'Adult': 'מבוגר',
  // Skin Colors
  'Light': 'בהיר',
  'Medium Light': 'בהיר-בינוני',
  'Medium': 'בינוני',
  'Medium Dark': 'כהה-בינוני',
  'Dark': 'כהה',
  // Hair Colors
  'Black': 'שחור',
  'Brown': 'חום',
  'Blonde': 'בלונדיני',
  'Red': 'אדום',
  'Gray': 'אפור',
  'White': 'לבן',
  // Hair Lengths
  'Bald': 'קירח',
  'Short': 'קצר',
  'Long': 'ארוך',
  // Eye Colors
  'Blue': 'כחול',
  'Green': 'ירוק',
  'Hazel': 'לוז',
  // Clothes Colors
  'Yellow': 'צהוב',
  'Orange': 'כתום',
  'Purple': 'סגול',
  'Pink': 'ורוד',
  'Teal': 'טורקיז',
  'Navy': 'כחול כהה',
  // Body Sizes
  'Slim': 'רזה',
  'Average': 'ממוצע',
  'Chubby': 'מלא',
  'Plus Size': 'מידה גדולה',
  
  // Actions
  'Happy': 'שמח',
  'Sad': 'עצוב',
  'Angry': 'כועס',
  'Tired': 'עייף',
  'Hurt': 'כואב',
  'Yes': 'כן',
  'No': 'לא',
  'Want': 'רוצה',
  'Stop': 'עצור',
  'More': 'עוד',
  'Eating': 'אוכל',
  'Drinking': 'שותה',
  'Holding': 'מחזיק',
  'Raising Hands': 'מרים ידיים',
  'Pointing Outward': 'מצביע החוצה',
  'Pointing at Self': 'מצביע על עצמו',
  'Walking': 'הולך',
  'Jumping': 'קופץ',
  'Sleeping': 'ישן',
  'Sitting': 'יושב',
  'Writing': 'כותב',
};

export const translateOption = (opt: string, lang: 'en' | 'he') => {
  if (lang === 'en') return opt;
  return optionTranslations[opt] || opt;
};
