import { NextRequest } from "next/server";
import { getStudentDashboard } from "@/lib/academicData";
import { fail, getErrorMessage, ok } from "@/lib/apiResponses";
import { getStudentSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = getStudentSession(request);
    if (!session) return fail("Sesion de estudiante no valida.", 401);

    const dashboard = await getStudentDashboard(session.document);
    return ok({ dashboard });
  } catch (error) {
    return fail(getErrorMessage(error), 400);
  }
}
