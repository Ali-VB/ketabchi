export type User = {
  uid: string;
  name: string;
  avatar: string | null;
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
