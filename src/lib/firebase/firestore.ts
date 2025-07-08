import {
  addDoc,
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  Timestamp,
  DocumentData,
  limit,
  onSnapshot,
  updateDoc,
  serverTimestamp,
  writeBatch,
  setDoc,
} from 'firebase/firestore';
import { db } from './config';
import type { BookRequest, Trip, Conversation, Message, User, MatchedRequest, MatchedTrip } from '../types';

const requestsCollection = collection(db, 'requests');
const tripsCollection = collection(db, 'trips');
const conversationsCollection = collection(db, 'conversations');
const usersCollection = collection(db, 'users');

// Helper to convert non-serializable Firestore Timestamps to strings
const processSerializable = (data: DocumentData) => {
  if (!data) return data;
  const processedData: DocumentData = {};
  for (const key in data) {
    if (data[key] instanceof Timestamp) {
      processedData[key] = data[key].toDate().toISOString();
    } else if (data[key] && typeof data[key] === 'object' && !Array.isArray(data[key])) {
        // do not process nested objects for now
        processedData[key] = data[key];
    }
     else {
      processedData[key] = data[key];
    }
  }
  return processedData;
};

// Add a new book request
export const addRequest = async (
  requestData: Omit<BookRequest, 'id' | 'createdAt'>
) => {
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
export const addTrip = async (tripData: Omit<Trip, 'id' | 'createdAt'>) => {
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
export const getAllRequests = async (
  docLimit = 10
): Promise<BookRequest[]> => {
  const q = query(
    requestsCollection,
    orderBy('createdAt', 'desc'),
    limit(docLimit)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...processSerializable(doc.data()),
  })) as BookRequest[];
};

// Fetch all trips
export const getAllTrips = async (docLimit = 10): Promise<Trip[]> => {
  const q = query(
    tripsCollection,
    orderBy('createdAt', 'desc'),
    limit(docLimit)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...processSerializable(doc.data()),
  })) as Trip[];
};

// Fetch requests for a specific user
export const getUserRequests = async (
  userId: string
): Promise<BookRequest[]> => {
  const q = query(
    requestsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...processSerializable(doc.data()),
  })) as BookRequest[];
};

// Fetch trips for a specific user
export const getUserTrips = async (userId: string): Promise<Trip[]> => {
  const q = query(
    tripsCollection,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...processSerializable(doc.data()),
  })) as Trip[];
};

// --- Matching System ---

export const findMatches = async (userId: string): Promise<{
  requestMatches: MatchedRequest[];
  tripMatches: MatchedTrip[];
}> => {
  if (!userId) {
    return { requestMatches: [], tripMatches: [] };
  }

  // 1. Get all requests and trips
  const allRequestsSnapshot = await getDocs(query(requestsCollection, orderBy('createdAt', 'desc')));
  const allRequests = allRequestsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...processSerializable(doc.data()),
  })) as BookRequest[];

  const allTripsSnapshot = await getDocs(query(tripsCollection, orderBy('createdAt', 'desc')));
  const allTrips = allTripsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...processSerializable(doc.data()),
  })) as Trip[];

  // 2. Filter for user's own items
  const myRequests = allRequests.filter(r => r.userId === userId);
  const myTrips = allTrips.filter(t => t.userId === userId);

  // 3. Find matches for user's requests
  const requestMatches: MatchedRequest[] = myRequests.map(myRequest => {
    const matchingTrips = allTrips.filter(trip => {
      // A trip (Abroad -> Iran) matches a request if the origin and destination cities are the same.
      const cityMatch = myRequest.from_city && trip.from_city && myRequest.from_city.trim().toLowerCase() === trip.from_city.trim().toLowerCase()
                        && myRequest.to_city && trip.to_city && myRequest.to_city.trim().toLowerCase() === trip.to_city.trim().toLowerCase();

      // And if the traveler's date is within the requester's deadline range.
      const tripDate = new Date(trip.trip_date);
      const requestStartDate = new Date(myRequest.deadline_start);
      const requestEndDate = new Date(myRequest.deadline_end);
      const dateMatch = trip.trip_date && myRequest.deadline_start && myRequest.deadline_end &&
                        (tripDate >= requestStartDate && tripDate <= requestEndDate);
      
      const capacityMatch = trip.capacity >= (myRequest.weight || 0.5);
      
      const notOwnItem = trip.userId !== myRequest.userId;

      return cityMatch && dateMatch && capacityMatch && notOwnItem;
    });
    return { ...myRequest, matchingTrips };
  }).filter(r => r.matchingTrips.length > 0);

  // 4. Find matches for user's trips
  const tripMatches: MatchedTrip[] = myTrips.map(myTrip => {
    const matchingRequests = allRequests.filter(request => {
      // A trip (Abroad -> Iran) matches a request if the origin and destination cities are the same.
      const cityMatch = request.from_city && myTrip.from_city && request.from_city.trim().toLowerCase() === myTrip.from_city.trim().toLowerCase()
                      && request.to_city && myTrip.to_city && request.to_city.trim().toLowerCase() === myTrip.to_city.trim().toLowerCase();

      // And if the traveler's date is within the requester's deadline range.
      const tripDate = new Date(myTrip.trip_date);
      const requestStartDate = new Date(request.deadline_start);
      const requestEndDate = new Date(request.deadline_end);
      const dateMatch = myTrip.trip_date && request.deadline_start && request.deadline_end &&
                        (tripDate >= requestStartDate && tripDate <= requestEndDate);

      const capacityMatch = myTrip.capacity >= (request.weight || 0.5);

      const notOwnItem = request.userId !== myTrip.userId;

      return cityMatch && dateMatch && capacityMatch && notOwnItem;
    });
    return { ...myTrip, matchingRequests };
  }).filter(t => t.matchingRequests.length > 0);

  return { requestMatches, tripMatches };
};


// --- Messaging Functions ---

export const getUserProfile = async (userId: string) => {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? userDoc.data() : null;
}

export const getOrCreateConversation = async (currentUserId: string, recipientId: string): Promise<string> => {
    const conversationQuery = query(
        conversationsCollection,
        where('users', 'array-contains', currentUserId)
    );
    const querySnapshot = await getDocs(conversationQuery);
    const conversation = querySnapshot.docs.find(doc => doc.data().users.includes(recipientId));

    if (conversation) {
        return conversation.id;
    } else {
        const newConversation = await addDoc(conversationsCollection, {
            users: [currentUserId, recipientId],
            lastMessage: '',
            lastMessageTimestamp: serverTimestamp(),
        });
        return newConversation.id;
    }
};

export const getConversations = async (userId: string): Promise<Conversation[]> => {
    const q = query(
        conversationsCollection,
        where('users', 'array-contains', userId),
        orderBy('lastMessageTimestamp', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const conversations = await Promise.all(
        querySnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            const otherUserId = data.users.find((uid: string) => uid !== userId);
            const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
            const otherUser = otherUserDoc.exists() 
                ? {
                    uid: otherUserDoc.id,
                    name: otherUserDoc.data().displayName,
                    avatar: otherUserDoc.data().photoURL
                  }
                : {
                    uid: otherUserId,
                    name: 'کاربر ناشناس',
                    avatar: null
                  };
            
            return {
                id: docSnap.id,
                ...processSerializable(data),
                otherUser,
            } as Conversation;
        })
    );
    return conversations;
};

export const getMessages = (conversationId: string, callback: (messages: Message[]) => void): (() => void) => {
    const messagesCollection = collection(db, 'conversations', conversationId, 'messages');
    const q = query(messagesCollection, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...processSerializable(doc.data()),
            timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString(),
        })) as Message[];
        callback(messages);
    });

    return unsubscribe;
};

export const sendMessage = async (conversationId: string, message: { text: string, senderId: string }) => {
    const batch = writeBatch(db);

    const messagesCollection = collection(db, 'conversations', conversationId, 'messages');
    const newMessageRef = doc(messagesCollection);
    batch.set(newMessageRef, { ...message, timestamp: serverTimestamp() });
    
    const conversationRef = doc(db, 'conversations', conversationId);
    batch.update(conversationRef, {
        lastMessage: message.text,
        lastMessageTimestamp: serverTimestamp(),
    });

    await batch.commit();
};

export const createUserProfileDocument = async (user: {uid: string, email: string | null, displayName: string | null, photoURL: string | null}) => {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
        const { uid, email, displayName, photoURL } = user;
        try {
            await setDoc(userDocRef, {
                uid,
                email,
                displayName,
                photoURL,
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error creating user profile document:", error);
        }
    }
};
