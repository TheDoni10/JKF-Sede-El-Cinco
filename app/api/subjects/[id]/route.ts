import { NextRequest } from "next/server";
import { fail, getErrorMessage, ok } from "@/app/lib/apiResponses";
import { parseGradeIds } from "@/app/lib/academicMutations";
import { getTeacherSession } from "@/app/lib/session";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    if (!getTeacherSession(request)) return fail("Sesion de profesor no valida.", 401);

    const { id } = await params;
    const body = await request.json();
    const nombre = String(body.nombre || "").trim();
    const gradeIds = parseGradeIds(body.gradeIds);

    if (!nombre) return fail("Ingresa el nombre de la materia.", 400);

    const supabase = getSupabaseAdmin();
    const { data: subject, error } = await supabase
      .from("materias")
      .update({ nombre, estado: body.estado === "inactivo" ? "inactivo" : "activo" })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from("grado_materias").delete().eq("materia_id", id);

    if (gradeIds.length) {
      const rows = gradeIds.map((grado_id) => ({ grado_id, materia_id: id }));
      const { error: relationError } = await supabase.from("grado_materias").insert(rows);
      if (relationError) throw relationError;
    }

    return ok({ subject });
  } catch (error) {
    return fail(getErrorMessage(error), 400);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    if (!getTeacherSession(request)) return fail("Sesion de profesor no valida.", 401);

    const { id } = await params;
    const supabase = getSupabaseAdmin();
    await supabase.from("grado_materias").delete().eq("materia_id", id);
    const { error } = await supabase.from("materias").delete().eq("id", id);
    if (error) throw error;

    return ok({ ok: true });
  } catch (error) {
    return fail(getErrorMessage(error), 400);
  }
}
