import { NextRequest } from "next/server";
import { fail, getErrorMessage, ok } from "@/app/lib/apiResponses";
import { refreshAcademicRollups } from "@/app/lib/academicMutations";
import { getTeacherSession, normalizeDocument } from "@/app/lib/session";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";

type Params = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, { params }: Params) {
  try {
    if (!getTeacherSession(request)) return fail("Sesion de profesor no valida.", 401);

    const { id } = await params;
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
    const { data, error } = await supabase.from("estudiantes").update(payload).eq("id", id).select().single();
    if (error) throw error;

    await refreshAcademicRollups();
    return ok({ student: data });
  } catch (error) {
    return fail(getErrorMessage(error), 400);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    if (!getTeacherSession(request)) return fail("Sesion de profesor no valida.", 401);

    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("estudiantes").delete().eq("id", id);
    if (error) throw error;

    await refreshAcademicRollups();
    return ok({ ok: true });
  } catch (error) {
    return fail(getErrorMessage(error), 400);
  }
}
