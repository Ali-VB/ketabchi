export type User = {
  uid: string;
  displayName: string;
  email: string | null;
  photoURL: string | null;
  createdAt?: string;
  isBanned?: boolean;
};

export type Book = {
  title: string;
  author: string;
  quantity: number;
};

export type BookRequest = {
  id: string;
  // For backwards compatibility with old data
  title?: string;
  author?: string;
  quantity?: number;
  // New data structure
  books?: Book[];
  description?: string;
  weight: number;
  from_city: string;
  to_city: string;
  deadline_start: string;
  deadline_end: string;
  user: User;
  userId: string;
  createdAt: string;
};

export type Trip = {
  id: string;
  from_city: string;
  to_city: string;
  trip_date: string;
  date_end?: string; // For sorting on homepage
  capacity: number;
  user: User;
  userId: string;
  createdAt: string;
};

export type Conversation = {
  id: string;
  users: string[];
  lastMessage: string;
  lastMessageTimestamp: string;
  otherUser: User;
};

export type Message = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
};

export type MatchedRequest = BookRequest & {
  matchingTrips: Trip[];
};

export type MatchedTrip = Trip & {
  matchingRequests: BookRequest[];
};

export interface Match {
  id: string;
  requesterId: string;
  travelerId: string;
  request: BookRequest;
  trip: Trip;
  status: 'pending_payment' | 'active' | 'completed' | 'disputed' | 'cancelled';
  paymentStatus: 'pending' | 'held' | 'released' | 'refunded' | 'disputed';
  deliveryCode: string;
  createdAt: string;
  updatedAt: string;
  amount?: number; // For future payment integration
  stripeCheckoutId?: string;
}