import { useState, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  LogIn,
  Loader2,
  TrendingUp,
  ShieldCheck,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const FEATURES = [
    {
      icon: Activity,
      title: t.auth.feature1Title,
      desc: t.auth.feature1Desc,
    },
    {
      icon: TrendingUp,
      title: t.auth.feature2Title,
      desc: t.auth.feature2Desc,
    },
    {
      icon: ShieldCheck,
      title: t.auth.feature3Title,
      desc: t.auth.feature3Desc,
    },
    {
      icon: AlertTriangle,
      title: t.auth.feature4Title,
      desc: t.auth.feature4Desc,
    },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError(t.auth.passwordMinLength);
      return;
    }
    try {
      const result = await login({ email, password, remember });
      if (result.requiere_verificacion) {
        navigate('/verificar-email', {
          replace: true,
          state: {
            email_enmascarado: result.email_enmascarado,
            email: result.email,
          },
        });
        return;
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      const backendError = err.response?.data?.error;
      setError(backendError || t.auth.serverError);
      if (backendError === t.auth.wrongPassword) {
        setPassword('');
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 flex-col justify-between p-12">
        {/* Decorative circles */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/3 -right-32 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 left-1/4 w-64 h-64 rounded-full bg-white/5" />

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-xl">
            <img src="/Logo.png" alt="Logo" className="w-9 h-9 object-contain" />
          </div>
          <div>
            <p className="text-white font-bold text-lg leading-tight">{t.auth.brandName}</p>
            <p className="text-primary-200 text-xs">{t.auth.brandSubtitle}</p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              {t.auth.headline1}<br />
              <span className="text-primary-200">{t.auth.headline2}</span>
            </h2>
            <p className="mt-3 text-primary-100 text-base max-w-sm leading-relaxed">
              {t.auth.headlineDesc}
            </p>
          </div>

          {/* Feature list */}
          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <li key={title} className="flex items-start gap-3">
                <div className="mt-0.5 bg-white/20 backdrop-blur-sm rounded-lg p-1.5 flex-shrink-0">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-primary-200 text-xs">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer quote */}
        <div className="relative z-10">
          <p className="text-primary-200 text-xs italic">
            "Risk comes from not knowing what you're doing." - Warren Buffett
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="w-full lg:w-1/2 flex flex-col bg-gray-50 dark:bg-gray-900">
        {/* Mobile brand */}
        <div className="flex lg:hidden items-center gap-3 p-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="bg-primary-600 p-1 rounded-lg">
            <img src="/Logo.png" alt="Logo" className="w-7 h-7 object-contain" />
          </div>
          <p className="font-bold text-gray-900 dark:text-white">{t.auth.brandName}</p>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t.auth.welcomeBack}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  {t.auth.loginSubtitle}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    {t.auth.email}
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.auth.emailPlaceholder}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               placeholder-gray-400 dark:placeholder-gray-500
                               focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               transition-colors text-sm"
                  />
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {t.auth.password}
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      {t.auth.forgotPassword}
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300 dark:border-gray-600
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 placeholder-gray-400 dark:placeholder-gray-500
                                 focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                 transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me */}
                <div className="flex items-center gap-2">
                  <input
                    id="remember"
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 cursor-pointer"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none"
                  >
                    {t.auth.rememberSession}
                  </label>
                </div>

                {/* Error */}
                {error && (
                  <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                             bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.auth.loggingIn}
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      {t.auth.login}
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {t.auth.noAccount}{' '}
                  <Link
                    to="/register"
                    className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                  >
                    {t.auth.register}
                  </Link>
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
              {t.auth.systemFooter} {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
