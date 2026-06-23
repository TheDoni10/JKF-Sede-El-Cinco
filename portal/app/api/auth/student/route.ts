import { NextRequest, NextResponse } from "next/server";
import { getStudentDashboard } from "@/app/lib/academicData";
import { fail, getErrorMessage } from "@/app/lib/apiResponses";
import {
  createAcademicSessionRecord,
  createSessionToken,
  normalizeDocument,
  setAcademicCookie,
  STUDENT_COOKIE,
} from "@/app/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const document = normalizeDocument(body.document);

    if (!document) return fail("Ingresa el numero de documento.", 400);

    const dashboard = await getStudentDashboard(document);
    const sessionId = await createAcademicSessionRecord({
      type: "student",
      userId: dashboard.student.id,
      document,
    });

    const token = createSessionToken({
      type: "student",
      document,
      userId: dashboard.student.id,
      sessionId,
    });

    const response = NextResponse.json({ dashboard });
    setAcademicCookie(response, STUDENT_COOKIE, token);
    return response;
  } catch (error) {
    return fail(getErrorMessage(error), 404);
  }
}
