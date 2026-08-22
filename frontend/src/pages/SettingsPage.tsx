import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileUpdateSchema, ProfileUpdateInput } from '../../../shared/validation';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui';
import { Button, Card, Input, Select, Modal, Skeleton, EmptyState, Badge } from '../components/ui';
import { supabase } from '../lib/supabase';
import { API_BASE_URL } from '../lib/api';
import { City, Trip } from '../../../shared/types';

const LANGUAGE_OPTIONS = [
  { label: 'English (US)', value: 'en' },
  { label: 'Spanish (ES)', value: 'es' },
  { label: 'French (FR)', value: 'fr' },
  { label: 'German (DE)', value: 'de' },
  { label: 'Japanese (JA)', value: 'ja' },
  { label: 'Hindi (HI)', value: 'hi' },
];

const CURRENCY_OPTIONS = [
  { label: 'US Dollar (USD)', value: 'USD' },
  { label: 'Indian Rupee (INR)', value: 'INR' },
  { label: 'Euro (EUR)', value: 'EUR' },
  { label: 'British Pound (GBP)', value: 'GBP' },
  { label: 'Japanese Yen (JPY)', value: 'JPY' },
  { label: 'Australian Dollar (AUD)', value: 'AUD' },
];

export const SettingsPage: React.FC = () => {
  const { user, session, profile, signOut, refreshProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);
  const [isLoadingDestinations, setIsLoadingDestinations] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState<boolean>(false);
  const [isEditingInfo, setIsEditingInfo] = useState<boolean>(false);

  const [savedDestinations, setSavedDestinations] = useState<City[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string>('');

  // Delete Account Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [confirmText, setConfirmText] = useState<string>('');
  const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);

  // Fetch user trips for Preplanned / Previous sections
  const { data: userTrips = [] } = useQuery<Trip[]>({
    queryKey: ['user-profile-trips', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const token = session?.access_token;
      try {
        const res = await fetch(`${API_BASE_URL}/trips`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) return await res.json();
      } catch (e) {
        console.warn('Backend fetch failed, using fallback query');
      }
      const { data } = await supabase
        .from('trips')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
      return (data || []) as Trip[];
    },
    enabled: !!user,
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const preplannedTrips = userTrips.filter((t) => t.start_date >= todayStr);
  const previousTrips = userTrips.filter((t) => t.start_date < todayStr);

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
        avatar_url: profile?.avatar_url || '',
        language_pref: (profile?.language_pref as any) || 'en',
        currency: (profile?.currency as any) || 'USD',
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
          currency: data.currency || 'USD',
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

      await refreshProfile();
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
    <div className="max-w-5xl mx-auto space-y-8 py-4 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1A1523] tracking-tight sm:text-3xl font-heading">
          User Profile Page
        </h1>
        <p className="text-sm text-[#6B7280] mt-1">
          Personal user profile details, preplanned itineraries, and previous trips overview.
        </p>
      </div>

      {/* ── 1. Top Section: Circular Profile Image Left, User Details + Edit Option Right (Screen 7 Spec) ── */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 p-2">
          <div className="flex items-center gap-5">
            {/* Circular Profile Image */}
            <div className="relative group shrink-0">
              {avatarPreview || watchAvatarUrl ? (
                <img
                  src={(avatarPreview || watchAvatarUrl) ?? undefined}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-[#7C3AED]/20 shadow-md"
                  onError={() => setAvatarPreview('')}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#F7F5FC] flex items-center justify-center text-[#7C3AED] font-black text-3xl border-4 border-[#E9E4F5]">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              )}
            </div>

            {/* User Details */}
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-[#1A1523] tracking-tight font-heading">
                {profile?.full_name || user?.email?.split('@')[0] || 'Traveler'}
              </h2>
              <p className="text-xs text-[#6B7280]">
                {user?.email}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="primary" size="sm">
                  🌐 Language: {profile?.language_pref?.toUpperCase() || 'EN'}
                </Badge>
                <Badge variant="success" size="sm">
                  Active Traveler
                </Badge>
              </div>
            </div>
          </div>

          {/* Edit Info Trigger Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditingInfo(!isEditingInfo)}
          >
            {isEditingInfo ? 'Hide Edit Form' : '✏️ Edit Profile Info'}
          </Button>
        </div>

        {/* Collapsible Edit Profile Form */}
        {isEditingInfo && (
          <div className="mt-6 pt-6 border-t border-[#E9E4F5]">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="flex items-center gap-3">
                <label className="cursor-pointer">
                  <span className="inline-flex items-center justify-center px-4 py-2 text-xs font-medium bg-[#F7F5FC] hover:bg-[#E9E4F5] text-[#1A1523] rounded-lg transition-colors border border-[#E9E4F5]">
                    {isUploadingAvatar ? 'Uploading...' : 'Upload New Avatar Photo'}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Email Address"
                  value={user?.email || ''}
                  readOnly
                  disabled
                  className="bg-[#F7F5FC] text-[#6B7280] cursor-not-allowed border-[#E9E4F5]"
                />
                <Input
                  label="Full Name"
                  placeholder="Jane Doe"
                  error={errors.full_name?.message}
                  {...register('full_name')}
                />
              </div>

            {/* Language & Currency Preferences */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <Select
                label="Language Preference"
                options={LANGUAGE_OPTIONS}
                error={errors.language_pref?.message}
                {...register('language_pref')}
              />
              <Select
                label="Currency Preference"
                options={CURRENCY_OPTIONS}
                error={errors.currency?.message}
                helperText="Display currency for costs and budgets"
                {...register('currency')}
              />
            </div>

              <div className="flex justify-end">
                <Button type="submit" isLoading={isSubmitting}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </div>
        )}
      </Card>

      {/* ── 2. Preplanned Trips Section (Screen 7 Spec: Horizontal Row + View Buttons + Create Card) ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1523] tracking-tight font-heading">Preplanned Trips</h2>
          <span className="text-xs text-[#6B7280]">{preplannedTrips.length} Upcoming Journeys</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Card to Create/Add a New Trip (Screen 7 Spec) */}
          <Link
            to="/trips/new"
            className="rounded-2xl border-2 border-dashed border-[#7C3AED]/40 bg-[#F7F5FC] p-6 flex flex-col items-center justify-center text-center hover:border-[#7C3AED] hover:bg-[#7C3AED]/5 transition-all group min-h-[220px]"
          >
            <div className="w-12 h-12 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center font-bold text-2xl group-hover:scale-110 transition-transform mb-2">
              +
            </div>
            <span className="font-bold text-sm text-[#1A1523] font-heading">Add / Create New Trip</span>
            <span className="text-xs text-[#6B7280] mt-1">Plan dates, stops & activities</span>
          </Link>

          {/* Preplanned Trip Cards */}
          {preplannedTrips.map((trip) => (
            <Card key={trip.id} hoverable className="flex flex-col justify-between overflow-hidden">
              <div>
                <div className="h-32 -mx-6 -mt-6 mb-3 overflow-hidden bg-[#F7F5FC] relative">
                  <img
                    src={trip.cover_photo_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=400&q=80'}
                    alt={trip.name || 'Trip'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h4 className="font-bold text-sm text-[#1A1523] font-heading line-clamp-1">{trip.name || 'Untitled Trip'}</h4>
                <p className="text-xs text-[#6B7280] mt-1">📅 {trip.start_date}</p>
              </div>
              <Card.Footer className="mt-4 pt-2 border-t border-[#E9E4F5]">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/trips/${trip.id}/view`)}
                >
                  View
                </Button>
              </Card.Footer>
            </Card>
          ))}
        </div>
      </section>

      {/* ── 3. Previous Trips Section (Screen 7 Spec: Horizontal Row + View Buttons) ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1523] tracking-tight font-heading">Previous Trips</h2>
          <span className="text-xs text-[#6B7280]">{previousTrips.length} Completed Journeys</span>
        </div>

        {previousTrips.length === 0 ? (
          <p className="text-xs text-[#6B7280] italic bg-[#F7F5FC] p-4 rounded-xl border border-[#E9E4F5]">
            No previous completed trips logged yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previousTrips.map((trip) => (
              <Card key={trip.id} hoverable className="flex flex-col justify-between overflow-hidden">
                <div>
                  <div className="h-32 -mx-6 -mt-6 mb-3 overflow-hidden bg-[#F7F5FC] relative">
                    <img
                      src={trip.cover_photo_url || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80'}
                      alt={trip.name || 'Trip'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="font-bold text-sm text-[#1A1523] font-heading line-clamp-1">{trip.name}</h4>
                  <p className="text-xs text-[#6B7280] mt-1">📅 {trip.start_date} to {trip.end_date}</p>
                </div>
                <Card.Footer className="mt-4 pt-2 border-t border-[#E9E4F5]">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/trips/${trip.id}/view`)}
                  >
                    View
                  </Button>
                </Card.Footer>
              </Card>
            ))}
          </div>
        )}
      </section>

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
