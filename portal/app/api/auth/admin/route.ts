import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";
import {
  createAcademicSessionRecord,
  createSessionToken,
  normalizeDocument,
  setAcademicCookie,
  ADMIN_COOKIE,
} from "@/app/lib/session";
import { fail, getErrorMessage } from "@/app/lib/apiResponses";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const document = normalizeDocument(body.document);

    if (!document) return fail("Ingresa el numero de documento.", 400);

    const supabase = getSupabaseAdmin();
    const { data: admin, error } = await supabase
      .from("admins")
      .select("id,nombre,apellidos,numero_documento,estado,created_at")
      .eq("numero_documento", document)
      .eq("estado", "activo")
      .single();

    if (error || !admin) return fail("No se encontro un administrador activo con ese documento.", 404);

    const sessionId = await createAcademicSessionRecord({
      type: "admin",
      userId: admin.id,
      document,
    });

    const token = createSessionToken({
      type: "admin",
      document,
      userId: admin.id,
      sessionId,
    });

    const response = NextResponse.json({ admin });
    setAcademicCookie(response, ADMIN_COOKIE, token);
    return response;
  } catch (error) {
    return fail(getErrorMessage(error), 400);
  }
}
