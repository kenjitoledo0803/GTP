# CREAX.INK — Video promocional (Reels / TikTok / Stories)

Video vertical de **40 s** para CREAX.INK, construido sobre el guion de 7 bloques
(hook → problema → presentación → servicios → proceso → resultados → CTA).

| Entregable | Archivo |
|---|---|
| Video final 9:16 (1080×1920, 30 fps, H.264 + AAC) | `output/CREAX-INK_promo_9x16.mp4` |
| Música + diseño sonoro original (120 BPM, WAV) | `output/creax-ink-music.wav` |
| Portadas sugeridas para el Reel | `output/portada-logo.jpg`, `output/portada-hook.jpg` |
| Constructor de proyecto para **After Effects** | `after-effects/CREAX_Promo_Builder.jsx` |
| Logo separado en piezas (PNG transparente) | `assets/brand/` |
| Código fuente de la animación (motor por frames) | `src/` |

---

## Guion → montaje

Toda la edición está sobre una grilla de **120 BPM** (1 beat = 0.5 s). Los cortes y golpes
caen en múltiplos de 0.25 s, así que todo "pega" con la música.

| Tiempo | Bloque | Qué pasa en pantalla | Texto |
|---|---|---|---|
| 0:00–0:04 | **1. HOOK** | Pantalla negra → cae una gota de tinta → explota en manchas de los colores del isotipo → el isotipo entra girando con motion blur → se abre un marco y pasan trabajos a cortes de corchea → *tape stop* y todo se desatura. | NO SOLO DISEÑAMOS. / CREAMOS **IDENTIDAD.** |
| 0:04–0:08 | **2. EL PROBLEMA** | Mundo gris: flyer genérico, logo "Mi Negocio", caja "TU LOGO AQUÍ" y colores que chocan, temblando en *stop motion* a 8 fps. Un foco (la idea) parpadea. Anotaciones en marcador rojo: "¿genérico?", "sin personalidad". La música suena apagada (filtro), entra un *riser* y el foco se enciende en un destello blanco. | ¿Tu negocio tiene una **idea increíble…** / pero no sabes cómo hacerla **realidad?** |
| 0:08–0:13 | **3. PRESENTACIÓN** | *Drop.* Guías de construcción, el isotipo se revela con un barrido radial, el wordmark entra letra por letra y CREATIVE STUDIO abre su tracking. El lockup sube y se arma un *brand board*: paleta, tipografía (el peso de "Aa" se anima de 100 a 900), aplicaciones (tarjetas) y patrón. Sale con una mancha de tinta negra. | CREAX.INK / Diseño que convierte **ideas** en **identidad.** |
| 0:13–0:24 | **4. ¿QUÉ HACEMOS?** | "¿QUÉ HACEMOS?" golpea y la cámara lo atraviesa. Cuatro tarjetas en carrusel con *whip pan*, cada una con su pieza animada y su color del isotipo: identidad (logo que se construye + tarjetas + vaso), redes (teléfono con feed, historia, post con *like*), publicidad (afiche, flyers que caen, banner), digital (laptop con slides animadas, app, banner web). Barra de progreso 1-4. | 01 IDENTIDAD VISUAL · 02 DISEÑO PARA REDES · 03 PUBLICIDAD · 04 DISEÑO DIGITAL (+ sub-servicios) |
| 0:24–0:30 | **5. EL PROCESO** | Una hoja de papel tapa la pantalla. IDEA: boceto a lápiz del isotipo. DISEÑO: aparece una ventana de software, el boceto pasa a vectores azules con anclas y manejadores. DETALLE: entra el color, panel de degradado y lupa. RESULTADO: mockup de tarjetas. *Zoom* rápido hacia el montaje. | De una idea en papel… / a una identidad que **habla por ti.** |
| 0:30–0:35 | **6. RESULTADOS** | Cortes a corchea con *punch-in*, muro inclinado de trabajos en movimiento, segunda ráfaga sobre fondos de color y una grilla que colapsa al centro. | TU MARCA MERECE / VERSE COMO / **IMAGINAS.** |
| 0:35–0:40 | **7. CIERRE / CTA** | Pantalla limpia. El isotipo entra girando y la tipografía golpea. Al final queda el lockup completo con una línea en degradado. La música resuelve de La menor a Do mayor con campanas. | TU IDEA. / NUESTRA **CREATIVIDAD.** / ¿Listo para darle identidad a tu proyecto? / **CREAX.INK** Diseño • Branding • Creatividad |

> El texto "TU MARCA MERECE VERSE COMO IMAGINAS." (la otra opción de hook del guion) se usa en el bloque de resultados.

**Zonas seguras:** todo el texto importante está entre y≈250 y y≈1500 px, para que no lo tapen
la interfaz de Reels/TikTok (arriba) ni el caption y los botones (abajo).

---

## ⚠️ Antes de publicar: reemplazar los trabajos de ejemplo

El guion pide que cada servicio aparezca **con un trabajo real**. Como no tenía el portafolio,
el video usa **marcas ficticias de ejemplo** (NÓMADA, FRESCA, URBAN BEATS, FORZA, BLOOM, KUMO,
VELA, PULSO) dibujadas por código. Hay dos formas de cambiarlas por proyectos reales de CREAX.INK:

### Opción A: volver a renderizar con tus imágenes (rápido)
1. Copia tus trabajos a `assets/works/` (JPG/PNG). Tamaños ideales: **1080×1350** (posts, afiches,
   identidades), **1080×1920** (historias) y **1600×900** (presentaciones).
2. Abre `src/config.js` y escribe la ruta en `WORK_OVERRIDES`, por ejemplo:
   ```js
   nomada: '../assets/works/identidad-cliente-1.jpg',
   beats:  '../assets/works/afiche-evento.jpg',
   ```
3. Renderiza (ver abajo). Cada pieza aparece en el hook, en la tarjeta de su servicio y en el montaje de resultados.

### Opción B: After Effects
El script crea capas naranjas llamadas **`[REEMPLAZAR] …`** con el tamaño exacto que necesita cada
hueco. Selecciona la capa, mantén **Alt/Option** y arrastra tu archivo desde el panel Proyecto
sobre ella. La animación se conserva.

---

## Renderizar el video

Requisitos: Node 18+, `ffmpeg` en el PATH y Playwright (Chromium).

```bash
cd creax-ink-promo
npm install                 # instala playwright
npx playwright install chromium   # si no tienes Chromium
npm run render              # música + video -> output/CREAX-INK_promo_9x16.mp4  (~4 min)
npm run stills              # PNGs sueltos para revisar -> output/stills/
node tools/render.cjs --range 13-24   # renderiza sólo un tramo (sin audio)
```

**Vista previa en el navegador** (con *scrub* frame a frame y audio): `npm run preview`, o
cualquier servidor estático apuntando a esta carpeta. Abre `/src/index.html`.
Espacio = play/pausa, ← → = frame a frame, `?t=12.5` = saltar a un segundo.

---

## After Effects

`after-effects/CREAX_Promo_Builder.jsx` reconstruye el proyecto editable en AE:

1. Instala la fuente **Montserrat** (gratis en Google Fonts). Para las anotaciones a mano, instala también **Caveat**.
2. En AE: **Archivo → Scripts → Ejecutar archivo de script…** y elige el `.jsx`.
   Debe estar dentro de esta carpeta, porque importa `assets/brand/*.png` y `output/creax-ink-music.wav`.
3. El script crea:
   - `CREAX_Promo_9x16` (1080×1920 · 30 fps · 40 s) con las **7 escenas como precomposiciones** en su tiempo exacto.
   - Textos con **Text Animators** (revelado por palabra), *easing* tipo expo y motion blur con obturador de 180°.
   - Expresiones de motion design: `posterizeTime(8)` + `wiggle` en el bloque del problema, el parpadeo del foco y un lápiz en órbita.
   - Efectos nativos: Radial Wipe (isotipo), Linear Wipe (wordmark), Tint (desaturación), Turbulent Displace (bordes de tinta), Glow y Noise (grano).
   - **Marcadores** de escena y una capa guía con un marcador por beat (120 BPM).
   - La música en la línea de tiempo y la composición en la cola de render.

El render de este repositorio (`output/*.mp4`) es la referencia visual de cada movimiento. El
proyecto de AE es la base editable para terminarlo con el portafolio real. Lo escribí para
ExtendScript (AE CC 2019 o posterior), pero **no lo probé dentro de After Effects**. Si un paso
falla, el script lo anota en la lista de avisos del final en lugar de detenerse.

---

## Música

`output/creax-ink-music.wav` es **original**: se sintetiza con `tools/music.cjs`, sin samples ni
loops de terceros. Por eso se puede usar sin problemas de licencia.

- Estructura: impacto en la gota (0:00.5), *tape stop* al entrar el problema, mezcla apagada con
  reloj y zumbido del foco, *riser* y *drop* en 0:08, *whooshes* en cada *whip pan*, *break* en el
  proceso (el filtro se abre paso a paso), *drop* en 0:30 y cierre F → G → **C** con campanas.
- Si prefieres una canción con licencia, elige una de **120 BPM** y alinea su *drop* con 0:08 o 0:30.
  Los cortes seguirán cayendo en el beat.

---

## Paleta (muestreada del logo)

`#A92987` · `#DA387B` · `#FB254E` · `#FF7510` · `#FFAD06` · `#5890FC` · `#256FFB` · `#0554C8` · `#2DC3CF` · `#60DDC5` · tinta `#0B0B0F` · papel `#F7F5F0`

## Estructura

```
creax-ink-promo/
├─ after-effects/CREAX_Promo_Builder.jsx   constructor del proyecto AE
├─ assets/brand/                           logo original + isotipo/wordmark/tagline separados
├─ assets/fonts/                           Montserrat y Caveat (SIL OFL)
├─ assets/works/                           (tus trabajos reales)
├─ output/                                 video, música y portadas
├─ src/                                    motor de animación (lib, assets, works, scenes, main)
└─ tools/                                  render.cjs (Playwright → ffmpeg) y music.cjs (sintetizador)
```
