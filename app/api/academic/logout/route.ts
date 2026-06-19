import { NextResponse } from "next/server";
import { clearAcademicCookie, STUDENT_COOKIE, TEACHER_COOKIE } from "@/lib/session";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  clearAcademicCookie(response, STUDENT_COOKIE);
  clearAcademicCookie(response, TEACHER_COOKIE);
  return response;
}
