import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ForgotPasswordPage from './ForgotPasswordPage';

const authServiceMocks = vi.hoisted(() => ({
  forgotPassword: vi.fn(),
}));

vi.mock('../services/auth.service', () => ({
  authService: {
    forgotPassword: authServiceMocks.forgotPassword,
  },
}));

const t = {
  auth: {
    email: 'Email',
  },
  register: {
    emailPlaceholder: 'you@example.com',
  },
  forgotPwd: {
    title: 'Forgot password',
    subtitle: 'Enter your email',
    send: 'Send',
    backToLogin: 'Back to login',
    checkEmail: 'Check your email',
    checkEmailDesc: 'We sent an email to {{email}}',
  },
  common: {
    selectLanguage: 'Select language',
  },
  apiErrors: {
    'No existe usuario con ese email': 'User not found',
  },
} as any;

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t,
    language: 'es',
    setLanguage: vi.fn(),
  }),
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    authServiceMocks.forgotPassword.mockReset();
  });

  it('disables submit until email is filled', async () => {
    render(
      <MemoryRouter initialEntries={['/forgot-password']}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Routes>
      </MemoryRouter>
    );

    const submit = screen.getByRole('button', { name: t.forgotPwd.send });
    expect(submit).toBeDisabled();

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(t.auth.email), 'user@example.com');
    expect(submit).toBeEnabled();
  });

  it('shows submitted state after success and includes email', async () => {
    authServiceMocks.forgotPassword.mockResolvedValue({ ok: true, mensaje: 'ok' });

    render(
      <MemoryRouter initialEntries={['/forgot-password']}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/login" element={<div>LOGIN PAGE</div>} />
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(t.auth.email), 'user@example.com');
    await user.click(screen.getByRole('button', { name: t.forgotPwd.send }));

    expect(await screen.findByText(t.forgotPwd.checkEmail)).toBeInTheDocument();
    expect(screen.getByText('We sent an email to user@example.com')).toBeInTheDocument();

    expect(authServiceMocks.forgotPassword).toHaveBeenCalledWith('user@example.com');
  });

  it('maps backend errors and shows them', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    authServiceMocks.forgotPassword.mockRejectedValue({
      response: {
        data: {
          error: 'No existe usuario con ese email',
        },
      },
    });

    render(
      <MemoryRouter initialEntries={['/forgot-password']}>
        <Routes>
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(t.auth.email), 'user@example.com');
    await user.click(screen.getByRole('button', { name: t.forgotPwd.send }));

    expect(await screen.findByText('User not found')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
