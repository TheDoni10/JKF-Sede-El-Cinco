# Portal Académico - JFK Sede El Cinco

## Descripción

Portal académico independiente construido con Next.js para:
- **Portal de Estudiantes**: Acceso a calificaciones, horarios, documentos y perfil
- **Portal de Profesores**: Gestión de estudiantes, calificaciones, materias y periodos

## 🚀 Quick Start

### 1. Instalar dependencias
```bash
git clone <repo-url>
cd Portal
npm install
```

### 2. Configurar variables de entorno
Copia el archivo `.env.example` a `.env.local`:

```bash
cp .env.example .env.local
```

Edita `.env.local` y agrega tus credenciales:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Ejecutar en desarrollo
```bash
npm run dev
```

Accede a `http://localhost:3000`

### 4. Compilar para producción
```bash
npm run build
npm start
```

---

## 📁 Estructura del Proyecto

```
Portal/
├── app/                      # Aplicación Next.js (App Router)
│   ├── student/              # Portal de estudiantes
│   ├── teacher/              # Portal de profesores
│   ├── components/           # Componentes reutilizables
│   ├── api/                  # Rutas API del servidor
│   ├── hooks/                # Custom hooks
│   ├── lib/                  # Funciones y utilidades
│   ├── services/             # Servicios externos (APIs)
│   ├── types/                # Tipos TypeScript globales
│   ├── utils/                # Funciones auxiliares
│   ├── constants/            # Constantes globales
│   ├── context/              # React Context
│   ├── globals.css           # Estilos globales
│   ├── layout.tsx            # Layout raíz de la app
│   ├── page.tsx              # Página de inicio (/portal)
│   ├── error.tsx             # Página de error global
│   └── not-found.tsx         # Página 404
├── middleware.ts             # Middleware Next.js (autenticación)
├── public/                   # Assets estáticos
├── .env.example              # Ejemplo de variables de entorno
├── .env.local                # Variables locales (NO subir a git)
├── .gitignore                # Archivos ignorados por git
├── package.json              # Dependencias del proyecto
├── next.config.mjs           # Configuración Next.js
├── tsconfig.json             # Configuración TypeScript
├── vercel.json               # Configuración para Vercel
└── README.md                 # Este archivo
```

---

## 🔐 Variables de Entorno

Todas las variables se encuentran documentadas en `.env.example`. Necesitas configurar:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública de Supabase | `eyJ...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave privada de servicio | `eyJ...` |
| `NEXT_PUBLIC_PORTAL_BASE_PATH` | Ruta base del portal | `/portal` |

### ⚠️ Seguridad

- **NUNCA** subas `.env.local` a GitHub
- Las variables que empiezan con `NEXT_PUBLIC_` se exponen al cliente (son seguras para eso)
- Las variables sin `NEXT_PUBLIC_` son privadas (solo servidor)
- `SUPABASE_SERVICE_ROLE_KEY` es PRIVADA, mantenla segura

---

## 🛣️ Rutas Principales

### Portal de Estudiantes (`/student/`)
- `/student/` - Dashboard del estudiante
- `/student/notas` - Calificaciones
- `/student/horario` - Horario escolar
- `/student/perfil` - Información del perfil
- `/student/documentos` - Documentos académicos

### Portal de Profesores (`/teacher/`)
- `/teacher/` - Dashboard del profesor
- `/teacher/estudiantes` - Gestión de estudiantes
- `/teacher/materias` - Gestión de materias
- `/teacher/notas` - Registro de calificaciones
- `/teacher/periodos` - Periodos académicos
- `/teacher/profesores` - Directorio de profesores
- `/teacher/configuracion` - Configuración personal

---

## 🔌 APIs Internas

### Autenticación
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Datos del usuario actual
- `POST /api/auth/change-password` - Cambiar contraseña

### Estudiantes
- `GET /api/students` - Lista de estudiantes
- `GET /api/students/[id]` - Detalles del estudiante
- `POST /api/students/[id]/reset-password` - Resetear contraseña

### Profesores
- `GET /api/teachers` - Lista de profesores
- `GET /api/teachers/[id]` - Detalles del profesor
- `POST /api/teachers/[id]/reset-password` - Resetear contraseña

### Datos Académicos
- `GET /api/grades` - Calificaciones
- `GET /api/grades/[id]` - Detalles de calificación
- `GET /api/subjects` - Materias
- `GET /api/subjects/[id]` - Detalles de materia
- `GET /api/periods/[id]` - Periodos académicos

---

## 🛡️ Autenticación & Seguridad

El proyecto usa un middleware (`middleware.ts`) que protege rutas:

### Rutas Públicas
- `/` - Inicio
- `/login` - Login
- `/api/auth/login` - Endpoint de login

### Rutas Protegidas
- `/student/*` - Requiere rol `student`
- `/teacher/*` - Requiere rol `teacher`
- `/admin/*` - Requiere rol `admin`

El middleware verifica cookies de sesión y roles automáticamente.

---

## 🚀 Desplegar en Vercel

### 1. Subir a GitHub
```bash
git init
git add .
git commit -m "Initial commit: Portal Académico"
git branch -M main
git remote add origin https://github.com/tu-usuario/portal.git
git push -u origin main
```

### 2. Conectar en Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Inicia sesión con tu cuenta
3. Haz clic en "New Project"
4. Selecciona tu repositorio de GitHub
5. Vercel detectará automáticamente que es Next.js
6. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
7. Haz clic en "Deploy"

### 3. Variables de Entorno en Vercel
En `Settings > Environment Variables`, agrega:
```
NEXT_PUBLIC_SUPABASE_URL = https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJ...
SUPABASE_SERVICE_ROLE_KEY = eyJ... (marcar como privada)
NEXT_PUBLIC_PORTAL_BASE_PATH = /portal (opcional)
```

### 4. Dominio Personalizado (Opcional)
En `Settings > Domains`, agrega tu dominio personalizado y sigue las instrucciones de DNS.

---

## 📦 Tecnologías

| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Next.js | 15.0+ | Framework React |
| React | 19.0+ | Librería UI |
| TypeScript | 5.6+ | Tipado estático |
| Supabase | 2.45+ | Base de datos y Auth |
| Lucide React | 0.468+ | Iconos |

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Compila la app
npm start            # Inicia servidor de producción

# Linting
npm run lint         # Ejecuta ESLint
```

---

## 📋 Checklist antes de Subir

- [ ] Copiar `.env.example` a `.env.local` localmente
- [ ] Llenar todas las variables de entorno en `.env.local`
- [ ] Probar localmente: `npm run dev`
- [ ] Verificar que el build compila: `npm run build`
- [ ] Subir a GitHub (sin `.env.local`)
- [ ] Configurar variables en Vercel
- [ ] Hacer deploy en Vercel
- [ ] Probar la URL de producción

---

## 🐛 Troubleshooting

### Error: "Faltan SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY"
**Solución**: Verifica que hayas configurado `.env.local` correctamente

### Error: "Cannot POST /api/auth/login"
**Solución**: Asegúrate de que el endpoint existe en `app/api/auth/login/route.ts`

### Rutas devuelven 404
**Solución**: Verifica el `NEXT_PUBLIC_PORTAL_BASE_PATH` si usas basePath

### Vercel dice "Build failed"
**Solución**: 
1. Revisa los logs en Vercel Dashboard
2. Verifica que todas las variables de entorno están configuradas
3. Asegúrate de que el build funciona localmente

---

## 📞 Soporte

Para reportar bugs o sugerencias:
1. Abre un issue en GitHub
2. Incluye los logs y el comportamiento esperado
3. Describe los pasos para reproducir el problema

---

## 📄 Licencia

Proyecto de uso interno - John F Kennedy Sede El Cinco

Mantener separadas las responsabilidades:
- `app/student/` - Toda la lógica del portal del estudiante
- `app/teacher/` - Toda la lógica del portal del profesor
- `app/components/` - Componentes compartidos
- `app/api/` - Rutas del servidor
- `app/lib/` - Lógica de negocio y utilitarios
- `app/types/` - Definiciones de tipos

### Ejecutar tests (si existen)
```bash
npm test
```

## Deployment

### En Vercel
```bash
vercel deploy
```

### Variables de entorno en Vercel
Asegúrate de configurar en Vercel:
- `SUPABASE_URL`
- `SUPABASE_KEY`
- Otras claves de API necesarias

## Notas

- Este es un portal completamente independiente del sitio web público
- Los estilos y componentes están organizados modularmente
- Las APIs utilizan autenticación basada en sesiones
