export type Translations = Record<string, Record<string, string>>;
export type TranslationKey = `${string}.${string}`;

export const getTranslator =
    (translations: Translations, fallback?: Translations) =>
    (_key: TranslationKey): string => {
        const [context, key] = _key.split('.');
        if (!context || !key) return _key;

        const translation = translations?.[context]?.[key] ?? fallback?.[context]?.[key];
        if (!translation) throw new Error(`Translation not found: ${_key}`);
        return translation;
    };
