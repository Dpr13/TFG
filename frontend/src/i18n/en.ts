import type { Translations } from './es';

const en: Translations = {
  // ── Common ──
  common: {
    save: 'Save Changes',
    cancel: 'Cancel',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    back: 'Back',
    search: 'Search',
    noResults: 'No results',
    retry: 'Retry',
    yes: 'Yes',
    no: 'No',
    or: 'or',
    and: 'and',
    of: 'of',
    basedOn: 'Classification based on its',
    analyzedOn: 'Analyzed on',
    unlimited: 'Unlimited',
    yearlyChange: 'Yearly Change',
    detailedAnalysis: 'Detailed analysis of this factor for the asset.',
    shortTermFactor: 'Relevant factor in the short term.',
    midTermFactor: 'Relevant factor in the medium term.',
    longTermFactor: 'Determining factor in the long term.',
    active: 'Active',
  },

  // ── Auth ──
  auth: {
    login: 'Log in',
    loggingIn: 'Logging in...',
    register: 'Sign up',
    logout: 'Log out',
    logoutMobile: 'Log out',
    email: 'Email address',
    password: 'Password',
    confirmPassword: 'Confirm New Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    rememberSession: 'Remember me',
    forgotPassword: 'Forgot your password?',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    welcomeBack: 'Welcome back',
    loginSubtitle: 'Log in to access your dashboard',
    emailPlaceholder: 'user@example.com',
    passwordMinLength: 'Password must be at least 6 characters.',
    serverError: 'Error connecting to the server. Please try again.',
    wrongPassword: 'Incorrect password. Please try again.',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    systemFooter: 'Financial Risk Analysis System · TFG',
    // Left panel
    brandName: 'Risk Analysis',
    brandSubtitle: 'Financial Platform · TFG',
    headline1: 'Make decisions',
    headline2: 'based on data',
    headlineDesc: 'Analyze stocks, cryptocurrencies and assets worldwide with real-time quantitative risk metrics.',
    feature1Title: 'Real-time data',
    feature1Desc: 'Prices and metrics updated from Yahoo Finance',
    feature2Title: 'Advanced analysis',
    feature2Desc: 'Volatility, Sharpe Ratio, VaR, Drawdown and more',
    feature3Title: 'Risk management',
    feature3Desc: 'Evaluate and compare the risk of any asset',
    feature4Title: 'Personalized tracking',
    feature4Desc: 'Create your list of favorite assets instantly',
  },

  // ── Register ──
  register: {
    title: 'Create account',
    subtitle: 'Sign up to start analyzing',
    name: 'Full name',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'you@email.com',
    passwordPlaceholder: 'Minimum 8 characters',
    confirmPlaceholder: 'Repeat password',
    submit: 'Create account',
    creating: 'Creating account...',
    termsPrefix: 'By signing up, you agree to our',
    terms: 'Terms and Conditions',
    privacyPrefix: 'and the',
    privacy: 'Privacy Policy',
    passwordReqs: 'Password must have:',
    req8Chars: 'At least 8 characters',
    reqUpper: 'One uppercase letter',
    reqNumber: 'One number',
    reqSymbol: 'One special symbol',
    passwordsNoMatch: "Passwords don't match.",
  },

  // ── Verify Email ──
  verifyEmail: {
    title: 'Verify your email',
    subtitle: "We've sent a 6-digit code to",
    codePlaceholder: '6-digit code',
    verify: 'Verify',
    verifying: 'Verifying...',
    resend: 'Resend code',
    resending: 'Resending...',
    resent: 'Code resent successfully',
    backToLogin: 'Back to login',
    codeExpires: 'The code expires in 15 minutes',
  },

  // ── Forgot / Reset Password ──
  forgotPwd: {
    title: 'Recover password',
    subtitle: 'Enter your email to receive a recovery link',
    send: 'Send link',
    sending: 'Sending...',
    backToLogin: 'Back to login',
  },
  resetPwd: {
    title: 'Reset password',
    subtitle: 'Enter your new password',
    submit: 'Reset password',
    submitting: 'Resetting...',
  },

  // ── Header / Nav ──
  nav: {
    home: 'Home',
    analysis: 'Analysis',
    technicalAnalysis: 'Technical Analysis',
    fundamentalAnalysis: 'Fundamental Analysis',
    quantitativeAnalysis: 'Quantitative Analysis',
    compareAssets: 'Compare Assets',
    recommendation: 'Recommendation',
    journaling: 'Journaling',
    autoTrader: 'AutoTrader',
    more: 'More',
    strategies: 'Strategies',
    psychoanalysis: 'Psychoanalysis',
    search: 'Search',
    profile: 'Profile',
    myProfile: 'My Profile',
    closeSession: 'Log out',
    riskAnalysis: 'Risk Analysis',
    riskManagement: 'Financial Risk Management',
  },

  // ── Home Page ──
  home: {
    goodMorning: 'Good morning',
    goodAfternoon: 'Good afternoon',
    goodEvening: 'Good evening',
    marketSummary: "Here's your market summary for today.",
    registeredOps: 'Registered operations',
    strategies: 'Strategies',
    tracking: 'Tracking',
    weeklyActivity: 'Weekly activity',
    analyzeRisk: 'Analyze risk',
    analyzeRiskDesc: 'Evaluate the risk of your investments and make informed decisions',
    viewAssets: 'View assets',
    followUp: 'Tracking',
    manage: 'Manage',
    marketNews: 'Market news',
    viewMore: 'View more',
    others: 'Others',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    agoMin: '{n} min ago',
    agoHours: '{n} h ago',
    agoDays: '{n} d ago',
  },

  // ── Profile Page ──
  profile: {
    editProfile: 'Edit Profile',
    editProfileDesc: 'Manage your personal settings and preferences',
    personalInfo: 'Personal Information',
    name: 'Name',
    email: 'Email',
    preferences: 'Preferences',
    notifications: 'Notifications',
    notificationsDesc: 'Receive alerts about risk changes',
    darkMode: 'Dark Mode',
    darkModeDesc: 'Enable dark theme',
    language: 'Language',
    languageDesc: 'Select your interface language',
    spanish: 'Español',
    english: 'English',
    saving: 'Saving...',
    profileUpdated: 'Profile updated successfully',
    profileError: 'Error updating profile',
    darkModeError: 'Error saving dark mode preference',
    languageError: 'Error saving language preference',
    security: 'Security',
    changePassword: 'Change Password',
    changingPassword: 'Changing...',
    passwordUpdated: 'Password updated successfully',
    passwordNoMatch: "Passwords don't match",
    passwordMinLength: 'Password must be at least 6 characters',
    passwordChangeError: 'Error changing password',
    lastPasswordUpdate: 'Last password update:',
    accountInfo: 'Account Information',
    userId: 'User ID',
    accountCreated: 'Account created',
    lastUpdate: 'Last update',
    accountStatus: 'Account status',
    loadingProfile: 'Loading profile...',
  },

  // ── Sidebar ──
  sidebar: {
    news: 'News',
    reloadNews: 'Reload news',
    markets: 'Markets',
    asset: 'Asset',
    updatedAgo: 'Updated {n}m ago',
    analyzeAssetForNews: 'Analyze an asset to see related news.',
    noNewsAvailable: 'No news available at this time.',
    errorLoadingNews: 'Could not load news. Please try again.',
    source: 'Source: Yahoo Finance',
    now: 'now',
    agoM: '{n}m ago',
    agoH: '{n}h ago',
    agoD: '{n}d ago',
  },

  // ── Footer ──
  footer: {
    description: 'Professional financial risk analysis and management platform for modern investors.',
    quickLinks: 'Quick Links',
    home: 'Home',
    aboutUs: 'About Us',
    services: 'Services',
    blog: 'Blog',
    contact: 'Contact',
    contactTitle: 'Contact',
    followUs: 'Follow Us',
    copyright: '© 2026 Financial Risk Analysis. All rights reserved.',
    privacy: 'Privacy Policy',
    terms: 'Terms and Conditions',
    cookies: 'Cookie Policy',
  },

  // ── Assets Page ──
  assets: {
    title: 'Search Assets',
    subtitle: 'Search and analyze stocks, cryptocurrencies and more',
    searchPlaceholder: 'Search by name or symbol (e.g.: AAPL, KO, NFLX)...',
    watchlist: 'Watchlist',
    recentSearches: 'Search',
    noWatchlistItems: 'Your watchlist is empty.',
    addFirst: 'Add your first asset by searching above.',
    noRecentSearches: 'No recent searches.',
    type: 'Type',
    stock: 'Stock',
    crypto: 'Crypto',
    forex: 'Forex',
  },

  assetDetail: {
    currentPrice: 'Current Price',
    loading: 'Loading data...',
    noData: 'No price data available',
    high: 'High',
    average: 'Average',
    low: 'Low',
    priceEvolution: 'Price Evolution',
    loadingChart: 'Loading chart...',
    noChartData: 'No data available for this interval',
    generalInfo: 'General Information',
    basicData: 'Basic Data',
    symbol: 'Symbol:',
    name: 'Name:',
    type: 'Type:',
    stock: 'Stock',
    crypto: 'Cryptocurrency',
    forex: 'Forex',
    valuationMeasures: 'Valuation Measures',
    financialHighlights: 'Financial Highlights',
    marketCap: 'Market Cap',
    peRatio: 'P/E Ratio',
    pegRatio: 'PEG Ratio',
    priceToSales: 'Price/Sales',
    priceToBook: 'Price/Book',
    evToEbitda: 'EV/EBITDA',
    eps: 'EPS (TTM)',
    dividendYield: 'Dividend Yield',
    beta: 'Beta',
    roe: 'ROE',
    roa: 'ROA',
    profitMargin: 'Profit Margin',
    fiftyTwoWeekHigh: '52-Week High',
    fiftyTwoWeekLow: '52-Week Low',
    averageVolume: 'Avg. Volume',
    marketInfo: 'Market Information',
    volume24h: '24h Volume',
    circulatingSupply: 'Circulating Supply',
    totalSupply: 'Total Supply',
    description: 'Description',
    recentHistory: 'Recent History',
    limitedData: 'Limited data available. Some financial metrics are currently inaccessible.',
    noFinancialData: 'Detailed financial data could not be retrieved at this time.',
    noMarketData: 'Market data could not be retrieved at this time.',
    notAvailable: 'Not available',
    removeWatchlist: 'Remove from watchlist',
    addWatchlist: 'Add to watchlist',
    intervals: {
      '5min': '5 min',
      '15min': '15 min',
      '30min': '30 min',
      '1h': '1 hour',
      '4h': '4 hours',
      '12h': '12 hours',
      '1d': 'Daily',
      '1wk': 'Weekly',
      '1mo': 'Monthly',
      'all': 'History',
    }
  },

  // ── Calendar Page ──
  calendar: {
    title: 'Trading Journal',
    subtitle: 'Record and analyze your daily trades',
    today: 'Today',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    totalPnL: 'Total P&L',
    operations: 'Operations',
    noOperations: 'No operations recorded for this date.',
    addOperation: 'Add operation',
  },

  // ── Compare Page ──
  compare: {
    title: 'Compare Assets',
    subtitle: 'Compare the performance and risk of multiple assets',
    addAsset: 'Add asset',
    searchPlaceholder: 'Ex: {symbol}',
    asset: 'Asset',
    remove: 'Remove',
    compare: 'Compare',
    noAssetsSelected: 'Select at least two assets to compare.',
  },

  // ── Risk Analysis Page ──
  riskAnalysis: {
    title: 'Risk Analysis',
    description: 'Calculate advanced risk metrics for any financial asset',
    period: 'Period:',
    interval: 'Interval:',
    sixMonths: '6 months',
    oneYear: '1 year',
    threeYears: '3 years',
    fiveYears: '5 years',
    tenYears: '10 years',
    tabTechnical: 'Technical Analysis',
    tabFundamental: 'Fundamental Analysis',
    tabQuantitative: 'Quantitative Analysis',
    detailedTitleTechnical: 'Technical Risk Analysis',
    detailedTitleFundamental: 'Fundamental Risk Analysis',
    detailedTitleQuantitative: 'Quantitative Risk Analysis',
    searchAsset: 'Search asset to analyze...',
    searchPlaceholder: 'Asset symbol (e.g.: AAPL, BTC-USD, MSFT)',
    selectPeriod: 'Select period',
    analyze: 'Analyze',
    analyzing: 'Analyzing...',
    riskLow: 'Low',
    riskMedium: 'Moderate',
    riskHigh: 'High',
    noData: 'Fundamental data not available for this asset.',
    noDataAll: 'Enter a symbol to analyze its risk',
    tryWith: 'Try with',
    recent: 'Recent:',
    popular: 'Popular:',
    tracking: 'Tracking:',
    missingMetrics: 'Metrics not available for this asset',
    volatility: {
      high: 'high volatility',
      moderate: 'moderate volatility',
      low: 'low volatility',
    },
    drawdown: {
      high: 'strong historical drops',
      moderate: 'moderate historical drops',
      low: 'limited drops',
    },
    metrics: {
      marketCap: {
        label: "Market Cap",
        desc: "Total market value of the asset. For stocks, price × outstanding shares. For crypto, indicates the relative size of the project."
      },
      peRatio: {
        label: "P/E Ratio",
        desc: "Price to earnings ratio. A low P/E may indicate undervaluation if the business is solid."
      },
      beta: {
        label: "Beta",
        desc: "Measures volatility relative to the market. <1 is less volatile, >1 is more volatile. Key for systemic risk."
      },
      eps: {
        label: "EPS",
        desc: "Net income divided by the number of shares. Indicates the profitability generated by each share."
      },
      netMargin: {
        label: "Net Margin",
        desc: "Percentage of revenue remaining after all expenses. High margin reflects operational efficiency."
      },
      roe: {
        label: "ROE",
        desc: "Measures efficiency with which the company uses shareholders' money to generate profits."
      },
      dividend: {
        label: "Div. Yield",
        desc: "Percentage of price distributed annually. Important for passive income strategies."
      },
      week52Range: {
        label: "52-Week Range",
        desc: "Yearly high and low. Helps see where current price stands relative to the past year."
      },
      circulatingSupply: {
        label: "Circulating Supply",
        desc: "Tokens or coins available to the public. Influences scarcity and asset value."
      },
      maxSupply: {
        label: "Max Supply",
        desc: "Maximum emission limit. If there is no limit, the asset can be inflationary over time."
      },
      volume24h: {
        label: "24h Volume",
        desc: "Total amount traded in the last 24 hours."
      },
      totalAssets: {
        label: "Assets (AUM)",
        desc: "Total value of assets under management by the fund."
      },
      navPrice: {
        label: "NAV Price",
        desc: "Net Asset Value per share."
      },
      beta3Year: {
        label: "Beta (3 years)",
        desc: "Volatility relative to its Benchmark over the last 3 years."
      },
      fiveYearAverageReturn: {
        label: "5-Year Return",
        desc: "Annualized average return over the last five years."
      },
      ytdReturn: {
        label: "YTD Return",
        desc: "Accumulated return in the current year."
      },
      annualReportExpenseRatio: {
        label: "Expense Ratio (TER)",
        desc: "Total annual management fee of the fund."
      },
    },
    sections: {
      helpWhat: 'What this section analyzes',
      helpImportance: 'Why it matters in this horizon',
      overview: { title: 'Overview', desc: 'Asset context under the chosen time horizon.', short: 'Provides immediate price context.', mid: 'Evaluates the medium-term trend.', long: 'Defines the asset\'s strategic framework.' },
      valuation: { title: 'Valuation', desc: 'Analyzes if current price is reasonable or market positioning.', short: 'Important for technical rebounds.', mid: 'Crucial for investment cycles.', long: 'Determines real intrinsic value.' },
      profitability: { title: 'Profitability', desc: 'Ability to generate profits or network activity/usage.', short: 'Minor impact in the very short term.', mid: 'Shows business health.', long: 'Main driver of long-term return.' },
      stability: { title: 'Stability', desc: 'Analyzes trend, volatility, and specific asset risks.', short: 'Critical for daily risk control.', mid: 'Defines move sustainability.', long: 'Ensures asset survival.' },
    },
    missingNotes: {
      CRYPTOCURRENCY: {
        peRatio: "Cryptos do not generate corporate accounting profits; their value is speculative or based on network utility.",
        eps: "There are no 'earnings per share' in decentralized assets.",
        beta: "Correlation with traditional markets varies, often invalidating standard beta.",
        netMargin: "There is no corporate structure to calculate profit margins.",
        roe: "There is no shareholder equity on which to calculate operating efficiency.",
        dividend: "Cryptos do not pay dividends; return comes from appreciation or staking."
      },
      ETF: {
        eps: "A fund is an investment vehicle, it does not generate its own independent EPS.",
        netMargin: "Profit margins correspond to the companies within the fund, not the ETF.",
        roe: "ROE is not applicable to collective investment structures like ETFs."
      },
      EQUITY: {
        dividend: "This company does not currently pay dividends (growth stage or difficulties).",
        peRatio: "Cannot be calculated if the company is in losses (negative EPS).",
        pegRatio: "Requires future growth estimates not currently available."
      },
      GENERIC: {
        default: "Data not available on Yahoo Finance for this symbol at this time."
      }
    },
    education: {
      title: 'What does this mean?',
      hide: 'Hide explanation',
    },
    riskTitle: 'Risk {label}',
    disclaimer: 'Informational and automatic signal; does not constitute investment advice.',
    fundamental: {
      outlooks: {
        STRONG: 'Strong',
        MODERATE: 'Moderate',
        WEAK: 'Weak'
      },
      ranges: {
        '6mo': '6 months',
        '1y': '1 year',
        '3y': '3 years',
        '5y': '5 years',
        '10y': '10 years'
      },
      generating: 'Generating fundamental analysis...',
      perspectiva: 'Outlook for {range}: {outlook}'
    },
    quantitative: {
      volatility: {
        label: 'Annualized Volatility',
        sub: {
          veryHigh: 'Very High',
          high: 'High',
          moderate: 'Moderate',
          low: 'Low'
        },
        tooltip: 'Annualized standard deviation of daily returns. Measures how much the price fluctuates. <15% low · 15-40% moderate · >40% high.'
      },
      drawdown: {
        label: 'Max Drawdown',
        sub: 'Largest peak-to-trough decline',
        tooltip: 'The largest historical percentage drop from a peak to a trough. Indicates the worst-case scenario the asset has faced.'
      },
      sharpe: {
        label: 'Sharpe Ratio',
        sub: {
          excellent: 'Excellent',
          good: 'Good',
          acceptable: 'Acceptable',
          negative: 'Negative'
        },
        tooltip: 'Return per unit of risk. >2 excellent · 1-2 good · 0-1 acceptable · <0 risk-adjusted losses.'
      },
      var: {
        label: 'VaR 95% (Annual)',
        sub: 'Expected max loss',
        tooltip: 'Value at Risk (VaR) at 95%. Indicates the maximum expected loss in a year with 95% confidence.'
      },
      sortino: {
        label: 'Sortino Ratio',
        tooltip: 'Similar to Sharpe, but only penalizes negative volatility. Useful for measuring return quality.'
      },
      calmar: {
        label: 'Calmar Ratio',
        tooltip: 'Relationship between annualized return and max drawdown. Measures efficiency relative to the worst-case decline.'
      },
      guideTitle: 'Interpretation Guide',
      guide: {
        volatility: 'Return variability. <15% low · 15–40% moderate · >40% high.',
        sharpe: 'Risk-adjusted return. >1 good · >2 excellent · <0 indicates losses.',
        drawdown: 'Worst historical drop. Indicates asset resilience in adverse scenarios.',
        var: 'Maximum expected loss on a normal day with 95% statistical confidence.',
        sortino: 'Penalizes only downside volatility. Better indicator of actual loss risk.',
        calmar: 'Return vs worst drop. >1 indicates profit outweighs maximum risk.'
      }
    }
  },

  // ── Comparison Page ──
  comparison: {
    title: 'Asset Risk Comparison',
    subtitle: 'Compare up to 3 financial assets across fundamental, technical, and quantitative dimensions',
    horizon: 'Horizon:',
    assetSlot: 'Asset {n}',
    addAsset: 'Add asset',
    compareButton: 'Compare',
    comparingButton: 'Comparing...',
    popular: 'Popular:',
    watchlist: 'Watchlist:',
    history: 'Recent:',
    verdictTitle: 'AI Verdict',
    generateVerdict: 'Generate AI verdict',
    generateVerdictDesc: 'Click "Generate AI verdict" to get a detailed comparison generated by artificial intelligence.',
    mixedTypeWarning: 'You are comparing different types of assets. Some metrics may not be directly comparable.',
    metricsFavorable: 'favorable metrics',
    assetTypes: {
      EQUITY: 'Stock',
      CRYPTOCURRENCY: 'Crypto',
      ETF: 'ETF'
    },
    trends: {
      alcista: '▲ Bullish',
      bajista: '▼ Bearish',
      neutral: 'Neutral'
    },
    errors: {
      minTwo: 'At least 2 valid assets are required to compare',
      verifyTickers: 'Please verify the entered tickers and try again.'
    },
    tables: {
      fundamental: {
        title: 'Fundamental Risk Analysis',
        desc: 'Valuation and business profitability metrics'
      },
      technical: {
        title: 'Technical Risk Analysis',
        desc: 'Price signals and momentum in the selected period'
      },
      risk: {
        title: 'Quantitative Risk Analysis',
        desc: 'Volatility, drawdown, and risk/return metrics'
      },
      metricHeader: 'Metric'
    }
  },

  // ── Recommendation Page ──
  recommendation: {
    title: 'Risk Analysis & Recommendation',
    subtitle: 'Automatically calculates Take Profit, Stop Loss levels and risk management.',
    financialAsset: 'Financial Asset',
    searchPlaceholder: 'E.g: AAPL, BTC-USD...',
    popular: 'POPULAR',
    tradeDirection: 'Trade Direction',
    long: 'LONG (Buy)',
    short: 'SHORT (Sell)',
    timeframe: 'Timeframe',
    slMethod: 'Stop Loss Method',
    fixedPct: 'Fixed percentage',
    closestSupport: 'Closest support',
    closestResistance: 'Closest resistance',
    dynamicATR: 'Dynamic ATR',
    recommended: 'RECOMMENDED',
    tpMethods: 'Take Profit Methods',
    riskRewardRatio: 'Risk/Reward Ratio',
    bollingerBands: 'Bollinger Bands',
    riskManagement: 'Risk Management',
    totalCapital: 'Total capital',
    riskPerTrade: 'Risk per trade',
    calculateLevels: 'Calculate Levels',
    recalculateLevels: 'Recalculate Levels',
    configureOperation: 'Configure Operation',
    configureDesc: 'Enter a symbol, select your parameters on the left and click calculate to get a detailed recommendation.',
    error: 'Error loading analysis',
    iaUnavailable: 'The AI service is not available at this moment. Please try again.',
    calculationError: 'Error calculating the recommendation',
    insufficientCapital: 'The position size exceeds available capital. Consider reducing the risk or increasing the stop loss.',
    signalContradictory: '⚠ Contradictory signal',
    signalAligned: '✓ Aligned signal',
    signalNeutral: '~ Neutral signal',
    entryPriceLabel: 'Entry Price',
    confidence: 'Confidence',
    noJustification: 'No justification data generated.',
    techSignal: 'Technical Signal',
    potential: 'Potential',
    units: 'units',
    totalValue: 'Total Value',
    positionSize: 'Position Size',
    riskPerCurrency: 'Risk / {currency}',
    noneValidTP: 'No valid Take Profit calculated.',
    disclaimer: 'The levels shown are purely informative and automatically generated. They do not constitute financial advice or investment recommendation. Always operate responsibly and within your means.',
    iaSummary: 'AI Summary',
    iaGenerated: 'Automatically generated by AI. Does not constitute financial advice.',
    detailedJustification: 'View detailed justification (AI)',
    chatWithIA: 'Chat with AI',
    contextual: 'Contextual',
    clearChat: 'Clear chat',
    askWhatever: 'Ask whatever you want about {symbol}',
    typeYourQuestion: 'Type your question...',
    calculateFirst: 'Calculate a recommendation first to activate the chat.',
    sma50: 'SMA 50',
    sma200: 'SMA 200',
    bollinger: 'Bollinger',
    chatSuggestions: [
      'Why is this stop loss proposed?',
      'What does the RSI indicate right now?',
      'What is the most important resistance level?',
      'Are the indicators in confluence?'
    ]
  },

  // ── Strategies Page ──
  strategies: {
    title: 'Strategies',
    subtitle: 'Organize and evaluate your trading strategies',
    createStrategy: 'Create strategy',
    noStrategies: "You don't have any strategies yet.",
    createFirst: 'Create your first strategy to organize your operations.',
    strategyName: 'Strategy name',
    description: 'Description',
    color: 'Color',
  },

  // ── Psychoanalysis Page ──
  psycho: {
    title: 'Psychological Risk Analysis',
    subtitle: 'Analysis of your behavior and trading patterns',
    noData: 'Record operations to generate your behavior analysis.',
    generalStats: 'General statistics',
    assetPerformance: 'Asset performance',
    temporalPatterns: 'Temporal patterns',
    behaviorAnalysis: 'Behavior analysis',
    alerts: 'Risk alerts',
    analyzing: 'Analyzing operations...',
    error: 'Error loading psychological analysis',
    strategy: 'Strategy:',
    from: 'From:',
    to: 'To:',
    clearFilters: 'Clear filters',
    generalAll: 'General (all)',
    highRisk: 'High Psychological Risk',
    mediumRisk: 'Moderate Psychological Risk',
    excellentPsychology: 'Excellent Psychology',
    noBehaviorRisk: 'No psychological risk detected',
    behaviorAlerts: 'Behavior Summary',
    noPatternsDetected: 'No emotional risk patterns detected. Your trading discipline is exemplary during this period.',
    analyzing_ops: 'Analyzing',
    noDataAvailable: 'No data available',
    detectedAlerts: '{count} behavioral alerts detected.',
    highRiskPatterns: 'There are high-risk patterns (revenge trading or spirals) that require immediate attention.',
    disciplineIssues: 'There are signs of lack of discipline that could affect your long-term profitability.',
    minorIssues: 'There are some minor inconsistencies in your trading.',
    analyzingOps: 'Analyzing {count} ops',
    positiveReturnability: 'Positive profitability',
    winRateAbove50: '✅ Your win rate is above 50%, good overall performance.',
    winRateBelow50: '⚠️ Your win rate is below 50%, consider reviewing your strategy.',
    recoverySuccess: '✅ You recover well from losses ({rate}% success rate).',
    recoveryLow: '⚠️ Your recovery attempts have a low success rate ({rate}%). Avoid trading emotionally.',
    moreOpsAfterLoss: '⚠️ You make more trades after losses than after wins. Potential',
    controlledBehavior: 'Your behavior is controlled: fewer trades after losses.',
  },

  // ── News Page ──
  news: {
    title: 'Financial News',
    subtitle: 'Latest financial market news',
    searchPlaceholder: 'Search news...',
    noNews: 'No news available.',
  },

  // ── Technical Analysis (TechnicalAnalysisPanel) ──
  technicalAnalysis: {
    title: 'Technical Risk Analysis',
    generating: 'Generating...',
    disclaimer: 'Informational and automatic signal; does not constitute investment advice.',
    regenerateSummary: 'Regenerate AI summary',
    generateSummary: 'Generate AI summary',
    aiSummary: 'AI Summary',
    overlays: 'Overlays:',
    export: 'Export',
    dataLimitWarning: 'Data for {interval} interval on Yahoo Finance has a limit of {days} historical days.',
    historicalDataLimit: 'historical days',
    analysisError: 'Error analyzing the asset',
    summaryGenerationError: 'Could not generate the summary.',
    serviceUnavailable: 'The AI service is not available at this time.',
    signals: {
      'COMPRA FUERTE': 'Strong Buy',
      'COMPRA': 'Buy',
      'NEUTRAL': 'Neutral',
      'VENTA': 'Sell',
      'VENTA FUERTE': 'Strong Sell',
    },
    indicators: {
      movingAverages: 'Moving Averages',
      rsi: 'RSI',
      macd: 'MACD',
      bollinger: 'Bollinger Bands',
      obv: 'Volume / OBV',
    },
    sr: {
      resistance: 'Resistance',
      support: 'Support',
    },
    aiDisclaimer: 'Automatically generated by AI from calculated technical indicators. Does not constitute financial advice.',
  },

  // ── Bots Page ──
  bots: {
    title: 'AutoTrader',
    subtitle: 'Automated trading bots',
    createBot: 'Create bot',
    noBots: "You don't have any bots yet.",
    createFirst: 'Create your first automated bot.',
    botName: 'Bot name',
    symbol: 'Symbol',
    strategy: 'Strategy',
    momentum: 'Momentum',
    meanReversion: 'Mean Reversion',
    initialCapital: 'Initial capital',
    start: 'Start',
    stop: 'Stop',
    running: 'Running',
    stopped: 'Stopped',
  },

  // ── IA ──
  ia: {
    disclaimer: 'Generated automatically by AI from calculated data. Does not constitute financial advice.'
  }
};

export default en;
