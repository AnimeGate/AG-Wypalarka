import { SettingsStore } from "./settings/settings-store";

// Get singleton instance of settings store
const settingsStore = SettingsStore.getInstance();

type Language = "pl" | "en";

// Main process translations (subset needed for notifications)
const translations: Record<Language, Record<string, string>> = {
  pl: {
    // Encoding notifications
    notificationEncodingCompleteTitle: "Wypalanie zakończone!",
    notificationEncodingCompleteBody: "Plik {{fileName}} został pomyślnie przetworzony.",

    // Queue notifications
    notificationQueueCompleteTitle: "Kolejka zakończona!",
    notificationQueueCompleteBody: "Przetworzono {{count}} plików.",
    notificationQueueCompleteBody_few: "Przetworzono {{count}} pliki.",
    notificationQueueCompleteBody_many: "Przetworzono {{count}} plików.",
  },
  en: {
    // Encoding notifications
    notificationEncodingCompleteTitle: "Encoding complete!",
    notificationEncodingCompleteBody: "File {{fileName}} has been successfully processed.",

    // Queue notifications
    notificationQueueCompleteTitle: "Queue complete!",
    notificationQueueCompleteBody: "Processed {{count}} file.",
    notificationQueueCompleteBody_plural: "Processed {{count}} files.",
  },
};

interface TranslateOptions {
  count?: number;
  [key: string]: string | number | undefined;
}

/**
 * Get current language from settings store.
 */
function getCurrentLanguage(): Language {
  return settingsStore.getLanguage();
}

/**
 * Handle Polish pluralization rules.
 * Polish has 3 forms: singular (1), few (2-4, 22-24, etc.), many (0, 5-21, 25-31, etc.)
 */
function getPolishPluralKey(count: number, baseKey: string): string {
  if (count === 1) {
    return baseKey;
  }

  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  // 2-4, 22-24, 32-34, etc. (but not 12-14)
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 10 || lastTwoDigits >= 20)) {
    return `${baseKey}_few`;
  }

  // 0, 5-21, 25-31, etc.
  return `${baseKey}_many`;
}

/**
 * Handle English pluralization (simple singular/plural).
 */
function getEnglishPluralKey(count: number, baseKey: string): string {
  return count === 1 ? baseKey : `${baseKey}_plural`;
}

/**
 * Translate a key with optional interpolation and pluralization.
 *
 * @param key - Translation key like "notificationEncodingCompleteTitle"
 * @param options - Optional interpolation values and count for pluralization
 * @returns Translated string
 *
 * @example
 * t("notificationEncodingCompleteTitle")
 * // => "Wypalanie zakończone!" (Polish) or "Encoding complete!" (English)
 *
 * t("notificationEncodingCompleteBody", { fileName: "video.mp4" })
 * // => "Plik video.mp4 został pomyślnie przetworzony."
 *
 * t("notificationQueueCompleteBody", { count: 5 })
 * // => "Przetworzono 5 plików." (Polish) or "Processed 5 files." (English)
 */
export function t(key: string, options?: TranslateOptions): string {
  const language = getCurrentLanguage();
  const langTranslations = translations[language] || translations.pl;

  let translationKey = key;

  // Handle pluralization by modifying the key
  if (options?.count !== undefined) {
    if (language === "pl") {
      const pluralKey = getPolishPluralKey(options.count, key);
      // Check if plural form exists, otherwise use base key
      if (pluralKey in langTranslations) {
        translationKey = pluralKey;
      }
    } else {
      const pluralKey = getEnglishPluralKey(options.count, key);
      // Check if plural form exists, otherwise use base key
      if (pluralKey in langTranslations) {
        translationKey = pluralKey;
      }
    }
  }

  let value = langTranslations[translationKey];

  // Fallback to English if key not found
  if (value === undefined && language !== "en") {
    value = translations.en[translationKey];
  }

  // Still not found, return key
  if (value === undefined) {
    return key;
  }

  // Replace interpolation placeholders {{key}}
  let result = value;
  if (options) {
    for (const [optKey, optValue] of Object.entries(options)) {
      if (optValue !== undefined) {
        result = result.replace(new RegExp(`{{${optKey}}}`, "g"), String(optValue));
      }
    }
  }

  return result;
}
