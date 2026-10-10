# Carton Plein ! — site de vente

Le site d'accueil présente le jeu, permet de le commander et de le payer, et le bouton **Jouer** (en haut à droite) ouvre le jeu complet dans le dossier `jouer/`.

## Ce qu'il y a dans le dossier

| Fichier | Rôle |
|---|---|
| `index.html` | Page d'accueil : présentation, combinaisons, photos, commande, questions, contact |
| `jouer/` | Le jeu en ligne (version complète pour l'instant) + son appli installable |
| `cgv.html` | Conditions générales de vente et d'utilisation |
| `confidentialite.html` | Page RGPD : données collectées, durées, droits, cookies |
| `mentions-legales.html` | Éditeur, hébergeur, médiateur |
| `merci.html` | Page affichée après un paiement réussi |
| `404.html` | Page « introuvable » personnalisée |
| `sitemap.xml`, `robots.txt` | Pour Google |
| `assets/js/config.js` | **Le seul fichier de réglages** : prix, frais de port, liens de paiement, date d'envoi… |
| `.htaccess` | HTTPS, 404 et cache, uniquement chez un hébergeur Apache (OVH, o2switch…) |

## À faire avant la mise en ligne (dans cet ordre)

1. **Ton domaine** : remplace partout `https://www.cartonplein.fr` par ton adresse réelle (dans VS Code : Rechercher/Remplacer dans tous les fichiers, Ctrl+Maj+H). Fichiers concernés : toutes les pages `.html`, `sitemap.xml`, `robots.txt`.
2. **Les textes légaux** : cherche `[À compléter` dans `mentions-legales.html`, `cgv.html` et `confidentialite.html` (nom, adresse, SIRET, médiateur). Vendre régulièrement demande un statut (la micro-entreprise suffit) : le SIRET est obligatoire sur le site.
3. **Ton e-mail** : dans `assets/js/config.js`, remplace `a-remplacer@exemple.fr`, puis la même adresse dans les pages légales.
4. **Le paiement** (Stripe, voir plus bas) : colle les deux liens dans `config.js`.
5. **Les photos** : remplace les fichiers de `assets/img/` par tes vraies photos en gardant **les mêmes noms**, puis retire la phrase « Visuels du prototype… » dans `index.html`.

Tant que les liens Stripe ne sont pas collés, le bouton de paiement affiche « Le paiement en ligne ouvre très bientôt » : on ne peut rien payer par erreur.

## Configurer le paiement avec Stripe (sans code, sans clé secrète)

Stripe gère la page de paiement **et** la saisie de l'adresse (avec suggestion automatique d'adresse). Ton site ne voit jamais les cartes bancaires.

1. Crée un compte sur stripe.com (il te demandera ton SIRET et ton RIB).
2. *Catalogue de produits* → **Ajouter un produit** : « Carton Plein ! », 19,90 €, paiement unique.
3. *Liens de paiement* → **Nouveau** — premier lien, « livraison » :
   - Produit Carton Plein !, cocher **Autoriser les clients à modifier la quantité** (1 à 5) ;
   - **Collecter les adresses** → adresses de livraison, pays autorisé : France ;
   - **Ajouter des frais de livraison** : « Colissimo », 9,90 € ;
   - Cocher **Exiger le numéro de téléphone** (utile au transporteur) ;
   - Onglet *Après le paiement* → **Rediriger vers ton site** : `https://ton-domaine/merci.html`.
4. Deuxième lien, « retrait » : identique, mais **sans** adresse de livraison ni frais de port.
5. Copie les deux adresses `https://buy.stripe.com/...` dans `config.js` (`liensPaiement.livraison` et `liensPaiement.retrait`).
6. Teste d'abord en **mode test** de Stripe (carte `4242 4242 4242 4242`), puis bascule en mode réel.

Chaque commande apparaît dans ton tableau de bord Stripe avec l'adresse, et tu reçois un e-mail. Les adresses `buy.stripe.com` sont publiques par nature : aucune clé API n'est dans le site.

## Mettre en ligne avec GitHub Pages

1. Crée un dépôt, dépose **le contenu** de ce dossier à la racine (pas le dossier lui-même).
2. *Settings → Pages* : source = branche `main`, dossier `/ (root)`.
3. Si tu as un nom de domaine : *Custom domain*, puis coche **Enforce HTTPS**.
4. La page `404.html` est utilisée automatiquement.

## Formulaire de contact et statistiques (facultatif, gratuits)

- **Formspree** (formulaire) : crée un formulaire sur formspree.io, colle son adresse dans `formulaireContact`. Sans ça, le formulaire affiche ton e-mail.
- **GoatCounter** (statistiques) : crée un compte sur goatcounter.com, mets ton code dans `goatcounter`. Il ne compte que les visiteurs qui ont cliqué « Accepter ».

## Passer de la précommande à la vente en stock

Dans `config.js` : `enPrecommande: false`. Le bandeau rouge disparaît et les textes passent en « En stock ».

## Les 19 points vérifiés

| # | Point | Où c'est fait |
|---|---|---|
| 1 | Page RGPD | `confidentialite.html` (données, durées, destinataires, droits, CNIL) |
| 2 | Page CGU | `cgv.html` (vente + utilisation du site et du jeu en ligne) |
| 3 | API hors front-end | Aucune clé dans le site : Stripe par liens publics, Formspree et GoatCounter par adresses publiques |
| 4 | HTTPS forcé | Redirection en JavaScript + `upgrade-insecure-requests` + `.htaccess` + « Enforce HTTPS » sur GitHub |
| 5 | Bannière cookies | Accepter / Refuser à égalité, choix gardé 6 mois, lien « Gérer les cookies » en pied de page |
| 6 | Meta title | Un titre et une description propres à chaque page |
| 7 | Image réseaux | `assets/img/og-image.jpg` (1200 × 630) |
| 8 | Favicon | `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png` |
| 9 | Sitemap + robots.txt | À la racine |
| 10 | Textes des images | Chaque image a un texte alternatif descriptif |
| 11 | Images compressées | WebP, deux tailles par photo (≈ 15 Ko et ≈ 40 Ko) |
| 12 | Vitesse | Aucune bibliothèque, polices hébergées sur le site, images chargées au défilement |
| 13 | Contraste | Toutes les couleurs de texte au niveau WCAG AA (4,5:1 minimum) |
| 14 | Responsive | Testé à 390 px (téléphone) et 1366 px (ordinateur), sans défilement horizontal |
| 15 | Page 404 | `404.html` (« Suite tronquée ») |
| 16 | Liens cassés | Toutes les pages parcourues automatiquement : aucun lien ni ancre cassé |
| 17 | Validation des formulaires | Messages d'erreur en français sous chaque champ, CGV obligatoires avant paiement |
| 18 | Anti-spam | Champ piège invisible + refus des envois en moins de 3 secondes |
| 19 | Analytics | GoatCounter, sans cookie, chargé seulement après accord |

Bonus : les polices du jeu sont désormais hébergées sur le site (plus aucune requête vers Google, ce qui est aussi meilleur pour le RGPD).
