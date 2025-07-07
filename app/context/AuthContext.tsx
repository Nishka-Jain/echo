"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { app, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import AuthModal from '@/app/components/AuthModal';

const auth = getAuth(app);
const storage = getStorage(app);

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  openAuthModal: () => void;
  updateUserProfilePhoto: (photoFile: File, position: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        const customData = userDocSnap.exists() ? userDocSnap.data() : {};
        setUser({ ...firebaseUser, ...customData }); 
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => setIsAuthModalOpen(false);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const userDocRef = doc(db, "users", result.user.uid);
      await setDoc(userDocRef, { 
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
      }, { merge: true });
      closeAuthModal();
    } catch (error) {
      console.error("Error signing in with Google", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };
  
  const updateUserProfilePhoto = async (photoFile: File, position: string) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No user is signed in.");

    const filePath = `profile-photos/${currentUser.uid}/${photoFile.name}`;
    const storageRef = ref(storage, filePath);
    await uploadBytes(storageRef, photoFile);
    const downloadURL = await getDownloadURL(storageRef);

    await updateProfile(currentUser, { photoURL: downloadURL });
    
    const userDocRef = doc(db, "users", currentUser.uid);
    await setDoc(userDocRef, { 
        photoURL: downloadURL,
        photoPosition: position
    }, { merge: true });

    setUser(prevUserProfile => {
        if (!prevUserProfile) return null;
        return {
            ...prevUserProfile,
            photoURL: downloadURL,
            photoPosition: position
        };
    });
  };

  const value = { user, isLoading, signInWithGoogle, logout, openAuthModal, updateUserProfilePhoto };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {isAuthModalOpen && <AuthModal onClose={closeAuthModal} />}
    </AuthContext.Provider>
  );
};

// ✨ FIX: Make sure the 'export' keyword is here
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};