export type Role = 'admin' | 'member';

export interface User {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Invitee {
  id: string;
  email: string;
  role: Role;
  status: 'pending' | 'accepted';
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}