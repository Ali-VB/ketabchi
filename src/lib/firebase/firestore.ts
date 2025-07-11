
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
import type { BookRequest, Trip, Conversation, Message, User, MatchedRequest, MatchedTrip, Match } from '../types';

const requestsCollection = collection(db, 'requests');
const tripsCollection = collection(db, 'trips');
const conversationsCollection = collection(db, 'conversations');
const usersCollection = collection(db, 'users');
const matchesCollection = collection(db, 'matches');


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
export const addTrip = async (tripData: Omit<Trip, 'id' | 'createdAt' | 'date_end'>) => {
  try {
    const tripDate = new Date(tripData.trip_date);
    const dateEnd = new Date(tripDate.setDate(tripDate.getDate() + 30));

    const docRef = await addDoc(tripsCollection, {
      ...tripData,
      createdAt: Timestamp.now(),
      date_end: dateEnd.toISOString().split('T')[0],
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

export const getRequestById = async (requestId: string): Promise<BookRequest | null> => {
    const docRef = doc(db, 'requests', requestId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...processSerializable(docSnap.data()) } as BookRequest;
    }
    return null;
};

export const getTripById = async (tripId: string): Promise<Trip | null> => {
    const docRef = doc(db, 'trips', tripId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...processSerializable(docSnap.data()) } as Trip;
    }
    return null;
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
      // A trip matches a request if the destination city is the same.
      const cityMatch = myRequest.to_city && trip.to_city && myRequest.to_city.replace(/\s/g, '').toLowerCase() === trip.to_city.replace(/\s/g, '').toLowerCase();

      // And if the traveler's date is within the requester's deadline range.
      // Comparing YYYY-MM-DD strings is safe and avoids timezone issues.
      const dateMatch = trip.trip_date && myRequest.deadline_start && myRequest.deadline_end &&
                        trip.trip_date >= myRequest.deadline_start && trip.trip_date <= myRequest.deadline_end;
      
      const capacityMatch = trip.capacity >= (myRequest.weight || 0.5);
      
      const notOwnItem = trip.userId !== myRequest.userId;

      return cityMatch && dateMatch && capacityMatch && notOwnItem;
    });
    return { ...myRequest, matchingTrips };
  }).filter(r => r.matchingTrips.length > 0);

  // 4. Find matches for user's trips
  const tripMatches: MatchedTrip[] = myTrips.map(myTrip => {
    const matchingRequests = allRequests.filter(request => {
      // A request matches a trip if the destination city is the same.
      const cityMatch = request.to_city && myTrip.to_city && request.to_city.replace(/\s/g, '').toLowerCase() === myTrip.to_city.replace(/\s/g, '').toLowerCase();

      // And if the traveler's date is within the requester's deadline range.
      // Comparing YYYY-MM-DD strings is safe and avoids timezone issues.
      const dateMatch = myTrip.trip_date && request.deadline_start && request.deadline_end &&
                        myTrip.trip_date >= request.deadline_start && myTrip.trip_date <= request.deadline_end;

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

export const getOrCreateConversationAndMatch = async (
    currentUserId: string,
    recipientId: string,
    requestId: string | null,
    tripId: string | null
): Promise<{ conversationId: string; match: Match | null }> => {
    // Find or create conversation
    const conversationQuery = query(
        conversationsCollection,
        where('users', 'array-contains', currentUserId)
    );
    const querySnapshot = await getDocs(conversationQuery);
    let conversation = querySnapshot.docs.find(doc => doc.data().users.includes(recipientId));
    let conversationId: string;

    if (conversation) {
        conversationId = conversation.id;
    } else {
        const newConversation = await addDoc(conversationsCollection, {
            users: [currentUserId, recipientId],
            lastMessage: '',
            lastMessageTimestamp: serverTimestamp(),
        });
        conversationId = newConversation.id;
    }

    // Find existing match
    let match: Match | null = null;
    if (requestId && tripId) {
        const matchQuery = query(
            matchesCollection,
            where('request.id', '==', requestId),
            where('trip.id', '==', tripId),
            limit(1)
        );
        const matchSnapshot = await getDocs(matchQuery);
        if (!matchSnapshot.empty) {
            const doc = matchSnapshot.docs[0];
            match = { id: doc.id, ...processSerializable(doc.data()) } as Match;
        }
    }

    return { conversationId, match };
};


export const getConversations = async (userId: string): Promise<Conversation[]> => {
    const q = query(
        conversationsCollection,
        where('users', 'array-contains', userId)
        // NOTE: orderBy was removed to prevent a complex query that can cause permission errors without a specific index.
        // Sorting is now handled on the client.
    );
    const querySnapshot = await getDocs(q);
    
    const conversationsPromises = querySnapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const otherUserId = data.users.find((uid: string) => uid !== userId);
        
        // Handle cases where there's no other user, though this shouldn't happen in a valid conversation.
        if (!otherUserId) {
            return null;
        }

        const otherUserDoc = await getDoc(doc(db, 'users', otherUserId));
        const otherUser = otherUserDoc.exists() 
            ? {
                uid: otherUserDoc.id,
                ...processSerializable(otherUserDoc.data()),
                }
            : {
                uid: otherUserId,
                displayName: 'Unknown User',
                photoURL: null,
                email: null,
                };
        
        return {
            id: docSnap.id,
            ...processSerializable(data),
            otherUser,
        } as Conversation;
    });

    const conversations = (await Promise.all(conversationsPromises)).filter((c): c is Conversation => c !== null);

    // Sort conversations by the last message timestamp, descending.
    return conversations.sort((a, b) => {
        const timeA = a.lastMessageTimestamp ? new Date(a.lastMessageTimestamp).getTime() : 0;
        const timeB = b.lastMessageTimestamp ? new Date(b.lastMessageTimestamp).getTime() : 0;
        return timeB - timeA;
    });
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
                isBanned: false,
            });
        } catch (error) {
            console.error("Error creating user profile document:", error);
        }
    }
};

// --- Match Management Functions ---

export const createMatch = async (request: BookRequest, trip: Trip): Promise<string> => {
    // Check if a match already exists
    const q = query(
        matchesCollection, 
        where('request.id', '==', request.id),
        where('trip.id', '==', trip.id),
        limit(1)
    );
    const existingMatchSnapshot = await getDocs(q);

    if (!existingMatchSnapshot.empty) {
        // Return existing match ID if it already exists to avoid duplicates
        return existingMatchSnapshot.docs[0].id;
    }


    const deliveryCode = Math.floor(100000 + Math.random() * 900000).toString();
    const matchData = {
        requesterId: request.userId,
        travelerId: trip.userId,
        request,
        trip,
        status: 'pending_payment',
        paymentStatus: 'pending',
        amount: 50.00, // Placeholder amount
        deliveryCode,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
    };
    const docRef = await addDoc(matchesCollection, matchData);
    return docRef.id;
};

export const getMatchesForUser = async (userId: string): Promise<Match[]> => {
    const requesterQuery = query(matchesCollection, where('requesterId', '==', userId));
    const travelerQuery = query(matchesCollection, where('travelerId', '==', userId));

    const [requesterSnapshot, travelerSnapshot] = await Promise.all([
        getDocs(requesterQuery),
        getDocs(travelerQuery),
    ]);

    const matches: Match[] = [];
    const seenIds = new Set<string>();

    const processSnapshot = (snapshot: any) => {
        snapshot.docs.forEach((doc: any) => {
            if (!seenIds.has(doc.id)) {
                const data = doc.data();
                matches.push({
                    id: doc.id,
                    ...processSerializable(data),
                    request: processSerializable(data.request),
                    trip: processSerializable(data.trip),
                } as Match);
                seenIds.add(doc.id);
            }
        });
    };

    processSnapshot(requesterSnapshot);
    processSnapshot(travelerSnapshot);

    return matches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

export const verifyDeliveryCode = async (matchId: string, code: string, currentUserId: string): Promise<boolean> => {
    const matchRef = doc(db, 'matches', matchId);
    const matchDoc = await getDoc(matchRef);

    if (!matchDoc.exists() || matchDoc.data().travelerId !== currentUserId) {
        console.error("Match not found or user is not the traveler.");
        return false;
    }

    if (matchDoc.data().deliveryCode === code) {
        await updateDoc(matchRef, {
            status: 'completed',
            paymentStatus: 'released',
            updatedAt: serverTimestamp(),
        });
        return true;
    }
    
    return false;
};


export const confirmDeliveryManually = async (matchId: string, currentUserId: string): Promise<void> => {
    const matchRef = doc(db, 'matches', matchId);
    const matchDoc = await getDoc(matchRef);

    if (!matchDoc.exists() || matchDoc.data().requesterId !== currentUserId) {
        throw new Error("Match not found or user is not the requester.");
    }
    
    await updateDoc(matchRef, {
        status: 'completed',
        paymentStatus: 'released',
        updatedAt: serverTimestamp(),
    });
};

export const disputeMatch = async (matchId: string, currentUserId: string): Promise<void> => {
    const matchRef = doc(db, 'matches', matchId);
    const matchDoc = await getDoc(matchRef);

     if (!matchDoc.exists() || matchDoc.data().requesterId !== currentUserId) {
        throw new Error("Match not found or user is not the requester of this match.");
    }

    await updateDoc(matchRef, {
        status: 'disputed',
        paymentStatus: 'disputed',
        updatedAt: serverTimestamp(),
    });
};

// --- Admin Functions ---

export const getAllUsers = async (): Promise<User[]> => {
    const querySnapshot = await getDocs(query(usersCollection, orderBy('createdAt', 'desc')));
    return querySnapshot.docs.map(doc => ({
      uid: doc.id,
      ...processSerializable(doc.data()),
    })) as User[];
};

export const banUser = async (userId: string): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { isBanned: true });
}

export const unbanUser = async (userId: string): Promise<void> => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { isBanned: false });
}

export const getPlatformStats = async () => {
  const matchesQuery = query(matchesCollection);
  const disputedMatchesQuery = query(matchesCollection, where('status', '==', 'disputed'));
  const completedMatchesQuery = query(matchesCollection, where('status', '==', 'completed'));

  const [
    matchesSnapshot,
    disputedMatchesSnapshot,
    completedMatchesSnapshot,
  ] = await Promise.all([
    getDocs(matchesQuery),
    getDocs(disputedMatchesQuery),
    getDocs(completedMatchesQuery),
  ]);

  return {
    totalMatches: matchesSnapshot.size,
    disputedMatches: disputedMatchesSnapshot.size,
    completedMatches: completedMatchesSnapshot.size,
  };
};

export const getStatsForDateRange = async (startDate: string, endDate: string) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  const requestsQuery = query(
    requestsCollection,
    where('createdAt', '>=', Timestamp.fromDate(start)),
    where('createdAt', '<=', Timestamp.fromDate(end))
  );

  const tripsQuery = query(
    tripsCollection,
    where('createdAt', '>=', Timestamp.fromDate(start)),
    where('createdAt', '<=', Timestamp.fromDate(end))
  );

  const completedMatchesQuery = query(
    matchesCollection,
    where('status', '==', 'completed'),
    where('updatedAt', '>=', Timestamp.fromDate(start)),
    where('updatedAt', '<=', Timestamp.fromDate(end))
  );

  const [
    requestsSnapshot,
    tripsSnapshot,
    completedMatchesSnapshot,
  ] = await Promise.all([
    getDocs(requestsQuery),
    getDocs(tripsQuery),
    getDocs(completedMatchesQuery),
  ]);

  return {
    newRequests: requestsSnapshot.size,
    newTrips: tripsSnapshot.size,
    completedMatches: completedMatchesSnapshot.size,
  };
};

export const getAllMatches = async (): Promise<Match[]> => {
    const q = query(matchesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...processSerializable(data),
            request: processSerializable(data.request),
            trip: processSerializable(data.trip),
        } as Match
    });
};

export const getDisputedMatches = async (): Promise<Match[]> => {
    const q = query(matchesCollection, where('status', '==', 'disputed'), orderBy('updatedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...processSerializable(data),
            request: processSerializable(data.request),
            trip: processSerializable(data.trip),
        } as Match
    });
};

export const resolveDispute = async (matchId: string, resolution: 'release' | 'refund'): Promise<void> => {
    const matchRef = doc(db, 'matches', matchId);
    
    // In a real app, this would trigger a Cloud Function to handle payment logic with Stripe.
    console.log(`Resolving dispute for ${matchId} with resolution: ${resolution}`);

    let updateData = {};
    if (resolution === 'release') {
        updateData = {
            status: 'completed',
            paymentStatus: 'released',
            updatedAt: serverTimestamp(),
        };
    } else if (resolution === 'refund') {
        updateData = {
            status: 'cancelled',
            paymentStatus: 'refunded',
            updatedAt: serverTimestamp(),
        };
    } else {
        throw new Error("Invalid resolution type.");
    }

    await updateDoc(matchRef, updateData);
};


    