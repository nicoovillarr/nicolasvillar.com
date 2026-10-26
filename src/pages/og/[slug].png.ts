import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import type { APIRoute, GetStaticPaths } from "astro";
import satori from "satori";
import {
  HOME_OG_SLUG,
  SITE_DESCRIPTION,
  SITE_ROLE,
  SITE_TITLE,
} from "../../consts";
import { getVisiblePosts } from "../../utils/posts";

const FONTS_DIR = join(
  process.cwd(),
  "node_modules/@fontsource/newsreader/files"
);

const loadFont = (weight: 400 | 600) =>
  readFile(join(FONTS_DIR, `newsreader-latin-${weight}-normal.woff`));

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await getVisiblePosts();

  return [
    {
      params: { slug: HOME_OG_SLUG },
      props: { eyebrow: SITE_ROLE, title: SITE_TITLE, subtitle: SITE_DESCRIPTION },
    },
    ...posts.map((post) => ({
      params: { slug: post.id },
      props: {
        eyebrow: post.data.category,
        title: post.data.title,
        subtitle: "",
      },
    })),
  ];
};

const text = (value: string, style: Record<string, unknown>) => ({
  type: "div",
  props: { style: { display: "flex", ...style }, children: value },
});

export const GET: APIRoute = async ({ props }) => {
  const { eyebrow, title, subtitle } = props as {
    eyebrow: string;
    title: string;
    subtitle: string;
  };

  const [regular, semibold] = await Promise.all([loadFont(400), loadFont(600)]);

  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#ffffff",
          borderTop: "16px solid #1f2937",
          fontFamily: "Newsreader",
          color: "#111827",
        },
        children: [
          {
            type: "div",
            props: {
              style: { display: "flex", flexDirection: "column", gap: "24px" },
              children: [
                text(eyebrow.toUpperCase(), {
                  fontSize: 28,
                  letterSpacing: "0.08em",
                  color: "#5d636e",
                }),
                text(title, {
                  fontSize: title.length > 60 ? 64 : 76,
                  fontWeight: 600,
                  lineHeight: 1.1,
                }),
                ...(subtitle
                  ? [text(subtitle, { fontSize: 34, color: "#4b5563" })]
                  : []),
              ],
            },
          },
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                justifyContent: "space-between",
                fontSize: 30,
                color: "#4b5563",
              },
              children: [
                text(SITE_TITLE, { fontWeight: 600, color: "#111827" }),
                text("nicolasvillar.com", {}),
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Newsreader", data: regular, weight: 400, style: "normal" },
        { name: "Newsreader", data: semibold, weight: 600, style: "normal" },
      ],
    }
  );

  const png = new Resvg(svg).render().asPng();

  return new Response(new Uint8Array(png), {
    headers: { "Content-Type": "image/png" },
  });
};
