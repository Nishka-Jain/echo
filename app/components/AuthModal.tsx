"use client";

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { signInWithEmailAndPassword, fetchSignInMethodsForEmail} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { X, Mail, Lock, User } from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
}

const GoogleIcon = () => (
    <svg className="h-5 w-5" viewBox="0 0 48 48"><path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"></path><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.82l-7.11-5.52c-2.16 1.45-4.92 2.3-8.78 2.3-6.76 0-12.48-4.56-14.52-10.68H1.26v5.7C5.25 42.62 13.86 48 24 48z"></path><path fill="#FBBC05" d="M9.48 28.32c-.41-1.24-.64-2.57-.64-3.96s.23-2.72.64-3.96V14.7H1.26C.46 16.63 0 18.75 0 21.36c0 2.61.46 4.73 1.26 6.66l8.22-6.7z"></path><path fill="#EA4335" d="M24 9.36c3.51 0 6.58 1.22 9.02 3.54l6.32-6.32C35.91 2.45 30.48 0 24 0 13.86 0 5.25 5.38 1.26 14.7l8.22 6.7c2.04-6.12 7.76-10.68 14.52-10.68z"></path><path fill="none" d="M0 0h48v48H0z"></path></svg>
);

export default function AuthModal({ onClose }: AuthModalProps) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestGoogleSignIn, setSuggestGoogleSignIn] = useState(false);
  const { signInWithGoogle, signUp } = useAuth(); // Add signUp

  const defaultPhotoURL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a8a29e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E";

  // ✨ THIS IS THE FUNCTION TO WATCH ✨
  const checkEmailOnBlur = async () => {
    // Checkpoint 1: See if the function is running at all.
    console.log("--- Firing onBlur Check ---");

    // Checkpoint 2: See the values that determine if the check proceeds.
    console.log(`Value of isLoginView: ${isLoginView}`);
    console.log(`Value of email: "${email}"`);
    console.log(`Is the email valid? ${/^\S+@\S+\.\S+$/.test(email)}`);

    if (!isLoginView || !/^\S+@\S+\.\S+$/.test(email)) {
      // Checkpoint 3: This will log if the function exits early.
      console.log("-> Condition NOT met. The Firebase check will NOT run.");
      return;
    }
    
    // Checkpoint 4: If you see this, the code is proceeding correctly.
    console.log("-> Condition MET. Proceeding to Firebase check...");

    try {
      setIsLoading(true);
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.includes('google.com')) {
        setSuggestGoogleSignIn(true);
      } else {
        // This handles cases where the email is valid but not linked to Google
        console.log("Email found, but not linked to a Google Sign-In for this project.");
      }
    } catch (err: any) {
      console.error("-> ERROR during Firebase check:", err);
      setError("Could not verify email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLoginView) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await signUp(name, email, password);
      }
      onClose();
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        setError('No account found with this email. Maybe you used a different sign-in method?');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists.');
      } else {
        console.error("Firebase Error:", err);
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSuggestGoogleSignIn(false);
    setError('');
    setEmail(e.target.value);
  }

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
                        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-amber-500 focus:border-amber-500" />
                    </div>
                </div>
            )}
            <div>
              <label className="text-sm font-medium text-stone-700" htmlFor="email">Email</label>
              <div className="relative mt-1">
                 <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                 {/* ✨ CHANGED: Added onBlur and updated onChange */}
                 <input id="email" type="email" value={email} onChange={handleEmailChange} onBlur={checkEmailOnBlur} required className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-amber-500 focus:border-amber-500" />
              </div>
            </div>
            
            {/* ✨ CHANGED: Conditionally render based on suggestion */}
            {isLoginView && suggestGoogleSignIn ? (
              <div className='text-center p-2 rounded-lg'>
                <p className='text-sm text-stone-600'>It looks like you signed up with Google.</p>
              </div>
            ) : (
              <div>
                <label className="text-sm font-medium text-stone-700" htmlFor="password">Password</label>
                <div className="relative mt-1">
                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
                   <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:ring-amber-500 focus:border-amber-500" />
                </div>
              </div>
            )}
            
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            {/* ✨ CHANGED: Hide normal submit button when suggesting Google */}
            {!(isLoginView && suggestGoogleSignIn) && (
              <button type="submit" disabled={isLoading} className="w-full p-3 rounded-lg bg-stone-800 text-white font-semibold hover:bg-stone-900 transition-colors disabled:bg-stone-300">
                {isLoading ? 'Loading...' : (isLoginView ? 'Login' : 'Create Account')}
              </button>
            )}

          </form>

          {/* ✨ CHANGED: Show OR divider only if password form is visible */}
          {!(isLoginView && suggestGoogleSignIn) && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-stone-300"></span></div>
              <div className="relative flex justify-center text-sm"><span className="bg-white px-2 text-stone-500">OR</span></div>
            </div>
          )}
          
          <button onClick={handleGoogleSignIn} disabled={isLoading} className={`w-full p-3 rounded-lg border font-semibold flex items-center justify-center gap-3 transition-colors disabled:opacity-50 ${isLoginView && suggestGoogleSignIn ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-500' : 'border-stone-300 text-stone-700 hover:bg-stone-50'}`}>
             <GoogleIcon /> Continue with Google
          </button>
          
          {/* ✨ NEW: Allow user to override suggestion */}
          {isLoginView && suggestGoogleSignIn && (
            <div className='text-center'>
              <button onClick={() => setSuggestGoogleSignIn(false)} className="text-sm text-stone-500 hover:text-stone-800 underline">
                Sign in with password instead
              </button>
            </div>
          )}

        </div>
        
        <p className="text-center text-sm text-stone-500 mt-8">
          {isLoginView ? "Don't have an account?" : "Already have an account?"}
          {/* ✨ CHANGED: Reset suggestion state when toggling view */}
          <button onClick={() => { setIsLoginView(!isLoginView); setError(''); setSuggestGoogleSignIn(false); }} className="font-semibold text-amber-700 hover:underline ml-1">
            {isLoginView ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}