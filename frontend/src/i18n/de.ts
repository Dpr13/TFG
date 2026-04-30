import type { Translations } from './es';

const de: Translations = {
  // ── Common ──
  common: {
    save: 'Änderungen speichern',
    cancel: 'Abbrechen',
    loading: 'Wird geladen...',
    error: 'Fehler',
    success: 'Erfolg',
    confirm: 'Bestätigen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    close: 'Schließen',
    back: 'Zurück',
    search: 'Suchen',
    noResults: 'Keine Ergebnisse',
    retry: 'Erneut versuchen',
    yes: 'Ja',
    no: 'Nein',
    or: 'oder',
    and: 'und',
    of: 'von',
    basedOn: 'Klassifizierung basierend auf seinem',
    analyzedOn: 'Analysiert am',
    unlimited: 'Unbegrenzt',
    yearlyChange: 'Jährliche Veränderung',
    detailedAnalysis: 'Detaillierte Analyse dieses Faktors für das Asset.',
    shortTermFactor: 'Relevanter Faktor kurzfristig.',
    midTermFactor: 'Relevanter Faktor mittelfristig.',
    longTermFactor: 'Bestimmender Faktor langfristig.',
    active: 'Aktiv',
  },

  // ── Auth ──
  auth: {
    login: 'Anmelden',
    loggingIn: 'Anmeldung läuft...',
    register: 'Registrieren',
    logout: 'Abmelden',
    logoutMobile: 'Abmelden',
    email: 'E-Mail-Adresse',
    password: 'Passwort',
    confirmPassword: 'Neues Passwort bestätigen',
    currentPassword: 'Aktuelles Passwort',
    newPassword: 'Neues Passwort',
    rememberSession: 'Angemeldet bleiben',
    forgotPassword: 'Passwort vergessen?',
    noAccount: 'Noch kein Konto?',
    hasAccount: 'Bereits ein Konto?',
    welcomeBack: 'Willkommen zurück',
    loginSubtitle: 'Melde dich an, um auf dein Dashboard zuzugreifen',
    emailPlaceholder: 'user@example.com',
    passwordMinLength: 'Das Passwort muss mindestens 6 Zeichen lang sein.',
    serverError: 'Fehler bei der Verbindung zum Server. Bitte versuche es erneut.',
    wrongPassword: 'Falsches Passwort. Bitte versuche es erneut.',
    showPassword: 'Passwort anzeigen',
    hidePassword: 'Passwort ausblenden',
    systemFooter: 'Finanzrisiko-Analysesystem · TFG',
    // Left panel
    brandName: 'Risikoanalyse',
    brandSubtitle: 'Finanzplattform · TFG',
    headline1: 'Treffe Entscheidungen',
    headline2: 'auf Basis von Daten',
    headlineDesc: 'Analysiere Aktien, Kryptowährungen und Vermögenswerte weltweit mit quantitativen Risikometriken in Echtzeit.',
    feature1Title: 'Echtzeitdaten',
    feature1Desc: 'Preise und Kennzahlen aktualisiert von Yahoo Finance',
    feature2Title: 'Erweiterte Analyse',
    feature2Desc: 'Volatilität, Sharpe-Ratio, VaR, Drawdown und mehr',
    feature3Title: 'Risikomanagement',
    feature3Desc: 'Bewerte und vergleiche das Risiko beliebiger Assets',
    feature4Title: 'Personalisierte Verfolgung',
    feature4Desc: 'Erstelle sofort deine Liste favorisierter Assets',
  },

  // ── Register ──
  register: {
    title: 'Konto erstellen',
    subtitle: 'Registriere dich, um mit der Analyse zu beginnen',
    name: 'Vollständiger Name',
    namePlaceholder: 'Dein Name',
    emailPlaceholder: 'du@email.com',
    passwordPlaceholder: 'Mindestens 8 Zeichen',
    confirmPlaceholder: 'Passwort wiederholen',
    submit: 'Konto erstellen',
    creating: 'Konto wird erstellt...',
    termsPrefix: 'Mit der Registrierung akzeptierst du unsere',
    terms: 'Allgemeinen Geschäftsbedingungen',
    privacyPrefix: 'und die',
    privacy: 'Datenschutzrichtlinie',
    passwordReqs: 'Das Passwort muss enthalten:',
    req8Chars: 'Mindestens 8 Zeichen',
    reqUpper: 'Einen Großbuchstaben',
    reqNumber: 'Eine Zahl',
    reqSymbol: 'Ein Sonderzeichen',
    passwordsNoMatch: 'Die Passwörter stimmen nicht überein.',
  },

  // ── Verify Email ──
  verifyEmail: {
    title: 'E-Mail bestätigen',
    subtitle: 'Wir haben einen 6-stelligen Code gesendet an',
    codePlaceholder: '6-stelliger Code',
    verify: 'Bestätigen',
    verifying: 'Wird überprüft...',
    resend: 'Code erneut senden',
    resending: 'Wird erneut gesendet...',
    resent: 'Code erfolgreich erneut gesendet',
    backToLogin: 'Zurück zum Login',
    codeExpires: 'Der Code läuft in 15 Minuten ab',
  },

  forgotPwd: {
  title: 'Passwort wiederherstellen',
  subtitle: 'Gib deine E-Mail ein, um einen Wiederherstellungslink zu erhalten',
  send: 'Link senden',
  sending: 'Wird gesendet...',
  backToLogin: 'Zurück zum Login',
},
resetPwd: {
  title: 'Passwort zurücksetzen',
  subtitle: 'Gib dein neues Passwort ein',
  submit: 'Passwort zurücksetzen',
  submitting: 'Wird zurückgesetzt...',
},

// ── Header / Nav ──
nav: {
  home: 'Startseite',
  analysis: 'Analyse',
  technicalAnalysis: 'Technische Analyse',
  fundamentalAnalysis: 'Fundamentalanalyse',
  quantitativeAnalysis: 'Quantitative Analyse',
  compareAssets: 'Assets vergleichen',
  recommendation: 'Empfehlung',
  journaling: 'Journal',
  autoTrader: 'AutoTrader',
  more: 'Mehr',
  strategies: 'Strategien',
  psychoanalysis: 'Psychoanalyse',
  search: 'Suchen',
  profile: 'Profil',
  myProfile: 'Mein Profil',
  closeSession: 'Abmelden',
  riskAnalysis: 'Risikoanalyse',
  riskManagement: 'Finanzielles Risikomanagement',
},

// ── Home Page ──
home: {
  goodMorning: 'Guten Morgen',
  goodAfternoon: 'Guten Tag',
  goodEvening: 'Guten Abend',
  marketSummary: 'Hier ist deine Marktübersicht für heute.',
  registeredOps: 'Registrierte Operationen',
  strategies: 'Strategien',
  tracking: 'Tracking',
  weeklyActivity: 'Wöchentliche Aktivität',
  analyzeRisk: 'Risiko analysieren',
  analyzeRiskDesc: 'Bewerte das Risiko deiner Investitionen und treffe fundierte Entscheidungen',
  viewAssets: 'Assets anzeigen',
  followUp: 'Tracking',
  manage: 'Verwalten',
  marketNews: 'Marktnachrichten',
  viewMore: 'Mehr anzeigen',
  others: 'Andere',
  days: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  agoMin: 'vor {n} Min',
  agoHours: 'vor {n} Std',
  agoDays: 'vor {n} Tg',
},

// ── Profile Page ──
profile: {
  editProfile: 'Profil bearbeiten',
  editProfileDesc: 'Verwalte deine persönlichen Einstellungen und Präferenzen',
  personalInfo: 'Persönliche Informationen',
  name: 'Name',
  email: 'E-Mail',
  preferences: 'Einstellungen',
  notifications: 'Benachrichtigungen',
  notificationsDesc: 'Erhalte Benachrichtigungen über Risikoänderungen',
  darkMode: 'Dunkelmodus',
  darkModeDesc: 'Dunkles Design aktivieren',
  language: 'Sprache',
  languageDesc: 'Wähle deine Oberflächensprache',
  spanish: 'Spanisch',
  english: 'Englisch',
  saving: 'Wird gespeichert...',
  profileUpdated: 'Profil erfolgreich aktualisiert',
  profileError: 'Fehler beim Aktualisieren des Profils',
  darkModeError: 'Fehler beim Speichern der Dunkelmodus-Einstellung',
  languageError: 'Fehler beim Speichern der Spracheinstellung',
  security: 'Sicherheit',
  changePassword: 'Passwort ändern',
  changingPassword: 'Wird geändert...',
  passwordUpdated: 'Passwort erfolgreich aktualisiert',
  passwordNoMatch: 'Passwörter stimmen nicht überein',
  passwordMinLength: 'Das Passwort muss mindestens 6 Zeichen lang sein',
  passwordChangeError: 'Fehler beim Ändern des Passworts',
  lastPasswordUpdate: 'Letzte Passwortänderung:',
  accountInfo: 'Kontoinformationen',
  userId: 'Benutzer-ID',
  accountCreated: 'Konto erstellt',
  lastUpdate: 'Letzte Aktualisierung',
  accountStatus: 'Kontostatus',
  loadingProfile: 'Profil wird geladen...',
  },

  // ── Sidebar ──
sidebar: {
  news: 'Nachrichten',
  reloadNews: 'Nachrichten neu laden',
  markets: 'Märkte',
  asset: 'Asset',
  updatedAgo: 'Vor {n} Min. aktualisiert',
  analyzeAssetForNews: 'Analysiere ein Asset, um zugehörige Nachrichten zu sehen.',
  noNewsAvailable: 'Derzeit keine Nachrichten verfügbar.',
  errorLoadingNews: 'Nachrichten konnten nicht geladen werden. Bitte versuche es erneut.',
  source: 'Quelle: Yahoo Finance',
  now: 'jetzt',
  agoM: 'vor {n} Min',
  agoH: 'vor {n} Std',
  agoD: 'vor {n} Tg',
},

// ── Footer ──
footer: {
  description: 'Professionelle Plattform zur Analyse und Verwaltung finanzieller Risiken für moderne Investoren.',
  quickLinks: 'Schnellzugriffe',
  home: 'Startseite',
  aboutUs: 'Über uns',
  services: 'Dienstleistungen',
  blog: 'Blog',
  contact: 'Kontakt',
  contactTitle: 'Kontakt',
  followUs: 'Folge uns',
  copyright: '© 2026 Finanzrisikoanalyse. Alle Rechte vorbehalten.',
  privacy: 'Datenschutzrichtlinie',
  terms: 'Allgemeine Geschäftsbedingungen',
  cookies: 'Cookie-Richtlinie',
},

// ── Assets Page ──
assets: {
  title: 'Assets suchen',
  subtitle: 'Suche und analysiere Aktien, Kryptowährungen und mehr',
  searchPlaceholder: 'Suche nach Name oder Symbol (z. B.: AAPL, KO, NFLX)...',
  watchlist: 'Watchlist',
  recentSearches: 'Suchen',
  noWatchlistItems: 'Deine Watchlist ist leer.',
  addFirst: 'Füge dein erstes Asset hinzu, indem du oben suchst.',
  noRecentSearches: 'Keine kürzlichen Suchen.',
  type: 'Typ',
  stock: 'Aktie',
  crypto: 'Krypto',
  forex: 'Forex',
},

assetDetail: {
  currentPrice: 'Aktueller Preis',
  loading: 'Daten werden geladen...',
  noData: 'Keine Preisdaten verfügbar',
  high: 'Hoch',
  average: 'Durchschnitt',
  low: 'Tief',
  priceEvolution: 'Preisentwicklung',
  loadingChart: 'Diagramm wird geladen...',
  noChartData: 'Für dieses Intervall sind keine Daten verfügbar',
  generalInfo: 'Allgemeine Informationen',
  basicData: 'Grunddaten',
  symbol: 'Symbol:',
  name: 'Name:',
  type: 'Typ:',
  stock: 'Aktie',
  crypto: 'Kryptowährung',
  forex: 'Forex',
  valuationMeasures: 'Bewertungskennzahlen',
  financialHighlights: 'Finanzielle Kennzahlen',
  marketCap: 'Marktkapitalisierung',
  peRatio: 'KGV',
  pegRatio: 'PEG-Verhältnis',
  priceToSales: 'Kurs/Umsatz',
  priceToBook: 'Kurs/Buchwert',
  evToEbitda: 'EV/EBITDA',
  eps: 'Gewinn je Aktie (TTM)',
  dividendYield: 'Dividendenrendite',
  beta: 'Beta',
  roe: 'ROE',
  roa: 'ROA',
  profitMargin: 'Gewinnmarge',
  fiftyTwoWeekHigh: '52-Wochen-Hoch',
  fiftyTwoWeekLow: '52-Wochen-Tief',
  averageVolume: 'Durchschn. Volumen',
  marketInfo: 'Marktinformationen',
  volume24h: '24h-Volumen',
  circulatingSupply: 'Umlaufmenge',
  totalSupply: 'Gesamtmenge',
  description: 'Beschreibung',
  recentHistory: 'Jüngste Entwicklung',
  limitedData: 'Begrenzte Daten verfügbar. Einige Finanzkennzahlen sind derzeit nicht zugänglich.',
  noFinancialData: 'Detaillierte Finanzdaten konnten derzeit nicht abgerufen werden.',
  noMarketData: 'Marktdaten konnten derzeit nicht abgerufen werden.',
  notAvailable: 'Nicht verfügbar',
  removeWatchlist: 'Aus Watchlist entfernen',
  addWatchlist: 'Zur Watchlist hinzufügen',
  intervals: {
    '5min': '5 Min',
    '15min': '15 Min',
    '30min': '30 Min',
    '1h': '1 Stunde',
    '4h': '4 Stunden',
    '12h': '12 Stunden',
    '1d': 'Täglich',
    '1wk': 'Wöchentlich',
    '1mo': 'Monatlich',
    'all': 'Historie',
  }
},

// ── Calendar Page ──
calendar: {
  title: 'Trading-Journal',
  subtitle: 'Erfasse und analysiere deine täglichen Trades',
  today: 'Heute',
  previousMonth: 'Vorheriger Monat',
  nextMonth: 'Nächster Monat',
  totalPnL: 'Gesamt P&L',
  operations: 'Operationen',
  noOperations: 'Für dieses Datum sind keine Operationen erfasst.',
  addOperation: 'Operation hinzufügen',
},

// ── Compare Page ──
compare: {
  title: 'Assets vergleichen',
  subtitle: 'Vergleiche die Performance und das Risiko mehrerer Assets',
  addAsset: 'Asset hinzufügen',
  searchPlaceholder: 'Bsp.: {symbol}',
  asset: 'Asset',
  remove: 'Entfernen',
  compare: 'Vergleichen',
  noAssetsSelected: 'Wähle mindestens zwei Assets zum Vergleichen aus.',
},

  // ── Risk Analysis Page ──
riskAnalysis: {
  title: 'Risikoanalyse',
  description: 'Berechne fortgeschrittene Risikokennzahlen für jedes Finanzasset',
  period: 'Zeitraum:',
  interval: 'Intervall:',
  sixMonths: '6 Monate',
  oneYear: '1 Jahr',
  threeYears: '3 Jahre',
  fiveYears: '5 Jahre',
  tenYears: '10 Jahre',
  tabTechnical: 'Technische Analyse',
  tabFundamental: 'Fundamentalanalyse',
  tabQuantitative: 'Quantitative Analyse',
  detailedTitleTechnical: 'Technische Risikoanalyse',
  detailedTitleFundamental: 'Fundamentale Risikoanalyse',
  detailedTitleQuantitative: 'Quantitative Risikoanalyse',
  searchAsset: 'Asset zum Analysieren suchen...',
  searchPlaceholder: 'Asset-Symbol (z. B.: AAPL, BTC-USD, MSFT)',
  selectPeriod: 'Zeitraum auswählen',
  analyze: 'Analysieren',
  analyzing: 'Wird analysiert...',
  riskLow: 'Niedrig',
  riskMedium: 'Mittel',
  riskHigh: 'Hoch',
  noData: 'Fundamentaldaten für dieses Asset nicht verfügbar.',
  noDataAll: 'Gib ein Symbol ein, um das Risiko zu analysieren',
  tryWith: 'Versuche es mit',
  recent: 'Zuletzt:',
  popular: 'Beliebt:',
  tracking: 'Tracking:',
  missingMetrics: 'Kennzahlen für dieses Asset nicht verfügbar',
  volatility: {
    high: 'hohe Volatilität',
    moderate: 'mittlere Volatilität',
    low: 'niedrige Volatilität',
  },
  drawdown: {
    high: 'starke historische Rückgänge',
    moderate: 'mittlere historische Rückgänge',
    low: 'begrenzte Rückgänge',
  },
  metrics: {
    marketCap: {
      label: "Marktkapitalisierung",
      desc: "Gesamtmarktwert des Assets. Bei Aktien: Preis × ausstehende Aktien. Bei Krypto: zeigt die relative Größe des Projekts."
    },
    peRatio: {
      label: "KGV",
      desc: "Kurs-Gewinn-Verhältnis. Ein niedriges KGV kann auf Unterbewertung hinweisen, wenn das Geschäft solide ist."
    },
    beta: {
      label: "Beta",
      desc: "Misst die Volatilität relativ zum Markt. <1 weniger volatil, >1 stärker volatil. Wichtig für systemisches Risiko."
    },
    eps: {
      label: "EPS",
      desc: "Nettogewinn geteilt durch die Anzahl der Aktien. Zeigt die Profitabilität pro Aktie."
    },
    netMargin: {
      label: "Nettomarge",
      desc: "Prozentsatz des Umsatzes nach allen Kosten. Hohe Marge zeigt operative Effizienz."
    },
    roe: {
      label: "ROE",
      desc: "Misst, wie effizient das Unternehmen das Kapital der Aktionäre nutzt, um Gewinne zu erzielen."
    },
    dividend: {
      label: "Dividendenrendite",
      desc: "Prozentsatz des Preises, der jährlich ausgeschüttet wird. Wichtig für passive Einkommensstrategien."
    },
    week52Range: {
      label: "52-Wochen-Spanne",
      desc: "Jahreshoch und -tief. Zeigt, wo der aktuelle Preis im Vergleich zum letzten Jahr liegt."
    },
    circulatingSupply: {
      label: "Umlaufmenge",
      desc: "Für die Öffentlichkeit verfügbare Tokens oder Coins. Beeinflusst Knappheit und Wert."
    },
    maxSupply: {
      label: "Maximales Angebot",
      desc: "Maximale Emissionsgrenze. Ohne Limit kann das Asset langfristig inflationär sein."
    },
    volume24h: {
      label: "24h-Volumen",
      desc: "Gesamtvolumen der letzten 24 Stunden."
    },
    totalAssets: {
      label: "Vermögen (AUM)",
      desc: "Gesamtwert der vom Fonds verwalteten Vermögenswerte."
    },
    navPrice: {
      label: "NAV-Preis",
      desc: "Nettoinventarwert pro Anteil."
    },
    beta3Year: {
      label: "Beta (3 Jahre)",
      desc: "Volatilität relativ zum Benchmark in den letzten 3 Jahren."
    },
    fiveYearAverageReturn: {
      label: "5-Jahres-Rendite",
      desc: "Durchschnittliche annualisierte Rendite der letzten fünf Jahre."
    },
    ytdReturn: {
      label: "YTD-Rendite",
      desc: "Kumulierte Rendite im laufenden Jahr."
    },
    annualReportExpenseRatio: {
      label: "Kostenquote (TER)",
      desc: "Gesamte jährliche Verwaltungsgebühr des Fonds."
    },
  },
  sections: {
    helpWhat: 'Was wird in diesem Abschnitt analysiert',
    helpImportance: 'Warum es in diesem Zeitraum wichtig ist',
    overview: { title: 'Überblick', desc: 'Kontext des Assets im gewählten Zeitraum.', short: 'Gibt sofortigen Preiskontext.', mid: 'Bewertet den mittelfristigen Trend.', long: 'Definiert den strategischen Rahmen des Assets.' },
    valuation: { title: 'Bewertung', desc: 'Analysiert, ob der aktuelle Preis angemessen ist.', short: 'Wichtig für technische Erholungen.', mid: 'Entscheidend für Investitionszyklen.', long: 'Bestimmt den intrinsischen Wert.' },
    profitability: { title: 'Rentabilität', desc: 'Fähigkeit, Gewinne oder Netzwerkaktivität zu generieren.', short: 'Geringe Auswirkung kurzfristig.', mid: 'Zeigt die Gesundheit des Geschäfts.', long: 'Haupttreiber langfristiger Rendite.' },
    stability: { title: 'Stabilität', desc: 'Analysiert Trend, Volatilität und spezifische Risiken.', short: 'Kritisch für tägliches Risikomanagement.', mid: 'Bestimmt Nachhaltigkeit von Bewegungen.', long: 'Sichert das Überleben des Assets.' },
  },
  missingNotes: {
    CRYPTOCURRENCY: {
      peRatio: "Kryptowährungen erzeugen keine klassischen Unternehmensgewinne; ihr Wert basiert auf Spekulation oder Netzwerknutzen.",
      eps: "Es gibt keine 'Gewinne pro Aktie' bei dezentralen Assets.",
      beta: "Die Korrelation mit traditionellen Märkten variiert stark und macht das Beta oft unzuverlässig.",
      netMargin: "Es gibt keine Unternehmensstruktur zur Berechnung von Margen.",
      roe: "Es gibt kein Eigenkapital zur Berechnung der Effizienz.",
      dividend: "Kryptos zahlen keine Dividenden; Rendite kommt durch Kurssteigerung oder Staking."
    },
    ETF: {
      eps: "Ein Fonds ist ein Anlagevehikel und generiert kein eigenes EPS.",
      netMargin: "Margen gehören zu den enthaltenen Unternehmen, nicht zum ETF.",
      roe: "ROE ist für kollektive Anlageformen wie ETFs nicht anwendbar."
    },
    EQUITY: {
      dividend: "Dieses Unternehmen zahlt derzeit keine Dividenden.",
      peRatio: "Nicht berechenbar bei Verlusten (negatives EPS).",
      pegRatio: "Erfordert zukünftige Wachstumsprognosen, die nicht verfügbar sind."
    },
    GENERIC: {
      default: "Daten derzeit nicht auf Yahoo Finance verfügbar."
    }
  },
  education: {
    title: 'Was bedeutet das?',
    hide: 'Erklärung ausblenden',
  },
  riskTitle: 'Risiko {label}',
  disclaimer: 'Informationssignal automatisch generiert; keine Anlageberatung.',
  fundamental: {
    outlooks: {
      STRONG: 'Stark',
      MODERATE: 'Mittel',
      WEAK: 'Schwach'
    },
    ranges: {
      '6mo': '6 Monate',
      '1y': '1 Jahr',
      '3y': '3 Jahre',
      '5y': '5 Jahre',
      '10y': '10 Jahre'
    },
    generating: 'Fundamentalanalyse wird erstellt...',
    perspectiva: 'Ausblick für {range}: {outlook}'
  },
  quantitative: {
    volatility: {
      label: 'Annualisierte Volatilität',
      sub: {
        veryHigh: 'Sehr hoch',
        high: 'Hoch',
        moderate: 'Mittel',
        low: 'Niedrig'
      },
      tooltip: 'Annualisierte Standardabweichung der täglichen Renditen. Misst Preisschwankungen. <15% niedrig · 15–40% mittel · >40% hoch.'
    },
    drawdown: {
      label: 'Max. Drawdown',
      sub: 'Größter Rückgang vom Hoch zum Tief',
      tooltip: 'Größter historischer prozentualer Rückgang von einem Hoch zu einem Tief.'
    },
    sharpe: {
      label: 'Sharpe-Ratio',
      sub: {
        excellent: 'Exzellent',
        good: 'Gut',
        acceptable: 'Akzeptabel',
        negative: 'Negativ'
      },
      tooltip: 'Rendite pro Risikoeinheit. >2 exzellent · 1–2 gut · 0–1 akzeptabel · <0 Verluste.'
    },
    var: {
      label: 'VaR 95% (jährlich)',
      sub: 'Erwarteter Maximalverlust',
      tooltip: 'Value at Risk bei 95%. Erwarteter maximaler Verlust in einem Jahr mit 95% Wahrscheinlichkeit.'
    },
    sortino: {
      label: 'Sortino-Ratio',
      tooltip: 'Ähnlich wie Sharpe, berücksichtigt nur negative Volatilität.'
    },
    calmar: {
      label: 'Calmar-Ratio',
      tooltip: 'Verhältnis zwischen Rendite und maximalem Drawdown.'
    },
    guideTitle: 'Interpretationsleitfaden',
    guide: {
      volatility: 'Renditeschwankung. <15% niedrig · 15–40% mittel · >40% hoch.',
      sharpe: 'Risikoadjustierte Rendite. >1 gut · >2 exzellent · <0 Verluste.',
      drawdown: 'Größter historischer Rückgang.',
      var: 'Maximal erwarteter Verlust mit 95% Wahrscheinlichkeit.',
      sortino: 'Berücksichtigt nur negative Volatilität.',
      calmar: 'Rendite vs. größter Verlust. >1 zeigt gutes Verhältnis.'
    }
  }
},

  // ── Comparison Page ──
comparison: {
  title: 'Asset-Risikovergleich',
  subtitle: 'Vergleiche bis zu 3 Finanzassets anhand fundamentaler, technischer und quantitativer Dimensionen',
  horizon: 'Zeithorizont:',
  assetSlot: 'Asset {n}',
  addAsset: 'Asset hinzufügen',
  compareButton: 'Vergleichen',
  comparingButton: 'Wird verglichen...',
  popular: 'Beliebt:',
  watchlist: 'Watchlist:',
  history: 'Zuletzt:',
  verdictTitle: 'KI-Bewertung',
  generateVerdict: 'KI-Bewertung generieren',
  generateVerdictDesc: 'Klicke auf „KI-Bewertung generieren“, um eine detaillierte Analyse durch künstliche Intelligenz zu erhalten.',
  mixedTypeWarning: 'Du vergleichst unterschiedliche Asset-Typen. Einige Kennzahlen sind möglicherweise nicht direkt vergleichbar.',
  metricsFavorable: 'günstige Kennzahlen',
  assetTypes: {
    EQUITY: 'Aktie',
    CRYPTOCURRENCY: 'Krypto',
    ETF: 'ETF'
  },
  trends: {
    alcista: '▲ Bullisch',
    bajista: '▼ Bärisch',
    neutral: 'Neutral'
  },
  errors: {
    minTwo: 'Mindestens 2 gültige Assets sind für den Vergleich erforderlich',
    verifyTickers: 'Bitte überprüfe die eingegebenen Ticker und versuche es erneut.'
  },
  tables: {
    fundamental: {
      title: 'Fundamentale Risikoanalyse',
      desc: 'Bewertungs- und Rentabilitätskennzahlen'
    },
    technical: {
      title: 'Technische Risikoanalyse',
      desc: 'Preissignale und Momentum im gewählten Zeitraum'
    },
    risk: {
      title: 'Quantitative Risikoanalyse',
      desc: 'Volatilität, Drawdown und Risiko-/Renditekennzahlen'
    },
    metricHeader: 'Kennzahl'
  }
},

// ── Recommendation Page ──
recommendation: {
  title: 'Risikoanalyse & Empfehlung',
  subtitle: 'Berechnet automatisch Take-Profit-, Stop-Loss-Level und Risikomanagement.',
  financialAsset: 'Finanzasset',
  searchPlaceholder: 'Z. B.: AAPL, BTC-USD...',
  popular: 'BELIEBT',
  tradeDirection: 'Handelsrichtung',
  long: 'LONG (Kaufen)',
  short: 'SHORT (Verkaufen)',
  timeframe: 'Zeitrahmen',
  slMethod: 'Stop-Loss-Methode',
  fixedPct: 'Fester Prozentsatz',
  closestSupport: 'Nächste Unterstützung',
  closestResistance: 'Nächster Widerstand',
  dynamicATR: 'Dynamischer ATR',
  recommended: 'EMPFOHLEN',
  tpMethods: 'Take-Profit-Methoden',
  riskRewardRatio: 'Chance/Risiko-Verhältnis',
  bollingerBands: 'Bollinger-Bänder',
  riskManagement: 'Risikomanagement',
  totalCapital: 'Gesamtkapital',
  riskPerTrade: 'Risiko pro Trade',
  calculateLevels: 'Level berechnen',
  recalculateLevels: 'Level neu berechnen',
  configureOperation: 'Trade konfigurieren',
  configureDesc: 'Gib ein Symbol ein, wähle links deine Parameter und klicke auf „Berechnen“, um eine detaillierte Empfehlung zu erhalten.',
  error: 'Fehler beim Laden der Analyse',
  iaUnavailable: 'Der KI-Dienst ist derzeit nicht verfügbar. Bitte versuche es erneut.',
  calculationError: 'Fehler bei der Berechnung der Empfehlung',
  insufficientCapital: 'Die Positionsgröße überschreitet das verfügbare Kapital. Reduziere das Risiko oder erhöhe den Stop-Loss.',
  signalContradictory: '⚠ Widersprüchliches Signal',
  signalAligned: '✓ Übereinstimmendes Signal',
  signalNeutral: '~ Neutrales Signal',
  entryPriceLabel: 'Einstiegspreis',
  confidence: 'Konfidenz',
  noJustification: 'Keine Begründungsdaten generiert.',
  techSignal: 'Technisches Signal',
  potential: 'Potenzial',
  units: 'Einheiten',
  totalValue: 'Gesamtwert',
  positionSize: 'Positionsgröße',
  riskPerCurrency: 'Risiko / {currency}',
  noneValidTP: 'Kein gültiger Take-Profit berechnet.',
  disclaimer: 'Die angezeigten Levels sind rein informativ und automatisch generiert. Sie stellen keine Finanzberatung oder Anlageempfehlung dar. Handle stets verantwortungsbewusst und innerhalb deiner Möglichkeiten.',
  iaSummary: 'KI-Zusammenfassung',
  iaGenerated: 'Automatisch durch KI generiert. Keine Finanzberatung.',
  detailedJustification: 'Detaillierte Begründung anzeigen (KI)',
  chatWithIA: 'Mit KI chatten',
  contextual: 'Kontextuell',
  clearChat: 'Chat leeren',
  askWhatever: 'Stelle eine beliebige Frage zu {symbol}',
  typeYourQuestion: 'Gib deine Frage ein...',
  calculateFirst: 'Berechne zuerst eine Empfehlung, um den Chat zu aktivieren.',
  sma50: 'SMA 50',
  sma200: 'SMA 200',
  bollinger: 'Bollinger',
  chatSuggestions: [
    'Warum wird dieser Stop-Loss vorgeschlagen?',
    'Was zeigt der RSI aktuell an?',
    'Was ist das wichtigste Widerstandsniveau?',
    'Sind die Indikatoren im Einklang?'
  ]
},

// ── Strategies Page ──
strategies: {
  title: 'Strategien',
  subtitle: 'Organisiere und bewerte deine Trading-Strategien',
  createStrategy: 'Strategie erstellen',
  noStrategies: 'Du hast noch keine Strategien.',
  createFirst: 'Erstelle deine erste Strategie, um deine Trades zu organisieren.',
  strategyName: 'Strategiename',
  description: 'Beschreibung',
  color: 'Farbe',
},

  // ── Psychoanalysis Page ──
psycho: {
  title: 'Psychologische Risikoanalyse',
  subtitle: 'Analyse deines Verhaltens und deiner Trading-Muster',
  noData: 'Erfasse Trades, um eine Verhaltensanalyse zu erstellen.',
  generalStats: 'Allgemeine Statistiken',
  assetPerformance: 'Asset-Performance',
  temporalPatterns: 'Zeitliche Muster',
  behaviorAnalysis: 'Verhaltensanalyse',
  alerts: 'Risikoalarme',
  analyzing: 'Trades werden analysiert...',
  error: 'Fehler beim Laden der psychologischen Analyse',
  strategy: 'Strategie:',
  from: 'Von:',
  to: 'Bis:',
  clearFilters: 'Filter zurücksetzen',
  generalAll: 'Allgemein (alle)',
  highRisk: 'Hohes psychologisches Risiko',
  mediumRisk: 'Mittleres psychologisches Risiko',
  excellentPsychology: 'Ausgezeichnete Disziplin',
  noBehaviorRisk: 'Kein psychologisches Risiko erkannt',
  behaviorAlerts: 'Verhaltensübersicht',
  noPatternsDetected: 'Keine emotionalen Risikomuster erkannt. Deine Trading-Disziplin ist in diesem Zeitraum vorbildlich.',
  analyzing_ops: 'Analysiere',
  noDataAvailable: 'Keine Daten verfügbar',
  detectedAlerts: '{count} Verhaltenswarnungen erkannt.',
  highRiskPatterns: 'Es wurden Hochrisiko-Muster erkannt (Revenge Trading oder Verlustspiralen), die sofortige Aufmerksamkeit erfordern.',
  disciplineIssues: 'Es gibt Anzeichen mangelnder Disziplin, die deine langfristige Profitabilität beeinträchtigen könnten.',
  minorIssues: 'Es gibt einige kleinere Inkonsistenzen in deinem Trading.',
  analyzingOps: 'Analysiere {count} Trades',
  positiveReturnability: 'Positive Rentabilität',
  winRateAbove50: '✅ Deine Gewinnrate liegt über 50 %, gute Gesamtperformance.',
  winRateBelow50: '⚠️ Deine Gewinnrate liegt unter 50 %, überprüfe deine Strategie.',
  recoverySuccess: '✅ Du erholst dich gut von Verlusten ({rate}% Erfolgsquote).',
  recoveryLow: '⚠️ Deine Erholungsversuche haben eine niedrige Erfolgsquote ({rate}%). Vermeide emotionales Trading.',
  moreOpsAfterLoss: '⚠️ Du führst nach Verlusten mehr Trades aus als nach Gewinnen. Mögliche',
  controlledBehavior: 'Dein Verhalten ist kontrolliert: weniger Trades nach Verlusten.',
},

// ── News Page ──
news: {
  title: 'Finanznachrichten',
  subtitle: 'Neueste Nachrichten aus den Finanzmärkten',
  searchPlaceholder: 'Nachrichten suchen...',
  noNews: 'Keine Nachrichten verfügbar.',
},

// ── Technical Analysis (TechnicalAnalysisPanel) ──
technicalAnalysis: {
  title: 'Technische Risikoanalyse',
  generating: 'Wird generiert...',
  disclaimer: 'Informationssignal automatisch generiert; keine Anlageberatung.',
  regenerateSummary: 'KI-Zusammenfassung neu generieren',
  generateSummary: 'KI-Zusammenfassung generieren',
  aiSummary: 'KI-Zusammenfassung',
  overlays: 'Overlays:',
  export: 'Exportieren',
  dataLimitWarning: 'Daten für das Intervall {interval} bei Yahoo Finance sind auf {days} historische Tage begrenzt.',
  historicalDataLimit: 'historische Tage',
  analysisError: 'Fehler bei der Analyse des Assets',
  summaryGenerationError: 'Zusammenfassung konnte nicht generiert werden.',
  serviceUnavailable: 'Der KI-Dienst ist derzeit nicht verfügbar.',
  signals: {
    'COMPRA FUERTE': 'Starker Kauf',
    'COMPRA': 'Kauf',
    'NEUTRAL': 'Neutral',
    'VENTA': 'Verkauf',
    'VENTA FUERTE': 'Starker Verkauf',
  },
  indicators: {
    movingAverages: 'Gleitende Durchschnitte',
    rsi: 'RSI',
    macd: 'MACD',
    bollinger: 'Bollinger-Bänder',
    obv: 'Volumen / OBV',
  },
  sr: {
    resistance: 'Widerstand',
    support: 'Unterstützung',
  },
  aiDisclaimer: 'Automatisch durch KI aus technischen Indikatoren generiert. Keine Anlageberatung.',
},

// ── Bots Page ──
bots: {
  title: 'AutoTrader',
  subtitle: 'Automatisierte Trading-Bots',
  createBot: 'Bot erstellen',
  noBots: 'Du hast noch keine Bots.',
  createFirst: 'Erstelle deinen ersten automatisierten Bot.',
  botName: 'Bot-Name',
  symbol: 'Symbol',
  strategy: 'Strategie',
  momentum: 'Momentum',
  meanReversion: 'Mean Reversion',
  initialCapital: 'Startkapital',
  start: 'Starten',
  stop: 'Stoppen',
  running: 'Läuft',
  stopped: 'Gestoppt',
},

// ── IA ──
ia: {
  disclaimer: 'Automatisch von KI aus berechneten Daten generiert. Keine Anlageberatung.'
}
};

export default de;
