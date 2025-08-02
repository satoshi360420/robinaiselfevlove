import { SupportedLanguage } from './types';

export const LANGUAGE_OPTIONS = [
  { id: SupportedLanguage.PYTHON, name: 'Python' },
  { id: SupportedLanguage.JAVASCRIPT, name: 'JavaScript' },
  { id: SupportedLanguage.HTML, name: 'HTML' },
  { id: SupportedLanguage.JSON, name: 'JSON' },
];

// Centralized AI Model Names
export const MODEL_GEMINI_FLASH = "gemini-2.5-flash";
export const MODEL_IMAGEN_3 = "imagen-3.0-generate-002";