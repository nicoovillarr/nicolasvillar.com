import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";

export const prerender = true;

export const GET: APIRoute = async (context) => {
  const posts = (await getCollection("blog"))
    .filter((post) => post.data.enabled !== false)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    customData: "<language>es-UY</language>",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      categories: [post.data.category, ...(post.data.tags ?? [])],
      link: `/blog/${post.id}/`,
    })),
  });
};
