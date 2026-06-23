import { NextRequest, NextResponse } from "next/server";
import { getAdminSession, getStudentSession, getTeacherSession } from "@/app/lib/session";
import { fail, getErrorMessage, ok } from "@/app/lib/apiResponses";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";

export async function GET(request: NextRequest) {
  try {
    const studentSession = await getStudentSession(request);
    if (studentSession) {
      const supabase = getSupabaseAdmin();
      const { data: student, error } = await supabase
        .from("estudiantes")
        .select("id,nombre,apellidos,numero_documento,estado,created_at,grado_id")
        .eq("id", studentSession.userId)
        .single();
      if (error || !student) return fail("No se encontro el estudiante.", 404);
      return ok({ role: "student", user: student });
    }

    const teacherSession = await getTeacherSession(request);
    if (teacherSession) {
      const supabase = getSupabaseAdmin();
      const { data: teacher, error } = await supabase
        .from("profesores")
        .select("id,nombre,apellidos,numero_documento,estado,created_at")
        .eq("id", teacherSession.userId)
        .single();
      if (error || !teacher) return fail("No se encontro el profesor.", 404);
      return ok({ role: "teacher", user: teacher });
    }

    const adminSession = await getAdminSession(request);
    if (adminSession) {
      const supabase = getSupabaseAdmin();
      const { data: admin, error } = await supabase
        .from("admins")
        .select("id,nombre,apellidos,numero_documento,estado,created_at")
        .eq("id", adminSession.userId)
        .single();
      if (error || !admin) return fail("No se encontro el administrador.", 404);
      return ok({ role: "admin", user: admin });
    }

    return fail("Sesion no valida.", 401);
  } catch (error) {
    return fail(getErrorMessage(error), 400);
  }
}
