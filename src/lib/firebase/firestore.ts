import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import type { BookRequest, Trip } from '../types';

const requestsCollection = collection(db, 'requests');
const tripsCollection = collection(db, 'trips');

// Add a new book request
export const addRequest = async (requestData: Omit<BookRequest, 'id'>) => {
  try {
    const docRef = await addDoc(requestsCollection, {
      ...requestData,
      createdAt: Timestamp.now(),
    });
    return docRef;
  } catch (e) {
    console.error('Error adding request: ', e);
    throw new Error('Failed to add request');
  }
};

// Add a new trip
export const addTrip = async (tripData: Omit<Trip, 'id'>) => {
  try {
    const docRef = await addDoc(tripsCollection, {
      ...tripData,
      createdAt: Timestamp.now(),
    });
    return docRef;
  } catch (e) {
    console.error('Error adding trip: ', e);
    throw new Error('Failed to add trip');
  }
};

// Fetch all book requests
export const getAllRequests = async (docLimit = 20): Promise<BookRequest[]> => {
  const q = query(requestsCollection, orderBy('createdAt', 'desc'), limit(docLimit));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<BookRequest, 'id'>),
  }));
};

// Fetch all trips
export const getAllTrips = async (docLimit = 20): Promise<Trip[]> => {
  const q = query(tripsCollection, orderBy('createdAt', 'desc'), limit(docLimit));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<Trip, 'id'>),
  }));
};

// Fetch requests for a specific user
export const getUserRequests = async (userId: string): Promise<BookRequest[]> => {
  const q = query(requestsCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<BookRequest, 'id'>),
  }));
};

// Fetch trips for a specific user
export const getUserTrips = async (userId: string): Promise<Trip[]> => {
  const q = query(tripsCollection, where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...(doc.data() as Omit<Trip, 'id'>),
  }));
};
