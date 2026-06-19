import { NextRequest, NextResponse } from "next/server";
import { getStudentDashboard } from "@/lib/academicData";
import { fail, getErrorMessage } from "@/lib/apiResponses";
import { createSessionToken, normalizeDocument, setAcademicCookie, STUDENT_COOKIE } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const document = normalizeDocument(body.document);

    if (!document) return fail("Ingresa el numero de documento.", 400);

    const dashboard = await getStudentDashboard(document);
    const token = createSessionToken({
      type: "student",
      document,
      id: dashboard.student.id,
    });

    const response = NextResponse.json({ dashboard });
    setAcademicCookie(response, STUDENT_COOKIE, token);
    return response;
  } catch (error) {
    return fail(getErrorMessage(error), 404);
  }
}
