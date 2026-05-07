import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Loader2,
  Mail,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { authService } from '../services/auth.service';
import { useLanguage } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import { mapBackendError } from '../utils/errorMapper';

const OTP_LENGTH = 6;

export default function VerifyEmailPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Datos pasados por navigate state desde RegisterPage o LoginPage
  const state = location.state as { email_enmascarado?: string; email?: string } | null;
  const emailEnmascarado = state?.email_enmascarado ?? '***@***.com';
  const email = state?.email ?? '';

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown para reenviar código
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Si no hay email, redirigir a registro
  useEffect(() => {
    if (!email) {
      navigate('/register', { replace: true });
    }
  }, [email, navigate]);

  const isComplete = digits.every((d) => d.length === 1);

  const handleChange = (index: number, value: string) => {
    // Solo aceptar dígitos
    const digit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = digit;
    setDigits(newDigits);
    setError(null);

    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!paste) return;

    const newDigits = [...digits];
    paste.split('').forEach((char, i) => {
      newDigits[i] = char;
    });
    setDigits(newDigits);
    setError(null);

    const focusIndex = Math.min(paste.length, OTP_LENGTH) - 1;
    inputsRef.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isComplete || !email) return;

    const codigo = digits.join('');
    setIsVerifying(true);
    setError(null);
    setSuccess(null);

    try {
      await authService.verificarEmail(email, codigo);
      setSuccess(t.verifyEmail.success);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err: any) {
      setError(mapBackendError(err, t));
      setDigits(Array(OTP_LENGTH).fill(''));
      inputsRef.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    setError(null);
    setSuccess(null);

    try {
      await authService.reenviarCodigo(email);
      setResendCooldown(60);
      setSuccess(t.verifyEmail.resendSuccess);
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      setError(mapBackendError(err, t));
    }
  };

  return (
    <div className="min-h-screen flex relative">
      {/* Selector de idioma persistente en la esquina superior derecha */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSelector />
      </div>

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
              {t.verifyEmail.subtitle.split('seguridad')[0]}<br />
              <span className="text-primary-200">
                {t.verifyEmail.subtitle.includes('seguridad') ? 'tu seguridad' : 
                 t.verifyEmail.subtitle.includes('security') ? 'your security' :
                 t.verifyEmail.subtitle.includes('Sicherheit') ? 'Ihre Sicherheit' :
                 t.verifyEmail.subtitle.includes('sécurité') ? 'votre sécurité' : 'tu seguridad'}
              </span>
            </h2>
            <p className="mt-3 text-primary-100 text-base max-w-sm leading-relaxed">
              {t.verifyEmail.desc}
            </p>
          </div>

          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="mt-0.5 bg-white/20 backdrop-blur-sm rounded-lg p-1.5 flex-shrink-0">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{t.verifyEmail.securityFeature}</p>
                <p className="text-primary-200 text-xs">{t.verifyEmail.securityFeatureDesc}</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="mt-0.5 bg-white/20 backdrop-blur-sm rounded-lg p-1.5 flex-shrink-0">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{t.verifyEmail.instantFeature}</p>
                <p className="text-primary-200 text-xs">{t.verifyEmail.instantFeatureDesc}</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="relative z-10">
          <p className="text-primary-200 text-xs italic">
            {t.verifyEmail.quote}
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
          <p className="font-bold text-gray-900 dark:text-white">{t.auth.brandName} {t.auth.brandSubtitle}</p>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-full">
                  <Mail className="w-8 h-8 text-primary-600 dark:text-primary-400" />
                </div>
              </div>

              <div className="mb-6 text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t.verifyEmail.cardTitle}
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                  {t.verifyEmail.cardDesc}
                </p>
                <p className="text-gray-700 dark:text-gray-200 font-semibold text-sm mt-1">
                  {emailEnmascarado}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                {/* OTP inputs */}
                <div className="flex justify-center gap-2 sm:gap-3">
                  {digits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { inputsRef.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      onPaste={i === 0 ? handlePaste : undefined}
                      autoFocus={i === 0}
                      className={`w-11 h-14 sm:w-12 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-lg border-2 transition-all
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none
                        ${digit
                          ? 'border-primary-400 dark:border-primary-500'
                          : 'border-gray-300 dark:border-gray-600'
                        }`}
                      aria-label={t.verifyEmail.digitAriaLabel.replace('{{index}}', (i + 1).toString())}
                    />
                  ))}
                </div>

                {/* Success */}
                {success && (
                  <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!isComplete || isVerifying}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg
                             bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm
                             disabled:opacity-50 disabled:cursor-not-allowed
                             transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t.verifyEmail.verifying}
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      {t.verifyEmail.verify}
                    </>
                  )}
                </button>

                {/* Resend */}
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t.verifyEmail.noCode}{' '}
                    {resendCooldown > 0 ? (
                      <span className="text-gray-400 dark:text-gray-500">
                        {t.verifyEmail.resendIn.replace('{{seconds}}', resendCooldown.toString())}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        className="text-primary-600 dark:text-primary-400 font-semibold hover:underline inline-flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        {t.verifyEmail.resendAction}
                      </button>
                    )}
                  </p>
                </div>
              </form>

              {/* Back to register */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  {t.verifyEmail.otherEmail}{' '}
                  <Link
                    to="/register"
                    className="text-primary-600 dark:text-primary-400 font-semibold hover:underline"
                  >
                    {t.verifyEmail.backToRegister}
                  </Link>
                </p>
              </div>
            </div>

            <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-6">
              {t.auth.brandName} {t.auth.brandSubtitle} · TFG {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
