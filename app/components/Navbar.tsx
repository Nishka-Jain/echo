"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { User, LogOut } from 'lucide-react';

interface NavbarProps {
  variant?: 'solid' | 'transparent';
}

export default function Navbar({ variant = 'solid' }: NavbarProps) {
  const { user, isLoading, openAuthModal, logout } = useAuth();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isTransparent = variant === 'transparent';

  const navClasses = isTransparent ? "border-white/20" : "bg-white/90 backdrop-blur-md";
  const linkColor = isTransparent ? "text-stone-300 hover:text-white" : "text-stone-600 hover:text-stone-900";
  const activeLinkColor = isTransparent ? "text-white font-bold" : "text-stone-800 font-bold";
  const brandColor = isTransparent ? "text-white" : "text-stone-900";
  const loginButtonClasses = isTransparent ? "text-white hover:bg-white/20 border-white/50" : "text-stone-600 hover:text-stone-900 border-stone-300 hover:border-stone-500";
  const welcomeTextColor = isTransparent ? "text-white" : "text-stone-800";

  const navLinks = [
    { href: "/about", label: "About" },
    { href: "/submit", label: "Record a Memory" },
    { href: "/explore", label: "Explore" },
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

  return (
    <nav className={`sticky top-0 z-50 transition-colors duration-300 ${navClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-3 items-center h-20 border-b ${isTransparent ? 'border-white/20' : 'border-stone-300'}`}>
          
          <div className="justify-self-start">
            <Link href="/" className="flex items-center">
              <span className={`text-2xl font-bold tracking-tighter ${brandColor}`}>{isTransparent ? 'Echo' : 'Echo'}</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center justify-self-center space-x-10">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`transition-colors text-base ${ pathname === link.href ? activeLinkColor : linkColor }`}>
                {link.label}
              </Link>
            ))}
          </div>

          <div className="justify-self-end">
            <div className="flex items-center">
              {!isLoading && (
                <>
                  {user ? (
                    <div className="relative" ref={dropdownRef}>
                      <div className="flex items-center gap-3">
                        <span className={`hidden sm:block text-base font-bold tracking-tight ${welcomeTextColor}`}>
                          Welcome, {user.displayName?.split(' ')[0]}!
                        </span>
                        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 rounded-full">
                          {user.photoURL && (
                            <Image src={user.photoURL} alt={user.displayName || 'User profile photo'} width={40} height={40} className={`rounded-full object-cover aspect-square ${user.photoPosition || 'object-center'}`} />
                          )}
                        </button>
                      </div>
                      
                      {isDropdownOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                          <Link href="/profile" onClick={() => setIsDropdownOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"><User size={16} />My Profile</Link>
                          <button onClick={() => { logout(); setIsDropdownOpen(false); }} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-stone-700 hover:bg-stone-100"><LogOut size={16} />Logout</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button onClick={openAuthModal} className={`text-sm font-semibold px-4 py-2 rounded-lg border transition-colors shadow-sm ${loginButtonClasses}`}>
                      Login / Sign Up
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
