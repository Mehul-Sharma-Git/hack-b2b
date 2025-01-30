export type Role = {
  id: string;
  name: string;
  permissions: Permissions[];
};

export interface Permissions {
  id: string;
  name: string;
  description: string;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  organizationId: string;
  createdAt: string;
}

export interface Invitee {
  id: string;
  email: string;
  role: Role;
  status: "pending" | "accepted";
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
}
