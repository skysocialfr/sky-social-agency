# Vidéos du portfolio — Sky Social Agency

Dépose tes vidéos ici pour qu'elles apparaissent automatiquement dans la section "Nos réalisations" de la page d'accueil.

## Fichiers attendus

| Nom du fichier | Carte concernée |
|---|---|
| `velmio-crm.mp4` | Velmio CRM |
| `meryne-studio.mp4` | Meryne Studio |
| `sky-social-agency.mp4` | Sky Social Agency (ce site) |

## Recommandations techniques

- **Format** : MP4 (codec H.264) — supporté partout
- **Durée** : 8 à 12 secondes en boucle
- **Résolution** : 1280×720 max (720p) — pas besoin de 1080p
- **Poids** : viser moins de 2 MB par vidéo (compresser avec HandBrake ou ffmpeg)
- **Son** : muet (les vidéos sont lues sans son automatiquement)
- **Contenu** : un curseur qui scroll/navigue sur le site, ou une démo des fonctionnalités clés

## Compression rapide avec ffmpeg

```bash
ffmpeg -i source.mov -c:v libx264 -crf 28 -preset slow -an -vf "scale=1280:-2" velmio-crm.mp4
```

(le `-an` enlève le son, `-crf 28` compresse fort, ajuster entre 23 et 30)

## Outils pour enregistrer

- **Loom** (gratuit, simple)
- **OBS Studio** (gratuit, plus puissant)
- **ScreenStudio** (Mac, payant mais beau)
- **CleanShot X** (Mac, payant)

## En attendant les vidéos

Les cartes affichent une image de fallback (`poster`) :
- Velmio CRM → `mockup.webp`
- Meryne Studio → `mockupchatgpt.webp`
- Sky Social Agency → `persona.webp`

Tu peux changer ces images dans `index.html` (chercher `poster=` dans la section portfolio).
