export type Role = {
  Id: string;
  Name: string;
  Permissions: Permissions[];
};

export interface Permissions {
  Id: string;
  Name: string;
  Description: string;
}

export interface User {
  Id: string;
  role: Role[];
  email: string;
  organizationId: string;
  CreatedDate: string;
}
export interface GetOrganizationUserData {
  Id: string;
  Name: string;
  Description: string;
  Level: string;
  OrgId: string;
  Permissions: Permissions[];
}

export interface Invitee {
  id: string;
  email: string;
  role: Role;
  status: "pending" | "accepted";
  CreatedDate: string;
}

export interface Organization {
  CreatedDate: string;
  Id: string;
  OrgId: string;
  RoleId: string;
  Uid: string;
  Name: string;
}
