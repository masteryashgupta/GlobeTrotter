import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { signInSchema, resetPasswordSchema, SignInInput, ResetPasswordInput } from '../../../shared/validation';
import { supabase } from '../lib/supabase';
import { Input, Button, Card, Modal, useToast } from '../components/ui';

export const LoginPage: React.FC = () => {
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  // Login Form
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isLoginSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
  });

  // Forgot Password Form
  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
    reset: resetForgotForm,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onLogin = async (data: SignInInput) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        addToast('error', 'Authentication Failed', error.message || 'Invalid email or password.');
        return;
      }

      addToast('success', 'Welcome Back!', 'Logged in successfully.');
      navigate('/dashboard');
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'An unexpected error occurred.');
    }
  };

  const onSendResetEmail = async (data: ResetPasswordInput) => {
    setIsForgotSubmitting(true);
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        addToast('error', 'Reset Error', error.message);
      } else {
        addToast('info', 'Check Your Email', 'Password reset instructions have been sent to your email.');
        setIsForgotModalOpen(false);
        resetForgotForm();
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Failed to send reset link');
    } finally {
      setIsForgotSubmitting(false);
    }
  };

  return (
    /* ── Page shell: white bg, overflow-hidden for the ambient blobs ── */
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">

      {/* ── Signature ambient glow: slow-floating violet blob (the ONE bold element) ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full pointer-events-none animate-ambient-glow"
        style={{
          background: 'radial-gradient(circle at center, rgba(124,58,237,0.12) 0%, rgba(192,132,252,0.07) 45%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      {/* Secondary smaller blob — soft purple, bottom-right */}
      <div
        className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(192,132,252,0.10) 0%, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-up">
        {/* ── Header ── */}
        <div className="text-center space-y-3">
          {/* Violet gradient logo badge */}
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#C084FC] items-center justify-center text-white font-black text-2xl shadow-xl shadow-[rgba(124,58,237,0.25)] font-heading">
            G
          </div>
          <h1 className="text-3xl font-extrabold text-[#1A1523] tracking-tight font-heading">
            Sign in to GlobeTrotter
          </h1>
          <p className="text-sm text-[#6B7280]">Access your itineraries, trips, and saved activities</p>
        </div>

        {/* ── Card Form ── */}
        <Card>
          <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-4" noValidate>
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={loginErrors.email?.message}
              {...registerLogin('email')}
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#1A1523] tracking-wide uppercase">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs text-[#7C3AED] hover:text-[#5B21B6] font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                error={loginErrors.password?.message}
                {...registerLogin('password')}
              />
            </div>

            <Button
              variant="primary"
              type="submit"
              className="w-full mt-2"
              isLoading={isLoginSubmitting}
            >
              Sign In
            </Button>
          </form>

          <Card.Footer className="justify-center">
            <p className="text-xs text-[#6B7280]">
              Don't have an account?{' '}
              <Link to="/signup" className="text-[#7C3AED] font-semibold hover:text-[#5B21B6] hover:underline transition-colors">
                Sign up
              </Link>
            </p>
          </Card.Footer>
        </Card>
      </div>

      {/* ── Forgot Password Modal ── */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Password"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsForgotModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleForgotSubmit(onSendResetEmail)}
              isLoading={isForgotSubmitting}
            >
              Send Reset Link
            </Button>
          </>
        }
      >
        <p className="text-sm text-[#6B7280] mb-4">
          Enter your registered account email below. We will send a secure link to reset your password.
        </p>
        <Input
          label="Account Email"
          type="email"
          placeholder="you@example.com"
          error={forgotErrors.email?.message}
          {...registerForgot('email')}
        />
      </Modal>
    </div>
  );
};
