const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const GROQ_VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const schoolContext = `
Institucion Educativa John F Kennedy - Sede El Cinco.
Ubicacion: Vereda El Cinco, Vegachi, Antioquia.
Correo institucional: redes.johnfkennedy@gmail.com.
Telefono o WhatsApp de referencia: +57 312 7400098.
Horario de clases de referencia: lunes a viernes, 8:00 a.m. a 2:00 p.m.
Matricula: gratuita; se realiza al inicio y al final del ano escolar; documentos sugeridos: recibo de energia, documento del estudiante y documento del acudiente.
Grados: preescolar, basica primaria, basica secundaria y media academica.
Docentes mencionados: Azael Renteria, Hugo Contreras, Jesenia, Humberto Quinto y Edwin Castelar.
Personero mencionado: Felipe Rua.
Restaurante escolar: servicio durante la jornada de clases.
Transporte: algunos estudiantes llegan caminando, en transporte particular o bicicleta; se menciona prestamo de bicicletas segun disponibilidad.
`;

const buildUserContent = (message, image) => {
  const text = String(message || "").slice(0, 1200) || "Lee este ejercicio de la imagen y resuelvelo paso a paso.";

  if (!image) return text;

  return [
    {
      type: "text",
      text
    },
    {
      type: "image_url",
      image_url: {
        url: image
      }
    }
  ];
};

const buildMessages = (message, history = [], image = null) => [
  {
    role: "system",
    content: `Eres el asistente educativo e informativo de la Institucion Educativa John F Kennedy - Sede El Cinco.

Contexto institucional confirmado:
${schoolContext}

Reglas de respuesta:
1. Responde siempre en espanol claro, amable y natural.
2. Si es una duda institucional, usa solo el contexto confirmado. Si falta un dato, dilo y sugiere contactar al colegio.
3. Si es una tarea academica, explica paso a paso y ensena el metodo. No entregues solo la respuesta cuando convenga explicar.
4. Adapta el nivel para estudiantes de colegio rural: ejemplos sencillos, frases cortas y tono motivador.
5. Evita respuestas largas. Usa listas solo cuando ayuden.
6. No inventes fechas, nombres, costos, normas internas ni eventos.
7. Si el usuario sube una foto de un ejercicio, lee el enunciado, explica que entendiste y resuelve paso a paso. Si la imagen no es clara, pide una foto mas nitida.`
  },
  ...history
    .filter((item) => item?.role && item?.content)
    .slice(-8)
    .map((item) => ({
      role: item.role === "user" ? "user" : "assistant",
      content: String(item.content).slice(0, 1200)
    })),
  {
    role: "user",
    content: buildUserContent(message, image)
  }
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Metodo no permitido." });
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Falta configurar GROQ_API_KEY." });
  }

  const { message, history, image } = req.body || {};

  if ((!message || typeof message !== "string") && !image) {
    return res.status(400).json({ error: "Mensaje invalido." });
  }

  try {
    const groqResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: image ? GROQ_VISION_MODEL : GROQ_MODEL,
        messages: buildMessages(message, Array.isArray(history) ? history : [], image),
        temperature: 0.4,
        max_completion_tokens: 500
      })
    });

    const data = await groqResponse.json();

    if (!groqResponse.ok) {
      return res.status(groqResponse.status).json({
        error: data?.error?.message || "No se pudo consultar Groq."
      });
    }

    const answer = data?.choices?.[0]?.message?.content?.trim();
    return res.status(200).json({
      answer: answer || "No recibi una respuesta valida de la IA."
    });
  } catch (error) {
    return res.status(500).json({ error: "Error interno al consultar la IA." });
  }
}
