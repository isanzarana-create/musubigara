# Instrucciones para Claude — musubigara.org (Musubigara®)

Repositorio de la web musubigara.org (Musubigara®) (de Ignacio Sanz Arana). Netlify publica cada commit en `main`.
Lee esto ANTES de tocar cualquier fichero. Estas reglas existen porque ya hubo fallos en producción
(13, 16 y 17 nov 2026) y Ignacio ha dejado claro que no pueden repetirse.

## 1. Sitemap: cada cambio de HTML lleva su `<lastmod>` en el MISMO commit
- Si un commit cambia una página HTML, ese mismo commit debe poner el `<lastmod>` de su URL en
  `sitemap.xml` con la fecha del día (zona Europe/Madrid).
- Hazlo con `node scripts/check-seo.mjs --fix-sitemap`, o a mano si editas desde la web de GitHub.
- Si subes varios commits seguidos, el sitemap con las fechas finales va en el PRIMERO
  (si no, cada commit intermedio falla el control).

## 2. Comprobar antes de subir
- Ejecuta `node scripts/check-seo.mjs` y debe terminar en «✓ Todo correcto».
- Si sale en rojo, NO subas nada hasta corregirlo.

## 3. Una incidencia no está cerrada hasta verla en verde
- Tras cada push, abre `github.com/isanzarana-create/musubigara/actions` y comprueba que
  «Control SEO» está en verde SOBRE TU COMMIT. Si falla, corrígelo ese mismo día y avisa a Ignacio.
- Anotar el problema no es arreglarlo: el arreglo tiene que estar en `main`.
- Si no puedes subir el arreglo (sin permisos, sin sesión en GitHub…), díselo a Ignacio ese
  mismo día con el fichero corregido listo. Nunca lo des por hecho.
- Si no hay acceso por token, se puede editar desde el Chrome de Ignacio con sesión en GitHub:
  `github.com/isanzarana-create/musubigara/edit/main/<fichero>`; comprueba la huella SHA-256 del
  contenido antes de confirmar el commit.

## 4. Datos estructurados (JSON-LD)
- Ningún evento (Event, MusicEvent, SportsEvent…) se publica o modifica sin performer, offers,
  startDate/endDate completos, location, image, organizer, eventStatus y description con datos REALES.
- Si falta un dato, no lo inventes ni publiques incompleto: pregunta a Ignacio.
- Antes de cada commit que toque datos estructurados, pasa la Prueba de resultados enriquecidos de Google.

## 5. Despliegues de Netlify = créditos
- Cada commit sin `[skip netlify]` es un despliegue y gasta créditos. Agrupa los cambios en el menor
  número de commits; en tandas de varios commits, todos llevan `[skip netlify]` menos el último.
- Commits que no cambian la web publicada (como este fichero) llevan `[skip netlify]`.

## 6. Antes de cambios grandes
- Comenta las dudas con Ignacio antes de ejecutar cambios grandes de contenido o diseño.

## 7. Contenido de musubigara.org
- Cero referencias a Beinke. La ® va en todas las apariciones visibles de Musubigara®.
- Solo gestión cultural: las URLs deportivas antiguas quedan con 301 (no tocarlas).
- Sin LinkedIn, sin códigos QR, sin iconos de mail, sin Spotify en `sameAs`.
- La Action de llms.txt hace su propio commit cuando cambian titles o metas: tenlo en cuenta al contar despliegues.

