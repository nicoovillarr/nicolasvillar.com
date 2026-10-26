import { getCollection } from "astro:content";

export const getVisiblePosts = async () =>
  (await getCollection("blog"))
    .filter((post) => post.data.enabled !== false)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
