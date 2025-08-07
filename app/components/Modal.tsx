"use client";

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export default function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div 
      className="fixed inset-0 backdrop-blur-sm bg-black/30 z-50 flex justify-center items-center"
      onClick={onClose}
    >
      {/* Modal Panel */}
      <div
        className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl p-6 m-4"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing it
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-stone-200 pb-4 mb-4">
          <h3 className="text-2xl font-semibold text-stone-800">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-stone-500 rounded-full hover:bg-stone-100 hover:text-stone-800 transition-colors"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Modal Content */}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}