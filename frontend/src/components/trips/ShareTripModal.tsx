import React, { useState } from 'react';
import { Modal, Button, useToast } from '../ui';
import { supabase } from '../../lib/supabase';
import { API_BASE_URL } from '../../lib/api';

interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: string;
  tripName: string;
  isPublic: boolean;
  shareToken: string | null;
  onShareUpdated?: (updated: { is_public: boolean; share_token: string | null }) => void;
}

export const ShareTripModal: React.FC<ShareTripModalProps> = ({
  isOpen,
  onClose,
  tripId,
  tripName,
  isPublic: initialIsPublic,
  shareToken: initialShareToken,
  onShareUpdated,
}) => {
  const { addToast } = useToast();
  const [isPublic, setIsPublic] = useState<boolean>(initialIsPublic);
  const [shareToken, setShareToken] = useState<string | null>(initialShareToken);
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const shareUrl = shareToken ? `${window.location.origin}${window.location.pathname}#/share/${shareToken}` : '';

  const handleToggleShare = async () => {
    try {
      setLoading(true);
      const newPublicState = !isPublic;

      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const endpoint = newPublicState
        ? `${API_BASE_URL}/trips/${tripId}/share`
        : `${API_BASE_URL}/trips/${tripId}/unshare`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update share settings');
      }

      const data = await res.json();
      setIsPublic(data.is_public);
      if (data.share_token) {
        setShareToken(data.share_token);
      }

      if (onShareUpdated) {
        onShareUpdated({ is_public: data.is_public, share_token: data.share_token });
      }

      addToast(
        'success',
        data.is_public ? 'Trip is now public' : 'Trip is now private',
        data.is_public ? 'Anyone with the link can view this itinerary.' : 'Only you can view this trip.'
      );
    } catch (err: any) {
      addToast('error', 'Error', err.message || 'Failed to update sharing settings');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    addToast('success', 'Link Copied!', 'Share link copied to clipboard.');
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share "${tripName}"`}>
      <div className="space-y-6 font-sans">
        {/* Toggle Public Sharing */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#F7F5FC] border border-[#E9E4F5]">
          <div>
            <h4 className="font-semibold text-[#1A1523]">Public Sharing</h4>
            <p className="text-xs text-[#6B7280] mt-0.5">
              {isPublic
                ? 'Anyone with the link can view your trip itinerary.'
                : 'Only you can access this trip. Enable to get a share link.'}
            </p>
          </div>
          <button
            type="button"
            disabled={loading}
            onClick={handleToggleShare}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isPublic ? 'bg-[#7C3AED]' : 'bg-[#E9E4F5]'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isPublic ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Share Link Box */}
        {isPublic && shareToken && (
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#1A1523]">
              Public Trip Link
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-3 py-2 text-sm rounded-lg bg-white border border-[#E9E4F5] text-[#1A1523] focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/25"
              />
              <Button onClick={handleCopyLink} variant="primary" className="whitespace-nowrap">
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </div>
          </div>
        )}

        {/* Social Share Shortcuts */}
        {isPublic && shareUrl && (
          <div className="pt-2 border-t border-[#E9E4F5]">
            <p className="text-xs text-[#6B7280] mb-3">Or share directly via:</p>
            <div className="flex items-center gap-3">
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out my trip "${tripName}": ${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 text-xs font-medium text-center rounded-lg bg-[#22C55E]/10 text-[#15803D] border border-[#22C55E]/30 hover:bg-[#22C55E]/20 transition-colors"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out my trip "${tripName}":`)}&url=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 text-xs font-medium text-center rounded-lg bg-sky-50 text-sky-600 border border-sky-200 hover:bg-sky-100 transition-colors"
              >
                Twitter / X
              </a>
              <a
                href={`mailto:?subject=${encodeURIComponent(`Trip Itinerary: ${tripName}`)}&body=${encodeURIComponent(`Hey! Take a look at my travel plan for ${tripName}: ${shareUrl}`)}`}
                className="flex-1 py-2 px-3 text-xs font-medium text-center rounded-lg bg-[#7C3AED]/10 text-[#5B21B6] border border-[#C4B5FD]/40 hover:bg-[#7C3AED]/20 transition-colors"
              >
                Email
              </a>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
