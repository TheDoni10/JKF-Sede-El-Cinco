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
