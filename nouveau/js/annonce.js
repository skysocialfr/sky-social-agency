/* =================================================================
   BANDEAU D'ANNONCE DE DÉPLACEMENT — configuration unique du site
   -----------------------------------------------------------------
   Pour l'activer : passer `actif` à true, renseigner la ville et les
   dates, puis pousser le fichier. Pour le couper : actif à false.

   pages : 'tout'             → affiché sur tout le site
           ['gabon']          → seulement sur /gabon
           ['gabon', 'index'] → plusieurs pages (nom du fichier sans .html)
   ================================================================= */
var ANNONCE = {
  actif: false,
  ville: 'Abidjan',
  du: '10 novembre',
  au: '14 novembre 2026',
  pages: 'tout',
  lien: 'rdv.html'
};

(function () {
  var a = ANNONCE;
  if (!a || !a.actif) return;

  var slug = (location.pathname.split('/').pop() || 'index').replace(/\.html$/, '') || 'index';
  if (a.pages !== 'tout' && (!Array.isArray(a.pages) || a.pages.indexOf(slug) === -1)) return;

  // Fermé par le visiteur : on ne le remontre pas pour CETTE annonce.
  var cle = 'sky_annonce_fermee_' + [a.ville, a.du, a.au].join('|');
  try { if (localStorage.getItem(cle)) return; } catch (e) {}

  var bar = document.createElement('div');
  bar.className = 'annonce';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Annonce');
  bar.innerHTML =
    '<p>Nous serons à <strong></strong> du <span class="du"></span> au <span class="au"></span> — ' +
    '<a class="link" target="_blank" rel="noopener">réservez un créneau</a></p>' +
    '<button type="button" class="icon-btn" aria-label="Fermer l’annonce">' +
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"></path></svg></button>';
  bar.querySelector('strong').textContent = a.ville;
  bar.querySelector('.du').textContent = a.du;
  bar.querySelector('.au').textContent = a.au;
  bar.querySelector('a').href = a.lien || 'rdv.html';

  var ajuster = function () {
    document.documentElement.style.setProperty('--annonce-h', bar.isConnected ? bar.offsetHeight + 'px' : '0px');
  };
  bar.querySelector('button').addEventListener('click', function () {
    bar.remove();
    ajuster();
    try { localStorage.setItem(cle, '1'); } catch (e) {}
  });

  document.body.insertBefore(bar, document.body.firstChild);
  ajuster();
  window.addEventListener('resize', ajuster);
})();
