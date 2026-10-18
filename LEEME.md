# musubigara.org · galería de Instagram

Esto es la web entera, lista para subir a un repositorio de GitHub, con la galería de
**@musubi.gara** integrada y el robot que la mantiene al día. Mismo sistema que ya
tienes funcionando en larrelongdistance.org y en mugarri.org.

---

## Qué tienes que hacer tú

### Paso 1 · Crear el repositorio

En GitHub: **New repository** → nombre `musubigara` → **público** → crear.
Luego **uploading an existing file** y arrastras todo el contenido de este paquete.

Si GitHub no te deja arrastrar la carpeta oculta `.github`, la creas a mano:
**Add file → Create new file**, y escribes como nombre
`.github/workflows/instagram-musubigara.yml` — al poner las barras, GitHub crea las
carpetas solo. Pegas dentro el contenido de ese fichero.

### Paso 2 · Conectar Netlify al repositorio

En Netlify, proyecto `musubigara` → **Project configuration → Developer settings →
Link repository** → eliges el repositorio.

Cuando te pregunte por la configuración de compilación:

- **Build command:** déjalo **vacío**
- **Publish directory:** pon un punto: `.`

La web es HTML estático: no hay nada que compilar.

> Esto además te cierra de raíz el problema que ya te ha roto la web dos veces (el 24 de
> septiembre y el 7 de octubre a las 16:51): cuando arrastras una carpeta a Netlify Drop,
> lo que no va en esa carpeta **desaparece de producción**. Con el repositorio enlazado,
> lo publicado es lo que hay en `main`, y un despiste no puede borrar `/eu/` ni `/en/`.

### Paso 3 · Dar permiso en Meta y guardar las claves

1. En **developers.facebook.com**, en la app que ya usas para LARRE, conecta la cuenta
   profesional **@musubi.gara** y genera su clave de acceso (permiso
   `instagram_business_basic`). Es otra cuenta, así que es **otra clave distinta**: la de
   LARRE no vale aquí.
2. En el repositorio: **Settings → Secrets and variables → Actions → New repository secret**
   - `IG_TOKEN` → la clave de Meta de @musubi.gara
   - `GH_PAT` → un *personal access token* de GitHub con permiso para escribir secrets
     en este repositorio

**Por qué el segundo:** la clave de Meta caduca a los 60 días. Con `GH_PAT`, el robot la
renueva él solo cada noche. Sin él funciona igual… hasta que un día de diciembre la
galería se queda congelada sin avisar a nadie.

### Paso 4 · Lanzarlo

Pestaña **Actions → Galería de Instagram (Musubigara) → Run workflow**.
En un par de minutos tendrás las fotos en la web.

> **Si prefieres no esperar a la clave de Meta**, el robot tiene un modo de arranque que
> lee la exportación oficial de Instagram («Configuración → Tu actividad → Descargar tu
> información», en formato JSON). Descomprimes el zip y ejecutas, desde la carpeta del
> repositorio:
> `IG_IMPORT=/ruta/a/la/exportacion node scripts/instagram-sync.mjs`
> Deja los ficheros exactamente en el mismo formato, así que el día que exista la clave el
> robot sigue donde lo dejaste, sin rehacer nada.

---

## Qué hay dentro

```
index.html                      portada en castellano
eu/index.html                   portada en euskera
en/index.html                   portada en inglés
gestion-cultural/ · eu/kultur-kudeaketa/ · en/cultural-management/
eventos-deportivos/ · eu/kirol-ekitaldiak/ · en/sporting-events/
aviso-legal/ · eu/lege-oharra/ · en/legal-notice/
politica-privacidad/ · eu/pribatutasun-politika/ · en/privacy-policy/

galeria/index.html              galería en castellano        (nueva)
eu/galeria/index.html           galería en euskera           (nueva)
en/gallery/index.html           galería en inglés            (nueva)

musubi-gallery.css              componente de galería · sistema Musubigara
musubi-gallery.js               componente de galería · sistema Musubigara
gallery-data.js                 datos de las fotos (lo reescribe el robot)
gallery-captions.json           tus textos a mano, si quieres cambiar algún pie
musubigara-og.png · robots.txt · sitemap.xml

scripts/instagram-sync.mjs                      el robot
.github/workflows/instagram-musubigara.yml      lo lanza cada día a las 08:43
```

La carpeta `fotos/` no está: la crea el robot con la primera ejecución.
Se lanza media hora después que la de LARRE para que no se pisen.

---

## Lo que he cambiado en la web

**Las tres páginas nuevas.** Están hechas clonando las páginas legales, que ya eran
páginas sueltas con su topbar, su menú y su pie: ni una regla de CSS del sitio se ha
tocado. El componente de galería es el mismo fichero que usan mugarri.org y LARRE, y se
viste solo con las variables que ya define tu web (`--brand`, `--paper`, `--line`,
`--font-mono`…). Si algún día cambias el granate, la galería cambia con él.

**La entrada de menú.** Entra como **07 Imágenes** (*Irudiak* / *Images*), justo después
de Trayectoria, y Equipo y Contacto corren a 08 y 09. Está en las 18 páginas. Si la
prefieres al final, es cambiar tres números.

**Cada galería lleva un solo idioma.** Tu web no tiene conmutador dentro de la página —
cada idioma es una URL propia — así que los pies van solo en el idioma de la página. Si
un pie no viene en euskera o en inglés, cae al castellano antes que dejar una foto sin
texto alternativo.

**El ancho.** El cuerpo de las secciones está limitado a 68 caracteres para que el texto
se lea bien. Una rejilla de fotos no es texto: en escritorio la dejo crecer hasta 920 px
(tres columnas) y en móvil se queda en dos. Es la única regla de disposición que he
añadido, y está acotada a `.mg--page`.

**Dos arreglos que venían de antes:**

- El logo `MUSU·BIGARA®` del topbar apuntaba a Instagram en las 15 páginas. Ahora vuelve
  a la portada de su idioma. Además del gesto esperado, es el enlace que le dice a Google
  cuál es tu página principal desde todo el sitio.
- El botón de Mugarri, en las tres versiones de eventos deportivos, apuntaba a
  `mugarri.netlify.app`. Ahora va a `mugarri.org`, que es el dominio bueno y el que tiene
  el SEO montado.

---

## Posicionamiento

- `/galeria/`, `/eu/galeria/` y `/en/gallery/` son **tres URL nuevas indexables**, cada
  una con su `title`, su `description`, su `canonical` y su `hreflang` recíproco en los
  tres sentidos.
- Las tres están dadas de alta en el `sitemap.xml` con `changefreq: daily`, y el robot les
  actualiza la fecha **solo a ellas** cuando hay fotos nuevas: mentir sobre la fecha de
  las páginas que no han cambiado perjudica.
- Cada página lleva datos estructurados de dos tipos: un `CollectionPage` con su
  `BreadcrumbList` (fijo), y un `ImageGallery` con **una ficha `ImageObject` por foto**
  —URL, miniatura, medidas, fecha, pie y lugar— que reescribe el robot. Es lo que permite
  que las fotos salgan en Google Imágenes con texto.
- Las fotos se sirven **desde tu dominio**, en WebP y en dos tamaños (900 px y 400 px),
  con `width`, `height`, `loading="lazy"` y `sizes` ajustado a la rejilla real. El texto
  alternativo de cada foto es su pie, en el idioma de la página.
- Las imágenes van **escritas en el HTML**, no pintadas por JavaScript. Es lo que Google
  lee. El JavaScript solo enciende el visor al pulsar una foto.
- Los `lastmod` del sitemap estaban todos en 2026-09-24, también en páginas que tocaste el
  6 y el 7 de octubre. Puestos al día.

---

## Comprobaciones hechas antes de entregar

| Prueba | Resultado |
|---|---|
| Enlaces internos entre páginas | 294 · todos resuelven |
| Anclas (`#presentacion`, `#contacto`…) | 117 · todas apuntan a un destino real |
| Enlaces externos distintos | 34 · comprobados uno a uno, todos responden |
| `canonical` de cada página | 18 · todos coinciden con su ruta |
| `hreflang` | recíproco en los tres sentidos en las 18 páginas |
| Sitemap ↔ ficheros | 18 URL, ninguna sobra, ninguna falta |
| Menú | numeración 01–09 correcta y entrada de galería en las 18 |
| Bloques JSON-LD | 12 · todos parsean |
| Etiquetas sin cerrar | 0 en las 18 páginas |
| `title` / `description` duplicados | ninguno |
| Robot: pies en tres idiomas, carrusel, reel | coge lo correcto de cada tipo |
| Robot: segunda pasada sin novedades | no modifica ni un fichero |
| Robot: comillas y `&` en los pies | se escapan, no rompen el HTML |
| Claves | nunca se escriben en el repositorio; hay un paso que lo verifica |
| Galerías × escritorio y móvil | sin errores de consola, sin recursos caídos |
| Desbordamiento horizontal en móvil (390 px) | 0 px en las tres |
| Estado sin fotos | aparece un aviso y desaparece solo en cuanto hay rejilla |

---

## Dos cosas que conviene que mires

**1 · La etiqueta de Search Console faltaba. Ya está puesta.**
En el deploy del 8 de octubre, donde iba la etiqueta `google-site-verification` solo
quedaba un comentario explicando dónde pegarla. Comprobado en Search Console: la
propiedad `https://musubigara.org/` está verificada **únicamente por etiqueta HTML**, sin
DNS ni fichero de respaldo. Es decir: el único papel que demuestra que la web es tuya se
había caído del HTML, y Google retira la verificación en cuanto lo revisa — llevándose
por delante el sitemap enviado y los datos de la propiedad.

La etiqueta está recuperada y puesta en las 18 páginas. **No la borres nunca al editar
el `<head>`.**

Aun así, conviene añadir una segunda verificación por DNS en Porkbun, que es donde
gestionas la zona: cubre `musubigara.org` y todos sus subdominios, no depende del HTML y
no se puede caer por un despiste de edición. En Search Console → Configuración →
Validación de la propiedad → Añadir método → Registro DNS.

**2 · Títulos largos.**
Siete páginas tienen el `title` por encima de 65 caracteres y dos la `description` por
encima de 165, así que Google los corta en los resultados. No es un fallo —se indexan
enteros— pero el usuario no llega a leerlos. Son textos tuyos y no los he tocado: dime y
te propongo versiones cortas.

| Página | `title` |
|---|---|
| `/en/` | 85 car. |
| `/en/cultural-management/` | 80 car. |
| `/en/sporting-events/` | 78 car. |
| `/` | 71 car. |
| `/eventos-deportivos/` | 68 car. |
| `/gestion-cultural/` · `/eu/kultur-kudeaketa/` | 67 car. |
| `/eu/` · `/eu/kirol-ekitaldiak/` | 66 car. |

Y una menor: tu página de empresa de LinkedIn se enlaza por su número
(`/company/136037162/`). Funciona, pero si le pones una URL personalizada en LinkedIn
(`/company/musubigara`) el enlace dice qué es antes de pulsarlo, y eso cuenta.

---

## Dos cosas que quizá quieras cambiar

**Las fotos se ven en blanco y negro y toman color al pasar el ratón.** Es como está hecho
el componente, y en tu paleta queda bien. Si las prefieres a color desde el principio, es
quitar una línea de `musubi-gallery.css`.

**El rótulo es «Imágenes» y la URL `/galeria/`.** Lo he separado a propósito: «galería» es
lo que la gente escribe en Google, «Imágenes» es lo que encaja con el resto de tu menú. Si
quieres que coincidan, se cambia en un minuto.
