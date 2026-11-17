import GiscusComponent from '@giscus/react';
import { useTranslation } from '@hooks/useTranslation';
import { useEffect, useState } from 'react';
import { commentConfig } from '@/constants/site-config';
import { getHtmlLang } from '@/i18n/utils';

function getTheme(): string {
  const mode = document.documentElement.classList.contains('dark') ? 'dark' : 'light';
  // The public CSS assets are built from the same palette as the parent page.
  // HTTP development previews use Giscus's built-in theme (HTTPS frames block HTTP styles).
  return window.location.protocol === 'https:' ? new URL(`/theme/giscus-${mode}.css`, window.location.origin).href : mode;
}

export default function Giscus() {
  const config = commentConfig.giscus;
  const { locale } = useTranslation();
  const [theme, setTheme] = useState('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(getTheme());

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const newTheme = getTheme();
          setTheme(newTheme);
        }
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  if (!mounted || !config?.repo) return null;

  const [owner, repo] = config.repo.split('/');
  if (!owner || !repo) {
    console.error('[Giscus] Invalid repo format. Expected "owner/repo"');
    return null;
  }

  return (
    <GiscusComponent
      host={config?.host}
      repo={config.repo}
      repoId={config.repoId}
      category={config?.category}
      categoryId={config?.categoryId}
      mapping={config?.mapping ?? 'pathname'}
      term={config?.term}
      strict={config?.strict}
      reactionsEnabled={config?.reactionsEnabled}
      emitMetadata={config?.emitMetadata}
      inputPosition={config?.inputPosition ?? 'top'}
      theme={config?.theme ?? theme}
      lang={config?.lang ?? getHtmlLang(locale)}
      loading={config?.loading ?? 'lazy'}
    />
  );
}
