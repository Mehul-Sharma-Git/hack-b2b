import { User, Invitee, Organization, Role } from "../types";
import axios, { AxiosInstance } from "axios";

export interface ApiResponse<T> {
  Data?: T;
  error?: string;
}
export interface NewResponse<T> {
  Data?: T;
  error?: string;
}

class HttpClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    console.log(baseURL);
    this.client = axios.create({
      baseURL: `${baseURL}/auth`,
      timeout: 5000,
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
  ): Promise<
    ApiResponse<{
      userId: string;
      organizationsList: Organization[];
      token: string;
      email: string;
    }>
  > {
    try {
      const response = await this.client.post("/login", {
        email,
        password,
      });
      return { Data: { ...response.data, email: email } };
    } catch (error) {
      return {
        error: (error as any).response?.data?.message || "Login failed",
      };
    }
  }
  // async mockLogin(
  //   email: string,
  //   password: string
  // ): Promise<
  //   ApiResponse<{
  //     userId: string;
  //     organizationsList: { id: string; name: string }[];
  //     token: string;
  //   }>
  // > {
  //   // Mock response data
  //   let mockResponse;

  //   if (email === "admin@nike.com" && password === "password") {
  //     mockResponse = {
  //       userId: "userId1",
  //       organizationsList: [
  //         { id: "orgId1", name: "Organization One" },
  //         { id: "orgId2", name: "Organization Two" },
  //         { id: "orgId3", name: "Organization Three" },
  //       ],
  //       token: "mockToken",
  //     };
  //   } else {
  //     mockResponse = {
  //       userId: "userId2",
  //       organizationsList: [
  //         { id: "orgId1", name: "Organization One" },
  //         { id: "orgId2", name: "Organization Two" },
  //         { id: "orgId3", name: "Organization Three" },
  //       ],
  //       token: "mockToken",
  //     };
  //   }

  //   // Simulate an async operation using a Promise
  //   return new Promise((resolve, reject) => {
  //     if (
  //       (email !== "admin@nike.com" && email !== "member@nike.com") ||
  //       password !== "password"
  //     ) {
  //       reject({ error: "Invalid email or password" });
  //     }
  //     setTimeout(() => {
  //       resolve({ Data: mockResponse });
  //     }, 1000);
  //   });
  // }

  async logout() {
    this.clearToken();
  }

  async getUsers(id: string): Promise<ApiResponse<NewResponse<any[]>>> {
    try {
      const response = await this.client.get(`/org/${id}/users`);
      return { Data: response.data };
    } catch (error) {
      return {
        error:
          (error as any).response?.data?.message || "Failed to fetch users",
      };
    }
  }

  async getInvitees(id: string): Promise<ApiResponse<NewResponse<Invitee[]>>> {
    try {
      const response = await this.client.get(`/org/${id}/invitations`);
      return { Data: response.data };
    } catch (error) {
      return {
        error:
          (error as any).response?.data?.message || "Failed to fetch invitees",
      };
    }
  }
  async getRoles(id: string): Promise<ApiResponse<NewResponse<Role[]>>> {
    try {
      const response = await this.client.get(`/org/${id}/roles`);
      return { Data: response.data };
    } catch (error) {
      return {
        error:
          (error as any).response?.data?.message || "Failed to fetch roles",
      };
    }
  }

  async createInvitee(
    id: string,
    email: string,
    role: string,
    userId: string
  ): Promise<ApiResponse<Invitee>> {
    try {
      const response = await this.client.post(`/org/${id}/invitations`, {
        Email: email,
        RoleIds: [role],
        InviterUid: userId,
      });
      return { Data: response.data };
    } catch (error) {
      return {
        error:
          (error as any).response?.data?.message || "Failed to create invitee",
      };
    }
  }

  async getOrganizations(
    id: string
  ): Promise<ApiResponse<NewResponse<Organization[]>>> {
    try {
      const response = await this.client.get(`/orgs?orgId=${id}`);
      return { Data: response.data };
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
      const response = await this.client.get(
        `/org/${orgId}/user/${userId}/roles`,
        {}
      );
      console.log("response", response);
      let data = {
        Id: userId,
        email: response.data.Data.Email,
        role: response.data.Data,
        organizationId: orgId,
        organizationName: "",
        CreatedDate: response.data.Data[0].CreatedDate,
      };
      return { Data: data };
    } catch (error) {
      return {
        error:
          (error as any).response?.data?.message ||
          "Failed to fetch current user data",
      };
    }
  }

  async testApi(): Promise<ApiResponse<any>> {
    try {
      const response = await this.client.get("/test");
      return { Data: response.data };
    } catch (error) {
      return {
        error: (error as any).response?.data?.message || "Failed to fetch data",
      };
    }
  }

  async createOrganization(
    name: string,
    oldName: string,
    currentOrgId: string,
    uid: string
  ): Promise<ApiResponse<Organization>> {
    try {
      const response = await this.client.post(`/org/${currentOrgId}/create`, {
        name: name,
        oldName: oldName,
        uid: uid,
      });
      return { Data: response.data };
    } catch (error) {
      return {
        error:
          (error as any).response?.data?.message ||
          "Failed to create organization",
      };
    }
  }
}

console.log(import.meta.env.VITE_API_BASE_URL);

export const httpClient = new HttpClient(
  import.meta.env.VITE_API_BASE_URL as string
);
