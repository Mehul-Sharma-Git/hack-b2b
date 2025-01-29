import { User, Invitee, Organization } from '../types';
import { mockUsers, mockInvitees, mockOrganizations } from './mock-data';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  // Auth
  async login(email: string, password: string): Promise<ApiResponse<{ token: string; user: User }>> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check for admin@nike.com/admin or member@nike.com/member
    if (
      (email === 'admin@nike.com' && password === 'admin') ||
      (email === 'member@nike.com' && password === 'member')
    ) {
      const role = email.includes('admin') ? 'admin' : 'member';
      const user: User = {
        id: '1',
        email,
        role,
        createdAt: new Date().toISOString(),
      };
      return {
        data: {
          token: 'mock-token-' + role,
          user,
        },
      };
    }

    return { error: 'Invalid credentials' };
  }

  async logout() {
    this.clearToken();
  }

  // Users
  async getUsers(): Promise<ApiResponse<User[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: mockUsers };
  }

  // Invitees
  async getInvitees(): Promise<ApiResponse<Invitee[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: mockInvitees };
  }

  async createInvitee(email: string, role: string): Promise<ApiResponse<Invitee>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newInvitee: Invitee = {
      id: Date.now().toString(),
      email,
      role: role as 'admin' | 'member',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    return { data: newInvitee };
  }

  // Organizations
  async getOrganizations(): Promise<ApiResponse<Organization[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: mockOrganizations };
  }

  async createOrganization(name: string): Promise<ApiResponse<Organization>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newOrg: Organization = {
      id: Date.now().toString(),
      name,
      createdAt: new Date().toISOString(),
    };
    return { data: newOrg };
  }
}

export const api = new ApiClient();