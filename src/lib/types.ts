export type User = {
  uid: string;
  name: string;
  avatar: string | null;
};

export type BookRequest = {
  id: string;
  title: string;
  author?: string;
  description?: string;
  quantity: number;
  weight: number;
  to_city: string;
  deadline: string;
  user: User;
  userId: string;
};

export type Trip = {
  id: string;
  from_city: string;
  to_city: string;
  date: string;
  capacity: number;
  user: User;
  userId: string;
};
