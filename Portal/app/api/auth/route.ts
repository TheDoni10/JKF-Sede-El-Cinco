import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    auth: {
      student: "/portal/api/auth/student",
      teacher: "/portal/api/auth/teacher",
      admin: "/portal/api/auth/admin",
    },
  });
}
