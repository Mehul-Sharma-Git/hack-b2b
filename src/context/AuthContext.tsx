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
  const [organizations, setOrganizations] = useState<
    { id: string; name: string }[]
  >([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      httpClient.setToken(token);
      // You might want to validate the token here
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const response = await httpClient.mockLogin(email, password);
    console.log(response);
    if (response.error) throw new Error(response.error);
    if (response.data) {
      const { userId, organizationsList, token } = response.data;
      localStorage.setItem("token", token);
      httpClient.setToken(token);
      console.log(response);
      setOrganizations(organizationsList);
      const getUserData = await httpClient.mockGetCurrentOrganizationData(
        userId,
        organizationsList[0].id
      );

      if (getUserData.data) {
        setCurrentUser(getUserData.data);
      }
    }
  };

  const switchOrgContext = async (organizationId: string) => {
    if (currentUser) {
      const getUserData = await httpClient.mockGetCurrentOrganizationData(
        currentUser.id,
        organizationId
      );
      if (getUserData.data) {
        setCurrentUser(getUserData.data);
      }
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    httpClient.clearToken();
    setCurrentUser(null);
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
