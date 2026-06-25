# JFK Sede El Cinco

Sitio web de la Institucion Educativa John F Kennedy - Sede El Cinco.

## Chat IA con Groq

La clave de Groq no debe ir en `main.js` ni en ningun archivo publico. El chat usa la funcion segura `api/chat.js`, que lee la clave desde una variable de entorno:

```env
GROQ_API_KEY=tu_clave_de_groq
```

## Publicar correctamente

GitHub Pages no ejecuta funciones dentro de `/api`, por eso el chat IA no funciona alli. Para que el chat funcione sin exponer la clave:

1. Sube este proyecto a GitHub.
2. Conecta el repositorio en Vercel.
3. En Vercel, entra a `Project Settings` > `Environment Variables`.
4. Agrega `GROQ_API_KEY` con tu clave nueva de Groq.
5. Haz redeploy del proyecto.

Si la clave anterior estuvo en GitHub, revocala en Groq y crea una nueva.

## Estructura del Proyecto

```
JFK SedeEl Cinco/
├── Portal/                    # ⭐ Portal académico independiente (Next.js)
│   ├── app/                   # Aplicación Next.js
│   ├── public/                # Assets del portal
│   ├── package.json
│   ├── next.config.mjs
│   ├── tsconfig.json
│   └── README.md              # Documentación del portal
│
├── api/                       # Funciones serverless (Node.js)
│   ├── chat.js                # IA con Groq
│   └── news.js                # Noticias de Google
│
├── assets/                    # Assets del sitio público
│   ├── img/
│   └── Carrusel de sonrrisas/
│
├── Sitio Web Público (HTML/CSS/JS)
│   ├── index.html             # Página de inicio
│   ├── nosotros.html          # Sobre nosotros
│   ├── noticias.html          # Noticias
│   ├── galeria.html           # Galería de fotos
│   ├── personero.html         # Personero estudiantil
│   ├── chat.html              # Asistente IA
│   ├── contacto.html          # Contacto
│   ├── main.js                # Interactividad
│   └── styles.css             # Estilos
└── ...
```

## Portal Académico con Supabase

El portal académico está ahora en la carpeta `/Portal/` como un proyecto **completamente independiente**.

Úsalo con Next.js, React, Vercel y Supabase.

### Instalación

```bash
cd Portal
npm install
npm run dev
```

### Variables de entorno (Portal/.env.local)

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_clave_publica
SUPABASE_SERVICE_ROLE_KEY=tu_clave_secreta
ACADEMIC_SESSION_SECRET=texto_largo_aleatorio
```

Si la integración de Vercel/Supabase crea `SUPABASE_SECRET_KEY` en lugar de `SUPABASE_SERVICE_ROLE_KEY`, también funciona.

Ejecuta `supabase-schema.sql` en Supabase SQL Editor antes de probar.

### Accesos demo (después de ejecutar el SQL)

- **Estudiante**: documento `1046907616`
- **Profesor**: cédula `1001001001`

En este portal:
- Los estudiantes ingresan con su documento de identidad
- Los profesores ingresan con su cédula
- Desde el panel de profesores se pueden administrar estudiantes, profesores, materias y notas

Para más detalles, ver [Portal/README.md](Portal/README.md)
