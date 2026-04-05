import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  UserPlus,
  Loader2,
  TrendingUp,
  ShieldCheck,
  Activity,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const FEATURES = [
  {
    icon: Activity,
    title: 'Datos en tiempo real',
    desc: 'Precios y métricas desde Yahoo Finance sin coste',
  },
  {
    icon: TrendingUp,
    title: 'Análisis cuantitativo',
    desc: 'Volatilidad, Sharpe Ratio, VaR, Sortino y más',
  },
  {
    icon: ShieldCheck,
    title: 'Gestión de riesgo',
    desc: 'Evalúa cualquier acción, cripto o divisa al instante',
  },
  {
    icon: AlertTriangle,
    title: 'Lista de seguimiento',
    desc: 'Guarda y monitoriza tus activos favoritos',
  },
];

interface PasswordStrength {
  score: number; // 0-4
  label: string;
  color: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels: PasswordStrength[] = [
    { score: 0, label: '', color: '' },
    { score: 1, label: 'Débil', color: 'bg-red-500' },
    { score: 2, label: 'Regular', color: 'bg-yellow-500' },
    { score: 3, label: 'Buena', color: 'bg-blue-500' },
    { score: 4, label: 'Fuerte', color: 'bg-green-500' },
  ];
  return levels[score];
}

const RULES = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Al menos una mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Al menos un número', test: (p: string) => /[0-9]/.test(p) },
  { label: 'Al menos un símbolo', test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

export default function RegisterPage() {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = getPasswordStrength(password);
  const passwordsMatch = password.length > 0 && confirm.length > 0 && password === confirm;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre no puede estar vacío.');
      return;
    }
    
    // Validar todas las reglas de contraseña
    const failingRules = RULES.filter(r => !r.test(password));
    if (failingRules.length > 0) {
      setError(`La contraseña no cumple con los requisitos de seguridad: mínimo 8 caracteres, una mayúscula, un número y un símbolo.`);
      return;
    }

    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      const result = await register({ name: name.trim(), email, password });
      navigate('/verificar-email', {
        replace: true,
        state: {
          email_enmascarado: result.email_enmascarado,
          email: result.email,
        },
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      const backendError = err.response?.data?.error;
      setError(backendError || 'Error al crear la cuenta. Inténtelo de nuevo.');
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
            <p className="text-white font-bold text-lg leading-tight">Análisis de Riesgo</p>
            <p className="text-primary-200 text-xs">Plataforma Financiera · TFG</p>
          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 space-y-6">
          <div>
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Empieza a analizar<br />
              <span className="text-primary-200">el mercado hoy</span>
            </h2>
            <p className="mt-3 text-primary-100 text-base max-w-sm leading-relaxed">
              Crea tu cuenta y accede a métricas cuantitativas de riesgo para cualquier activo
              financiero del mundo.
            </p>
          </div>

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

        <div className="relative z-10">
          <p className="text-primary-200 text-xs italic">
            "An investment in knowledge pays the best interest." — Benjamin Franklin
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
          <p className="font-bold text-gray-900 dark:text-white">Análisis de Riesgo Financiero</p>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-md">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              <div className="mb-7">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Crear cuenta
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                  Regístrate para acceder a la plataforma
                </p>
              </div>


              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Nombre */}
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Nombre completo
                  </label>
                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               placeholder-gray-400 dark:placeholder-gray-500
                               focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               transition-colors text-sm"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@ejemplo.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                               placeholder-gray-400 dark:placeholder-gray-500
                               focus:ring-2 focus:ring-primary-500 focus:border-transparent
                               transition-colors text-sm"
                  />
                </div>

                {/* Contraseña */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
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
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Barra de fortaleza */}
                  {password.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              i <= strength.score ? strength.color : 'bg-gray-200 dark:bg-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      {strength.label && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Fortaleza:{' '}
                          <span className={`font-semibold ${
                            strength.score <= 1 ? 'text-red-500' :
                            strength.score === 2 ? 'text-yellow-500' :
                            strength.score === 3 ? 'text-blue-500' : 'text-green-500'
                          }`}>
                            {strength.label}
                          </span>
                        </p>
                      )}
                      {/* Reglas */}
                      <ul className="grid grid-cols-2 gap-x-2 gap-y-1">
                        {RULES.map((r) => {
                          const ok = r.test(password);
                          return (
                            <li key={r.label} className={`flex items-center gap-1 text-xs ${ok ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>
                              {ok
                                ? <Check className="w-3 h-3 flex-shrink-0" />
                                : <X className="w-3 h-3 flex-shrink-0" />
                              }
                              {r.label}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label
                    htmlFor="confirm"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
                  >
                    Confirmar contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full px-4 py-2.5 pr-11 rounded-lg border transition-colors text-sm
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 placeholder-gray-400 dark:placeholder-gray-500
                                 focus:ring-2 focus:ring-primary-500 focus:border-transparent
                                 ${confirm.length > 0
                                   ? passwordsMatch
                                     ? 'border-green-400 dark:border-green-500'
                                     : 'border-red-400 dark:border-red-500'
                                   : 'border-gray-300 dark:border-gray-600'
                                 }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirm.length > 0 && !passwordsMatch && (
                    <p className="mt-1 text-xs text-red-500">Las contraseñas no coinciden</p>
                  )}
                  {passwordsMatch && (
                    <p className="mt-1 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Las contraseñas coinciden
                    </p>
                  )}
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
                  disabled={isLoading || !name || !email || !password || !confirm}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                             bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creando cuenta...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Crear cuenta
                    </>
                  )}
                </button>
              </form>

              {/* Link to login */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  ¿Ya tienes cuenta?{' '}
                  <Link
                    to="/login"
                    className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                  >
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
              Sistema de Análisis de Riesgo Financiero · TFG {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
