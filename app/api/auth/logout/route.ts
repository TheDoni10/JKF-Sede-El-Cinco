import { NextResponse } from "next/server";
import {
  clearAcademicCookie,
  getAdminSession,
  getStudentSession,
  getTeacherSession,
  revokeAcademicSessionRecord,
  STUDENT_COOKIE,
  TEACHER_COOKIE,
  ADMIN_COOKIE,
} from "@/app/lib/session";

export async function POST(request: Request) {
  const nextReq = request as unknown as any;
  const studentSession = await getStudentSession(nextReq);
  const teacherSession = await getTeacherSession(nextReq);
  const adminSession = await getAdminSession(nextReq);

  const response = NextResponse.json({ ok: true });

  if (studentSession) await revokeAcademicSessionRecord(studentSession.sessionId);
  if (teacherSession) await revokeAcademicSessionRecord(teacherSession.sessionId);
  if (adminSession) await revokeAcademicSessionRecord(adminSession.sessionId);

  clearAcademicCookie(response, STUDENT_COOKIE);
  clearAcademicCookie(response, TEACHER_COOKIE);
  clearAcademicCookie(response, ADMIN_COOKIE);

  return response;
}
