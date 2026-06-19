import { NextRequest } from "next/server";
import { fail, getErrorMessage, ok } from "@/lib/apiResponses";
import { getTeacherSession, normalizeDocument } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

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
      estado: body.estado === "inactivo" ? "inactivo" : "activo",
    };

    if (!payload.nombre || !payload.apellidos || !payload.numero_documento) {
      return fail("Completa nombre, apellidos y cedula.", 400);
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from("profesores").update(payload).eq("id", id).select().single();
    if (error) throw error;

    return ok({ teacher: data });
  } catch (error) {
    return fail(getErrorMessage(error), 400);
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const session = getTeacherSession(request);
    if (!session) return fail("Sesion de profesor no valida.", 401);

    const { id } = await params;
    if (session.id === id) return fail("No puedes eliminar el profesor con la sesion actual.", 400);

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("profesores").delete().eq("id", id);
    if (error) throw error;

    return ok({ ok: true });
  } catch (error) {
    return fail(getErrorMessage(error), 400);
  }
}
