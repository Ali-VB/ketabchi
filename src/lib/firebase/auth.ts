'use client';
import { signOut as firebaseSignOut, updateProfile } from 'firebase/auth';
import { auth } from './config';

export const signOut = () => {
  return firebaseSignOut(auth);
};

export const updateUserProfile = async (
  displayName: string,
  photoURL: string
) => {
  if (!auth.currentUser) {
    throw new Error('No user is currently signed in.');
  }

  try {
    await updateProfile(auth.currentUser, {
      displayName,
      photoURL,
    });
  } catch (error) {
    console.error('Error updating profile: ', error);
    throw new Error('Failed to update profile.');
  }
};
