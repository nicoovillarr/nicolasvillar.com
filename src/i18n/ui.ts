export const languages = { en: "English", es: "Español" };

export type Lang = keyof typeof languages;
export type Localized<T> = Record<Lang, T>;

export const defaultLang: Lang = "en";

export const htmlLang: Localized<string> = { en: "en-US", es: "es-UY" };
export const ogLocale: Localized<string> = { en: "en_US", es: "es_UY" };

const en = {
  "site.role": "Senior Full Stack Developer",
  "site.description":
    "Personal site and blog of Nicolás Villar, a senior full stack developer based in Montevideo, Uruguay.",
  "nav.home": "Home",
  "nav.blog": "Blog",
  "nav.contact": "Contact",
  "nav.switchLanguage": "Leer en español",
  "footer.rights": "All rights reserved.",
  "footer.privacy": "Privacy",
  "footer.cookies": "Cookies",
  "footer.links": "Links",
  "footer.contact": "Get in touch",
  "hero.photoAlt": "Photo of Nicolás Villar",
  "portfolio.title": "What I've built",
  "portfolio.logoAlt": "Logo of",
  "career.title": "Work experience",
  "career.at": "at",
  "now.title": "What I'm doing now",
  "now.updated": "Updated:",
  "contact.title": "Contact me",
  "contact.name": "Name",
  "contact.namePlaceholder": "Your full name",
  "contact.email": "Email",
  "contact.emailPlaceholder": "Your email address",
  "contact.subject": "Subject",
  "contact.subjectPlaceholder": "Select a subject...",
  "contact.message": "Message",
  "contact.messagePlaceholder": "Write your message here...",
  "contact.submit": "Send message",
  "contact.sending": "Sending...",
  "contact.success": "Thanks! I'll get back to you soon.",
  "contact.tryAgain": "Please try again.",
  "contact.error": "Something went wrong, please try again.",
  "contact.offline": "No connection, please try again in a few minutes.",
  "blog.description":
    "Thoughts and side projects about web development, infrastructure and programming in general.",
  "blog.readMore": "Read more",
  "blog.readMoreAbout": "Read more about",
  "blog.minutesToRead": "min read",
  "blog.lastUpdated": "Last updated:",
  "cookies.label": "Cookie consent",
  "cookies.message":
    "I use Google Analytics to know how many people visit the site and which pages they read. It only turns on if you accept.",
  "cookies.moreInfo": "Learn more",
  "cookies.reject": "Reject",
  "cookies.accept": "Accept",
  "cookies.statusGranted": "accepted",
  "cookies.statusDenied": "rejected",
  "cookies.statusPending": "not chosen yet",
  "notFound.title": "Looks like you got lost...",
  "notFound.back": "Try going back to the",
  "notFound.home": "home page",
};

const es: Record<keyof typeof en, string> = {
  "site.role": "Desarrollador Full Stack Senior",
  "site.description":
    "Sitio personal y blog de Nicolás Villar, desarrollador full stack senior en Montevideo, Uruguay.",
  "nav.home": "Inicio",
  "nav.blog": "Blog",
  "nav.contact": "Contacto",
  "nav.switchLanguage": "Read in English",
  "footer.rights": "Todos los derechos reservados.",
  "footer.privacy": "Privacidad",
  "footer.cookies": "Cookies",
  "footer.links": "Links",
  "footer.contact": "Contactame",
  "hero.photoAlt": "Foto de Nicolás Villar",
  "portfolio.title": "Lo que he construido",
  "portfolio.logoAlt": "Logo de",
  "career.title": "Experiencia laboral",
  "career.at": "en",
  "now.title": "En qué estoy ahora",
  "now.updated": "Actualizado:",
  "contact.title": "Contactame",
  "contact.name": "Nombre",
  "contact.namePlaceholder": "Tu nombre completo",
  "contact.email": "Correo Electrónico",
  "contact.emailPlaceholder": "Tu correo electrónico",
  "contact.subject": "Asunto",
  "contact.subjectPlaceholder": "Seleccioná un asunto...",
  "contact.message": "Mensaje",
  "contact.messagePlaceholder": "Escribí tu mensaje acá...",
  "contact.submit": "Enviar Mensaje",
  "contact.sending": "Enviando...",
  "contact.success": "¡Gracias! Te responderé pronto.",
  "contact.tryAgain": "Intentá de nuevo.",
  "contact.error": "Hubo un error, intentá de nuevo.",
  "contact.offline": "No hay conexión, intentá de nuevo en unos minutos.",
  "blog.description":
    "Reflexiones y proyectos personales sobre desarrollo web, infraestructura y programación en general.",
  "blog.readMore": "Leer más",
  "blog.readMoreAbout": "Leer más sobre",
  "blog.minutesToRead": "min de lectura",
  "blog.lastUpdated": "Última actualización:",
  "cookies.label": "Consentimiento de cookies",
  "cookies.message":
    "Uso Google Analytics para saber cuántas personas visitan el sitio y qué páginas leen. Solo se activa si aceptás.",
  "cookies.moreInfo": "Más info",
  "cookies.reject": "Rechazar",
  "cookies.accept": "Aceptar",
  "cookies.statusGranted": "aceptadas",
  "cookies.statusDenied": "rechazadas",
  "cookies.statusPending": "sin elegir todavía",
  "notFound.title": "Parece que te perdiste...",
  "notFound.back": "Probá volviendo al",
  "notFound.home": "inicio",
};

const ui: Localized<typeof en> = { en, es };

export const getLang = (locale: string | undefined): Lang =>
  locale && locale in languages ? (locale as Lang) : defaultLang;

export const useTranslations = (lang: Lang) => (key: keyof typeof en) =>
  ui[lang][key];

const translatedSegments: Localized<Record<string, string>> = {
  en: { privacidad: "privacy" },
  es: { privacy: "privacidad" },
};

export const localizePath = (lang: Lang, path = "/") => {
  const [pathname, hash] = path.split("#");
  const localizedPathname = pathname
    .split("/")
    .map((segment) => translatedSegments[lang][segment] ?? segment)
    .join("/");

  return `/${lang}${localizedPathname}${hash === undefined ? "" : `#${hash}`}`;
};

export const switchLanguagePath = (pathname: string, lang: Lang) =>
  localizePath(lang, pathname.replace(/^\/(en|es)(?=\/|$)/, "") || "/");

export const otherLang = (lang: Lang): Lang => (lang === "en" ? "es" : "en");
