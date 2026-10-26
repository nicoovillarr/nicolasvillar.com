import type { Localized } from "./i18n/ui";

export const SITE_TITLE = "Nicolás Villar";
export const SITE_URL = "https://nicolasvillar.com";
export const HOME_OG_SLUG = "home";
export const GA_MEASUREMENT_ID = "G-WJVWNT02YE";
export const CONTACT_EMAIL = "yo@nicolasvillar.com";
export const NOW_UPDATED_AT = new Date("2025-12-21");
export const subjects: Record<string, Localized<string>> = {
  job: { en: "Job opportunity", es: "Oportunidad laboral" },
  general: { en: "General inquiry", es: "Consulta general" },
  support: { en: "Technical support", es: "Soporte técnico" },
  collaboration: { en: "Collaboration", es: "Colaboración" },
  project: { en: "New project", es: "Proyecto nuevo" },
  hello: { en: "Just saying hi", es: "Solo quiero saludar" },
};
