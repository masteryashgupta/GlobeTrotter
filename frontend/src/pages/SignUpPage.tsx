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

      <div className="w-full max-w-xl space-y-6 relative z-10 animate-fade-up">
        {/* ── Header ── */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-[#1A1523] tracking-tight font-heading">
            Register Account
          </h1>
          <p className="text-sm text-[#6B7280]">Join travel enthusiasts and start planning your journeys</p>
        </div>

        {/* ── Form Card (Screen 2 Spec) ── */}
        <Card>
          {/* Top Avatar Circle Icon */}
          <div className="flex flex-col items-center justify-center pb-4 pt-2">
            <div className="w-20 h-20 rounded-full bg-[#F7F5FC] border-2 border-dashed border-[#7C3AED] flex flex-col items-center justify-center text-[#7C3AED] font-bold text-xs shadow-sm hover:border-[#5B21B6] transition-colors cursor-pointer group">
              <svg className="w-6 h-6 text-[#7C3AED] group-hover:scale-110 transition-transform mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Photo</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSignUp)} className="space-y-4" noValidate>
            {/* 2-Column Field Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="Alex"
                error={errors.full_name?.message}
                {...register('full_name')}
              />
              <Input
                label="Last Name"
                placeholder="Morgan"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="City"
                placeholder="San Francisco"
              />
              <Input
                label="Country"
                placeholder="United States"
              />
            </div>

            {/* Additional Information Textarea */}
            <div>
              <label className="block text-xs font-semibold text-[#1A1523] uppercase tracking-wide mb-1">
                Additional Information
              </label>
              <textarea
                rows={3}
                placeholder="Travel preferences, favorite activities, bio..."
                className="w-full px-3.5 py-2.5 bg-[#F7F5FC] border border-[#E9E4F5] rounded-xl text-sm text-[#1A1523] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] transition-all resize-none"
              />
            </div>

            {/* Password Field */}
            <Input
              label="Password"
              type="password"
              placeholder="Min 8 chars, 1 number"
              helperText="Must contain at least 8 characters and 1 digit"
              error={errors.password?.message}
              {...register('password')}
            />

            {/* Centered Register Users CTA Button */}
            <div className="pt-2 flex justify-center">
              <Button
                variant="primary"
                type="submit"
                size="lg"
                className="w-full sm:w-auto px-8"
                isLoading={isSubmitting}
              >
                Register Users
              </Button>
            </div>
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
