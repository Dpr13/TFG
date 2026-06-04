import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginPage from './LoginPage';

const loginMock = vi.fn();

let authState: { login: typeof loginMock; isLoading: boolean } = {
  login: loginMock,
  isLoading: false,
};

const t = {
  auth: {
    brandName: 'Brand',
    brandSubtitle: 'Subtitle',
    headline1: 'Headline 1',
    headline2: 'Headline 2',
    headlineDesc: 'Headline desc',
    feature1Title: 'Feature 1',
    feature1Desc: 'Feature 1 desc',
    feature2Title: 'Feature 2',
    feature2Desc: 'Feature 2 desc',
    feature3Title: 'Feature 3',
    feature3Desc: 'Feature 3 desc',
    feature4Title: 'Feature 4',
    feature4Desc: 'Feature 4 desc',

    welcomeBack: 'Welcome back',
    loginSubtitle: 'Login subtitle',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    showPassword: 'Show password',
    hidePassword: 'Hide password',
    passwordMinLength: 'Password must be at least 6 characters',
    loggingIn: 'Logging in…',
    login: 'Login',
    noAccount: "Don't have an account?",
    register: 'Register',
    systemFooter: 'System',
  },
  common: {
    selectLanguage: 'Select language',
  },
  apiErrors: {
    'Contraseña incorrecta. Por favor, inténtelo de nuevo.': 'Wrong password',
  },
} as any;

vi.mock('../context/AuthContext', () => ({
  useAuth: () => authState,
}));

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t,
    language: 'es',
    setLanguage: vi.fn(),
  }),
}));

function VerifyEmailSpy() {
  const location = useLocation();
  const state = location.state as any;
  return (
    <div>
      <div>VERIFY EMAIL</div>
      <div data-testid="masked">{state?.email_enmascarado ?? ''}</div>
      <div data-testid="email">{state?.email ?? ''}</div>
    </div>
  );
}

function renderLogin(fromPath: string = '/risk') {
  return render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/login',
          state: { from: { pathname: fromPath } },
        } as any,
      ]}
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/risk" element={<div>RISK PAGE</div>} />
        <Route path="/" element={<div>HOME PAGE</div>} />
        <Route path="/verificar-email" element={<VerifyEmailSpy />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    loginMock.mockReset();
    authState = { login: loginMock, isLoading: false };
  });

  it('disables submit until email and password are filled', async () => {
    renderLogin();
    const user = userEvent.setup();

    const submit = screen.getByRole('button', { name: t.auth.login });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(t.auth.email), 'user@example.com');
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(t.auth.password), '123456');
    expect(submit).toBeEnabled();
  });

  it('shows validation error when password is too short and does not call login', async () => {
    renderLogin();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(t.auth.email), 'user@example.com');
    await user.type(screen.getByLabelText(t.auth.password), '123');
    await user.click(screen.getByRole('button', { name: t.auth.login }));

    expect(await screen.findByText(t.auth.passwordMinLength)).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('navigates to the intended route after successful login', async () => {
    loginMock.mockResolvedValue({});
    renderLogin('/risk');
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(t.auth.email), 'user@example.com');
    await user.type(screen.getByLabelText(t.auth.password), '123456');
    await user.click(screen.getByRole('button', { name: t.auth.login }));

    expect(await screen.findByText('RISK PAGE')).toBeInTheDocument();
  });

  it('redirects to verify email when backend requires verification', async () => {
    loginMock.mockResolvedValue({
      requiere_verificacion: true,
      email_enmascarado: 'u***@example.com',
      email: 'user@example.com',
    });

    renderLogin('/risk');
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(t.auth.email), 'user@example.com');
    await user.type(screen.getByLabelText(t.auth.password), '123456');
    await user.click(screen.getByRole('button', { name: t.auth.login }));

    expect(await screen.findByText('VERIFY EMAIL')).toBeInTheDocument();
    expect(screen.getByTestId('masked')).toHaveTextContent('u***@example.com');
    expect(screen.getByTestId('email')).toHaveTextContent('user@example.com');
  });

  it('maps backend wrong-password error and clears password input', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    loginMock.mockRejectedValue({
      response: {
        data: {
          error: 'Contraseña incorrecta. Por favor, inténtelo de nuevo.',
        },
      },
    });

    renderLogin('/risk');
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(t.auth.email), 'user@example.com');
    const passwordInput = screen.getByLabelText(t.auth.password) as HTMLInputElement;
    await user.type(passwordInput, '123456');

    await user.click(screen.getByRole('button', { name: t.auth.login }));

    expect(await screen.findByText('Wrong password')).toBeInTheDocument();

    await waitFor(() => {
      expect(passwordInput.value).toBe('');
    });

    consoleErrorSpy.mockRestore();
  });
});
