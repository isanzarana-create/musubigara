/* ─────────────────────────────────────────────────────────────
   MUSUBI GALLERY · lógica mínima (sin librerías, ~6 KB)
   - pinta la rejilla donde se le diga (panel lateral)
   - enciende el visor (lightbox) sobre cualquier .mg-item del DOM,
     esté pintado por JS o escrito ya en el HTML por el robot.

   REGLA DE ORO (oct 2026): aquí nunca se enseña una foto rota.
   El visor NO depende del índice de gallery-data.js: lee la foto
   del propio elemento que se ha clicado. Si la versión grande
   fallara, se queda en la miniatura (que ya está cargada en la
   rejilla, así que se ve seguro); si tampoco hubiera miniatura,
   se cierra el visor y se abre la cuenta de Instagram. Y una foto
   de la rejilla que no cargue desaparece en vez de dejar el
   recuadro con la interrogación.
   ───────────────────────────────────────────────────────────── */
(function (w, d) {
  var DATA = w.MUSUBI_GALLERY || { photos: [] };
  var BASE = (w.MUSUBI_GALLERY_BASE || 'fotos/');
  var PERFIL = DATA.profileUrl || 'https://www.instagram.com/';

  /* Tres idiomas: si falta el pie en el idioma de la página, cae al
     castellano antes que dejar la foto sin texto alternativo. */
  function cap(p, lang) { return p[lang] || p.es || p.eu || p.en || ''; }
  var LOCALES = { es: 'es-ES', eu: 'eu-ES', en: 'en-GB' };
  var VER_EN_IG = { es: 'Ver en Instagram', eu: 'Instagramen ikusi', en: 'View on Instagram' };
  function paginaLang() {
    var l = (d.documentElement.lang || 'es').slice(0, 2);
    return LOCALES[l] ? l : 'es';
  }
  function metaLine(p, lang) {
    if (!p.date) return '';
    var f = new Date(p.date + 'T12:00:00').toLocaleDateString(LOCALES[lang] || 'es-ES',
      { day: '2-digit', month: 'short', year: 'numeric' });
    if (lang === 'eu') f = f.replace(/\(a\)\s*$/, '').trim();
    return p.place ? p.place + ' · ' + f : f;
  }

  /* Nombre de la foto a partir de su URL: ig-2026-10-24-696255-400.webp
     y ig-2026-10-24-696255.webp son la misma foto. */
  function ficheroDe(url) {
    if (!url) return '';
    var n = String(url).split('?')[0].split('#')[0].split('/').pop();
    return n.replace(/\.webp$/i, '').replace(/-400$/, '');
  }
  function fichaDe(file) {
    for (var i = 0; i < (DATA.photos || []).length; i++) {
      if (DATA.photos[i].file === file) return DATA.photos[i];
    }
    return null;
  }

  /* Marcado de una foto. variant: 'panel' | 'page' */
  function itemHTML(p, i, lang, variant) {
    var alt = cap(p, lang).replace(/"/g, '&quot;');
    var img = '<img src="' + BASE + p.file + '-400.webp"' +
      ' srcset="' + BASE + p.file + '-400.webp 400w, ' + BASE + p.file + '.webp 900w"' +
      ' sizes="(max-width: 640px) 50vw, 300px"' +
      ' width="900" height="900" loading="' + (i < 2 ? 'eager' : 'lazy') + '" decoding="async"' +
      ' alt="' + alt + '">';
    if (variant === 'page') {
      return '<figure>' +
        '<a class="mg-item" href="' + BASE + p.file + '.webp" data-mg-index="' + i + '" ' +
        'aria-label="' + alt + '">' + img + '</a>' +
        '<figcaption class="mg-figcap">' + cap(p, lang) +
        '<span class="mg-meta">' + metaLine(p, lang) + '</span></figcaption></figure>';
    }
    return '<figure class="mg-item" data-mg-index="' + i + '" tabindex="0" role="button" ' +
      'aria-label="' + alt + '">' + img +
      '<figcaption>' + cap(p, lang) + '</figcaption></figure>';
  }

  function render(el, opts) {
    opts = opts || {};
    var lang = opts.lang || paginaLang();
    var variant = opts.variant || 'panel';
    var list = (DATA.photos || []).slice(0, opts.limit || 6);
    el.innerHTML = '<div class="mg-grid">' +
      list.map(function (p, i) { return itemHTML(p, i, lang, variant); }).join('') +
      '</div>';
  }

  /* ── Red de seguridad en la rejilla ─────────────────────────
     Si una foto de la rejilla no carga, su hueco se retira en vez
     de quedarse con el icono de imagen rota. Se escucha en fase de
     captura porque el evento 'error' de <img> no burbujea.        */
  d.addEventListener('error', function (e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG' || !img.closest) return;
    if (!img.closest('.mg-grid')) return;
    /* Primer intento: la miniatura, por si lo que falló fue la grande.
       La ruta se saca de la que ha fallado, nunca de una base relativa:
       en /en/ o /eu/ una ruta relativa buscaría las fotos donde no están. */
    var src = img.currentSrc || img.src || '';
    if (src && !/-400\.webp/i.test(src) && !img.dataset.mgRetry) {
      img.dataset.mgRetry = '1';
      img.removeAttribute('srcset');
      img.src = src.replace(/\.webp(\?.*)?$/i, '-400.webp$1');
      return;
    }
    var fig = img.closest('figure');
    (fig || img).style.display = 'none';
  }, true);

  /* ── Lista de fotos tal y como están en la página ───────────
     La verdad es el DOM, no el índice: así el visor enseña siempre
     la foto que se ha clicado aunque gallery-data.js se quede
     desfasado.                                                    */
  function itemsDe(el) {
    var grid = (el && el.closest) ? el.closest('.mg-grid') : null;
    var nodos = (grid || d).querySelectorAll('[data-mg-index]');
    var lang = paginaLang();
    var out = [];
    for (var i = 0; i < nodos.length; i++) {
      var nodo = nodos[i];
      var fig = nodo.closest('figure') || nodo;
      var img = nodo.querySelector('img') || fig.querySelector('img');
      /* Se usan las propiedades (URL absoluta ya resuelta), no los
         atributos: una ruta relativa escrita en el HTML se interpretaría
         mal en /eu/ y /en/, que cuelgan de otra carpeta. */
      var thumb = img ? (img.currentSrc || img.src || '') : '';
      var full = nodo.tagName === 'A' ? (nodo.href || '') : '';
      if (!full && thumb) full = thumb.replace(/-400(\.webp)(\?.*)?$/i, '$1$2');
      var file = ficheroDe(full || thumb);
      if (!full && file) full = BASE + file + '.webp';
      var ficha = fichaDe(file);
      var capEl = fig.querySelector('.mg-figcap') || fig.querySelector('figcaption');
      var metaEl = fig.querySelector('.mg-meta');
      var texto = '';
      if (ficha) texto = cap(ficha, lang);
      if (!texto && capEl) {
        texto = (capEl.textContent || '').replace(metaEl ? (metaEl.textContent || '') : '', '').trim();
      }
      if (!texto) texto = nodo.getAttribute('aria-label') || (img && img.alt) || '';
      out.push({
        el: nodo,
        file: file,
        full: full,
        thumb: thumb || (file ? BASE + file + '-400.webp' : ''),
        texto: texto,
        meta: metaEl ? (metaEl.textContent || '').trim() : (ficha ? metaLine(ficha, lang) : ''),
        permalink: (ficha && ficha.permalink) || PERFIL
      });
    }
    return out;
  }

  /* Fotos de gallery-data.js, por si en esta página no hay rejilla. */
  function itemsDeDatos() {
    var lang = paginaLang();
    return (DATA.photos || []).map(function (p) {
      return {
        el: null, file: p.file,
        full: BASE + p.file + '.webp',
        thumb: BASE + p.file + '-400.webp',
        texto: cap(p, lang), meta: metaLine(p, lang),
        permalink: p.permalink || PERFIL
      };
    });
  }

  /* ── Visor ─────────────────────────────────────────────────── */
  var lb, items = [], idx = 0;
  function buildLB() {
    lb = d.createElement('div');
    lb.className = 'mg-lb';
    lb.innerHTML =
      '<button class="mg-lb-close" type="button" aria-label="Cerrar">✕</button>' +
      '<button class="mg-lb-nav mg-lb-prev" type="button" aria-label="Anterior">‹</button>' +
      '<button class="mg-lb-nav mg-lb-next" type="button" aria-label="Siguiente">›</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>';
    d.body.appendChild(lb);
    lb.addEventListener('click', function (e) {
      if (e.target.closest('.mg-lb-ig')) return;          /* el enlace a IG manda */
      if (e.target === lb || e.target.closest('.mg-lb-close')) close();
      if (e.target.closest('.mg-lb-prev')) show(idx - 1);
      if (e.target.closest('.mg-lb-next')) show(idx + 1);
    });
    /* Última red: si aun así la imagen del visor fallara, se baja a la
       miniatura y, si tampoco, se va a Instagram en vez de enseñar el
       recuadro roto. */
    lb.querySelector('img').addEventListener('error', function () {
      var it = items[idx] || {};
      var img = this;
      if (it.thumb && img.getAttribute('src') !== it.thumb) { img.src = it.thumb; return; }
      close();
      w.open(it.permalink || PERFIL, '_blank', 'noopener');
    });
    d.addEventListener('keydown', function (e) {
      if (!lb || !lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(idx - 1);
      if (e.key === 'ArrowRight') show(idx + 1);
    });
  }

  function show(i) {
    var n = items.length; if (!n) return;
    idx = (i + n) % n;
    var it = items[idx];
    var img = lb.querySelector('img');
    var lang = paginaLang();

    /* Se abre ya con la miniatura, que está cargada y no puede fallar;
       la versión grande entra después, cuando se sepa que carga. */
    var arranque = it.thumb || it.full;
    if (arranque) img.src = arranque;
    img.alt = it.texto || '';

    if (it.full && it.full !== arranque) {
      var test = new Image();
      var objetivo = idx;
      test.onload = function () { if (idx === objetivo) img.src = it.full; };
      test.onerror = function () { /* se queda en la miniatura */ };
      test.src = it.full;
    }

    var enlace = it.permalink || PERFIL;
    lb.querySelector('figcaption').innerHTML =
      (it.texto || '') +
      (it.meta ? '<span class="mg-lb-meta">' + it.meta + '</span>' : '') +
      '<a class="mg-lb-ig" href="' + enlace + '" target="_blank" rel="noopener noreferrer">' +
      (VER_EN_IG[lang] || VER_EN_IG.es) + ' ↗</a>';
    lb.classList.add('open');
    d.documentElement.style.overflow = 'hidden';
  }
  function close() {
    if (!lb) return;
    lb.classList.remove('open');
    d.documentElement.style.overflow = '';
  }

  function abrirDesde(nodo) {
    if (!lb) buildLB();
    items = itemsDe(nodo);
    if (!items.length) items = itemsDeDatos();
    var i = 0;
    for (var k = 0; k < items.length; k++) if (items[k].el === nodo) { i = k; break; }
    if (!items.length) {                       /* sin nada que enseñar: a Instagram */
      w.open(PERFIL, '_blank', 'noopener');
      return;
    }
    show(i);
  }

  d.addEventListener('click', function (e) {
    var it = e.target.closest('[data-mg-index], .mg-item');
    if (!it) return;
    e.preventDefault();
    abrirDesde(it);
  });
  d.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var a = d.activeElement;
    var it = a && a.closest && a.closest('[data-mg-index], .mg-item');
    if (!it) return;
    e.preventDefault();
    abrirDesde(it);
  });

  w.MusubiGallery = { render: render, data: DATA, itemHTML: itemHTML };
})(window, document);
