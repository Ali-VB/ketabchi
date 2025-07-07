import { signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from './config';

export const signOut = () => {
  return firebaseSignOut(auth);
};
