# PROJECT_CONTEXT

## Objetivo general del proyecto

Sitio web institucional de la Institucion Educativa John F Kennedy - Sede El Cinco, ubicada en la Vereda El Cinco, Vegachi, Antioquia. El proyecto busca informar a estudiantes, familias, docentes y comunidad sobre la sede, su ubicacion, noticias, galeria, personero, contacto, portal estudiantil demostrativo y un asistente educativo con IA.

## Descripcion funcional completa

El proyecto es una aplicacion web multipagina, principalmente estatica, con dos funciones serverless pensadas para Vercel:

- `index.html`: pagina de inicio con hero institucional, imagen del colegio, estadisticas animadas, ubicacion y mapa embebido de Google Maps.
- `nosotros.html`: pagina institucional con descripcion general, mision, vision y valores.
- `noticias.html`: pagina de noticias y eventos. Incluye tarjetas de eventos institucionales con cuenta regresiva, descarga de eventos en formato `.ics` y una seccion de noticias educativas recientes de Colombia cargadas desde `/api/news`.
- `galeria.html`: galeria del evento "Carrusel de Sonrisas", con imagenes locales y visor tipo lightbox.
- `personero.html`: perfil del personero estudiantil, foto, periodo, mensaje y enlaces a contacto/noticias.
- `chat.html`: asistente educativo con respuestas locales para preguntas frecuentes y fallback a Groq mediante `/api/chat`. Permite adjuntar imagenes de ejercicios, las redimensiona en el navegador y usa un modelo vision cuando hay imagen.
- `contacto.html`: formulario de contacto con validacion en cliente, informacion institucional y mapa embebido.
- `portal.html`: portal estudiantil demostrativo. Acepta cualquier correo y contrasena no vacios, muestra dashboard con calificaciones, horario y enlaces de documentos ficticios.

La interactividad comun vive en `main.js`. Cada pagina carga el mismo archivo y las funciones se activan solo si existen los nodos requeridos en el DOM.

## Tecnologias utilizadas

- HTML5 multipagina.
- CSS3 puro con variables CSS, grid, flexbox, media queries y animaciones.
- JavaScript vanilla en el navegador.
- Funciones serverless JavaScript en `/api`, compatibles con Vercel.
- API de Groq compatible con formato OpenAI Chat Completions.
- Google News RSS como fuente de noticias.
- Google Maps Embed mediante `iframe`.
- Google Fonts (`DM Sans` y `Syne`) importadas desde CSS.
- APIs nativas del navegador: `fetch`, `localStorage`, `IntersectionObserver`, `FileReader`, `canvas`, `Blob`, `URL.createObjectURL`, `Intl.DateTimeFormat`.

No hay framework frontend, bundler, sistema de componentes, `package.json`, base de datos ni dependencias npm declaradas.

## Arquitectura del sistema

Arquitectura simple de sitio estatico con funciones serverless:

```text
Navegador
  |
  |-- HTML/CSS/JS estatico
  |-- assets locales
  |
  |-- GET /api/news  ---> Vercel Serverless Function ---> Google News RSS
  |                                             |
  |                                             +-------> Groq fallback
  |
  |-- POST /api/chat ---> Vercel Serverless Function ---> Groq Chat/Vision
```

Capas principales:

- Presentacion: archivos HTML y `styles.css`.
- Interactividad cliente: `main.js`.
- Servicios serverless: `api/chat.js` y `api/news.js`.
- Contenido estatico: imagenes en `assets/`.
- Configuracion sensible: `GROQ_API_KEY` en variables de entorno.

El frontend no tiene estado persistente de servidor. Solo usa `localStorage` para cache diario de noticias y variables en memoria para historial de chat e imagen seleccionada.

## Estructura de carpetas y archivos importantes

```text
.
|-- README.md
|-- .env.example
|-- .gitignore
|-- index.html
|-- nosotros.html
|-- noticias.html
|-- galeria.html
|-- personero.html
|-- chat.html
|-- contacto.html
|-- portal.html
|-- main.js
|-- styles.css
|-- api/
|   |-- chat.js
|   `-- news.js
|-- assets/
|   |-- img/
|   |   |-- logo/
|   |   |   |-- Logo.JFK.png
|   |   |   `-- Foto colegio.png
|   |   |-- noticias/
|   |   |   `-- Aviso.png
|   |   `-- personero/
|   |       `-- Personero.jpg
|   `-- Carrusel de sonrrisas/
|       `-- multiples fotografias JPG del evento
`-- .vscode/
```

Archivos clave:

- `main.js`: comportamiento global del sitio, noticias, calendario `.ics`, lightbox, portal simulado y chat IA.
- `styles.css`: sistema visual completo, responsive design, layout, componentes, chat, portal, galeria y animaciones.
- `api/chat.js`: endpoint seguro para Groq Chat/Vision usando `GROQ_API_KEY`.
- `api/news.js`: endpoint para noticias recientes via Google News RSS con fallback a Groq.
- `.env.example`: ejemplo de variable requerida.
- `.gitignore`: excluye `.env`, `.env.local`, `.env.*.local`, `node_modules/` y `.vercel/`.

## Dependencias principales

Dependencias externas en runtime:

- Groq API:
  - Texto: `llama-3.3-70b-versatile`.
  - Vision: `meta-llama/llama-4-scout-17b-16e-instruct`.
- Google News RSS:
  - `https://news.google.com/rss/search?q=educacion%20Colombia&hl=es-419&gl=CO&ceid=CO:es-419`
- Google Maps:
  - enlaces de busqueda y `iframe` para `R878+W6 Vegachi, Antioquia, Colombia`.
- Google Fonts:
  - `DM Sans`.
  - `Syne`.

Dependencias implicitas:

- Navegador moderno.
- Node.js moderno en Vercel serverless, idealmente Node 18+ por `fetch` y `AbortSignal.timeout`.
- Vercel para ejecutar `/api/chat` y `/api/news` sin exponer la clave de Groq.

No hay dependencias instalables registradas en el repositorio.

## Base de datos, modelos y relaciones

No existe base de datos ni ORM.

Datos actuales:

- Contenido institucional: hardcoded en HTML y en `chatKnowledge` dentro de `main.js`.
- Eventos: hardcoded en `noticias.html` mediante atributos `data-event-date`, `data-event-title` y `data-event-description`.
- Noticias educativas externas: obtenidas dinamicamente desde `/api/news`.
- Cache de noticias: `localStorage` con clave `jfk-google-news-cache` y validez diaria.
- Portal estudiantil: datos hardcoded en `portal.html` (calificaciones, horario y documentos).
- Chat:
  - `chatHistory`: arreglo en memoria del navegador.
  - `selectedImage`: imagen temporal en memoria como data URL.

Modelos logicos informales:

- Evento: fecha, titulo, descripcion, imagen, categoria.
- Noticia externa: `title`, `link`, `pubDate`, `isoDate`, `source`.
- Mensaje de chat: `role` (`user` o `assistant`) y `content`.
- Pregunta frecuente: palabras clave y respuesta institucional.

No hay relaciones persistentes entre entidades. Todo esta acoplado al DOM, objetos JS locales o respuestas JSON de endpoints.

## APIs, servicios externos e integraciones

### `POST /api/chat`

Archivo: `api/chat.js`.

Funcion:

- Recibe preguntas del chat.
- Usa `GROQ_API_KEY` desde variables de entorno.
- Incluye contexto institucional confirmado de la sede.
- Envia las ultimas 8 interacciones del historial.
- Si hay imagen, envia contenido multimodal y cambia al modelo vision.

Body esperado:

```json
{
  "message": "Texto del usuario",
  "history": [{ "role": "user", "content": "..." }],
  "image": "data:image/jpeg;base64,..."
}
```

Respuesta exitosa:

```json
{
  "answer": "Respuesta de la IA"
}
```

Errores principales:

- `405`: metodo distinto de `POST`.
- `500`: falta `GROQ_API_KEY` o error interno.
- `400`: mensaje invalido cuando no hay texto ni imagen.
- Codigo de Groq: se propaga si la API externa falla.

### `GET /api/news`

Archivo: `api/news.js`.

Funcion:

- Intenta cargar 5 noticias desde Google News RSS.
- Parsea XML manualmente con expresiones regulares simples.
- Si RSS falla, usa Groq como fallback para generar un arreglo JSON.
- Devuelve `Cache-Control: s-maxage=3600, stale-while-revalidate=7200`.

Respuesta exitosa:

```json
{
  "items": [
    {
      "title": "Titulo",
      "link": "https://...",
      "pubDate": "Thu, 01 Jan 2026 08:00:00 GMT",
      "isoDate": "2026-01-01T08:00:00.000Z",
      "source": "Medio"
    }
  ],
  "source": "rss"
}
```

Errores principales:

- `405`: metodo distinto de `GET`.
- `502`: no se pudieron cargar noticias ni por RSS ni por Groq.

### Google Maps

Usado en `index.html` y `contacto.html` mediante enlaces publicos e `iframe`. No requiere clave.

### Google Fonts

Importado en `styles.css`. Requiere conexion externa para cargar las fuentes.

## Flujo de autenticacion y autorizacion

No hay autenticacion real ni autorizacion.

El `portal.html` implementa solo una simulacion:

1. Usuario ingresa cualquier correo y contrasena no vacios.
2. `main.js` oculta `#login-panel`.
3. `main.js` muestra `#dashboard`.
4. Boton "Salir" revierte el estado visual y limpia el formulario.

No hay sesiones, tokens, roles, cookies, validacion contra servidor ni proteccion de rutas. El chat serverless solo protege la clave de Groq al mantenerla en el servidor, pero no autentica usuarios.

## Variables de entorno requeridas

```env
GROQ_API_KEY=tu_clave_de_groq
```

Uso:

- Requerida por `api/chat.js`.
- Requerida por `api/news.js` solo si falla Google News RSS y se necesita fallback con Groq.

La clave no debe ponerse en `main.js`, HTML ni archivos publicos. `.gitignore` ya excluye `.env`, `.env.local` y `.env.*.local`.

## Funcionalidades implementadas

- Navegacion responsive con menu movil.
- Resaltado de enlace activo segun pagina actual.
- Header sticky con estado al hacer scroll.
- Animaciones de aparicion con `IntersectionObserver`.
- Contadores animados en la pagina principal.
- Pagina de inicio institucional con ubicacion y mapa.
- Pagina de nosotros con mision, vision y valores.
- Pagina de noticias con:
  - eventos hardcoded,
  - cuenta regresiva por evento,
  - descarga de calendario `.ics`,
  - skeleton loader para noticias externas,
  - cache diario en `localStorage`,
  - fallback visual si `/api/news` falla.
- Galeria con lightbox, cierre por boton, click fuera y tecla Escape.
- Perfil del personero estudiantil.
- Formulario de contacto con validacion cliente y mensaje de estado.
- Portal estudiantil demostrativo con login simulado, tabs, calificaciones, horario y documentos ficticios.
- Chat educativo con:
  - respuestas locales por palabras clave,
  - preguntas rapidas,
  - historial corto,
  - fallback a Groq,
  - mensajes de error especificos para `file:` y GitHub Pages,
  - subida y preview de imagen,
  - redimensionamiento de imagen en canvas,
  - uso de modelo vision si hay imagen.
- Endpoints serverless para chat y noticias.
- README con advertencia de seguridad sobre la clave de Groq y despliegue en Vercel.

## Funcionalidades pendientes

- Autenticacion real del portal estudiantil.
- Base de datos para usuarios, estudiantes, calificaciones, horarios y documentos.
- Panel administrativo o CMS para editar noticias, eventos, galeria, personero y contenido institucional.
- Backend real para el formulario de contacto, por ejemplo email transaccional o almacenamiento de solicitudes.
- Validacion, sanitizacion y moderacion mas robusta para entradas del chat.
- Rate limiting para `/api/chat` y `/api/news`.
- Manejo de costos, cuotas y observabilidad de Groq.
- Pruebas automatizadas.
- Configuracion explicita de Vercel o scripts de desarrollo.
- Documentos reales descargables en el portal.
- Mejoras SEO: metadatos por pagina, Open Graph, sitemap y robots.
- Politicas de privacidad, tratamiento de datos e informacion sobre uso de IA.
- Accesibilidad avanzada y auditoria responsive completa.
- Limpieza de codificacion de caracteres y textos con signos/acentos inconsistentes.

## Problemas conocidos y limitaciones

- GitHub Pages no ejecuta `/api`; el chat IA y noticias via endpoint requieren Vercel u otro hosting serverless.
- No hay `package.json`, por tanto no existen scripts `npm run dev`, `npm test` o build.
- El portal estudiantil no es seguro: acepta cualquier credencial no vacia.
- El formulario de contacto no envia correos ni guarda datos.
- Algunos textos usan ASCII sin tildes y otros muestran posibles problemas de codificacion/mojibake, especialmente comentarios y fragmentos en `api/news.js` y separadores de `main.js`.
- Hay inconsistencias de contenido en personero:
  - Hero: "Personero estudiantil 2026-2027".
  - Badge: "Periodo 2025-2026".
  - Footer: "Personero estudiantil 2025".
- En `personero.html`, el `alt` de la foto menciona "Carlos Andres Martinez", pero el nombre mostrado es "Luis Felipe Rua Palacio".
- Carpeta `assets/Carrusel de sonrrisas/` contiene "sonrrisas" con doble `r`.
- En `galeria.html`, una imagen usa ruta URL-encoded `Ni%C3%B1os.jpg`; confirmar compatibilidad en hosting segun nombre real del archivo.
- `api/news.js` usa parsing XML manual con regex; puede romperse ante cambios del feed.
- El fallback de noticias con Groq puede generar noticias no verificadas, aunque el prompt pida fuentes reales.
- No hay proteccion contra abuso de endpoints ni contra imagenes muy grandes mas alla del redimensionamiento cliente.
- La carga de Google Fonts, Google Maps, Google News y Groq depende de red externa.

## Convenciones de codigo utilizadas

- HTML multipagina con header/footer repetido manualmente.
- Un unico CSS global (`styles.css`) con variables en `:root`.
- Clases semanticas por componente: `site-header`, `nav-links`, `page-shell`, `section`, `news-card`, `chat-panel`, etc.
- Radio visual centralizado en `--radius: 8px`.
- Layouts con CSS Grid y Flexbox.
- Mobile first parcial mediante media queries a `1060px` y `720px`.
- JavaScript vanilla sin modulos en frontend.
- Uso de optional chaining para que `main.js` pueda correr en todas las paginas.
- Seleccion de elementos por clases, ids y atributos `data-*`.
- Funciones pequenas para tareas especificas: renderizado de noticias, descarga ICS, respuestas del chat, manejo de imagenes.
- Endpoints serverless con `export default async function handler(req, res)`.
- Respuestas JSON en API.
- Variables sensibles solo mediante `process.env`.
- Estilo mayormente ASCII en textos y codigo.

## Instrucciones para ejecutar el proyecto

### Ver el sitio estatico

Opcion simple:

1. Abrir `index.html` directamente en el navegador.
2. Navegar por las paginas desde el menu.

Limitacion: abriendo con `file:` no funcionaran `/api/chat` ni `/api/news`.

Opcion con servidor estatico local:

```bash
python -m http.server 8000
```

Luego abrir:

```text
http://localhost:8000
```

Limitacion: este servidor tampoco ejecuta las funciones de `/api`.

### Ejecutar con funciones serverless

Usar Vercel local o despliegue en Vercel:

1. Configurar variable de entorno:

```env
GROQ_API_KEY=tu_clave_de_groq
```

2. Ejecutar con Vercel CLI:

```bash
vercel dev
```

3. Abrir la URL local que indique Vercel.

### Publicar

Segun `README.md`:

1. Subir el repositorio a GitHub.
2. Conectarlo en Vercel.
3. En Vercel, ir a `Project Settings` > `Environment Variables`.
4. Agregar `GROQ_API_KEY`.
5. Hacer redeploy.

No publicar claves reales en archivos versionados.

## Resumen tecnico para otra IA

Este repositorio contiene un sitio institucional estatico para la Institucion Educativa John F Kennedy - Sede El Cinco. No uses frameworks ni asumas build system: todo esta en HTML, CSS y JS vanilla. La logica compartida esta en `main.js`, que se carga en todas las paginas y usa optional chaining para activar solo lo que existe en cada DOM.

Las dos piezas dinamicas reales estan en `/api` y estan pensadas para Vercel. `api/chat.js` es un wrapper seguro de Groq para el chat educativo; nunca mover `GROQ_API_KEY` al frontend. `api/news.js` trae noticias desde Google News RSS y cae a Groq si el RSS falla. Si se prueba en GitHub Pages o abriendo archivos locales, esas APIs no funcionaran.

No hay base de datos, autenticacion, CMS ni backend de contacto. Portal, eventos, documentos, calificaciones, textos y galeria son datos hardcoded. Si se continua el desarrollo, las prioridades tecnicas razonables son: corregir textos/codificacion, convertir portal y contacto en funcionalidades reales, agregar persistencia, proteger endpoints, crear configuracion de desarrollo, y separar datos hardcoded en JSON o un CMS antes de seguir creciendo el sitio.
