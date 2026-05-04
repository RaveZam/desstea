"use client";

import { useEffect, useRef } from "react";
import { logout } from "@/app/login/actions";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  displayName: string;
  email: string;
};

export default function AccountModal({
  isOpen,
  onClose,
  displayName,
  email,
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.body.style.overflow = "auto";
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full sm:w-80 bg-[#FDFAF7] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#EDE8E3]">
          <h2 className="text-sm font-semibold text-[#6B4F3A]">Account</h2>
        </div>

        {/* Content */}
        <div className="px-5 py-3.5">
          <div className="space-y-3">
            {/* User Info Card */}
            <div className="bg-[#FAF7F2] rounded-lg p-3 space-y-1.5">
              <p className="text-[10px] uppercase tracking-widest font-semibold text-[#C4B4A6]">
                Logged in as
              </p>
              <div>
                <p className="text-xs font-semibold text-[#6B4F3A]">
                  {displayName}
                </p>
                <p className="text-[10px] text-[#A08C7A]">{email}</p>
              </div>
            </div>

            {/* Logout Button */}
            <form action={logout} className="w-full">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-[#6B4F3A] hover:bg-[#5A4230] text-white py-2 px-3 rounded-lg font-medium text-xs transition-all duration-200 active:scale-95"
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Keyboard shortcut to close */}
      <style jsx global>{`
        @keyframes slide-in-from-bottom {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes zoom-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-in.fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-in.slide-in-from-bottom-4 {
          animation: slide-in-from-bottom 0.3s ease-out;
        }

        @media (min-width: 640px) {
          .animate-in.sm\:zoom-in-95 {
            animation: zoom-in 0.3s ease-out;
          }
        }
      `}</style>
    </div>
  );
}
