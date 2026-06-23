import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import type { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/app/lib/supabaseAdmin";
import type { AcademicSession, AcademicSessionBase } from "@/app/types/auth";

export const STUDENT_COOKIE = "jfk_student_session";
export const TEACHER_COOKIE = "jfk_teacher_session";
export const ADMIN_COOKIE = "jfk_admin_session";

const getSecret = () =>
  process.env.ACADEMIC_SESSION_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  "jfk-academic-dev-secret";

const sign = (body: string) =>
  createHmac("sha256", getSecret()).update(body).digest("base64url");

const sessionMaxAgeMs = 1000 * 60 * 60 * 10;
const cookieMaxAgeSeconds = 60 * 60 * 10;

export const normalizeDocument = (document: string) =>
  String(document || "").replace(/\D/g, "").trim();

export const createSessionToken = (payload: AcademicSessionBase & { sessionId: string }) => {
  const body = Buffer.from(JSON.stringify({ ...payload, iat: Date.now() })).toString("base64url");
  return `${body}.${sign(body)}`;
};

export const verifySessionToken = async (token: string | undefined, expectedType: AcademicSession["type"]) => {
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
    if (payload.type !== expectedType) return null;
    if (Date.now() - payload.iat > sessionMaxAgeMs) return null;

    const supabase = getSupabaseAdmin();
    const { data: session, error } = await supabase
      .from("sessions")
      .select("session_id,role,user_id,document,expires_at,revoked")
      .eq("session_id", payload.sessionId)
      .single();

    if (error || !session) return null;
    if (session.revoked) return null;
    if (session.role !== payload.type) return null;
    if (session.document !== payload.document) return null;
    if (session.user_id !== payload.userId) return null;
    if (new Date(session.expires_at).getTime() < Date.now()) return null;

    await supabase
      .from("sessions")
      .update({ last_active_at: new Date().toISOString() })
      .eq("session_id", payload.sessionId);

    return payload;
  } catch {
    return null;
  }
};

export const getStudentSession = (request: NextRequest) =>
  verifySessionToken(request.cookies.get(STUDENT_COOKIE)?.value, "student");

export const getTeacherSession = (request: NextRequest) =>
  verifySessionToken(request.cookies.get(TEACHER_COOKIE)?.value, "teacher");

export const getAdminSession = (request: NextRequest) =>
  verifySessionToken(request.cookies.get(ADMIN_COOKIE)?.value, "admin");

export const createAcademicSessionRecord = async (payload: AcademicSessionBase) => {
  const sessionId = randomUUID();
  const expiresAt = new Date(Date.now() + sessionMaxAgeMs).toISOString();
  const supabase = getSupabaseAdmin();

  const { error } = await supabase.from("sessions").insert({
    session_id: sessionId,
    role: payload.type,
    user_id: payload.id,
    document: payload.document,
    expires_at: expiresAt,
    created_at: new Date().toISOString(),
    last_active_at: new Date().toISOString(),
    revoked: false,
  });

  if (error) throw error;
  return sessionId;
};

export const revokeAcademicSessionRecord = async (sessionId: string) => {
  const supabase = getSupabaseAdmin();
  await supabase.from("sessions").update({ revoked: true }).eq("session_id", sessionId);
};

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
    maxAge: cookieMaxAgeSeconds,
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
