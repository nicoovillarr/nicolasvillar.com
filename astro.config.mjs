// @ts-check
import { defineConfig } from "astro/config";

import tailwindcss from "@tailwindcss/vite";

import mdx from "@astrojs/mdx";

import vercel from "@astrojs/vercel";

import sitemap from "@astrojs/sitemap";

// https://astro.build/config
export default defineConfig({
  site: "https://nicolasvillar.com",

  output: "static",
  adapter: vercel(),

  i18n: {
    locales: ["en", "es"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },

  redirects: {
    "/": "/en/",
    "/blog": "/en/blog",
    "/blog/mi-propio-servidor": "/en/blog/my-home-server",
    "/blog/[...slug]": "/en/blog/[...slug]",
    "/privacidad": "/en/privacy",
    "/rss.xml": "/en/rss.xml",
  },

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    mdx(),
    sitemap({
      filter: (page) => /\/(en|es)\//.test(page),
      i18n: {
        defaultLocale: "en",
        locales: { en: "en-US", es: "es-UY" },
      },
    }),
  ],
});
