# España vs Argentina - Final Mundial 2026 ⚽🏆

Landing page para la gran final de la Copa Mundial 2026 entre **España** y **Argentina**, diseñada para atraer tráfico, retener a los visitantes con juegos y monetizar con publicidad, cuyos ingresos se sortean entre los participantes.

## Qué incluye

- ⏱️ **Cuenta regresiva** hasta la final (19 de julio de 2026, MetLife Stadium)
- 🔮 **Voto de quién gana** (España / Empate / Argentina), con el % de la afición (juego gratuito, sin apuestas de dinero)
- 🥅 **Minijuego de penaltis** con rachas y récord personal
- 🧠 **Trivia** sobre ambas selecciones
- 🎁 **Sorteo en Instagram**: me gusta + comentar etiquetando a 2 amigos + registrar tu usuario de Instagram en la web
- 💬 **Comentarios** de los visitantes, con filtro de palabras malsonantes
- 📢 **3 espacios publicitarios** listos para Google AdSense o Monetag

## Tecnología

Frontend en HTML + CSS + JavaScript puro, **sin frameworks ni build**, con **GSAP + ScrollTrigger** (vía CDN, con carga diferida y fallback sin CDN) para las animaciones. Es la opción óptima para indexación rápida en Google:

- Todo el contenido está en el HTML (Googlebot no necesita ejecutar JS para leerlo)
- Carga casi instantánea (Core Web Vitals excelentes)
- Datos estructurados JSON-LD (`SportsEvent` + `FAQPage`) para rich results
- Open Graph y Twitter Cards para que se comparta bien en redes
- `sitemap.xml` y `robots.txt` incluidos

Los **comentarios**, el **voto de quién gana** (con el % de la afición) y el **registro de Instagram** de cada participante ya no se guardan solo en el navegador: se comparten entre todos los visitantes mediante un backend en `server/app.py`, escrito solo con librería estándar de Python (`http.server` + `sqlite3`, sin `pip install`). El resto (racha de penaltis, mejor marca de trivia, bote estimado) sigue en `localStorage`, sin servidor.

## Puesta en marcha

1. **Backend**: ejecuta `python3 server/app.py` en tu servidor (VPS, Railway, Render, etc.) — necesitas un proceso corriendo de forma persistente, **no funciona en hosting 100% estático** como GitHub Pages. El propio backend sirve también el HTML/CSS/JS, así que solo necesitas exponer ese proceso (puerto `8000` por defecto, configurable con la variable de entorno `PORT`) detrás de tu dominio (p. ej. con Nginx como proxy inverso).
2. **Dominio**: reemplaza `TU-DOMINIO.com` en `index.html`, `robots.txt` y `sitemap.xml` por tu URL real. Un dominio propio ayuda al SEO.
3. **Indexación rápida (Google Search Console)**:
   - Da de alta el sitio en [Google Search Console](https://search.google.com/search-console) (método "Etiqueta HTML")
   - Descomenta la `<meta name="google-site-verification">` del `<head>` de `index.html` y pega tu código
   - Envía el `sitemap.xml` y usa "Inspección de URLs → Solicitar indexación" para la home
4. **Publicidad (AdSense o Monetag)**: en el `<head>` de `index.html` hay un bloque comentado con las instrucciones de ambas redes. Pega tu script, coloca los bloques de anuncio en los tres `ad-placeholder` del HTML y completa `ads.txt` con tu ID de editor (imprescindible para cobrar).
5. **Sorteo en Instagram** (la participación real ocurre en Instagram; la web solo informa y registra el usuario). El enlace `#insta-post-link` de `index.html` apunta al **perfil** de Instagram (`https://www.instagram.com/madolellr/`), no a una publicación fija, para no depender de un post ya existente — cada vez que publiques el sorteo será "la última publicación" sin tener que tocar el código:
   - Requisitos de participación (ya explicados en la página, en este orden): visitar la web + inscribir su usuario de Instagram en la web + dar me gusta a la última publicación + comentar etiquetando a 2 amigos (seguir la cuenta es opcional)
   - Antes del sorteo, cruza los usuarios registrados en la web (tabla `participants` de `server/data.db`) con quienes realmente cumplieron los requisitos en Instagram — el registro en la web es solo lo que el participante declara, no una verificación automática de que comentó de verdad. Para ver la lista: `sqlite3 server/data.db "SELECT instagram FROM participants;"`

## Aviso legal importante

- Es una **página de aficionados**, sin afiliación con FIFA, RFEF ni AFA. No uses logos ni marcas oficiales.
- Los sorteos con premio tienen **requisitos legales** (bases del sorteo, protección de datos/RGPD, y en algunos países registro o tasas). Publica las bases y consulta la normativa de tu país antes de lanzarlo.
- Las predicciones son un juego gratuito **sin apuestas de dinero real**.

## Cómo contribuir

1. Clona el repositorio
2. Crea una rama para tu cambio
3. Envía un pull request con tu propuesta
