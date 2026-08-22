import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileUpdateSchema, ProfileUpdateInput } from '../../../shared/validation';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui';
import { Button, Card, Input, Select, Modal, Skeleton, EmptyState, Badge } from '../components/ui';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../lib/api';
import { City } from '../../../shared/types';

const LANGUAGE_OPTIONS = [
  { label: 'English (US)', value: 'en' },
  { label: 'Español', value: 'es' },
  { label: 'Français', value: 'fr' },
  { label: 'Deutsch', value: 'de' },
  { label: '日本語', value: 'ja' },
];

export const SettingsPage: React.FC = () => {
  const { user, session, profile, signOut } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  
  const [savedDestinations, setSavedDestinations] = useState<City[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Delete Account Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>('');
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProfileUpdateInput>({
    // zodResolver with z.preprocess widens input types to `unknown`; cast to satisfy RHF's Resolver generic.
    // The actual runtime behaviour is fully correct — preprocess coerces empty strings before validation.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(profileUpdateSchema) as any,
    defaultValues: {
      full_name: '',
      avatar_url: '',
      language_pref: 'en',
    },
  });


  const watchAvatarUrl = watch('avatar_url');

  useEffect(() => {
    if (profile) {
      reset({
        full_name: profile.full_name || '',
        avatar_url: profile.avatar_url || '',
        language_pref: (profile.language_pref as any) || 'en',
      });
      setAvatarPreview(profile.avatar_url || '');
      setIsLoadingProfile(false);
    } else {
      fetchProfile();
    }
    fetchSavedDestinations();
  }, [profile]);

  const fetchProfile = async () => {
    if (!session?.access_token) {
      setIsLoadingProfile(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        reset({
          full_name: data.full_name || '',
          avatar_url: data.avatar_url || '',
          language_pref: data.language_pref || 'en',
        });
        setAvatarPreview(data.avatar_url || '');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const fetchSavedDestinations = async () => {
    if (!session?.access_token) {
      setIsLoadingDestinations(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/profile/saved-destinations`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedDestinations(data || []);
      }
    } catch (err) {
      console.error('Error fetching saved destinations:', err);
    } finally {
      setIsLoadingDestinations(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type and size client-side
    if (!file.type.startsWith('image/')) {
      addToast('error', 'Invalid File', 'Please select an image file (JPEG, PNG, WebP, etc.).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      addToast('error', 'File Too Large', 'Avatar image must be under 5 MB.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      let publicUrl: string;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.warn('Storage upload failed, falling back to Base64 Data URL:', uploadError.message);
        publicUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        addToast('success', 'Photo Selected', 'Image processed cleanly. Click "Save Profile Changes" to save.');
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        publicUrl = publicUrlData?.publicUrl || await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        addToast('success', 'Avatar Uploaded', 'Your profile photo has been updated. Click "Save Profile Changes" to save.');
      }

      setValue('avatar_url', publicUrl, { shouldValidate: true });
      setAvatarPreview(publicUrl);
    } catch (err: any) {
      addToast('error', 'Upload Failed', err.message || 'Could not upload avatar image.');
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = '';
    }
  };

  const onSubmit = async (data: ProfileUpdateInput) => {
    if (!session?.access_token) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to update profile');
      }

      addToast('success', 'Profile Saved', 'Your settings and preferences have been updated.');
    } catch (err: any) {
      addToast('error', 'Update Error', err.message || 'An error occurred while updating profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE' || !session?.access_token) return;

    setIsDeletingAccount(true);
    try {
      const res = await fetch(`${API_BASE_URL}/profile`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ confirm: true }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Failed to delete account');
      }

      await signOut();
      addToast('info', 'Account Deleted', 'Your account and all associated data have been permanently removed.');
      navigate('/login');
    } catch (err: any) {
      addToast('error', 'Deletion Error', err.message || 'Failed to delete account.');
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1A1523] tracking-tight sm:text-3xl font-heading">
          Account Settings &amp; Profile
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Manage your personal details, preferred language, saved trip destinations, and account lifecycle.
        </p>
      </div>

      {/* 1. Profile Information & Preferences Form */}
      <Card>
        <Card.Header>
          <Card.Title>Personal Information</Card.Title>
          <Card.Description>Update your profile information and language preferences.</Card.Description>
        </Card.Header>

        {isLoadingProfile ? (
          <div className="space-y-4 py-2">
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
            <Skeleton variant="rectangular" height={40} />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Avatar Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-[#E9E4F5]">
              <div className="relative group">
                {avatarPreview || watchAvatarUrl ? (
                  <img
                    src={(avatarPreview || watchAvatarUrl) ?? undefined}
                    alt="Avatar preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#7C3AED] shadow-md"
                    onError={() => setAvatarPreview('')}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#F7F5FC] flex items-center justify-center text-[#7C3AED] font-bold text-2xl border-2 border-[#E9E4F5]">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-3">
                <label className="block text-xs font-semibold text-[#1A1523] uppercase tracking-wide">
                  Profile Avatar
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="cursor-pointer">
                    <span className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium bg-[#F7F5FC] hover:bg-[#E9E4F5] text-[#1A1523] rounded-lg transition-colors border border-[#E9E4F5]">
                      {isUploadingAvatar ? 'Uploading...' : 'Upload New Photo'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={isUploadingAvatar}
                      className="hidden"
                    />
                  </label>
                </div>
                <input type="hidden" {...register('avatar_url')} />
              </div>
            </div>

            {/* Email (Read-Only) & Full Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Input
                label="Email Address"
                value={user?.email || ''}
                readOnly
                disabled
                helperText="Email is managed via Supabase Auth"
                className="bg-[#F7F5FC] text-[#6B7280] cursor-not-allowed border-[#E9E4F5]"
              />
              <Input
                label="Full Name"
                placeholder="Jane Doe"
                error={errors.full_name?.message}
                {...register('full_name')}
              />
            </div>

            {/* Language Preference */}
            <div className="pt-2">
              <Select
                label="Language Preference"
                options={LANGUAGE_OPTIONS}
                error={errors.language_pref?.message}
                helperText="Application display language preference"
                {...register('language_pref')}
              />
            </div>

            {/* Form Submit Footer */}
            <div className="pt-4 border-t border-[#E9E4F5] flex justify-end">
              <Button type="submit" isLoading={isSubmitting}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* 2. Saved Destinations Section */}
      <Card>
        <Card.Header>
          <Card.Title>Saved Destinations</Card.Title>
          <Card.Description>
            Cities and locations included across your scheduled trip itineraries.
          </Card.Description>
        </Card.Header>

        {isLoadingDestinations ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton variant="rectangular" height={160} />
            <Skeleton variant="rectangular" height={160} />
            <Skeleton variant="rectangular" height={160} />
          </div>
        ) : savedDestinations.length === 0 ? (
          <EmptyState
            title="No Saved Destinations Yet"
            description="Cities added as stops in your trips will automatically build your saved destinations list."
            icon={
              <svg className="w-10 h-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedDestinations.map((city) => (
              <div
                key={city.id}
                className="group relative overflow-hidden rounded-xl border border-[#E9E4F5] bg-[#F7F5FC] shadow-sm hover:border-[#7C3AED]/40 transition-all"
              >
                {city.image_url ? (
                  <img
                    src={city.image_url}
                    alt={city.name}
                    className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-32 bg-[#E9E4F5] flex items-center justify-center text-[#6B7280]">
                    No image available
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-[#1A1523] tracking-tight font-heading">{city.name}</h4>
                    {city.cost_index && (
                      <Badge variant="secondary">
                        {'₹'.repeat(city.cost_index)}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-[#6B7280] mt-1">{city.country} {city.region ? `• ${city.region}` : ''}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* 3. Account Deletion Danger Zone */}
      <Card className="border-[#EF4444]/30 bg-[#EF4444]/5">
        <Card.Header>
          <Card.Title className="text-[#EF4444]">Danger Zone</Card.Title>
          <Card.Description className="text-[#6B7280]">
            Permanently delete your user account, profile, trips, and all associated itinerary data.
          </Card.Description>
        </Card.Header>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-[#1A1523]">Delete User Account</h4>
            <p className="text-xs text-[#6B7280] mt-0.5">This action is irreversible and cannot be undone.</p>
          </div>
          <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)} className="flex-shrink-0">
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setConfirmText('');
        }}
        title="Confirm Account Deletion"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setConfirmText('');
              }}
              disabled={isDeletingAccount}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              disabled={confirmText !== 'DELETE'}
              isLoading={isDeletingAccount}
              onClick={handleDeleteAccount}
            >
              Permanently Delete Account
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-200 text-sm">
            <strong className="block font-semibold mb-1">Warning: Irreversible Action!</strong>
            Deleting your account will permanently purge your user profile, all created trips, itinerary stops, activities, expenses, and saved data.
          </div>

          <p className="text-sm text-slate-300">
            To proceed, please type <strong className="text-rose-400 select-all font-mono">DELETE</strong> in the box below to confirm:
          </p>

          <Input
            placeholder='Type "DELETE" to confirm'
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="font-mono text-center tracking-widest uppercase border-rose-900 focus:ring-rose-500"
          />
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
