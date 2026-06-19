export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Metodo no permitido." });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return res.status(500).json({
      error: "Faltan SUPABASE_URL o SUPABASE_ANON_KEY.",
    });
  }

  return res.status(200).json({
    supabaseUrl,
    supabaseAnonKey,
  });
}
