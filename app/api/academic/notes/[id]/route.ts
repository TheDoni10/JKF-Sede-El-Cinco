import { NextRequest } from "next/server";
import { fail, getErrorMessage, ok } from "@/lib/apiResponses";
import { refreshAcademicRollups } from "@/lib/academicMutations";
import { getTeacherSession } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    if (!getTeacherSession(request)) return fail("Sesion de profesor no valida.", 401);

    const { id } = await params;
    const body = await request.json();
    const nota = Number(body.nota);
    if (Number.isNaN(nota) || nota < 0 || nota > 5) return fail("La nota debe estar entre 0 y 5.", 400);

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("notas")
      .update({
        nota,
        observacion: String(body.observacion || "").trim() || null,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    await refreshAcademicRollups();

    return ok({ note: data });
  } catch (error) {
    return fail(getErrorMessage(error), 400);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    if (!getTeacherSession(request)) return fail("Sesion de profesor no valida.", 401);

    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("notas").delete().eq("id", id);
    if (error) throw error;

    await refreshAcademicRollups();
    return ok({ ok: true });
  } catch (error) {
    return fail(getErrorMessage(error), 400);
  }
}
