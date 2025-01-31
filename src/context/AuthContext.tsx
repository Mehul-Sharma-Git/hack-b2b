import React, { createContext, useContext, useState, useEffect } from "react";
import { Organization, User } from "../types";
import { httpClient } from "../lib/api-client";

interface AuthContextType {
  currentUser: User | null;
  organizations: Organization[];
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  switchOrgContext: (organizationId: string) => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      httpClient.setToken(token);
      // You might want to validate the token here
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
    const organizations = JSON.parse(
      localStorage.getItem("organizations") || "[]"
    );
    const email = localStorage.getItem("email") || "";

    if (currentUser && organizations && email) {
      setCurrentUser(currentUser);
      setOrganizations(organizations);
      setEmail(email);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await httpClient.login(email, password);

    if (response.error) throw new Error(response.error);
    if (response.Data) {
      const { userId, organizationsList, token, email } = response.Data;
      localStorage.setItem("token", token);
      httpClient.setToken(token);
      console.log("wdwsds", organizationsList);
      setOrganizations(organizationsList);
      const getUserData = await httpClient.getCurrentOrganizationData(
        userId,
        organizationsList[0].OrgId
      );
      console.log("wdwsdxs", getUserData);
      if (getUserData.Data) {
        setEmail(email);
        localStorage.setItem("email", email);
        setCurrentUser({
          ...getUserData.Data,
          email: email || localStorage.getItem("email") || "",
          organizationName: organizationsList[0].Name,
        });
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            ...getUserData.Data,
            email: email || localStorage.getItem("email") || "",
            organizationName: organizationsList[0].Name,
          })
        );
        localStorage.setItem(
          "organizations",
          JSON.stringify(organizationsList)
        );
      }
    }
  };

  const switchOrgContext = async (organizationId: string) => {
    if (currentUser) {
      const getUserData = await httpClient.getCurrentOrganizationData(
        currentUser.Id,
        organizationId
      );
      if (getUserData.Data) {
        setCurrentUser({
          ...getUserData.Data,
          email: email || localStorage.getItem("email") || "",
          organizationName:
            organizations.find((org) => org.OrgId === organizationId)?.Name ||
            "",
        });
        localStorage.setItem(
          "currentUser",
          JSON.stringify({
            ...getUserData.Data,
            email: email || localStorage.getItem("email") || "",
            organizationName:
              organizations.find((org) => org.OrgId === organizationId)?.Name ||
              "",
          })
        );
        localStorage.setItem("organizations", JSON.stringify(organizations));
        httpClient.getUsers(organizationId);
        httpClient.getInvitees(organizationId);
        httpClient.getOrganizations(organizationId);
        httpClient.getRoles(organizationId);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    httpClient.clearToken();
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("organizations");
    localStorage.removeItem("email");
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        organizations,
        switchOrgContext,
        login,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
