import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Modal, Input, Button, Select, useToast } from '../ui';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const createPostSchema = z.object({
  location: z.string().trim().min(1, 'Location is required'),
  trip_title: z.string().trim().min(1, 'Trip title is required').max(150, 'Title too long'),
  content: z.string().trim().min(1, 'Content is required').max(2000, 'Content too long'),
  category: z.string().trim().min(1, 'Category is required'),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

const CATEGORY_OPTIONS = [
  { value: 'Culture & Sightseeing', label: 'Culture & Sightseeing' },
  { value: 'Foodie Trail', label: 'Foodie Trail' },
  { value: 'Outdoor Adventure', label: 'Outdoor Adventure' },
  { value: 'Relaxation & Spa', label: 'Relaxation & Spa' },
  { value: 'Nightlife', label: 'Nightlife' },
];

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToast } = useToast();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      category: 'Culture & Sightseeing',
    },
  });

  const uploadImage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Math.random()}.${fileExt}`;
    const filePath = `community/${fileName}`; // reusing trip-covers or general images

    const { error: uploadError } = await supabase.storage
      .from('trip-covers') // using existing public bucket
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from('trip-covers').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostFormData) => {
      let image_url = null;
      if (imageFile) {
        setIsUploading(true);
        try {
          image_url = await uploadImage(imageFile);
        } catch (err) {
          console.error('Image upload failed', err);
          throw new Error('Image upload failed');
        } finally {
          setIsUploading(false);
        }
      }

      return api.createCommunityPost({ ...data, image_url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communityPosts'] });
      addToast('success', 'Experience Shared', 'Your post has been added to the community feed!');
      reset();
      setImageFile(null);
      onClose();
    },
    onError: (error: any) => {
      addToast('error', 'Error', error.message || 'Failed to create post');
    },
  });

  const onSubmit = (data: CreatePostFormData) => {
    createPostMutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Your Experience">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Trip Title"
          placeholder="e.g. A Weekend in Paris"
          error={errors.trip_title?.message}
          {...register('trip_title')}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Location"
            placeholder="e.g. Paris, France"
            error={errors.location?.message}
            {...register('location')}
          />
          <Select
            label="Category"
            options={CATEGORY_OPTIONS}
            error={errors.category?.message}
            {...register('category')}
          />
        </div>
        
        <div>
          <label className="block text-sm font-semibold text-[#1A1523] mb-1">
            Story / Content
          </label>
          <textarea
            className={`w-full px-4 py-2.5 rounded-xl border bg-white focus:ring-2 transition-all outline-none text-sm placeholder:text-[#6B7280] ${
              errors.content
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-[#E9E4F5] focus:border-[#7C3AED] focus:ring-[#7C3AED]/20'
            }`}
            rows={4}
            placeholder="Share your experience..."
            {...register('content')}
          />
          {errors.content && (
            <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#1A1523] mb-1">
            Cover Image (Optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-[#6B7280]
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-xs file:font-semibold
              file:bg-[#7C3AED]/10 file:text-[#7C3AED]
              hover:file:bg-[#7C3AED]/20
              transition-colors"
          />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-[#E9E4F5]">
          <Button variant="outline" type="button" onClick={onClose} disabled={createPostMutation.isPending || isUploading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" isLoading={createPostMutation.isPending || isUploading}>
            Share Post
          </Button>
        </div>
      </form>
    </Modal>
  );
};
