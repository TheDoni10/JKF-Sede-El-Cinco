const GOOGLE_NEWS_RSS =
  "https://news.google.com/rss/search?q=educacion%20Colombia&hl=es-419&gl=CO&ceid=CO:es-419";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// ── helpers XML ────────────────────────────────────────────────────────────────

const decodeXml = (text = "") =>
  text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

const readTag = (xml, tag) => {
  const match = xml.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, "i")
  );
  return decodeXml(match?.[1] || "").trim();
};

const parseNewsItems = (xml) =>
  Array.from(xml.matchAll(/<item>([\s\S]*?)<\/item>/gi))
    .slice(0, 5)
    .map((match) => {
      const itemXml = match[1];
      const title = readTag(itemXml, "title") || "Noticia educativa";
      const link =
        readTag(itemXml, "link") ||
        "https://news.google.com/search?q=educacion%20Colombia&hl=es-419&gl=CO&ceid=CO:es-419";
      const pubDate = readTag(itemXml, "pubDate");
      const source = readTag(itemXml, "source") || "Google News";
      const date = new Date(pubDate);

      return {
        title,
        link,
        pubDate,
        isoDate: Number.isNaN(date.getTime()) ? "" : date.toISOString(),
        source,
      };
    });

// ── fuente 1: RSS de Google News ───────────────────────────────────────────────

const fetchFromRss = async () => {
  const response = await fetch(GOOGLE_NEWS_RSS, {
    headers: { "User-Agent": "Mozilla/5.0 JFK-Sede-El-Cinco" },
    signal: AbortSignal.timeout(6000),
  });

  if (!response.ok) throw new Error(`RSS respondio ${response.status}`);

  const xml = await response.text();
  const items = parseNewsItems(xml);

  if (!items.length) throw new Error("RSS no devolvio items");

  return { items, source: "rss" };
};

// ── fuente 2: Groq como fallback ───────────────────────────────────────────────

const fetchFromGroq = async () => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY no configurada");

  const today = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const prompt = `Genera exactamente 5 noticias educativas recientes de Colombia para la fecha ${today}.
Responde SOLO con un array JSON valido, sin texto adicional, sin backticks, sin explicaciones.
Formato exacto:
[
  {
    "title": "Titulo de la noticia",
    "link": "https://www.mineducacion.gov.co",
    "pubDate": "Thu, 01 Jan 2026 08:00:00 GMT",
    "isoDate": "2026-01-01T08:00:00.000Z",
    "source": "Nombre del medio"
  }
]
Usa fuentes reales como El Tiempo, Semana, Mineducacion, El Colombiano, El Espectador.
Los titulos deben ser concretos, realistas y variados: politica educativa, infraestructura escolar, resultados Saber, programas de bilingüismo, desercion escolar, educacion rural, tecnologia en aulas.`;

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 800,
    }),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) throw new Error(`Groq respondio ${response.status}`);

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "";

  // Limpia posibles backticks que el modelo incluya
  const clean = raw.replace(/```(?:json)?/g, "").trim();
  const items = JSON.parse(clean);

  if (!Array.isArray(items) || !items.length) throw new Error("Groq no devolvio items validos");

  return { items: items.slice(0, 5), source: "groq" };
};

// ── handler principal ──────────────────────────────────────────────────────────

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Metodo no permitido." });
  }

  // Cache de 1 hora via header (Vercel Edge lo respeta)
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=7200");

  // Intento 1: RSS
  try {
    const result = await fetchFromRss();
    return res.status(200).json(result);
  } catch (rssError) {
    console.warn("[news] RSS fallo:", rssError.message, "— usando Groq como fallback");
  }

  // Intento 2: Groq
  try {
    const result = await fetchFromGroq();
    return res.status(200).json(result);
  } catch (groqError) {
    console.error("[news] Groq fallo:", groqError.message);
    return res.status(502).json({
      error: "No se pudieron cargar las noticias. Intenta mas tarde.",
    });
  }
}
