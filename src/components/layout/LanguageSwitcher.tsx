/** A shared, locale-aware segmented control for desktop and mobile navigation. */

import { navigate } from 'astro:transitions/client';
import { isMotionDisabled } from '@lib/motion-level';
import { cn } from '@lib/utils';
import { type CSSProperties, memo, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { getAlternateUrl, getLocaleFromUrl, localeEntries, t } from '@/i18n';
import '@/styles/components/language-switcher.css';

const SLIDE_DURATION = 260;

function subscribePathname(callback: () => void) {
  document.addEventListener('astro:page-load', callback);
  return () => document.removeEventListener('astro:page-load', callback);
}

function getPathname() {
  return window.location.pathname;
}

interface LanguageSwitcherProps {
  /** The rendered page path also supplies the matching SSR/hydration snapshot. */
  currentPath: string;
  className?: string;
}

function LanguageSwitcherComponent({ currentPath: serverPath, className }: LanguageSwitcherProps) {
  const currentPath = useSyncExternalStore(subscribePathname, getPathname, () => serverPath);
  const locale = getLocaleFromUrl(currentPath);
  const [pendingLocale, setPendingLocale] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigation = useRef<Promise<void> | null>(null);

  useEffect(() => {
    const cancelPendingNavigation = () => {
      if (timer.current !== null) clearTimeout(timer.current);
      timer.current = null;
    };
    const syncSelection = () => {
      cancelPendingNavigation();
      setPendingLocale(null);
    };
    // Another link or history navigation must not be interrupted by a delayed locale change.
    document.addEventListener('astro:before-preparation', cancelPendingNavigation);
    document.addEventListener('astro:page-load', syncSelection);
    return () => {
      cancelPendingNavigation();
      document.removeEventListener('astro:before-preparation', cancelPendingNavigation);
      document.removeEventListener('astro:page-load', syncSelection);
    };
  }, []);

  if (localeEntries.length <= 1) return null;

  const selectedIndex = Math.max(
    0,
    localeEntries.findIndex((entry) => entry.code === (pendingLocale ?? locale)),
  );

  return (
    <nav
      className={cn('language-switcher', className)}
      aria-label={t(locale, 'common.language')}
      style={
        {
          '--language-count': localeEntries.length,
          '--language-index': selectedIndex,
          '--language-duration': `${SLIDE_DURATION}ms`,
        } as CSSProperties
      }
    >
      <span className="language-switcher-thumb" aria-hidden="true" />
      {localeEntries.map((entry) => (
        <a
          key={entry.code}
          className="language-switcher-option"
          href={getAlternateUrl(currentPath, entry.code)}
          hrefLang={entry.code}
          lang={entry.code}
          aria-label={entry.code === 'en' ? 'English' : entry.label}
          aria-current={entry.code === locale ? 'true' : undefined}
          data-selected={entry.code === (pendingLocale ?? locale)}
          onClick={(event) => {
            // Retain native links for opening another tab and for readers without JavaScript.
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            if (pendingLocale === entry.code) return;
            if (timer.current !== null) clearTimeout(timer.current);
            timer.current = null;
            const link = event.currentTarget;
            const followLink = () => {
              timer.current = null;
              const request = navigate(link.href, { sourceElement: link });
              navigation.current = request;
              const settle = () => {
                if (navigation.current !== request) return;
                navigation.current = null;
                setPendingLocale(null);
              };
              void request.then(settle, settle);
            };
            // A second choice during a fetch must supersede it, even if it selects the old locale.
            if (navigation.current !== null) {
              setPendingLocale(entry.code);
              followLink();
              return;
            }
            if (entry.code === locale) {
              setPendingLocale(null);
              return;
            }
            setPendingLocale(entry.code);
            // Finish the slide before Astro replaces the page (and closes the mobile drawer).
            timer.current = setTimeout(followLink, isMotionDisabled() ? 0 : SLIDE_DURATION);
          }}
        >
          {entry.code === 'en' ? 'EN' : entry.code === 'zh' ? '中文' : entry.label}
        </a>
      ))}
    </nav>
  );
}

export default memo(LanguageSwitcherComponent);
