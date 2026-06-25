# ESTRUCTURA DEL PROYECTO - REORGANIZACIÓN

## Cambios Realizados

El proyecto ha sido reorganizado para separar el **Portal Académico** del **Sitio Web Público**.

### Antes
```
JFK-SedeEl-Cinco/
├── app/                  (Portal académico Next.js)
├── index.html            (Sitio público)
├── nosotros.html
├── ... [otros HTML]
├── package.json          (Dependencias del portal)
└── ...
```

### Después
```
JFK-SedeEl-Cinco/
├── Portal/               (Portal académico INDEPENDIENTE)
│   ├── app/              (Next.js - estudiantes y profesores)
│   ├── public/           (Assets del portal)
│   ├── package.json
│   ├── next.config.mjs
│   ├── tsconfig.json
│   └── ...
│
├── api/                  (Funciones serverless compartidas)
│   ├── chat.js           (IA con Groq)
│   └── news.js           (Noticias)
│
├── assets/               (Assets del sitio público)
│   ├── img/
│   └── Carrusel de sonrrisas/
│
├── index.html            (Sitio web público)
├── nosotros.html
├── noticias.html
├── galeria.html
├── personero.html
├── chat.html
├── contacto.html
├── main.js               (Interactividad del sitio público)
├── styles.css            (Estilos del sitio público)
└── ...
```

## Ventajas de esta Estructura

✅ **Portal completamente independiente**
- Tiene su propio `package.json` y dependencias
- Fácil de mantener, actualizar y desplegar por separado
- Estructura clara con carpetas dedicadas

✅ **Sitio público limpio**
- Mantiene las páginas estáticas (HTML/CSS/JS)
- Separado del portal académico
- Más fácil de gestionar las APIs compartidas

✅ **Fácil de desplegar**
- Portal → Vercel (con variables de Supabase)
- Sitio público → GitHub Pages o Vercel
- APIs serverless compartidas → Vercel

## Flujos de Trabajo

### Desarrollar el Portal
```bash
cd Portal
npm install        # Una sola vez
npm run dev        # Desarrollo
npm run build      # Producción
npm start          # Iniciar en producción
```

### Desarrollar el Sitio Público
```bash
# Editar archivos HTML/CSS/JS en la raíz
# Usar un servidor local simple para probar:
# En Windows: python -m http.server 8000
# En Mac/Linux: python3 -m http.server 8000
```

### Desplegar

**Portal (Vercel)**
```bash
cd Portal
vercel deploy
```

**Sitio Público (GitHub Pages o Vercel)**
- Commit a GitHub
- Configurar acciones automáticas

## Archivos Importantes

### En la Raíz
- `README.md` - Documentación general
- `PROJECT_CONTEXT.md` - Contexto del proyecto
- `main.js` - Interactividad del sitio público
- `styles.css` - Estilos del sitio público

### En `Portal/`
- `Portal/README.md` - Documentación del portal
- `Portal/package.json` - Dependencias del portal
- `Portal/.env.local` - Variables de Supabase (local)

### En `api/`
- `api/chat.js` - Asistente IA con Groq (compartido)
- `api/news.js` - Noticias de Google (compartido)

## Próximos Pasos

1. **Instalar dependencias del Portal**
   ```bash
   cd Portal && npm install
   ```

2. **Configurar variables de Supabase**
   - Crear `.Portal/.env.local`
   - Agregar variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, etc.

3. **Ejecutar el portal**
   ```bash
   cd Portal && npm run dev
   ```

4. **Desplegar**
   - Portal: Vercel
   - Sitio público: GitHub Pages o Vercel

## Notas

- El portal ahora es **completamente independiente** y puede desarrollarse/desplegarse sin afectar el sitio público
- Las APIs en `api/` se comparten entre ambas aplicaciones
- Los `assets/` contienen recursos del sitio público únicamente
