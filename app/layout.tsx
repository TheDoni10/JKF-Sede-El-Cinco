import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portal Academico JFK Sede El Cinco",
  description: "Sistema academico para estudiantes y profesores de la Institucion Educativa John F Kennedy - Sede El Cinco.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
