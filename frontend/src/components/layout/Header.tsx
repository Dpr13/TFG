import { User, LogOut, Menu, X, ChevronDown, Search } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useState, useEffect } from 'react';

export default function Header() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  interface NavItem {
    label: string;
    path: string;
    isDropdown: boolean;
    icon?: any;
    subItems?: { label: string; path: string; tab?: string }[];
  }

  const navItems: NavItem[] = [
    { label: t.nav.home, path: '/', isDropdown: false },
    {
      label: t.nav.analysis,
      path: '/analisis',
      isDropdown: true,
      subItems: [
        { label: t.nav.technicalAnalysis, path: '/analisis?tab=tecnico', tab: 'tecnico' },
        { label: t.nav.fundamentalAnalysis, path: '/analisis?tab=fundamental', tab: 'fundamental' },
        { label: t.nav.quantitativeAnalysis, path: '/analisis?tab=cuantitativo', tab: 'cuantitativo' },
        { label: t.nav.compareAssets, path: '/comparar' },
      ]
    },
    { label: t.nav.recommendation, path: '/recommendation', isDropdown: false },
    { label: t.nav.journaling, path: '/calendar', isDropdown: false },
    { label: t.nav.autoTrader, path: '/bots', isDropdown: false },
    {
      label: t.nav.more,
      path: '#',
      isDropdown: true,
      subItems: [
        { label: t.nav.strategies, path: '/strategies' },
        { label: t.nav.psychoanalysis, path: '/psychoanalysis' },
      ]
    },
    { label: t.nav.search, path: '/assets', isDropdown: false, icon: Search },
  ];

  const isTabActive = (tab: string) => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('tab') === tab;
  };

  const isPathActive = (path: string, exact = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const isItemActive = (item: any) => {
    if (!item.isDropdown) return isPathActive(item.path, true);
    if (item.label === t.nav.analysis) return isPathActive('/analisis');
    if (item.label === t.nav.more) {
      return ['/strategies', '/psychoanalysis'].some(p => isPathActive(p));
    }
    return false;
  };

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 fixed top-0 left-0 right-0 z-50">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0">
            <img src="/Logo.png" alt="Logo" className="w-10 h-10 object-contain" />
            <div className="hidden lg:block">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                {t.nav.riskAnalysis}
              </h1>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {t.nav.riskManagement}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 mx-4">
            {navItems.map((item) => (
              <div
                key={item.label}
                className={`relative group ${item.label === t.nav.search ? 'ml-3' : ''}`}
                onMouseEnter={() => item.isDropdown && setActiveDropdown(item.label)}
                onMouseLeave={() => item.isDropdown && setActiveDropdown(null)}
              >
                {!item.isDropdown ? (
                  <Link
                    to={item.path}
                    title={item.icon ? item.label : undefined}
                    className={`px-4 py-2 rounded-lg text-base font-medium transition-all relative flex items-center justify-center ${isItemActive(item)
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    {item.icon ? <item.icon className="w-5 h-5" /> : item.label}
                    {isItemActive(item) && (
                      <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary-500 rounded-full" />
                    )}
                  </Link>
                ) : (
                  <button
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-base font-medium transition-all ${isItemActive(item)
                      ? 'text-primary-600 dark:text-primary-400'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      }`}
                  >
                    {item.label}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === item.label ? 'rotate-180' : ''}`} />
                  </button>
                )}

                {/* Dropdown Menu */}
                {item.isDropdown && (
                  <div
                    className={`absolute top-full left-0 pt-2 w-56 transition-all duration-150 transform ${activeDropdown === item.label
                      ? 'opacity-100 translate-y-0 pointer-events-auto'
                      : 'opacity-0 translate-y-1 pointer-events-none'
                      }`}
                  >
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden py-1">
                      {item.subItems?.map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.path}
                          className={`block px-4 py-2.5 text-sm transition-colors ${(sub.tab ? isTabActive(sub.tab) : isPathActive(sub.path, true))
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-semibold'
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                            }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Controls */}
          <div className="flex items-center space-x-2">
            {user && (
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
                <div className="w-6 h-6 rounded-full bg-primary-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[120px] truncate">
                  {user.name}
                </span>
              </div>
            )}

            <div className="hidden sm:flex items-center space-x-1">
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg
                         text-gray-700 dark:text-gray-300 hover:bg-gray-100 
                         dark:hover:bg-gray-700 transition-colors"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium hidden lg:inline">{t.nav.profile}</span>
              </Link>
              <button
                onClick={handleLogout}
                title={t.nav.closeSession}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg
                         text-gray-700 dark:text-gray-300 hover:bg-red-50 hover:text-red-600
                         dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium hidden lg:inline">{t.auth.logout}</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen border-t border-gray-200 dark:border-gray-700' : 'max-h-0'
          }`}
      >
        <div className="px-4 py-4 space-y-3 bg-gray-50 dark:bg-gray-900/50 max-h-[calc(100vh-65px)] overflow-y-auto overscroll-contain">
          {navItems.map((item) => (
            <div key={item.label} className="space-y-2">
              {!item.isDropdown ? (
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isItemActive(item)
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                >
                  {item.icon && <item.icon className="w-5 h-5" />}
                  {item.label}
                </Link>
              ) : (
                <div className="space-y-1">
                  <p className="px-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2 mt-4 first:mt-0">
                    {item.label}
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {item.subItems?.map((sub) => (
                      <Link
                        key={sub.label}
                        to={sub.path}
                        className={`block px-4 py-2 rounded-lg text-sm transition-colors ${(sub.tab ? isTabActive(sub.tab) : isPathActive(sub.path, true))
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800'
                          }`}
                      >
                        {sub.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* User controls in mobile menu */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700 sm:hidden pb-4">
            <Link
              to="/profile"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="font-medium">{t.nav.myProfile}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-600 dark:text-red-400 w-full hover:bg-white dark:hover:bg-gray-800 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t.auth.logoutMobile}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
