import { NextRequest, NextResponse } from "next/server";

// Rutas que no requieren autenticación
const PUBLIC_ROUTES = ["/", "/portal", "/login", "/api/auth/login", "/api/auth/logout"];

// Rutas protegidas
const PROTECTED_ROUTES = ["/student", "/teacher", "/admin"];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Permitir rutas públicas
  if (PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.next();
  }

  // Obtener la sesión del token
  const sessionToken = request.cookies.get("session")?.value;
  const userRole = request.cookies.get("userRole")?.value;

  // Proteger rutas de estudiante
  if (pathname.startsWith("/student")) {
    if (!sessionToken || userRole !== "student") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  // Proteger rutas de profesor
  if (pathname.startsWith("/teacher")) {
    if (!sessionToken || userRole !== "teacher") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  // Proteger rutas de admin
  if (pathname.startsWith("/admin")) {
    if (!sessionToken || userRole !== "admin") {
      return NextResponse.redirect(new URL("/portal", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Ejecutar middleware en todas las rutas excepto:
     * - api (excepto rutas específicas)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico (favicon)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
