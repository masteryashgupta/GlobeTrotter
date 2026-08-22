import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { signUpSchema, SignUpInput } from '../../../shared/validation';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../lib/api';
import { Input, Button, Card, useToast } from '../components/ui';

export const SignUpPage: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
  });

  const onSignUp = async (data: SignUpInput) => {
    try {
      // 1. Try standard Supabase Client Signup first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
          },
        },
      });

      if (!authError && authData.user) {
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          full_name: data.full_name,
          language_pref: 'en',
        } as any);

        addToast('success', 'Account Created!', 'Welcome to GlobeTrotter.');

        // Attempt instant login if session was not returned automatically
        if (!authData.session) {
          await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
          });
        }
        navigate('/dashboard');
        return;
      }

      // 2. Fallback to Express Backend Admin Signup (Bypasses Supabase Auth Rate Limits 100%)
      const backendRes = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.full_name,
        }),
      });

      const backendData = await backendRes.json();

      if (!backendRes.ok) {
        addToast('error', 'Sign Up Failed', backendData.error || 'Could not register user.');
        return;
      }

      // 3. Admin creation succeeded — sign in immediately with password!
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (signInError) {
        addToast('error', 'Sign In Error', signInError.message);
        return;
      }

      addToast('success', 'Account Created!', 'Welcome to GlobeTrotter.');
      navigate('/dashboard');
    } catch (err: any) {
      addToast('error', 'Registration Error', err.message || 'An unexpected error occurred.');
    }
  };

  return (
    /* ── Page shell: white bg ── */
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">

      {/* ── Ambient violet blob glow ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full pointer-events-none animate-ambient-glow"
        style={{
          background: 'radial-gradient(circle at center, rgba(124,58,237,0.12) 0%, rgba(192,132,252,0.07) 45%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute bottom-1/4 left-1/4 w-56 h-56 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(192,132,252,0.08) 0%, transparent 70%)',
          filter: 'blur(28px)',
        }}
      />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-up">
        {/* ── Header ── */}
        <div className="text-center space-y-3">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#C084FC] items-center justify-center text-white font-black text-2xl shadow-xl shadow-[rgba(124,58,237,0.25)] font-heading">
            G
          </div>
          <h1 className="text-3xl font-extrabold text-[#1A1523] tracking-tight font-heading">
            Create your GlobeTrotter account
          </h1>
          <p className="text-sm text-[#6B7280]">Join travel enthusiasts and start planning your journeys</p>
        </div>

        {/* ── Form Card ── */}
        <Card>
          <form onSubmit={handleSubmit(onSignUp)} className="space-y-4" noValidate>
            <Input
              label="Full Name"
              placeholder="Alex Morgan"
              error={errors.full_name?.message}
              {...register('full_name')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Min 8 chars, 1 number"
              helperText="Must contain at least 8 characters and 1 digit"
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              variant="primary"
              type="submit"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Create Account
            </Button>
          </form>

          <Card.Footer className="justify-center">
            <p className="text-xs text-[#6B7280]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#7C3AED] font-semibold hover:text-[#5B21B6] hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
};
