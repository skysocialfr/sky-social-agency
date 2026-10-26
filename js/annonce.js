/* =================================================================
   BANDEAU D'ANNONCE DE DÉPLACEMENT — configuration unique du site
   -----------------------------------------------------------------
   Pour l'activer : passer `actif` à true, renseigner la ville et les
   dates, puis pousser le fichier. Pour le couper : actif: false.

   pages : 'tout'          → affiché sur tout le site
           ['gabon']       → seulement sur /gabon
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
    '<p>Nous serons à <strong></strong> du <span class="annonce-du"></span> au <span class="annonce-au"></span>. ' +
    '<a target="_blank" rel="noopener">Réservez un créneau →</a></p>' +
    '<button type="button" aria-label="Fermer l’annonce">×</button>';
  bar.querySelector('strong').textContent = a.ville;
  bar.querySelector('.annonce-du').textContent = a.du;
  bar.querySelector('.annonce-au').textContent = a.au;
  bar.querySelector('a').href = a.lien || 'rdv.html';

  function ajuster() {
    document.documentElement.style.setProperty('--annonce-h', bar.offsetHeight + 'px');
  }
  bar.querySelector('button').addEventListener('click', function () {
    bar.remove();
    document.documentElement.style.setProperty('--annonce-h', '0px');
    try { localStorage.setItem(cle, '1'); } catch (e) {}
  });

  document.body.insertBefore(bar, document.body.firstChild);
  document.documentElement.classList.add('has-annonce');
  ajuster();
  window.addEventListener('resize', ajuster);
})();
