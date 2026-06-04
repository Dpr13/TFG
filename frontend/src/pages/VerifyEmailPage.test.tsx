import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import VerifyEmailPage from './VerifyEmailPage';

const authServiceMocks = vi.hoisted(() => ({
  verificarEmail: vi.fn(),
  reenviarCodigo: vi.fn(),
}));

vi.mock('../services/auth.service', () => ({
  authService: {
    verificarEmail: authServiceMocks.verificarEmail,
    reenviarCodigo: authServiceMocks.reenviarCodigo,
  },
}));

const t = {
  auth: {
    brandName: 'Brand',
    brandSubtitle: 'Subtitle',
    email: 'Email',
  },
  verifyEmail: {
    subtitle: 'Protege tu seguridad',
    desc: 'desc',
    securityFeature: 'sec',
    securityFeatureDesc: 'sec desc',
    instantFeature: 'inst',
    instantFeatureDesc: 'inst desc',
    quote: 'quote',

    cardTitle: 'Verify your email',
    cardDesc: 'Enter the code',

    digitAriaLabel: 'Digit {{index}}',

    verifying: 'Verifying…',
    verify: 'Verify',

    success: 'Verified!',
    resendSuccess: 'Code resent',

    noCode: "Didn't get a code?",
    resendIn: 'Resend in {{seconds}}',
    resendAction: 'Resend',

    otherEmail: 'Other email?',
    backToRegister: 'Back to register',
  },
  common: {
    selectLanguage: 'Select language',
  },
  apiErrors: {
    'Código inválido': 'Invalid code',
  },
} as any;

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t,
    language: 'es',
    setLanguage: vi.fn(),
  }),
}));

function renderVerifyEmail(state?: any) {
  return render(
    <MemoryRouter
      initialEntries={[
        state
          ? ({ pathname: '/verificar-email', state } as any)
          : ({ pathname: '/verificar-email' } as any),
      ]}
    >
      <Routes>
        <Route path="/verificar-email" element={<VerifyEmailPage />} />
        <Route path="/register" element={<div>REGISTER PAGE</div>} />
        <Route path="/login" element={<div>LOGIN PAGE</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    authServiceMocks.verificarEmail.mockReset();
    authServiceMocks.reenviarCodigo.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('redirects to /register when no email is provided in navigation state', async () => {
    renderVerifyEmail();
    expect(await screen.findByText('REGISTER PAGE')).toBeInTheDocument();
  });

  it('enables submit after pasting a 6-digit OTP', async () => {
    renderVerifyEmail({ email: 'user@example.com', email_enmascarado: 'u***@example.com' });

    const user = userEvent.setup();

    const submit = screen.getByRole('button', { name: t.verifyEmail.verify });
    expect(submit).toBeDisabled();

    const first = screen.getByLabelText('Digit 1') as HTMLInputElement;
    await user.click(first);
    await user.paste('123456');

    expect((screen.getByLabelText('Digit 1') as HTMLInputElement).value).toBe('1');
    expect((screen.getByLabelText('Digit 2') as HTMLInputElement).value).toBe('2');
    expect((screen.getByLabelText('Digit 3') as HTMLInputElement).value).toBe('3');
    expect((screen.getByLabelText('Digit 4') as HTMLInputElement).value).toBe('4');
    expect((screen.getByLabelText('Digit 5') as HTMLInputElement).value).toBe('5');
    expect((screen.getByLabelText('Digit 6') as HTMLInputElement).value).toBe('6');

    expect(submit).toBeEnabled();
  });

  it('verifies code, shows success, and navigates to /login after 2 seconds', async () => {
    vi.useFakeTimers();
    authServiceMocks.verificarEmail.mockResolvedValue({ ok: true, mensaje: 'ok' });

    renderVerifyEmail({ email: 'user@example.com', email_enmascarado: 'u***@example.com' });

    await act(async () => {
      for (let i = 1; i <= 6; i++) {
        fireEvent.change(screen.getByLabelText(`Digit ${i}`), { target: { value: String(i) } });
      }
    });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: t.verifyEmail.verify }));
    });

    expect(screen.getByText(t.verifyEmail.success)).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();

    expect(authServiceMocks.verificarEmail).toHaveBeenCalledWith('user@example.com', '123456');
  });

  it('shows error, clears digits, and focuses first input on verify failure', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    authServiceMocks.verificarEmail.mockRejectedValue({
      response: {
        data: {
          error: 'Código inválido',
        },
      },
    });

    renderVerifyEmail({ email: 'user@example.com', email_enmascarado: 'u***@example.com' });

    const user = userEvent.setup();

    const first = screen.getByLabelText('Digit 1') as HTMLInputElement;
    await user.click(first);
    await user.paste('123456');

    await user.click(screen.getByRole('button', { name: t.verifyEmail.verify }));

    expect(await screen.findByText('Invalid code')).toBeInTheDocument();

    await waitFor(() => {
      expect((screen.getByLabelText('Digit 1') as HTMLInputElement).value).toBe('');
    });

    expect(screen.getByLabelText('Digit 1')).toHaveFocus();

    consoleErrorSpy.mockRestore();
  });

  it('resends code and starts a cooldown', async () => {
    vi.useFakeTimers();
    authServiceMocks.reenviarCodigo.mockResolvedValue({ ok: true, mensaje: 'ok', email_enmascarado: 'u***@example.com' });

    renderVerifyEmail({ email: 'user@example.com', email_enmascarado: 'u***@example.com' });

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: t.verifyEmail.resendAction }));
    });

    expect(screen.getByText(t.verifyEmail.resendSuccess)).toBeInTheDocument();
    expect(screen.getByText('Resend in 60')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('Resend in 59')).toBeInTheDocument();

    expect(authServiceMocks.reenviarCodigo).toHaveBeenCalledWith('user@example.com');
  });
});
