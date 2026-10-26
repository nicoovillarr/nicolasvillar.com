import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { SITE_TITLE } from "../consts";
import { htmlLang, localizePath, useTranslations, type Lang } from "../i18n/ui";
import { getVisiblePosts, postSlug } from "./posts";

export const rssFeed =
  (lang: Lang): APIRoute =>
  async (context) => {
    const t = useTranslations(lang);
    const posts = await getVisiblePosts(lang);

    return rss({
      title: SITE_TITLE,
      description: t("site.description"),
      site: context.site!,
      customData: `<language>${htmlLang[lang]}</language>`,
      items: posts.map((post) => ({
        title: post.data.title,
        description: post.data.description,
        pubDate: post.data.pubDate,
        categories: [post.data.category, ...(post.data.tags ?? [])],
        link: `${localizePath(lang, `/blog/${postSlug(post)}`)}/`,
      })),
    });
  };
