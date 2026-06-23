import { NextRequest } from "next/server";
import { fail, getErrorMessage, ok } from "@/app/lib/apiResponses";
import { refreshAcademicRollups } from "@/app/lib/academicMutations";
import { getTeacherSession } from "@/app/lib/session";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const session = getTeacherSession(request);
    if (!session) return fail("Sesion de profesor no valida.", 401);

    const body = await request.json();
    const payload = {
      estudiante_id: String(body.estudiante_id || ""),
      materia_id: String(body.materia_id || ""),
      periodo_id: Number(body.periodo_id),
      profesor_id: session.id,
      nota: Number(body.nota),
      observacion: String(body.observacion || "").trim() || null,
    };

    if (!payload.estudiante_id || !payload.materia_id || !payload.periodo_id || Number.isNaN(payload.nota)) {
      return fail("Completa estudiante, materia, periodo y nota.", 400);
    }

    if (payload.nota < 0 || payload.nota > 5) return fail("La nota debe estar entre 0 y 5.", 400);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("notas")
      .upsert(payload, { onConflict: "estudiante_id,materia_id,periodo_id" })
      .select()
      .single();

    if (error) throw error;
    await refreshAcademicRollups();

    return ok({ note: data });
  } catch (error) {
    return fail(getErrorMessage(error), 400);
  }
}
