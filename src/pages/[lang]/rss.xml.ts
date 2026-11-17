import rss from '@astrojs/rss';
import { siteConfig } from '@constants/site-config';
import { getCategoryArr, getPostSlug, getSortedPosts, translateCategoryName } from '@lib/content';
import { encodeSlug } from '@lib/route';
import { buildRssItemFields } from '@lib/rss-utils';
import type { APIContext } from 'astro';
import type { BlogPost } from 'types/blog';
import { getHtmlLang, localizedPath } from '@/i18n';
import { getContentSite, getContentTagName } from '@/i18n/content';
import { getLocaleStaticPaths } from '../_shared/utils';

export const getStaticPaths = getLocaleStaticPaths;

export async function GET(context: APIContext) {
  const lang = context.params.lang as string;
  const posts = await getSortedPosts(lang);
  const { site } = context;

  if (!site) {
    throw new Error('Missing site metadata');
  }

  const copy = getContentSite(lang);
  const response = await rss({
    title: copy?.title ?? siteConfig.title,
    description: copy?.subtitle ?? (siteConfig.subtitle || 'No description'),
    site: new URL(localizedPath('/', lang), site),
    trailingSlash: false,
    customData: `<language>${getHtmlLang(lang)}</language>`,
    stylesheet: localizedPath('/rss/feed.xsl', lang),
    items: posts.slice(0, 20).map((post: BlogPost) => {
      const categoryArr = getCategoryArr(post.data.categories?.[0]);
      const categories = [
        ...(categoryArr || []).map((cat) => `category:${translateCategoryName(cat, lang)}`),
        ...(post.data.tags || []).map((tag) => `tag:${getContentTagName(lang, tag)}`),
      ];

      const postSlug = getPostSlug(post);
      const postLink = localizedPath(`/post/${encodeSlug(postSlug)}`, lang);
      const { title, description, content } = buildRssItemFields(post, lang);

      return {
        title,
        pubDate: post.data.date,
        description,
        link: postLink,
        content,
        categories,
        customData: `<guid isPermaLink="false">${lang}:${postSlug}</guid>`,
      };
    }),
  });

  const headers = new Headers(response.headers);
  headers.set('Content-Type', 'application/xml; charset=utf-8');
  return new Response(response.body, {
    status: response.status,
    headers,
  });
}
