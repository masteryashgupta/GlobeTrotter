import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { tripCreateSchema, TripCreateInput } from '../../../../shared/validation';
import { Trip } from '../../../../shared/types';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { API_BASE_URL } from '../../lib/api';
import { Input, Textarea, Button, useToast } from '../ui';

export interface TripFormProps {
  initialValues?: Trip;
  isEdit?: boolean;
  onSuccess?: () => void;
}

export const TripForm: React.FC<TripFormProps> = ({ initialValues, isEdit = false, onSuccess }) => {
  const { user } = useAuth(); // keep AuthContext subscription alive
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string>(initialValues?.cover_photo_url || '');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TripCreateInput>({
    resolver: zodResolver(tripCreateSchema),
    defaultValues: initialValues
      ? {
          name: initialValues.name || '',
          description: initialValues.description || '',
          start_date: initialValues.start_date || '',
          end_date: initialValues.end_date || '',
          cover_photo_url: initialValues.cover_photo_url || '',
          is_public: initialValues.is_public ?? false,
        }
      : {
          name: '',
          description: '',
          start_date: '',
          end_date: '',
          cover_photo_url: '',
          is_public: false,
        },
  });

  // Handle Supabase Storage cover photo upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 9)}_${Date.now()}.${fileExt}`;
      const filePath = `covers/${user?.id || 'anonymous'}/${fileName}`;

      let uploadedUrl: string;

      const { error: uploadError } = await supabase.storage
        .from('trip-covers')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.warn('Storage upload failed, falling back to Base64 Data URL:', uploadError.message);
        uploadedUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        addToast('success', 'Cover Photo Selected', 'Photo loaded successfully.');
      } else {
        const { data: publicUrlData } = supabase.storage
          .from('trip-covers')
          .getPublicUrl(filePath);

        uploadedUrl = publicUrlData.publicUrl || await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        addToast('success', 'Image Uploaded', 'Cover photo uploaded successfully.');
      }

      setCoverPhotoUrl(uploadedUrl);
      setValue('cover_photo_url', uploadedUrl, { shouldValidate: true });
    } catch (err: any) {
      addToast('error', 'Upload Error', err.message || 'Failed to upload photo.');
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (data: TripCreateInput) => {
    try {
      // Always fetch a fresh session so the token is never stale
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      const token = freshSession?.access_token;

      if (!token) {
        addToast('error', 'Not Signed In', 'Please sign in again to create a trip.');
        return;
      }

      const endpoint = isEdit ? `${API_BASE_URL}/trips/${initialValues?.id}` : `${API_BASE_URL}/trips`;
      const method = isEdit ? 'PATCH' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errRes = await response.json();
        const errorMessage = errRes.details ? `${errRes.error}: ${errRes.details}` : (errRes.error || 'Server error');
        addToast('error', isEdit ? 'Update Failed' : 'Creation Failed', errorMessage);
        return;
      }

      const savedTrip = await response.json();
      addToast(
        'success',
        isEdit ? 'Trip Updated!' : 'Trip Created!',
        `Successfully ${isEdit ? 'updated' : 'created'} "${savedTrip.name}".`
      );

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/trips/${savedTrip.id}/build`);
      }
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'An unexpected error occurred.');
    }
  };

  const suggestionItems = [
    { title: 'Paris Sightseeing', category: 'Culture & Landmark', image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80' },
    { title: 'Tokyo Foodie Tour', category: 'Culinary Adventure', image: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=400&q=80' },
    { title: 'Swiss Alps Hiking', category: 'Outdoor Experience', image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=400&q=80' },
    { title: 'Rome Colosseum Walk', category: 'Historic Tour', image: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=400&q=80' },
    { title: 'Barcelona Tapas Crawl', category: 'Food & Nightlife', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=400&q=80' },
    { title: 'New York Central Park', category: 'City Park & Relax', image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=400&q=80' },
  ];

  return (
    <div className="space-y-8">
      {/* ── Form Section: Plan a new trip (Screen 4 Spec) ── */}
      <div className="bg-[#F7F5FC] border border-[#E9E4F5] rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h2 className="text-xl font-bold text-[#1A1523] tracking-tight font-heading border-b border-[#E9E4F5] pb-3">
          Plan a new trip
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {/* Label Left / Input Right Vertical Stack (Screen 4 Layout) */}
          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
            <label className="text-xs font-semibold text-[#1A1523] uppercase tracking-wide md:col-span-1">
              Trip Name
            </label>
            <div className="md:col-span-3">
              <Input
                placeholder="e.g. Summer in Tokyo & Kyoto"
                error={errors.name?.message}
                {...register('name')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
            <label className="text-xs font-semibold text-[#1A1523] uppercase tracking-wide md:col-span-1">
              Select a Place
            </label>
            <div className="md:col-span-3">
              <Input
                placeholder="Search or enter destination (e.g. Paris, France)"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
            <label className="text-xs font-semibold text-[#1A1523] uppercase tracking-wide md:col-span-1">
              Start Date
            </label>
            <div className="md:col-span-3">
              <Input
                type="date"
                error={errors.start_date?.message}
                {...register('start_date')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-center gap-2 md:gap-4">
            <label className="text-xs font-semibold text-[#1A1523] uppercase tracking-wide md:col-span-1">
              End Date
            </label>
            <div className="md:col-span-3">
              <Input
                type="date"
                error={errors.end_date?.message}
                {...register('end_date')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-2 md:gap-4">
            <label className="text-xs font-semibold text-[#1A1523] uppercase tracking-wide md:col-span-1 pt-2">
              Description
            </label>
            <div className="md:col-span-3">
              <Textarea
                placeholder="Share context, goals, or notes for this trip..."
                rows={3}
                error={errors.description?.message}
                {...register('description')}
              />
            </div>
          </div>

          {/* Cover Photo File Upload */}
          <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-2 md:gap-4">
            <label className="text-xs font-semibold text-[#1A1523] uppercase tracking-wide md:col-span-1 pt-2">
              Cover Photo
            </label>
            <div className="md:col-span-3 space-y-2">
              {coverPhotoUrl && (
                <div className="relative h-36 w-full rounded-xl overflow-hidden border border-[#E9E4F5] bg-white mb-2">
                  <img src={coverPhotoUrl} alt="Cover preview" className="w-full h-full object-cover" />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="w-full text-xs text-[#6B7280] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-[#7C3AED] hover:file:bg-[#E9E4F5] cursor-pointer"
              />
              {isUploading && <p className="text-xs text-[#7C3AED] animate-pulse">Uploading cover photo...</p>}
            </div>
          </div>

          {/* Public Visibility Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="is_public"
              className="w-4 h-4 rounded border-[#E9E4F5] text-[#7C3AED] focus:ring-[#7C3AED]"
              {...register('is_public')}
            />
            <label htmlFor="is_public" className="text-xs text-[#1A1523] select-none cursor-pointer">
              Make this trip public (anyone with link can view)
            </label>
          </div>

          <div className="pt-4 flex items-center justify-end">
            <Button variant="primary" size="lg" type="submit" isLoading={isSubmitting || isUploading}>
              {isEdit ? 'Save Changes' : 'Create Trip & Start Building'}
            </Button>
          </div>
        </form>
      </div>

      {/* ── Suggestions Section: 3x2 Grid of Suggestion Cards (Screen 4 Spec) ── */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#1A1523] tracking-tight font-heading">
          Suggestions for Places to Visit / Activities to Perform
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {suggestionItems.map((item, idx) => (
            <div
              key={idx}
              className="group rounded-2xl overflow-hidden border border-[#E9E4F5] bg-[#F7F5FC] shadow-sm hover:border-[#7C3AED]/40 hover:-translate-y-0.5 transition-all p-3 flex flex-col justify-between"
            >
              <div className="h-32 -mx-3 -mt-3 mb-3 overflow-hidden bg-white relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C3AED]">
                  {item.category}
                </span>
                <h4 className="font-bold text-sm text-[#1A1523] group-hover:text-[#7C3AED] transition-colors font-heading leading-tight mt-0.5">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
