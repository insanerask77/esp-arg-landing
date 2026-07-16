# España vs Argentina - Final Mundial 2026 ⚽🏆

Landing page para la gran final de la Copa Mundial 2026 entre **España** y **Argentina**, diseñada para atraer tráfico, retener a los visitantes con juegos y monetizar con publicidad, cuyos ingresos se sortean entre los participantes.

## Qué incluye

- ⏱️ **Cuenta regresiva** hasta la final (19 de julio de 2026, MetLife Stadium)
- 🔮 **Predicción de marcador** (juego gratuito, sin apuestas de dinero)
- 🥅 **Minijuego de penaltis** con rachas y récord personal
- 🧠 **Trivia** sobre ambas selecciones
- 🎁 **Sorteo en Instagram**: me gusta + compartir la publicación + registrar el usuario en la web
- 💬 **Comentarios** de los visitantes
- 📢 **3 espacios publicitarios** listos para Google AdSense o Monetag

## Tecnología

HTML + CSS + JavaScript puro, **sin frameworks ni build**, con **GSAP + ScrollTrigger** (vía CDN, con carga diferida y fallback sin CDN) para las animaciones. Es la opción óptima para indexación rápida en Google:

- Todo el contenido está en el HTML (Googlebot no necesita ejecutar JS para leerlo)
- Carga casi instantánea (Core Web Vitals excelentes)
- Datos estructurados JSON-LD (`SportsEvent` + `FAQPage`) para rich results
- Open Graph y Twitter Cards para que se comparta bien en redes
- `sitemap.xml` y `robots.txt` incluidos

## Puesta en marcha

1. **Publicar**: activa GitHub Pages (Settings → Pages → rama `main`) o sube los archivos a cualquier hosting estático (Netlify, Vercel, Cloudflare Pages).
2. **Dominio**: reemplaza `TU-DOMINIO.com` en `index.html`, `robots.txt` y `sitemap.xml` por tu URL real. Un dominio propio ayuda al SEO.
3. **Indexación rápida (Google Search Console)**:
   - Da de alta el sitio en [Google Search Console](https://search.google.com/search-console) (método "Etiqueta HTML")
   - Descomenta la `<meta name="google-site-verification">` del `<head>` de `index.html` y pega tu código
   - Envía el `sitemap.xml` y usa "Inspección de URLs → Solicitar indexación" para la home
4. **Publicidad (AdSense o Monetag)**: en el `<head>` de `index.html` hay un bloque comentado con las instrucciones de ambas redes. Pega tu script, coloca los bloques de anuncio en los tres `ad-placeholder` del HTML y completa `ads.txt` con tu ID de editor (imprescindible para cobrar).
5. **Sorteo en Instagram** (la web solo informa; la participación es 100% en Instagram):
   - Publica el post del sorteo en tu cuenta y reemplaza `TU_PUBLICACION` en el enlace `#insta-post-link` de `index.html`
   - Requisitos de participación (ya explicados en la página): me gusta a la publicación + comentar etiquetando a 2 amigos; el comentario es la participación (seguir la cuenta es opcional)
   - Antes del sorteo, comprueba en Instagram que cada comentario cumple los requisitos

## Aviso legal importante

- Es una **página de aficionados**, sin afiliación con FIFA, RFEF ni AFA. No uses logos ni marcas oficiales.
- Los sorteos con premio tienen **requisitos legales** (bases del sorteo, protección de datos/RGPD, y en algunos países registro o tasas). Publica las bases y consulta la normativa de tu país antes de lanzarlo.
- Las predicciones son un juego gratuito **sin apuestas de dinero real**.

## Cómo contribuir

1. Clona el repositorio
2. Crea una rama para tu cambio
3. Envía un pull request con tu propuesta
