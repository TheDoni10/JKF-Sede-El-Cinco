import { NextRequest, NextResponse } from "next/server";
import { getTeacherOverview } from "@/lib/academicData";
import { fail, getErrorMessage } from "@/lib/apiResponses";
import { createSessionToken, normalizeDocument, setAcademicCookie, TEACHER_COOKIE } from "@/lib/session";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const document = normalizeDocument(body.document);

    if (!document) return fail("Ingresa la cedula del profesor.", 400);

    const supabase = getSupabaseAdmin();
    const { data: teacher, error } = await supabase
      .from("profesores")
      .select("id,nombre,apellidos,numero_documento,estado,created_at")
      .eq("numero_documento", document)
      .eq("estado", "activo")
      .single();

    if (error || !teacher) return fail("No se encontro un profesor activo con esa cedula.", 404);

    const overview = await getTeacherOverview();
    const token = createSessionToken({
      type: "teacher",
      document,
      id: teacher.id,
    });

    const response = NextResponse.json({ teacher, overview });
    setAcademicCookie(response, TEACHER_COOKIE, token);
    return response;
  } catch (error) {
    return fail(getErrorMessage(error), 400);
  }
}
