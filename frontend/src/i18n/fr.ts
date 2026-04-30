import type { Translations } from './es';

const fr: Translations = {
  // ── Common ──
  common: {
  save: 'Enregistrer les modifications',
  cancel: 'Annuler',
  loading: 'Chargement...',
  error: 'Erreur',
  success: 'Succès',
  confirm: 'Confirmer',
  delete: 'Supprimer',
  edit: 'Modifier',
  close: 'Fermer',
  back: 'Retour',
  search: 'Rechercher',
  noResults: 'Aucun résultat',
  retry: 'Réessayer',
  yes: 'Oui',
  no: 'Non',
  or: 'ou',
  and: 'et',
  of: 'de',
  basedOn: 'Classification basée sur son',
  analyzedOn: 'Analysé le',
  unlimited: 'Illimité',
  yearlyChange: 'Variation annuelle',
  detailedAnalysis: 'Analyse détaillée de ce facteur pour l\'actif.',
  shortTermFactor: 'Facteur pertinent à court terme.',
  midTermFactor: 'Facteur pertinent à moyen terme.',
  longTermFactor: 'Facteur déterminant à long terme.',
  active: 'Actif',
},

// ── Auth ──
auth: {
  login: 'Se connecter',
  loggingIn: 'Connexion...',
  register: "S'inscrire",
  logout: 'Se déconnecter',
  logoutMobile: 'Se déconnecter',
  email: 'Adresse e-mail',
  password: 'Mot de passe',
  confirmPassword: 'Confirmer le nouveau mot de passe',
  currentPassword: 'Mot de passe actuel',
  newPassword: 'Nouveau mot de passe',
  rememberSession: 'Se souvenir de moi',
  forgotPassword: 'Mot de passe oublié ?',
  noAccount: "Vous n'avez pas de compte ?",
  hasAccount: 'Vous avez déjà un compte ?',
  welcomeBack: 'Bon retour',
  loginSubtitle: 'Connectez-vous pour accéder à votre tableau de bord',
  emailPlaceholder: 'user@example.com',
  passwordMinLength: 'Le mot de passe doit contenir au moins 6 caractères.',
  serverError: 'Erreur de connexion au serveur. Veuillez réessayer.',
  wrongPassword: 'Mot de passe incorrect. Veuillez réessayer.',
  showPassword: 'Afficher le mot de passe',
  hidePassword: 'Masquer le mot de passe',
  systemFooter: 'Système d\'analyse des risques financiers · TFG',
  // Left panel
  brandName: 'Analyse des risques',
  brandSubtitle: 'Plateforme financière · TFG',
  headline1: 'Prenez des décisions',
  headline2: 'basées sur des données',
  headlineDesc: 'Analysez des actions, des cryptomonnaies et des actifs dans le monde entier avec des métriques de risque quantitatives en temps réel.',
  feature1Title: 'Données en temps réel',
  feature1Desc: 'Prix et indicateurs mis à jour depuis Yahoo Finance',
  feature2Title: 'Analyse avancée',
  feature2Desc: 'Volatilité, ratio de Sharpe, VaR, drawdown et plus',
  feature3Title: 'Gestion du risque',
  feature3Desc: 'Évaluez et comparez le risque de n\'importe quel actif',
  feature4Title: 'Suivi personnalisé',
  feature4Desc: 'Créez instantanément votre liste d\'actifs favoris',
},

// ── Register ──
register: {
  title: 'Créer un compte',
  subtitle: "Inscrivez-vous pour commencer à analyser",
  name: 'Nom complet',
  namePlaceholder: 'Votre nom',
  emailPlaceholder: 'vous@email.com',
  passwordPlaceholder: 'Minimum 8 caractères',
  confirmPlaceholder: 'Répéter le mot de passe',
  submit: 'Créer un compte',
  creating: 'Création du compte...',
  termsPrefix: "En vous inscrivant, vous acceptez nos",
  terms: 'Conditions générales',
  privacyPrefix: 'et la',
  privacy: 'Politique de confidentialité',
  passwordReqs: 'Le mot de passe doit contenir :',
  req8Chars: 'Au moins 8 caractères',
  reqUpper: 'Une lettre majuscule',
  reqNumber: 'Un chiffre',
  reqSymbol: 'Un symbole spécial',
  passwordsNoMatch: 'Les mots de passe ne correspondent pas.',
},

// ── Verify Email ──
verifyEmail: {
  title: 'Vérifiez votre e-mail',
  subtitle: 'Nous avons envoyé un code à 6 chiffres à',
  codePlaceholder: 'Code à 6 chiffres',
  verify: 'Vérifier',
  verifying: 'Vérification...',
  resend: 'Renvoyer le code',
  resending: 'Renvoi...',
  resent: 'Code renvoyé avec succès',
  backToLogin: 'Retour à la connexion',
  codeExpires: 'Le code expire dans 15 minutes',
},

// ── Forgot / Reset Password ──
forgotPwd: {
  title: 'Récupérer le mot de passe',
  subtitle: 'Entrez votre e-mail pour recevoir un lien de récupération',
  send: 'Envoyer le lien',
  sending: 'Envoi...',
  backToLogin: 'Retour à la connexion',
},
resetPwd: {
  title: 'Réinitialiser le mot de passe',
  subtitle: 'Entrez votre nouveau mot de passe',
  submit: 'Réinitialiser le mot de passe',
  submitting: 'Réinitialisation...',
},

// ── Header / Nav ──
nav: {
  home: 'Accueil',
  analysis: 'Analyse',
  technicalAnalysis: 'Analyse technique',
  fundamentalAnalysis: 'Analyse fondamentale',
  quantitativeAnalysis: 'Analyse quantitative',
  compareAssets: 'Comparer des actifs',
  recommendation: 'Recommandation',
  journaling: 'Journal',
  autoTrader: 'AutoTrader',
  more: 'Plus',
  strategies: 'Stratégies',
  psychoanalysis: 'Psychoanalyse',
  search: 'Rechercher',
  profile: 'Profil',
  myProfile: 'Mon profil',
  closeSession: 'Se déconnecter',
  riskAnalysis: 'Analyse des risques',
  riskManagement: 'Gestion du risque financier',
},

// ── Home Page ──
home: {
  goodMorning: 'Bonjour',
  goodAfternoon: 'Bon après-midi',
  goodEvening: 'Bonsoir',
  marketSummary: 'Voici votre résumé du marché pour aujourd\'hui.',
  registeredOps: 'Opérations enregistrées',
  strategies: 'Stratégies',
  tracking: 'Suivi',
  weeklyActivity: 'Activité hebdomadaire',
  analyzeRisk: 'Analyser le risque',
  analyzeRiskDesc: 'Évaluez le risque de vos investissements et prenez des décisions éclairées',
  viewAssets: 'Voir les actifs',
  followUp: 'Suivi',
  manage: 'Gérer',
  marketNews: 'Actualités du marché',
  viewMore: 'Voir plus',
  others: 'Autres',
  days: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
  agoMin: 'il y a {n} min',
  agoHours: 'il y a {n} h',
  agoDays: 'il y a {n} j',
},

// ── Profile Page ──
profile: {
  editProfile: 'Modifier le profil',
  editProfileDesc: 'Gérez vos paramètres et préférences personnelles',
  personalInfo: 'Informations personnelles',
  name: 'Nom',
  email: 'E-mail',
  preferences: 'Préférences',
  notifications: 'Notifications',
  notificationsDesc: 'Recevez des alertes sur les changements de risque',
  darkMode: 'Mode sombre',
  darkModeDesc: 'Activer le thème sombre',
  language: 'Langue',
  languageDesc: "Sélectionnez la langue de l'interface",
  spanish: 'Espagnol',
  english: 'Anglais',
  german: 'Allemand',
  french: 'Français',
  saving: 'Enregistrement...,',
  profileUpdated: 'Profil mis à jour avec succès',
  profileError: 'Erreur lors de la mise à jour du profil',
  darkModeError: 'Erreur lors de l\'enregistrement du mode sombre',
  languageError: 'Erreur lors de l\'enregistrement de la langue',
  security: 'Sécurité',
  changePassword: 'Changer le mot de passe',
  changingPassword: 'Modification...',
  passwordUpdated: 'Mot de passe mis à jour avec succès',
  passwordNoMatch: 'Les mots de passe ne correspondent pas',
  passwordMinLength: 'Le mot de passe doit contenir au moins 6 caractères',
  passwordChangeError: 'Erreur lors du changement de mot de passe',
  lastPasswordUpdate: 'Dernière mise à jour du mot de passe :',
  accountInfo: 'Informations du compte',
  userId: 'ID utilisateur',
  accountCreated: 'Compte créé',
  lastUpdate: 'Dernière mise à jour',
  accountStatus: 'Statut du compte',
  loadingProfile: 'Chargement du profil...',
},

  // ── Sidebar ──
sidebar: {
  news: 'Actualités',
  reloadNews: 'Actualiser les actualités',
  markets: 'Marchés',
  asset: 'Actif',
  updatedAgo: 'Mis à jour il y a {n} min',
  analyzeAssetForNews: 'Analysez un actif pour voir les actualités associées.',
  noNewsAvailable: 'Aucune actualité disponible pour le moment.',
  errorLoadingNews: 'Impossible de charger les actualités. Veuillez réessayer.',
  source: 'Source : Yahoo Finance',
  now: 'maintenant',
  agoM: 'il y a {n} min',
  agoH: 'il y a {n} h',
  agoD: 'il y a {n} j',
},

// ── Footer ──
footer: {
  description: 'Plateforme professionnelle d\'analyse et de gestion des risques financiers pour les investisseurs modernes.',
  quickLinks: 'Liens rapides',
  home: 'Accueil',
  aboutUs: 'À propos',
  services: 'Services',
  blog: 'Blog',
  contact: 'Contact',
  contactTitle: 'Contact',
  followUs: 'Suivez-nous',
  copyright: '© 2026 Analyse des risques financiers. Tous droits réservés.',
  privacy: 'Politique de confidentialité',
  terms: 'Conditions générales',
  cookies: 'Politique de cookies',
},

// ── Assets Page ──
assets: {
  title: 'Rechercher des actifs',
  subtitle: 'Recherchez et analysez des actions, cryptomonnaies et plus',
  searchPlaceholder: 'Rechercher par nom ou symbole (ex. : AAPL, KO, NFLX)...',
  watchlist: 'Watchlist',
  recentSearches: 'Recherches',
  noWatchlistItems: 'Votre watchlist est vide.',
  addFirst: 'Ajoutez votre premier actif en effectuant une recherche ci-dessus.',
  noRecentSearches: 'Aucune recherche récente.',
  type: 'Type',
  stock: 'Action',
  crypto: 'Crypto',
  forex: 'Forex',
},

assetDetail: {
  currentPrice: 'Prix actuel',
  loading: 'Chargement des données...',
  noData: 'Aucune donnée de prix disponible',
  high: 'Haut',
  average: 'Moyenne',
  low: 'Bas',
  priceEvolution: 'Évolution du prix',
  loadingChart: 'Chargement du graphique...',
  noChartData: 'Aucune donnée disponible pour cet intervalle',
  generalInfo: 'Informations générales',
  basicData: 'Données de base',
  symbol: 'Symbole :',
  name: 'Nom :',
  type: 'Type :',
  stock: 'Action',
  crypto: 'Cryptomonnaie',
  forex: 'Forex',
  valuationMeasures: 'Mesures de valorisation',
  financialHighlights: 'Indicateurs financiers',
  marketCap: 'Capitalisation boursière',
  peRatio: 'Ratio P/E',
  pegRatio: 'Ratio PEG',
  priceToSales: 'Prix/Ventes',
  priceToBook: 'Prix/Valeur comptable',
  evToEbitda: 'EV/EBITDA',
  eps: 'BPA (TTM)',
  dividendYield: 'Rendement du dividende',
  beta: 'Bêta',
  roe: 'ROE',
  roa: 'ROA',
  profitMargin: 'Marge bénéficiaire',
  fiftyTwoWeekHigh: 'Plus haut sur 52 semaines',
  fiftyTwoWeekLow: 'Plus bas sur 52 semaines',
  averageVolume: 'Volume moyen',
  marketInfo: 'Informations de marché',
  volume24h: 'Volume 24h',
  circulatingSupply: 'Offre en circulation',
  totalSupply: 'Offre totale',
  description: 'Description',
  recentHistory: 'Historique récent',
  limitedData: 'Données limitées disponibles. Certaines métriques financières sont actuellement inaccessibles.',
  noFinancialData: 'Les données financières détaillées ne peuvent pas être récupérées pour le moment.',
  noMarketData: 'Les données de marché ne peuvent pas être récupérées pour le moment.',
  notAvailable: 'Non disponible',
  removeWatchlist: 'Retirer de la watchlist',
  addWatchlist: 'Ajouter à la watchlist',
  intervals: {
    '5min': '5 min',
    '15min': '15 min',
    '30min': '30 min',
    '1h': '1 heure',
    '4h': '4 heures',
    '12h': '12 heures',
    '1d': 'Journalier',
    '1wk': 'Hebdomadaire',
    '1mo': 'Mensuel',
    'all': 'Historique',
  }
},

// ── Calendar Page ──
calendar: {
  title: 'Journal de trading',
  subtitle: 'Enregistrez et analysez vos trades quotidiens',
  today: "Aujourd'hui",
  previousMonth: 'Mois précédent',
  nextMonth: 'Mois suivant',
  totalPnL: 'P&L total',
  operations: 'Opérations',
  noOperations: 'Aucune opération enregistrée pour cette date.',
  addOperation: 'Ajouter une opération',
},

// ── Compare Page ──
compare: {
  title: 'Comparer des actifs',
  subtitle: 'Comparez la performance et le risque de plusieurs actifs',
  addAsset: 'Ajouter un actif',
  searchPlaceholder: 'Ex. : {symbol}',
  asset: 'Actif',
  remove: 'Supprimer',
  compare: 'Comparer',
  noAssetsSelected: 'Sélectionnez au moins deux actifs à comparer.',
},

  // ── Risk Analysis Page ──
riskAnalysis: {
  title: 'Analyse des risques',
  description: 'Calcule des indicateurs de risque avancés pour tout actif financier',
  period: 'Période :',
  interval: 'Intervalle :',
  currentDataOnly: 'Données actuelles — indépendantes de la période sélectionnée',
  sixMonths: '6 mois',
  oneYear: '1 an',
  threeYears: '3 ans',
  fiveYears: '5 ans',
  tenYears: '10 ans',
  tabTechnical: 'Analyse technique',
  tabFundamental: 'Analyse fondamentale',
  tabQuantitative: 'Analyse quantitative',
  detailedTitleTechnical: 'Analyse technique du risque',
  detailedTitleFundamental: 'Analyse fondamentale du risque',
  detailedTitleQuantitative: 'Analyse quantitative du risque',
  searchAsset: 'Rechercher un actif à analyser...',
  searchPlaceholder: 'Symbole de l\'actif (ex : AAPL, BTC-USD, MSFT)',
  selectPeriod: 'Sélectionner la période',
  analyze: 'Analyser',
  analyzing: 'Analyse en cours...',
  riskLow: 'Faible',
  riskMedium: 'Modéré',
  riskHigh: 'Élevé',
  noData: 'Données fondamentales non disponibles pour cet actif.',
  noDataAll: 'Entrez un symbole pour analyser son risque',
  tryWith: 'Essayer avec',
  recent: 'Récent :',
  popular: 'Populaire :',
  tracking: 'Suivi :',
  missingMetrics: 'Indicateurs non disponibles pour cet actif',

  volatility: {
    high: 'forte volatilité',
    moderate: 'volatilité modérée',
    low: 'faible volatilité',
  },

  drawdown: {
    high: 'fortes baisses historiques',
    moderate: 'baisses modérées',
    low: 'baisses limitées',
  },

  metrics: {
    marketCap: {
      label: "Capitalisation boursière",
      desc: "Valeur totale de l\'actif sur le marché. Pour les actions : prix × actions en circulation. Pour les cryptos : indique la taille relative du projet."
    },
    peRatio: {
      label: "Ratio P/E",
      desc: "Ratio cours/bénéfice. Un P/E faible peut indiquer une sous-évaluation si l\'entreprise est solide."
    },
    beta: {
      label: "Bêta",
      desc: "Mesure la volatilité par rapport au marché. <1 moins volatile, >1 plus volatile. Important pour le risque systémique."
    },
    eps: {
      label: "BPA",
      desc: "Résultat net divisé par le nombre d\'actions. Indique la rentabilité par action."
    },
    netMargin: {
      label: "Marge nette",
      desc: "Pourcentage de revenus restant après dépenses. Une marge élevée indique une bonne efficacité."
    },
    roe: {
      label: "ROE",
      desc: "Mesure l\'efficacité avec laquelle l\'entreprise utilise les fonds des actionnaires pour générer des profits."
    },
    dividend: {
      label: "Rendement du dividende",
      desc: "Pourcentage du prix distribué annuellement. Important pour les stratégies de revenus passifs."
    },
    week52Range: {
      label: "Plage 52 semaines",
      desc: "Plus haut et plus bas sur un an. Permet de situer le prix actuel."
    },
    circulatingSupply: {
      label: "Offre en circulation",
      desc: "Tokens ou coins disponibles au public. Influence la rareté et la valeur."
    },
    maxSupply: {
      label: "Offre maximale",
      desc: "Limite maximale d\'émission. Sans limite, l\'actif peut être inflationniste."
    },
    volume24h: {
      label: "Volume 24h",
      desc: "Volume total échangé sur les 24 dernières heures."
    },
    totalAssets: {
      label: "Actifs (AUM)",
      desc: "Valeur totale des actifs sous gestion du fonds."
    },
    navPrice: {
      label: "Valeur liquidative (NAV)",
      desc: "Valeur nette par part."
    },
    beta3Year: {
      label: "Bêta (3 ans)",
      desc: "Volatilité par rapport à son indice de référence sur 3 ans."
    },
    fiveYearAverageReturn: {
      label: "Rendement 5 ans",
      desc: "Rendement annualisé moyen sur 5 ans."
    },
    ytdReturn: {
      label: "Rendement YTD",
      desc: "Rendement cumulé depuis le début de l\'année."
    },
    annualReportExpenseRatio: {
      label: "Frais (TER)",
      desc: "Frais de gestion annuels totaux du fonds."
    },
  },

  sections: {
    helpWhat: 'Ce que cette section analyse',
    helpImportance: 'Pourquoi c\'est important sur cet horizon',

    overview: {
      title: 'Vue d\'ensemble',
      desc: 'Contexte de l\'actif sur la période choisie.',
      short: 'Donne un contexte de prix immédiat.',
      mid: 'Évalue la tendance moyen terme.',
      long: 'Définit le cadre stratégique de l\'actif.'
    },

    valuation: {
      title: 'Valorisation',
      desc: 'Analyse si le prix actuel est raisonnable.',
      short: 'Important pour les rebonds techniques.',
      mid: 'Crucial pour les cycles d\'investissement.',
      long: 'Détermine la valeur intrinsèque réelle.'
    },

    profitability: {
      title: 'Rentabilité',
      desc: 'Capacité à générer des profits ou de l\'activité réseau.',
      short: 'Impact limité à très court terme.',
      mid: 'Montre la santé de l\'activité.',
      long: 'Principal moteur de rendement long terme.'
    },

    stability: {
      title: 'Stabilité',
      desc: 'Analyse la tendance, la volatilité et les risques.',
      short: 'Critique pour le contrôle du risque quotidien.',
      mid: 'Définit la durabilité des mouvements.',
      long: 'Assure la survie de l\'actif.'
    },
  },

  missingNotes: {
    CRYPTOCURRENCY: {
      peRatio: "Les cryptos ne génèrent pas de bénéfices comptables.",
      eps: "Il n\'existe pas de BPA pour les actifs décentralisés.",
      beta: "La corrélation avec les marchés traditionnels est instable.",
      netMargin: "Aucune structure d\'entreprise pour calculer des marges.",
      roe: "Aucun capital actionnarial pour calculer le ROE.",
      dividend: "Les cryptos ne versent pas de dividendes."
    },
    ETF: {
      eps: "Un ETF ne génère pas de BPA propre.",
      netMargin: "Les marges concernent les actifs sous-jacents.",
      roe: "Le ROE n\'est pas applicable aux ETF."
    },
    EQUITY: {
      dividend: "Cette entreprise ne verse pas de dividendes actuellement.",
      peRatio: "Impossible si les bénéfices sont négatifs.",
      pegRatio: "Dépend de projections futures non disponibles."
    },
    GENERIC: {
      default: "Données non disponibles sur Yahoo Finance."
    }
  },

  education: {
    title: 'Qu\'est-ce que cela signifie ?',
    hide: 'Masquer l\'explication',
  },

  riskTitle: 'Risque {label}',
  disclaimer: 'Signal automatique informatif; ne constitue pas un conseil en investissement.',

  fundamental: {
    outlooks: {
      STRONG: 'Fort',
      MODERATE: 'Modéré',
      WEAK: 'Faible'
    },
    ranges: {
      '6mo': '6 mois',
      '1y': '1 an',
      '3y': '3 ans',
      '5y': '5 ans',
      '10y': '10 ans'
    },
    generating: 'Génération de l\'analyse fondamentale...',
    perspectiva: 'Perspectives pour {range} : {outlook}'
  },

  quantitative: {
    volatility: {
      label: 'Volatilité annualisée',
      sub: {
        veryHigh: 'Très élevée',
        high: 'Élevée',
        moderate: 'Modérée',
        low: 'Faible'
      },
      tooltip: 'Écart-type annualisé des rendements. Mesure la variation des prix.'
    },
    drawdown: {
      label: 'Drawdown max',
      sub: 'Plus forte baisse historique',
      tooltip: 'Plus grande baisse entre un sommet et un creux.'
    },
    sharpe: {
      label: 'Ratio de Sharpe',
      sub: {
        excellent: 'Excellent',
        good: 'Bon',
        acceptable: 'Acceptable',
        negative: 'Négatif'
      },
      tooltip: 'Rendement ajusté au risque.'
    },
    var: {
      label: 'VaR 95% (annuel)',
      sub: 'Perte max attendue',
      tooltip: 'Perte maximale attendue avec 95% de confiance.'
    },
    sortino: {
      label: 'Ratio de Sortino',
      tooltip: 'Mesure similaire au Sharpe, mais ne pénalise que la volatilité négative.'
    },
    calmar: {
      label: 'Ratio de Calmar',
      tooltip: 'Rendement vs drawdown maximal.'
    },
    guideTitle: 'Guide d\'interprétation',
    guide: {
      volatility: 'Variabilité des rendements.',
      sharpe: 'Rendement ajusté au risque.',
      drawdown: 'Pire chute historique.',
      var: 'Perte maximale probable.',
      sortino: 'Risque de baisse uniquement.',
      calmar: 'Rendement vs risque maximal.'
    }
  }
},

// ── Comparison Page ──
comparison: {
  title: 'Comparaison du risque des actifs',
  subtitle: 'Compare jusqu\'à 3 actifs financiers selon plusieurs dimensions',
  horizon: 'Horizon :',
  assetSlot: 'Actif {n}',
  addAsset: 'Ajouter un actif',
  compareButton: 'Comparer',
  comparingButton: 'Comparaison...',
  popular: 'Populaire :',
  watchlist: 'Watchlist :',
  history: 'Récent :',
  verdictTitle: 'Verdict IA',
  generateVerdict: 'Générer un verdict IA',
  generateVerdictDesc: 'Cliquez pour obtenir une analyse générée par IA.',
  mixedTypeWarning: 'Vous comparez des types d\'actifs différents.',
  metricsFavorable: 'indicateurs favorables',
  assetTypes: {
    EQUITY: 'Action',
    CRYPTOCURRENCY: 'Crypto',
    ETF: 'ETF'
  },
  trends: {
    alcista: '▲ Haussier',
    bajista: '▼ Baissier',
    neutral: 'Neutre'
  },
  errors: {
    minTwo: 'Au moins 2 actifs sont requis',
    verifyTickers: 'Vérifiez les symboles et réessayez.'
  },
  tables: {
    fundamental: {
      title: 'Analyse des risques fondamentaux',
      desc: 'Métriques de valorisation et de rentabilité',
      marketCap: 'Capitalisation Boursière',
      peRatio: 'Ratio P/E',
      roe: 'ROE',
      netMargin: 'Marge Nette',
      dividend: 'Dividende',
      eps: 'EPS',
      priceBook: 'Cours/Valeur Comptable',
      debtEquity: 'Endettement/Capitaux Propres',
    },
    technical: {
      title: 'Analyse des risques techniques',
      desc: 'Signaux et momentum sur la période sélectionnée',
      periodChange: 'Variation de la Période',
      rsi: 'RSI (14)',
      trend: 'Tendance',
      overSMA50: 'Au-dessus SMA50',
      overSMA200: 'Au-dessus SMA200',
      macd: 'MACD',
      technicalScore: 'Score Technique',
      bullish: 'Haussier',
      bearish: 'Baissier',
      yes: 'Oui',
      no: 'Non',
    },
    risk: {
      title: 'Analyse des risques quantitatifs',
      desc: 'Volatilité, drawdown et métriques de risque/rendement',
      volatilityAnnual: 'Volatilité Annuelle',
      annualizedReturn: 'Rendement Annualisé',
      sharpeRatio: 'Ratio de Sharpe',
      var95: 'VaR 95%',
      maxDrawdown: 'Drawdown Maximal',
      beta: 'Bêta',
    },
    metricHeader: 'Métrique'
  }
},

  // ── Recommendation Page ──
recommendation: {
  title: 'Analyse du risque et recommandation',
  subtitle: 'Calcule automatiquement les niveaux de Take Profit, Stop Loss et la gestion du risque.',
  financialAsset: 'Actif financier',
  searchPlaceholder: 'Ex : AAPL, BTC-USD...',
  popular: 'POPULAIRE',
  tradeDirection: 'Direction de la position',
  long: 'LONG (Achat)',
  short: 'SHORT (Vente)',
  timeframe: 'Unité de temps',
  slMethod: 'Méthode de Stop Loss',
  fixedPct: 'Pourcentage fixe',
  closestSupport: 'Support le plus proche',
  closestResistance: 'Résistance la plus proche',
  dynamicATR: 'ATR dynamique',
  recommended: 'RECOMMANDÉ',
  tpMethods: 'Méthodes de Take Profit',
  riskRewardRatio: 'Ratio risque/rendement',
  bollingerBands: 'Bandes de Bollinger',
  riskManagement: 'Gestion du risque',
  totalCapital: 'Capital total',
  riskPerTrade: 'Risque par trade',
  calculateLevels: 'Calculer les niveaux',
  recalculateLevels: 'Recalculer les niveaux',
  configureOperation: 'Configurer l\'opération',
  configureDesc: 'Entrez un symbole, choisissez vos paramètres à gauche et cliquez sur calculer pour obtenir une recommandation détaillée.',
  error: 'Erreur lors du chargement de l\'analyse',
  iaUnavailable: "Le service d'IA n'est pas disponible pour le moment. Veuillez réessayer.",
  calculationError: 'Erreur lors du calcul de la recommandation',
  insufficientCapital: 'La taille de la position dépasse le capital disponible. Réduisez le risque ou augmentez le stop loss.',
  signalContradictory: '⚠ Signal contradictoire',
  signalAligned: '✓ Signal aligné',
  signalNeutral: '~ Signal neutre',
  entryPriceLabel: "Prix d'entrée",
  confidence: 'Confiance',
  noJustification: 'Aucune justification générée.',
  techSignal: 'Signal technique',
  potential: 'Potentiel',
  units: 'unités',
  totalValue: 'Valeur totale',
  positionSize: 'Taille de position',
  riskPerCurrency: 'Risque / {currency}',
  noneValidTP: 'Aucun Take Profit valide calculé.',
  disclaimer: "Les niveaux sont purement informatifs et générés automatiquement. Ils ne constituent pas un conseil en investissement.",
  iaSummary: 'Résumé IA',
  iaGenerated: 'Généré automatiquement par IA. Ne constitue pas un conseil financier.',
  detailedJustification: 'Voir la justification détaillée (IA)',
  chatWithIA: 'Chat avec IA',
  contextual: 'Contextuel',
  clearChat: 'Effacer le chat',
  askWhatever: 'Posez vos questions sur {symbol}',
  typeYourQuestion: 'Écrivez votre question...',
  calculateFirst: 'Calculez d\'abord une recommandation pour activer le chat.',
  sma50: 'MM 50',
  sma200: 'MM 200',
  bollinger: 'Bollinger',
  chatSuggestions: [
    'Pourquoi ce stop loss ?',
    'Que dit le RSI actuellement ?',
    'Quel est le niveau de résistance principal ?',
    'Les indicateurs sont-ils en confluence ?'
  ]
},

// ── Strategies Page ──
strategies: {
  title: 'Stratégies',
  subtitle: 'Organisez et évaluez vos stratégies de trading',
  createStrategy: 'Créer une stratégie',
  noStrategies: "Vous n'avez encore aucune stratégie.",
  createFirst: 'Créez votre première stratégie pour organiser vos opérations.',
  strategyName: 'Nom de la stratégie',
  description: 'Description',
  color: 'Couleur',
},

// ── Psychoanalysis Page ──
psycho: {
  title: 'Analyse psychologique du risque',
  subtitle: 'Analyse de votre comportement et de vos schémas de trading',
  noData: 'Enregistrez des opérations pour générer votre analyse comportementale.',
  generalStats: 'Statistiques générales',
  assetPerformance: 'Performance des actifs',
  temporalPatterns: 'Schémas temporels',
  behaviorAnalysis: 'Analyse du comportement',
  alerts: 'Alertes de risque',
  analyzing: 'Analyse des opérations...',
  error: "Erreur lors du chargement de l'analyse psychologique",
  strategy: 'Stratégie :',
  from: 'De :',
  to: 'À :',
  clearFilters: 'Effacer les filtres',
  generalAll: 'Général (tout)',
  highRisk: 'Risque psychologique élevé',
  mediumRisk: 'Risque psychologique modéré',
  excellentPsychology: 'Psychologie excellente',
  noBehaviorRisk: 'Aucun risque psychologique détecté',
  behaviorAlerts: 'Résumé du comportement',
  noPatternsDetected: "Aucun schéma émotionnel à risque détecté. Votre discipline de trading est exemplaire.",
  analyzing_ops: 'Analyse en cours',
  noDataAvailable: 'Aucune donnée disponible',
  detectedAlerts: '{count} alertes comportementales détectées.',
  highRiskPatterns: 'Des schémas à haut risque (trading de revanche ou spirales) ont été détectés.',
  disciplineIssues: 'Des signes de manque de discipline ont été détectés.',
  minorIssues: 'Quelques incohérences mineures dans votre trading.',
  analyzingOps: 'Analyse de {count} opérations',
  positiveReturnability: 'Rentabilité positive',
  winRateAbove50: '✅ Votre taux de réussite est supérieur à 50%.',
  winRateBelow50: '⚠️ Votre taux de réussite est inférieur à 50%.',
  recoverySuccess: '✅ Bonne capacité de récupération ({rate}% de succès).',
  recoveryLow: '⚠️ Faible taux de récupération ({rate}%).',
  moreOpsAfterLoss: '⚠️ Vous tradez davantage après des pertes. Potentiel comportement risqué.',
  controlledBehavior: 'Comportement contrôlé : moins de trades après pertes.',
},

  // ── News Page ──
news: {
  title: 'Actualités financières',
  subtitle: 'Dernières nouvelles des marchés financiers',
  searchPlaceholder: 'Rechercher des actualités...',
  noNews: 'Aucune actualité disponible.',
},

// ── Technical Analysis (TechnicalAnalysisPanel) ──
technicalAnalysis: {
  title: 'Analyse technique du risque',
  generating: 'Analyse technique en cours de génération...',
  noData: 'Données techniques non disponibles pour cet actif.',
  disclaimer: "Signal automatique informatif; ne constitue pas un conseil en investissement.",
  signalDisclaimer: "Ce signal est purement informatif et est généré automatiquement à partir d\'indicateurs techniques. Il ne constitue pas un conseil financier ou une recommandation d\'investissement.",
  regenerateSummary: "Régénérer le résumé IA",
  generateSummary: "Générer le résumé IA",
  aiSummary: 'Résumé IA',
  overlays: 'Superpositions :',
  export: 'Exporter',
  exportPNG: 'Exporter PNG',
  dataLimitWarning: "Les données pour l\'intervalle {interval} sur Yahoo Finance sont limitées à {days} jours historiques.",
  historicalDataLimit: 'jours historiques',
  analysisError: "Erreur lors de l\'analyse de l\'actif",
  summaryGenerationError: 'Impossible de générer le résumé.',
  serviceUnavailable: "Le service d\'IA n\'est pas disponible pour le moment.",
  signals: {
    'COMPRA FUERTE': 'Achat fort',
    'COMPRA': 'Achat',
    'NEUTRAL': 'Neutre',
    'VENTA': 'Vente',
    'VENTA FUERTE': 'Vente forte',
  },
  indicators: {
    movingAverages: 'Moyennes mobiles',
    rsi: 'RSI',
    macd: 'MACD',
    bollinger: 'Bandes de Bollinger',
    obv: 'Volume / OBV',
  },
  sr: {
    title: 'Niveaux de support et de résistance',
    supports: 'Supports',
    resistances: 'Résistances',
    noSupports: 'Aucun support clair détecté',
    noResistances: 'Aucune résistance claire détectée',
    strength: 'Force :',
    resistance: 'Résistance',
    support: 'Support',
  },
  aiDisclaimer: "Généré automatiquement par IA à partir d\'indicateurs techniques calculés. Ne constitue pas un conseil financier.",
},

// ── Bots Page ──
bots: {
  title: 'AutoTrader',
  subtitle: 'Bots de trading automatisés',
  createBot: 'Créer un bot',
  noBots: "Vous n\'avez encore aucun bot.",
  createFirst: 'Créez votre premier bot automatisé.',
  botName: 'Nom du bot',
  symbol: 'Symbole',
  strategy: 'Stratégie',
  momentum: 'Momentum',
  meanReversion: 'Retour à la moyenne',
  initialCapital: 'Capital initial',
  start: 'Démarrer',
  stop: 'Arrêter',
  running: 'En cours',
  stopped: 'Arrêté',
},

// ── IA ──
ia: {
  disclaimer: "Généré automatiquement par IA à partir de données calculées. Ne constitue pas un conseil financier."
}
};

export default fr;
