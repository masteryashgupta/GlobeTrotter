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
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 items-center justify-center text-slate-950 font-black text-2xl shadow-xl shadow-teal-500/20 font-heading">
            G
          </div>
          <h1 className="text-3xl font-extrabold text-slate-50 tracking-tight font-heading">Sign in to GlobeTrotter</h1>
          <p className="text-sm text-slate-400">Access your itineraries, trips, and saved activities</p>
        </div>

        {/* Card Form */}
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
                <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase">Password</label>
                <button
                  type="button"
                  onClick={() => setIsForgotModalOpen(true)}
                  className="text-xs text-teal-400 hover:text-teal-300 font-medium transition-colors"
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
            <p className="text-xs text-slate-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-teal-400 font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </Card.Footer>
        </Card>
      </div>

      {/* Forgot Password Modal */}
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
        <p className="text-xs text-slate-400 mb-4">
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
