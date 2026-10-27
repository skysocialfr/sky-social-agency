#!/usr/bin/env python3
"""
Recopie l'en-tête et le pied de page des modèles (_modeles/) dans toutes les pages.
Aucune dépendance : Python 3 suffit.

  python3 _outils/synchroniser.py --verifier            montre ce qui changerait, sans rien écrire
  python3 _outils/synchroniser.py                       applique les modèles aux pages
  python3 _outils/synchroniser.py --dossier .           cible la racine du site (après la bascule)

Par défaut, le script travaille sur le dossier « nouveau/ » (refonte en cours).
Chaque page doit contenir les repères posés par le modèle :
  <!-- @entete:debut … --> … <!-- @entete:fin -->
  <!-- @pied:debut … --> … <!-- @pied:fin -->

La page courante reçoit aria-current="page" dans le menu (les articles activent
« Blog », les pages pays activent « Pays »).
"""
import re
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
MODELES = RACINE / '_modeles'
EXCLUES = {'en.html', 'rdv.html', 'pays-modele.html'}   # en-têtes propres ou page modèle
PAGES_PAYS = {'gabon.html', 'pays.html'}
PAGES_HORS_BLOG = {'index.html', 'about.html', 'services.html', 'realisations.html', 'contact.html',
                   'recrutement.html', 'mentions-legales.html', 'politique-de-confidentialite.html',
                   'merci.html', 'merci-candidature.html', 'blog.html', 'etude-de-cas-foned.html'} | PAGES_PAYS
LIEN_ACTIF_SPECIAL = {'etude-de-cas-foned.html': 'realisations.html'}

ZONES = {
    'entete': re.compile(r'<!-- @entete:debut.*?<!-- @entete:fin -->', re.S),
    'pied': re.compile(r'<!-- @pied:debut.*?<!-- @pied:fin -->', re.S),
}


def dossier():
    if '--dossier' in sys.argv:
        return (RACINE / sys.argv[sys.argv.index('--dossier') + 1]).resolve()
    return RACINE / 'nouveau'


def lien_actif(nom):
    if nom in LIEN_ACTIF_SPECIAL:
        return LIEN_ACTIF_SPECIAL[nom]
    if nom in PAGES_PAYS:
        return 'gabon.html'
    if nom not in PAGES_HORS_BLOG:
        return 'blog.html'
    return nom


def rendre(zone, nom):
    fichier = 'entete.html' if zone == 'entete' else 'pied-de-page.html'
    html = (MODELES / fichier).read_text(encoding='utf-8').rstrip('\n')
    if zone == 'entete':
        cible = lien_actif(nom)
        html = html.replace(f'<a href="{cible}">', f'<a href="{cible}" aria-current="page">')
    return html


def main():
    verifier = '--verifier' in sys.argv
    base = dossier()
    modifiees = 0
    for p in sorted(base.glob('*.html')):
        if p.name in EXCLUES or p.name.startswith('google'):
            continue
        avant = p.read_text(encoding='utf-8')
        apres = avant
        for zone, motif in ZONES.items():
            if motif.search(apres):
                bloc = rendre(zone, p.name)
                apres = motif.sub(lambda m: bloc, apres, count=1)
        if apres != avant:
            modifiees += 1
            if not verifier:
                p.write_text(apres, encoding='utf-8')
            print(f'  {"changerait" if verifier else "mise à jour"} : {p.relative_to(RACINE)}')
    print(f'{modifiees} page(s) {"à modifier" if verifier else "modifiée(s)"}.')


if __name__ == '__main__':
    main()
