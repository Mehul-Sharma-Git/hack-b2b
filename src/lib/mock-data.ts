import { User, Invitee, Organization } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@nike.com',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'member1@nike.com',
    role: 'member',
    createdAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    email: 'member2@nike.com',
    role: 'member',
    createdAt: '2024-01-03T00:00:00Z',
  },
];

export const mockInvitees: Invitee[] = [
  {
    id: '1',
    email: 'pending1@nike.com',
    role: 'member',
    status: 'pending',
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'accepted1@nike.com',
    role: 'member',
    status: 'accepted',
    createdAt: '2024-02-02T00:00:00Z',
  },
  {
    id: '3',
    email: 'pending2@nike.com',
    role: 'admin',
    status: 'pending',
    createdAt: '2024-02-03T00:00:00Z',
  },
];

export const mockOrganizations: Organization[] = [
  {
    id: '1',
    name: 'Nike Sports',
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    name: 'Nike Fashion',
    createdAt: '2024-01-02T00:00:00Z',
  },
];