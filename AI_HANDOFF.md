# AI_HANDOFF

## Estado actual

El proyecto ahora conserva el sitio institucional existente y agrega un modulo academico en Next.js/React bajo la ruta `/academico`.

El portal academico usa Supabase como base de datos principal mediante APIs server-side de Next/Vercel. Los estudiantes ingresan con numero de documento. Los profesores ingresan con cedula registrada en la tabla `profesores`.

No se pudo compilar localmente en esta maquina porque `npm` no esta instalado o no esta disponible en PowerShell.

## Tareas completadas

- Se agrego estructura Next.js:
  - `package.json`
  - `next.config.mjs`
  - `tsconfig.json`
  - `next-env.d.ts`
  - `app/layout.tsx`
  - `app/page.tsx`
  - `app/globals.css`
- Se creo el modulo React:
  - `app/academico/page.tsx`
  - `app/academico/AcademicPortal.tsx`
- Se crearon APIs academicas server-side:
  - `app/api/academic/student/login/route.ts`
  - `app/api/academic/student/me/route.ts`
  - `app/api/academic/teacher/login/route.ts`
  - `app/api/academic/teacher/overview/route.ts`
  - `app/api/academic/logout/route.ts`
  - `app/api/academic/students/route.ts`
  - `app/api/academic/students/[id]/route.ts`
  - `app/api/academic/teachers/route.ts`
  - `app/api/academic/teachers/[id]/route.ts`
  - `app/api/academic/subjects/route.ts`
  - `app/api/academic/subjects/[id]/route.ts`
  - `app/api/academic/notes/route.ts`
  - `app/api/academic/notes/[id]/route.ts`
- Se agrego capa compartida:
  - `lib/supabaseAdmin.ts`
  - `lib/session.ts`
  - `lib/types.ts`
  - `lib/academicData.ts`
  - `lib/apiResponses.ts`
  - `lib/academicMutations.ts`
- Se reemplazo `supabase-schema.sql` por el esquema academico completo.
- Se actualizo `portal.html` para redirigir al nuevo modulo `/academico` y evitar el error viejo `Failed to fetch`.
- Se actualizo `.env.example` con las variables necesarias.

## Decisiones tecnicas

- Se usa Next.js solo para el modulo academico.
- Las operaciones sensibles contra Supabase se hacen en APIs de servidor usando `SUPABASE_SERVICE_ROLE_KEY`.
- La clave secreta de Supabase nunca debe ir al frontend.
- Los estudiantes no usan contrasena; ingresan por documento.
- Los profesores usan su cedula registrada como acceso.
- El panel profesor administra estudiantes, profesores, materias y notas.
- Promedios, rankings e historial se recalculan en Supabase con `refresh_academic_rollups()`.
- Las notas tienen escala de 0 a 5 y son unicas por estudiante, materia y periodo.

## Variables requeridas

En Vercel deben existir:

```env
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ACADEMIC_SESSION_SECRET
GROQ_API_KEY
```

## Base de datos

Ejecutar `supabase-schema.sql` completo en Supabase SQL Editor.

Tablas creadas:

- `grados`
- `periodos`
- `estudiantes`
- `profesores`
- `materias`
- `grado_materias`
- `notas`
- `rankings`
- `historial_academico`

Datos iniciales:

- Grados desde Preescolar hasta Undecimo.
- Periodos 1 a 4.
- Materias base.
- Profesor demo:
  - Cedula: `1001001001`
- Estudiante demo:
  - Documento: `1046907616`

## Pendientes

- Instalar Node.js/npm localmente si se quiere probar en esta maquina.
- Ejecutar:

```bash
npm install
npm run build
```

- Ejecutar `supabase-schema.sql` en Supabase.
- Hacer redeploy en Vercel despues de variables y cambios.
- Probar `/academico`.
- Rotar la `SUPABASE_SERVICE_ROLE_KEY` si fue compartida fuera de Vercel.
- Revisar si el sitio institucional estatico debe migrarse tambien a Next.js o mantenerse como despliegue separado.

## Proximos pasos recomendados

1. Ejecutar el SQL completo en Supabase.
2. Confirmar variables de entorno en Vercel con nombres exactos.
3. Hacer redeploy.
4. Abrir `/academico`.
5. Probar estudiante demo con documento `1046907616`.
6. Probar profesor demo con cedula `1001001001`.
7. Crear estudiantes y profesores reales desde el panel profesor.
8. Registrar notas y validar que promedios, rankings e historial cambien automaticamente.
