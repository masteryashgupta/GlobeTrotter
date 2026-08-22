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
  useAuth(); // keep AuthContext subscription alive
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
      const filePath = `covers/${fileName}`;

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <Input
        label="Trip Name"
        placeholder="e.g. Summer in Tokyo & Kyoto"
        error={errors.name?.message}
        {...register('name')}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Start Date"
          type="date"
          error={errors.start_date?.message}
          {...register('start_date')}
        />
        <Input
          label="End Date"
          type="date"
          error={errors.end_date?.message}
          {...register('end_date')}
        />
      </div>

      <Textarea
        label="Description (Optional)"
        placeholder="Share context, goals, or notes for this trip..."
        rows={3}
        error={errors.description?.message}
        {...register('description')}
      />

      {/* Cover Photo File Upload */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-[#1A1523] tracking-wide uppercase">
          Cover Photo (Supabase Storage)
        </label>
        {coverPhotoUrl && (
          <div className="relative h-40 w-full rounded-xl overflow-hidden border border-[#E9E4F5] bg-[#F7F5FC] mb-2">
            <img src={coverPhotoUrl} alt="Cover preview" className="w-full h-full object-cover" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="w-full text-xs text-[#6B7280] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#F7F5FC] file:text-[#7C3AED] hover:file:bg-[#E9E4F5] cursor-pointer"
        />
        {isUploading && <p className="text-xs text-[#7C3AED] animate-pulse">Uploading cover photo...</p>}
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

      <div className="pt-4 flex items-center justify-end gap-3">
        <Button variant="primary" type="submit" isLoading={isSubmitting || isUploading}>
          {isEdit ? 'Save Changes' : 'Create Trip & Start Building'}
        </Button>
      </div>
    </form>
  );
};
