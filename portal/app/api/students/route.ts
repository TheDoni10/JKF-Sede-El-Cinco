import { NextRequest } from "next/server";
import { fail, getErrorMessage, ok } from "@/app/lib/apiResponses";
import { refreshAcademicRollups } from "@/app/lib/academicMutations";
import { getTeacherSession, normalizeDocument } from "@/app/lib/session";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    if (!getTeacherSession(request)) return fail("Sesion de profesor no valida.", 401);

    const search = request.nextUrl.searchParams.get("q")?.trim();
    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("estudiantes")
      .select("id,nombre,apellidos,numero_documento,estado,created_at,grado_id,grados(id,nombre,orden)")
      .order("apellidos", { ascending: true });

    if (search) {
      query = query.or(`nombre.ilike.%${search}%,apellidos.ilike.%${search}%,numero_documento.ilike.%${search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;

    return ok({ students: data || [] });
  } catch (error) {
    return fail(getErrorMessage(error), 400);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!getTeacherSession(request)) return fail("Sesion de profesor no valida.", 401);

    const body = await request.json();
    const payload = {
      nombre: String(body.nombre || "").trim(),
      apellidos: String(body.apellidos || "").trim(),
      numero_documento: normalizeDocument(body.numero_documento),
      grado_id: Number(body.grado_id),
      estado: body.estado === "inactivo" ? "inactivo" : "activo",
    };

    if (!payload.nombre || !payload.apellidos || !payload.numero_documento || !payload.grado_id) {
      return fail("Completa nombre, apellidos, documento y grado.", 400);
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("estudiantes").insert(payload).select().single();
    if (error) throw error;

    await refreshAcademicRollups();
    return ok({ student: data });
  } catch (error) {
    return fail(getErrorMessage(error), 400);
  }
}
