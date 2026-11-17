import type { ColophonContentTranslation } from '@lib/config/colophon';

/**
 * Type definitions for i18n content translations (config/i18n-content.yaml)
 */

export interface SeriesContentTranslation {
  label?: string;
  fullName?: string;
  description?: string;
}

export interface FeaturedCategoryContentTranslation {
  label?: string;
  description?: string;
}

export interface LocaleContentTranslations {
  site?: {
    title?: string;
    name?: string;
    subtitle?: string;
    keywords?: string[];
    description?: string;
  };
  colophon?: ColophonContentTranslation;
  tags?: Record<string, string>;
  friends?: {
    groups?: Record<string, { title?: string; description?: string }>;
    sites?: Record<string, { site?: string; desc?: string }>;
    applyDesc?: string;
  };
  categories?: Record<string, string>;
  series?: Record<string, SeriesContentTranslation>;
  featuredCategories?: Record<string, FeaturedCategoryContentTranslation>;
}

export type I18nContentConfig = Record<string, LocaleContentTranslations>;
