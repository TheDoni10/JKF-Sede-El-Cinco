import { createHmac, timingSafeEqual } from "crypto";
import type { NextRequest, NextResponse } from "next/server";

export const STUDENT_COOKIE = "jfk_student_session";
export const TEACHER_COOKIE = "jfk_teacher_session";

type SessionKind = "student" | "teacher";

export type AcademicSession = {
  type: SessionKind;
  document: string;
  id: string;
  iat: number;
};

const getSecret = () =>
  process.env.ACADEMIC_SESSION_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "jfk-academic-dev-secret";

const sign = (body: string) =>
  createHmac("sha256", getSecret()).update(body).digest("base64url");

export const normalizeDocument = (document: string) =>
  String(document || "").replace(/\D/g, "").trim();

export const createSessionToken = (payload: Omit<AcademicSession, "iat">) => {
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString("base64url");
  return `${body}.${sign(body)}`;
};

export const verifySessionToken = (token: string | undefined, expectedType: SessionKind) => {
  if (!token) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const safeSignature = Buffer.from(signature);
  const safeExpected = Buffer.from(expected);

  if (safeSignature.length !== safeExpected.length || !timingSafeEqual(safeSignature, safeExpected)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as AcademicSession;
    const maxAgeMs = 1000 * 60 * 60 * 10;

    if (payload.type !== expectedType) return null;
    if (Date.now() - payload.iat > maxAgeMs) return null;

    return payload;
  } catch {
    return null;
  }
};

export const getStudentSession = (request: NextRequest) =>
  verifySessionToken(request.cookies.get(STUDENT_COOKIE)?.value, "student");

export const getTeacherSession = (request: NextRequest) =>
  verifySessionToken(request.cookies.get(TEACHER_COOKIE)?.value, "teacher");

export const setAcademicCookie = (
  response: NextResponse,
  cookieName: string,
  token: string
) => {
  response.cookies.set(cookieName, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 10,
  });
};

export const clearAcademicCookie = (response: NextResponse, cookieName: string) => {
  response.cookies.set(cookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
};
