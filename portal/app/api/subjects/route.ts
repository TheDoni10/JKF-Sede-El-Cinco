import { NextRequest } from "next/server";
import { fail, getErrorMessage, ok } from "@/app/lib/apiResponses";
import { parseGradeIds } from "@/app/lib/academicMutations";
import { getTeacherSession } from "@/app/lib/session";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    if (!getTeacherSession(request)) return fail("Sesion de profesor no valida.", 401);

    const body = await request.json();
    const nombre = String(body.nombre || "").trim();
    const gradeIds = parseGradeIds(body.gradeIds);

    if (!nombre) return fail("Ingresa el nombre de la materia.", 400);

    const supabase = getSupabaseAdmin();
    const { data: subject, error } = await supabase
      .from("materias")
      .insert({ nombre, estado: body.estado === "inactivo" ? "inactivo" : "activo" })
      .select()
      .single();

    if (error) throw error;

    if (gradeIds.length) {
      const rows = gradeIds.map((grado_id) => ({ grado_id, materia_id: subject.id }));
      const { error: relationError } = await supabase.from("grado_materias").insert(rows);
      if (relationError) throw relationError;
    }

    return ok({ subject });
  } catch (error) {
    return fail(getErrorMessage(error), 400);
  }
}
