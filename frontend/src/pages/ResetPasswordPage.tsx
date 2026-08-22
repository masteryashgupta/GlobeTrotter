import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '../lib/supabase';
import { Input, Button, Card, useToast } from '../components/ui';

const newPasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/\d/, 'Password must contain at least one number'),
  confirm_password: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Passwords do not match',
  path: ['confirm_password'],
});

type NewPasswordInput = z.infer<typeof newPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordInput>({
    resolver: zodResolver(newPasswordSchema),
  });

  const onUpdatePassword = async (data: NewPasswordInput) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        addToast('error', 'Update Failed', error.message);
        return;
      }

      addToast('success', 'Password Updated!', 'Your new password has been set successfully.');
      navigate('/login');
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Failed to update password');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Ambient violet blob glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] rounded-full pointer-events-none animate-ambient-glow"
        style={{
          background: 'radial-gradient(circle at center, rgba(124,58,237,0.10) 0%, rgba(192,132,252,0.06) 45%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div className="w-full max-w-md space-y-6 relative z-10 animate-fade-up">
        <div className="text-center space-y-2">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#7C3AED] to-[#C084FC] items-center justify-center text-white font-black text-2xl shadow-xl shadow-[rgba(124,58,237,0.25)] font-heading">
            G
          </div>
          <h1 className="text-2xl font-bold text-[#1A1523] tracking-tight font-heading">Set New Password</h1>
          <p className="text-sm text-[#6B7280]">Please enter your new account password below</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit(onUpdatePassword)} className="space-y-4" noValidate>
            <Input
              label="New Password"
              type="password"
              placeholder="Min 8 chars, 1 number"
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Re-enter password"
              error={errors.confirm_password?.message}
              {...register('confirm_password')}
            />

            <Button
              variant="primary"
              type="submit"
              className="w-full mt-2"
              isLoading={isSubmitting}
            >
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
