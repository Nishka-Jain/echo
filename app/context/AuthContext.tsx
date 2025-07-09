"use client";

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { getAuth, onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut, updateProfile } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { app, db } from '@/lib/firebase';
import type { UserProfile } from '@/lib/types';
import AuthModal from '@/app/components/AuthModal';

const auth = getAuth(app);
const storage = getStorage(app);

// Define the shape of your context data
interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  openAuthModal: () => void;
  // ✨ FIX: Update the type for the 'newPhoto' property
  updateUserProfile: (updates: {
    displayName?: string;
    newPhoto?: File | null; 
    photoPosition?: string;
  }) => Promise<void>;
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

  const signInWithGoogle = async () => { /* ... (this function is correct) ... */ };
  const logout = async () => { /* ... (this function is correct) ... */ };
  
  // ✨ FIX: Update the type for the 'updates' parameter here as well
  const updateUserProfile = async (updates: { displayName?: string; newPhoto?: File | null; photoPosition?: string }) => {
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("No user is signed in.");

    let newPhotoURL = currentUser.photoURL;

    if (updates.newPhoto) {
      const filePath = `profile-photos/${currentUser.uid}/${updates.newPhoto.name}`;
      const storageRef = ref(storage, filePath);
      await uploadBytes(storageRef, updates.newPhoto);
      newPhotoURL = await getDownloadURL(storageRef);
    }
    
    const authUpdateData: { displayName?: string; photoURL?: string } = {};
    if (updates.displayName) authUpdateData.displayName = updates.displayName;
    if (newPhotoURL) authUpdateData.photoURL = newPhotoURL;

    const firestoreUpdateData: any = {};
    if (updates.displayName) firestoreUpdateData.displayName = updates.displayName;
    if (newPhotoURL) firestoreUpdateData.photoURL = newPhotoURL;
    if (updates.photoPosition) firestoreUpdateData.photoPosition = updates.photoPosition;

    await updateProfile(currentUser, authUpdateData);
    const userDocRef = doc(db, "users", currentUser.uid);
    await setDoc(userDocRef, firestoreUpdateData, { merge: true });

    setUser(prevUserProfile => {
        if (!prevUserProfile) return null;
        return { ...prevUserProfile, ...authUpdateData, ...firestoreUpdateData };
    });
  };

  const value = { user, isLoading, signInWithGoogle, logout, openAuthModal, updateUserProfile };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {isAuthModalOpen && <AuthModal onClose={closeAuthModal} />}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
