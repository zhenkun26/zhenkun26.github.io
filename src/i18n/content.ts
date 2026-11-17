/**
 * i18n Content Translation Loader
 *
 * Loads content-level translations (category names, series fields, featured category fields)
 * from config/i18n-content.yaml. These are user-configurable strings separate from UI strings.
 *
 * Lookup: YAML content config → caller provides fallback
 */

import i18nContent from '../../config/i18n-content.yaml';
import type { I18nContentConfig } from './content-types';

const config = i18nContent as I18nContentConfig;

/** Site copy overrides; callers fall back to the default site configuration. */
export function getContentSite(locale: string) {
  return config[locale]?.site;
}

/** Translate the display name without changing the tag's identity or URL. */
export function getContentTagName(locale: string, tag: string): string {
  return config[locale]?.tags?.[tag] ?? tag;
}

/** Friend-page copy keyed by stable group IDs and site URLs. */
export function getContentFriends(locale: string) {
  return config[locale]?.friends;
}

/**
 * Look up a translated category name from the YAML content config.
 * Returns undefined if no translation is defined for the given locale/slug.
 */
export function getContentCategoryName(locale: string, slug: string): string | undefined {
  return config[locale]?.categories?.[slug];
}

/**
 * Look up a translated series field (label, fullName, description) from the YAML content config.
 * Returns undefined if no translation is defined.
 */
export function getContentSeriesField(locale: string, slug: string, field: string): string | undefined {
  const series = config[locale]?.series?.[slug];
  if (!series) return undefined;
  return series[field as keyof typeof series];
}

/**
 * Look up a translated featured category field (label, description) from the YAML content config.
 * The `link` parameter matches the `link` field in featuredCategories config (e.g. 'life', 'note/front-end').
 */
export function getContentFeaturedCategoryField(locale: string, link: string, field: string): string | undefined {
  const cat = config[locale]?.featuredCategories?.[link];
  if (!cat) return undefined;
  return cat[field as keyof typeof cat];
}

/** Colophon group/mark overrides for a locale (`<locale>.colophon` in the YAML content config). */
export function getContentColophon(locale: string) {
  return config[locale]?.colophon;
}
