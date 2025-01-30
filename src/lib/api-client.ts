import { User, Invitee, Organization } from "../types";
import axios, { AxiosInstance } from "axios";

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL,
      timeout: 1000,
    });
  }

  setToken(token: string) {
    this.client.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  clearToken() {
    delete this.client.defaults.headers.common["Authorization"];
  }
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<{ token: string; user: any }>> {
    try {
      const response = await this.client.post("/login", { email, password });
      return { data: response.data };
    } catch (error) {
      return {
        error: (error as any).response?.data?.message || "Login failed",
      };
    }
  }
  async mockLogin(
    email: string,
    password: string
  ): Promise<
    ApiResponse<{
      userId: string;
      organizationsList: { id: string; name: string }[];
      token: string;
    }>
  > {
    // Mock response data
    let mockResponse;

    if (email === "admin@nike.com" && password === "password") {
      mockResponse = {
        userId: "userId1",
        organizationsList: [
          { id: "orgId1", name: "Organization One" },
          { id: "orgId2", name: "Organization Two" },
          { id: "orgId3", name: "Organization Three" },
        ],
        token: "mockToken",
      };
    } else {
      mockResponse = {
        userId: "userId2",
        organizationsList: [
          { id: "orgId1", name: "Organization One" },
          { id: "orgId2", name: "Organization Two" },
          { id: "orgId3", name: "Organization Three" },
        ],
        token: "mockToken",
      };
    }

    // Simulate an async operation using a Promise
    return new Promise((resolve, reject) => {
      if (
        (email !== "admin@nike.com" && email !== "member@nike.com") ||
        password !== "password"
      ) {
        reject({ error: "Invalid email or password" });
      }
      setTimeout(() => {
        resolve({ data: mockResponse });
      }, 1000);
    });
  }

  async logout() {
    this.clearToken();
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await this.client.get("/users");
      return { data: response.data };
    } catch (error) {
      return {
        error:
          (error as any).response?.data?.message || "Failed to fetch users",
      };
    }
  }

  async getInvitees(): Promise<ApiResponse<Invitee[]>> {
    try {
      const response = await this.client.get("/invitees");
      return { data: response.data };
    } catch (error) {
      return {
        error:
          (error as any).response?.data?.message || "Failed to fetch invitees",
      };
    }
  }

  async createInvitee(
    email: string,
    role: string
  ): Promise<ApiResponse<Invitee>> {
    try {
      const response = await this.client.post("/invitees", { email, role });
      return { data: response.data };
    } catch (error) {
      return {
        error:
          (error as any).response?.data?.message || "Failed to create invitee",
      };
    }
  }

  async getOrganizations(): Promise<ApiResponse<Organization[]>> {
    try {
      const response = await this.client.get("/organizations");
      return { data: response.data };
    } catch (error) {
      return {
        error:
          (error as any).response?.data?.message ||
          "Failed to fetch organizations",
      };
    }
  }

  async getCurrentOrganizationData(
    userId: string,
    orgId: string
  ): Promise<ApiResponse<User>> {
    try {
      const response = await this.client.get(`/current-user`, {
        params: { userId, orgId },
      });
      return { data: response.data };
    } catch (error) {
      return {
        error:
          (error as any).response?.data?.message ||
          "Failed to fetch current user data",
      };
    }
  }
  async mockGetCurrentOrganizationData(
    userId: string,
    orgId: string
  ): Promise<ApiResponse<User>> {
    // Mock response data

    let mockResponse: {
      id: string;
      email: string;
      role:
        | {
            id: string;
            name: string;
            permissions: { id: string; name: string; description: string }[];
          }
        | {
            id: string;
            name: string;
            permissions: { id: string; name: string; description: string }[];
          }
        | {
            id: string;
            name: string;
            permissions: { id: string; name: string; description: string }[];
          }
        | {
            id: string;
            name: string;
            permissions: { id: string; name: string; description: string }[];
          }
        | {
            id: string;
            name: string;
            permissions: { id: string; name: string; description: string }[];
          }
        | {
            id: string;
            name: string;
            permissions: { id: string; name: string; description: string }[];
          }
        | {
            id: string;
            name: string;
            permissions: { id: string; name: string; description: string }[];
          }
        | {
            id: string;
            name: string;
            permissions: { id: string; name: string; description: string }[];
          };
      createdAt: string;
      organizationId: string;
    };

    switch (orgId) {
      case "orgId1":
        mockResponse = {
          id: userId,
          email: `${userId}@example.com`,
          role: {
            id: userId,
            name: userId === "userId1" ? "Admin" : "User",
            permissions:
              userId === "userId1"
                ? [
                    {
                      id: "perm1",
                      name: "users:view",
                      description: "Can read User data",
                    },
                    {
                      id: "perm2",
                      name: "roles:view",
                      description: "Can read Role data",
                    },
                    {
                      id: "perm3",
                      name: "invite:view",
                      description: "Can read Invite data",
                    },
                    {
                      id: "perm4",
                      name: "invite:create",
                      description: "Can create Invite",
                    },
                  ]
                : [
                    {
                      id: "perm5",
                      name: "users:view",
                      description: "Can read User data",
                    },
                    {
                      id: "perm2",
                      name: "roles:view",
                      description: "Can read Role data",
                    },
                    {
                      id: "perm3",
                      name: "invite:view",
                      description: "Can read Invite data",
                    },
                  ],
          },
          createdAt: new Date().toISOString(),
          organizationId: orgId,
        };
        break;
      case "orgId2":
        mockResponse = {
          id: userId,
          email: `${userId}@example.com`,
          role: {
            id: userId === "userId1" ? "role3" : "role4",
            name: userId === "userId1" ? "Manager" : "Guest",
            permissions:
              userId === "userId1"
                ? [
                    { id: "perm6", name: "View", description: "Can view data" },
                    { id: "perm7", name: "Edit", description: "Can edit data" },
                  ]
                : [
                    {
                      id: "perm8",
                      name: "Comment",
                      description: "Can comment",
                    },
                  ],
          },
          createdAt: new Date().toISOString(),
          organizationId: orgId,
        };
        break;
      case "orgId3":
        mockResponse = {
          id: userId,
          email: `${userId}@example.com`,
          role: {
            id: userId === "userId1" ? "role5" : "role6",
            name: userId === "userId1" ? "Editor" : "Viewer",
            permissions:
              userId === "userId1"
                ? [
                    {
                      id: "perm9",
                      name: "Comment",
                      description: "Can comment",
                    },
                    {
                      id: "perm10",
                      name: "Delete",
                      description: "Can delete data",
                    },
                  ]
                : [
                    {
                      id: "perm11",
                      name: "Share",
                      description: "Can share data",
                    },
                  ],
          },
          createdAt: new Date().toISOString(),
          organizationId: orgId,
        };
        break;
      default:
        mockResponse = {
          id: userId,
          email: `${userId}@example.com`,
          role: {
            id: "role1",
            name: "mockRole",
            permissions: [
              { id: "perm1", name: "Read", description: "Can read data" },
              { id: "perm2", name: "Write", description: "Can write data" },
            ],
          },
          createdAt: new Date().toISOString(),
          organizationId: orgId,
        };
        break;
    }

    // Simulate an async operation using a Promise
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockResponse });
      }, 1000);
    });
  }

  async createOrganization(name: string): Promise<ApiResponse<Organization>> {
    try {
      const response = await this.client.post("/organizations", { name });
      return { data: response.data };
    } catch (error) {
      return {
        error:
          (error as any).response?.data?.message ||
          "Failed to create organization",
      };
    }
  }
}

export const httpClient = new HttpClient("http://localhost:3000");
