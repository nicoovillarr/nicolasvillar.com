import type { APIRoute } from "astro";
import { Resend } from "resend";
import { subjects } from "../../consts";

const resend = new Resend(import.meta.env.RESEND_API_KEY);

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { name, email, message, subject } = body;

    if (!name || !email || !message || !subject) {
      return new Response(JSON.stringify({ message: "Datos incompletos" }), {
        status: 400,
      });
    }

    if (message.length > 500) {
      return new Response(
        JSON.stringify({ message: "El mensaje es demasiado largo" }),
        { status: 400 }
      );
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return new Response(JSON.stringify({ message: "Email inválido" }), {
        status: 400,
      });
    }

    if (!subjects.includes(subject)) {
      return new Response(JSON.stringify({ message: "Asunto inválido" }), {
        status: 400,
      });
    }

    const { data, error } = await resend.emails.send({
      from: "Nicolás Villar <yo@nicolasvillar.com>",
      to: "yo@nicolasvillar.com",
      subject: `${subject} | nicolasvillar.com`,
      replyTo: email,
      text: `Nombre: ${name}\nEmail: ${email}\nMensaje: ${message}`,
      html: `<p><strong>Nombre:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p><strong>Asunto:</strong> ${subject}</p><p><strong>Mensaje:</strong> ${message}</p>`,
    });

    if (error) {
      return new Response(JSON.stringify({ error }), { status: 400 });
    }

    return new Response(JSON.stringify({ message: "¡Email enviado!" }), {
      status: 200,
    });
  } catch (e) {
    console.error("Error en la API:", e);
    return new Response(
      JSON.stringify({ message: "Error procesando la solicitud" }),
      { status: 500 }
    );
  }
};
