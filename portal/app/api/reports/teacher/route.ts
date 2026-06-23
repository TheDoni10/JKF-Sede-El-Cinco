import { NextRequest } from "next/server";
import { getTeacherOverview } from "@/app/lib/academicData";
import { fail, getErrorMessage, ok } from "@/app/lib/apiResponses";
import { getTeacherSession } from "@/app/lib/session";

export async function GET(request: NextRequest) {
  try {
    const session = getTeacherSession(request);
    if (!session) return fail("Sesion de profesor no valida.", 401);

    const overview = await getTeacherOverview();
    return ok({ overview });
  } catch (error) {
    return fail(getErrorMessage(error), 400);
  }
}
