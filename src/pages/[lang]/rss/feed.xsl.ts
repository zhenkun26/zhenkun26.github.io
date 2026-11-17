import type { APIContext } from 'astro';
import { getLocaleStaticPaths } from '../../_shared/utils';
import { renderFeedStylesheet } from '../../rss/feed.xsl';

export const getStaticPaths = getLocaleStaticPaths;

export function GET({ props }: APIContext<{ locale: string }>) {
  return renderFeedStylesheet(props.locale);
}
