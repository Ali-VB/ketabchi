export type User = {
  name: string;
  avatar: string;
};

export type BookRequest = {
  id: string;
  title: string;
  to_city: string;
  deadline: string;
  user: User;
};

export type Trip = {
  id: string;
  from_city: string;
  to_city: string;
  date: string;
  capacity: number;
  user: User;
};
