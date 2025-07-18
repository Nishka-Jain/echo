"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { User, LogOut, Menu, X } from 'lucide-react';

interface NavbarProps {
  variant?: 'solid' | 'transparent';
}

export default function Navbar({ variant = 'solid' }: NavbarProps) {
  const { user, isLoading, openAuthModal, logout } = useAuth();
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMobileMenuOpen]);

  return (
    <nav className={`sticky top-0 z-50 transition-colors duration-300 ${navClasses}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`relative flex items-center justify-between h-20 border-b ${isTransparent ? 'border-white/20' : 'border-stone-300'}`}>
          
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className={`text-2xl font-bold tracking-tighter ${brandColor}`}>Echo</span>
            </Link>
          </div>

          <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex items-center space-x-10">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} className={`transition-colors text-base ${ pathname === link.href ? activeLinkColor : linkColor }`}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center">
            <div className="hidden md:flex items-center">
              {!isLoading && (
                <>
                  {user ? (
                    <div className="relative" ref={dropdownRef}>
                      <div className="flex items-center gap-3">
                        <span className={`hidden sm:block text-base font-bold tracking-tight ${welcomeTextColor}`}>
                          Welcome, {user.displayName?.split(' ')[0]}!
                        </span>
                        <button 
                          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                          aria-label="Open user menu" 
                          className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 rounded-full"
                        >
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

            <div className="md:hidden">
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                  aria-label="Open main menu"
                  className={`p-2 rounded-md ${isTransparent ? 'text-white' : 'text-stone-800'}`}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute left-6 right-6 mt-2 rounded-lg bg-white shadow-lg animate-fade-in-down" id="mobile-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                 {navLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      pathname === link.href ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
            </div>
            <div className="border-t border-stone-200 px-4 py-4 space-y-4">
              {!isLoading && (
                  user ? (
                    <>
                      <div className="flex items-center gap-3">
                          {user.photoURL && (
                            <Image src={user.photoURL} alt="Your profile photo" width={40} height={40} className={`rounded-full object-cover aspect-square ${user.photoPosition || 'object-center'}`} />
                          )}
                          <div>
                              <p className="text-base font-semibold text-stone-800">{user.displayName}</p>
                              <p className="text-sm text-stone-500">{user.email}</p>
                          </div>
                      </div>
                      <div className="space-y-2">
                        <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="w-full text-left flex items-center gap-3 px-3 py-2 text-base font-medium text-stone-600 hover:bg-stone-50 rounded-md"><User size={16} />My Profile</Link>
                        <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-base font-medium text-stone-600 hover:bg-stone-50 rounded-md"><LogOut size={16} />Logout</button>
                      </div>
                    </>
                  ) : (
                      <button onClick={() => {openAuthModal(); setIsMobileMenuOpen(false);}} className="w-full text-center px-4 py-2 rounded-lg bg-stone-800 text-white font-semibold">
                        Login / Sign Up
                      </button>
                  )
              )}
            </div>
        </div>
      )}
    </nav>
  );
}