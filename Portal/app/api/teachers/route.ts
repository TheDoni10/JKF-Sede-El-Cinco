import { NextRequest } from "next/server";
import { fail, getErrorMessage, ok } from "@/app/lib/apiResponses";
import { getTeacherSession, normalizeDocument } from "@/app/lib/session";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    if (!getTeacherSession(request)) return fail("Sesion de profesor no valida.", 401);

    const body = await request.json();
    const payload = {
      nombre: String(body.nombre || "").trim(),
      apellidos: String(body.apellidos || "").trim(),
      numero_documento: normalizeDocument(body.numero_documento),
      estado: body.estado === "inactivo" ? "inactivo" : "activo",
    };

    if (!payload.nombre || !payload.apellidos || !payload.numero_documento) {
      return fail("Completa nombre, apellidos y cedula.", 400);
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("profesores").insert(payload).select().single();
    if (error) throw error;

    return ok({ teacher: data });
  } catch (error) {
    return fail(getErrorMessage(error), 400);
  }
}
