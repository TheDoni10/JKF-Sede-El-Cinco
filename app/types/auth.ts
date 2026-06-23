export type AcademicRole = "student" | "teacher" | "admin";

export type AcademicSessionBase = {
  type: AcademicRole;
  userId: string;
  document: string;
};

export type AcademicSessionPayload = AcademicSessionBase & {
  sessionId: string;
};

export type AcademicSession = AcademicSessionPayload & {
  iat: number;
};

export type SessionRecord = {
  session_id: string;
  role: AcademicRole;
  user_id: string;
  document: string;
  expires_at: string;
  created_at: string;
  last_active_at: string;
  revoked: boolean;
  ip_address?: string | null;
  user_agent?: string | null;
};
