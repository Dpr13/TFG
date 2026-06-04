import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import RegisterPage from './RegisterPage';

const registerMock = vi.fn();

let authState: { register: typeof registerMock; isLoading: boolean } = {
  register: registerMock,
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

    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    hasAccount: 'Already have an account?',
    login: 'Login',
    systemFooter: 'System',
  },
  register: {
    title: 'Create account',
    subtitle: 'Register subtitle',
    name: 'Name',
    namePlaceholder: 'Your name',
    emailPlaceholder: 'you@example.com',

    req8Chars: '8+ chars',
    reqUpper: '1 uppercase',
    reqNumber: '1 number',
    reqSymbol: '1 symbol',

    passwordReqs: 'Password does not meet requirements',
    passwordsNoMatch: 'Passwords do not match',
    confirmNoMatch: 'No match',
    confirmMatch: 'Match',

    strength: 'Strength',
    strengthLevels: {
      weak: 'Weak',
      fair: 'Fair',
      good: 'Good',
      strong: 'Strong',
    },

    creating: 'Creating…',
    submit: 'Create',
    coldStartMsg: 'This may take a moment (cold start).',
  },
  common: {
    error: 'Error',
    selectLanguage: 'Select language',
  },
  apiErrors: {},
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

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verificar-email" element={<VerifyEmailSpy />} />
        <Route path="/login" element={<div>LOGIN PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );
}

async function fillValidForm(user = userEvent.setup()) {
  await user.type(screen.getByLabelText(t.register.name), 'Alice');
  await user.type(screen.getByLabelText(t.auth.email), 'alice@example.com');
  await user.type(screen.getByLabelText(t.auth.password), 'Password1!');
  await user.type(screen.getByLabelText(t.auth.confirmPassword), 'Password1!');
}

describe('RegisterPage', () => {
  beforeEach(() => {
    registerMock.mockReset();
    authState = { register: registerMock, isLoading: false };
  });

  it('disables submit until all fields are filled', async () => {
    renderRegister();
    const user = userEvent.setup();

    const submit = screen.getByRole('button', { name: t.register.submit });
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(t.register.name), 'Alice');
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(t.auth.email), 'alice@example.com');
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(t.auth.password), 'Password1!');
    expect(submit).toBeDisabled();

    await user.type(screen.getByLabelText(t.auth.confirmPassword), 'Password1!');
    expect(submit).toBeEnabled();
  });

  it('shows error when password requirements are not met', async () => {
    renderRegister();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(t.register.name), 'Alice');
    await user.type(screen.getByLabelText(t.auth.email), 'alice@example.com');
    await user.type(screen.getByLabelText(t.auth.password), 'short');
    await user.type(screen.getByLabelText(t.auth.confirmPassword), 'short');

    await user.click(screen.getByRole('button', { name: t.register.submit }));

    expect(await screen.findByText(t.register.passwordReqs)).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('shows error when passwords do not match', async () => {
    renderRegister();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText(t.register.name), 'Alice');
    await user.type(screen.getByLabelText(t.auth.email), 'alice@example.com');
    await user.type(screen.getByLabelText(t.auth.password), 'Password1!');
    await user.type(screen.getByLabelText(t.auth.confirmPassword), 'Password2!');

    await user.click(screen.getByRole('button', { name: t.register.submit }));

    expect(await screen.findByText(t.register.passwordsNoMatch)).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it('navigates to verify email after successful registration', async () => {
    registerMock.mockResolvedValue({
      ok: true,
      mensaje: 'ok',
      email_enmascarado: 'a***@example.com',
      email: 'alice@example.com',
    });

    renderRegister();
    const user = userEvent.setup();

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: t.register.submit }));

    expect(await screen.findByText('VERIFY EMAIL')).toBeInTheDocument();
    expect(screen.getByTestId('masked')).toHaveTextContent('a***@example.com');
    expect(screen.getByTestId('email')).toHaveTextContent('alice@example.com');
  });
});
