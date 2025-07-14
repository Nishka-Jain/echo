"use client";

import React, { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth, updateProfile } from 'firebase/auth';
import { X, Mail, Lock, User } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

const GoogleIcon = () => ( <svg className="h-5 w-5" viewBox="0 0 48 48">...</svg> );

export default function AuthModal({ onClose }: AuthModalProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useAuth();

  const defaultPhotoURL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a8a29e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const auth = getAuth();

    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
            displayName: name,
            photoURL: defaultPhotoURL,
        });
      }
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please sign up first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in.');
      }
      else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-xl relative animate-fade-in" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-stone-600">
          <X size={24} />
        </button>
        
        <h2 className="font-serif text-3xl text-center text-stone-900">{isLoginView ? 'Welcome Back' : 'Create Your Account'}</h2>
        <p className="text-center text-stone-500 mt-2">{isLoginView ? 'Log in to continue.' : 'Join the Echo community.'}</p>

        <div className="mt-8 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLoginView && (
                 <div>
                    <label className="text-sm font-medium text-stone-700" htmlFor="name">Full Name</label>
                    <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg" />
                    </div>
                </div>
            )}
            <div>
              <label className="text-sm font-medium text-stone-700" htmlFor="email">Email</label>
              <div className="relative mt-1">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                 <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700" htmlFor="password">Password</label>
              <div className="relative mt-1">
                 <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                 <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg" />
              </div>
            </div>
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}
            <button type="submit" disabled={isLoading} className="w-full p-3 rounded-lg bg-stone-800 text-white font-semibold hover:bg-stone-900 disabled:bg-stone-300">
              {isLoading ? 'Loading...' : (isLoginView ? 'Login' : 'Create Account')}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-stone-300"></span></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-stone-500">OR</span></div>
          </div>
          
          <button onClick={handleGoogleSignIn} className="w-full p-3 rounded-lg border border-stone-300 font-semibold hover:bg-stone-50 flex items-center justify-center gap-3">
             <GoogleIcon /> Continue with Google
          </button>
        </div>
        
        <p className="text-center text-sm text-stone-500 mt-8">
          {isLoginView ? "Don't have an account?" : "Already have an account?"}
          <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="font-semibold text-amber-700 hover:underline ml-1">
            {isLoginView ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}