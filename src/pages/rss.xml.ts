import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { SITE_DESCRIPTION, SITE_TITLE } from "../consts";
import { getVisiblePosts } from "../utils/posts";

export const GET: APIRoute = async (context) => {
  const posts = await getVisiblePosts();

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
