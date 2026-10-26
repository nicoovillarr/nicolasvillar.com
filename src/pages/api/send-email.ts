import type { APIRoute } from "astro";
import { Resend } from "resend";
import { subjects } from "../../consts";
import { getLang, type Localized } from "../../i18n/ui";

export const prerender = false;

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 500;

const messages: Localized<Record<string, string>> = {
  en: {
    invalidRequest: "Invalid request",
    sent: "Email sent!",
    incomplete: "Missing fields",
    nameTooLong: "Name is too long",
    messageTooLong: "Message is too long",
    invalidEmail: "Invalid email",
    invalidSubject: "Invalid subject",
    unavailable: "The form is not available",
    captchaFailed: "We couldn't verify that you're not a robot",
    sendFailed: "The message could not be sent",
    serverError: "Error processing the request",
  },
  es: {
    invalidRequest: "Solicitud inválida",
    sent: "¡Email enviado!",
    incomplete: "Datos incompletos",
    nameTooLong: "El nombre es demasiado largo",
    messageTooLong: "El mensaje es demasiado largo",
    invalidEmail: "Email inválido",
    invalidSubject: "Asunto inválido",
    unavailable: "El formulario no está disponible",
    captchaFailed: "No pudimos verificar que no seas un robot",
    sendFailed: "No se pudo enviar el mensaje",
    serverError: "Error procesando la solicitud",
  },
};

const jsonResponse = (body: Record<string, unknown>, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const readString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const verifyTurnstile = async (token: string, remoteIp: string) => {
  const secret = import.meta.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return true;
  }

  if (!token) {
    return false;
  }

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    body: new URLSearchParams({
      secret,
      response: token,
      remoteip: remoteIp,
    }),
  });

  if (!response.ok) {
    return false;
  }

  const result: { success: boolean } = await response.json();
  return result.success;
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let body: Record<string, unknown>;

  try {
    body = await request.json();
  } catch {
    return jsonResponse({ message: messages.en.invalidRequest }, 400);
  }

  if (!body || typeof body !== "object") {
    return jsonResponse({ message: messages.en.invalidRequest }, 400);
  }

  const t = messages[getLang(readString(body.lang))];

  if (readString(body.website)) {
    return jsonResponse({ message: t.sent }, 200);
  }

  const name = readString(body.name);
  const email = readString(body.email);
  const subject = readString(body.subject);
  const message = readString(body.message);
  const turnstileToken = readString(body["cf-turnstile-response"]);

  if (!name || !email || !message || !subject) {
    return jsonResponse({ message: t.incomplete }, 400);
  }

  if (name.length > MAX_NAME_LENGTH) {
    return jsonResponse({ message: t.nameTooLong }, 400);
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse({ message: t.messageTooLong }, 400);
  }

  if (email.length > MAX_EMAIL_LENGTH || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ message: t.invalidEmail }, 400);
  }

  if (!Object.hasOwn(subjects, subject)) {
    return jsonResponse({ message: t.invalidSubject }, 400);
  }

  const subjectLabel = subjects[subject].es;

  const resendApiKey = import.meta.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.error("Falta RESEND_API_KEY");
    return jsonResponse({ message: t.unavailable }, 503);
  }

  try {
    if (!(await verifyTurnstile(turnstileToken, clientAddress))) {
      return jsonResponse(
        { message: t.captchaFailed },
        403
      );
    }

    const { error } = await new Resend(resendApiKey).emails.send({
      from: "Nicolás Villar <yo@nicolasvillar.com>",
      to: "yo@nicolasvillar.com",
      subject: `${subjectLabel} | nicolasvillar.com`,
      replyTo: email,
      text: `Nombre: ${name}\nEmail: ${email}\nAsunto: ${subjectLabel}\nMensaje: ${message}`,
      html: [
        `<p><strong>Nombre:</strong> ${escapeHtml(name)}</p>`,
        `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
        `<p><strong>Asunto:</strong> ${escapeHtml(subjectLabel)}</p>`,
        `<p><strong>Mensaje:</strong></p>`,
        `<p style="white-space: pre-wrap">${escapeHtml(message)}</p>`,
      ].join(""),
    });

    if (error) {
      console.error("Error de Resend:", error);
      return jsonResponse({ message: t.sendFailed }, 502);
    }

    return jsonResponse({ message: t.sent }, 200);
  } catch (e) {
    console.error("Error en la API:", e);
    return jsonResponse({ message: t.serverError }, 500);
  }
};
