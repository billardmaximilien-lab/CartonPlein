/* =========================================================================
   CARTON PLEIN ! — RÉGLAGES DU SITE
   C'est le SEUL fichier à modifier pour changer le prix, les liens de
   paiement, la date de livraison, etc. Aucune clé secrète ne doit jamais
   être écrite ici : tout ce qui est dans ce fichier est public.
   ========================================================================= */
window.CARTON_PLEIN = {

  // --- Vente -------------------------------------------------------------
  prix: 19.90,                    // prix d'un jeu, en euros TTC
  fraisLivraison: 9.90,           // Colissimo domicile, par commande
  enPrecommande: true,            // true = précommande, false = en stock
  livraisonPrevue: "avant le 20 décembre 2026",
  lieuRetrait: "Conquereuil (Loire-Atlantique)",
  quantiteMax: 5,

  // --- Paiement (Stripe Payment Links) -----------------------------------
  // Crée deux « liens de paiement » dans ton tableau de bord Stripe et colle-les ici.
  // Ce sont des adresses PUBLIQUES (https://buy.stripe.com/...) : aucune clé API.
  liensPaiement: {
    livraison: "https://buy.stripe.com/A_REMPLACER_LIVRAISON",
    retrait:   "https://buy.stripe.com/A_REMPLACER_RETRAIT"
  },

  // --- Formulaire de contact (Formspree, offre gratuite) ----------------------
  // Crée un formulaire sur https://formspree.io et colle son adresse ici.
  // Laisse vide pour afficher simplement l'adresse e-mail ci-dessous.
  formulaireContact: "",
  emailContact: "a-remplacer@exemple.fr",   // ton adresse e-mail de contact

  // --- Mesure d'audience (GoatCounter : sans cookie, gratuit, respectueux) --
  // Crée un compte sur https://www.goatcounter.com et indique ton code ici
  // (ex. "cartonplein" pour https://cartonplein.goatcounter.com). Vide = désactivé.
  goatcounter: ""
};
