import type { APIRoute } from "astro";
import { Resend } from "resend";
import { subjects } from "../../consts";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_MESSAGE_LENGTH = 500;

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
    return jsonResponse({ message: "Solicitud inválida" }, 400);
  }

  if (!body || typeof body !== "object") {
    return jsonResponse({ message: "Solicitud inválida" }, 400);
  }

  if (readString(body.website)) {
    return jsonResponse({ message: "¡Email enviado!" }, 200);
  }

  const name = readString(body.name);
  const email = readString(body.email);
  const subject = readString(body.subject);
  const message = readString(body.message);
  const turnstileToken = readString(body["cf-turnstile-response"]);

  if (!name || !email || !message || !subject) {
    return jsonResponse({ message: "Datos incompletos" }, 400);
  }

  if (name.length > MAX_NAME_LENGTH) {
    return jsonResponse({ message: "El nombre es demasiado largo" }, 400);
  }

  if (message.length > MAX_MESSAGE_LENGTH) {
    return jsonResponse({ message: "El mensaje es demasiado largo" }, 400);
  }

  if (email.length > MAX_EMAIL_LENGTH || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ message: "Email inválido" }, 400);
  }

  if (!subjects.includes(subject)) {
    return jsonResponse({ message: "Asunto inválido" }, 400);
  }

  try {
    if (!(await verifyTurnstile(turnstileToken, clientAddress))) {
      return jsonResponse(
        { message: "No pudimos verificar que no seas un robot" },
        403
      );
    }

    const { error } = await resend.emails.send({
      from: "Nicolás Villar <yo@nicolasvillar.com>",
      to: "yo@nicolasvillar.com",
      subject: `${subject} | nicolasvillar.com`,
      replyTo: email,
      text: `Nombre: ${name}\nEmail: ${email}\nAsunto: ${subject}\nMensaje: ${message}`,
      html: [
        `<p><strong>Nombre:</strong> ${escapeHtml(name)}</p>`,
        `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
        `<p><strong>Asunto:</strong> ${escapeHtml(subject)}</p>`,
        `<p><strong>Mensaje:</strong></p>`,
        `<p style="white-space: pre-wrap">${escapeHtml(message)}</p>`,
      ].join(""),
    });

    if (error) {
      console.error("Error de Resend:", error);
      return jsonResponse({ message: "No se pudo enviar el mensaje" }, 502);
    }

    return jsonResponse({ message: "¡Email enviado!" }, 200);
  } catch (e) {
    console.error("Error en la API:", e);
    return jsonResponse({ message: "Error procesando la solicitud" }, 500);
  }
};
