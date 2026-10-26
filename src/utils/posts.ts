import { getCollection, type CollectionEntry } from "astro:content";
import {
  languages,
  localizePath,
  type Lang,
  type Localized,
} from "../i18n/ui";

export const getVisiblePosts = async (lang: Lang) =>
  (
    await getCollection(
      "blog",
      (post) => post.data.enabled !== false && post.id.startsWith(`${lang}/`)
    )
  ).sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

export const postSlug = (post: CollectionEntry<"blog">) =>
  post.id.split("/").slice(1).join("/");

export const getPostPaths = async (lang: Lang) =>
  (await getVisiblePosts(lang)).map((post) => ({
    params: { slug: postSlug(post) },
    props: { post },
  }));

export const getTranslationPaths = async (translationKey: string) => {
  const translations = await getCollection(
    "blog",
    (post) =>
      post.data.enabled !== false &&
      post.data.translationKey === translationKey
  );

  return Object.fromEntries(
    (Object.keys(languages) as Lang[]).map((lang) => {
      const translation = translations.find((post) =>
        post.id.startsWith(`${lang}/`)
      );

      return [
        lang,
        localizePath(
          lang,
          translation ? `/blog/${postSlug(translation)}` : "/blog"
        ),
      ];
    })
  ) as Localized<string>;
};
