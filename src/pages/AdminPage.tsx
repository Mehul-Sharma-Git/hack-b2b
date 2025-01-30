import React, { useEffect, useState } from "react";
import { Users, UserPlus, Shield, Building } from "lucide-react";
import { httpClient } from "../lib/api-client";
import { User, Invitee, Organization } from "../types";
import { NikeLogo } from "../components/NikeLogo";
import { useAuth } from "../context/AuthContext";

type Tab = "users" | "roles" | "invitees" | "organizations";

export function AdminPage() {
  const { currentUser, logout, organizations, switchOrgContext } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [users, setUsers] = useState<User[]>([]);
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>(
    []
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  // const [newInviteeEmail, setNewInviteeEmail] = useState("");
  // const [newInviteeRole, setNewInviteeRole] = useState<"admin" | "member">(
  //   "member"
  // );
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, inviteesRes, orgsRes] = await Promise.all([
        httpClient.getUsers(currentUser?.organizationId || ""),
        httpClient.getInvitees(currentUser?.organizationId || ""),
        httpClient.getOrganizations(),
        httpClient.getRoles(currentUser?.organizationId || ""),
      ]);
      console.log(orgsRes);
      if (usersRes.Data) setUsers(usersRes.Data.Data ?? []);
      if (inviteesRes.Data) setInvitees(inviteesRes.Data.Data ?? []);
      if (orgsRes.Data && orgsRes.Data.Data)
        setUserOrganizations(orgsRes.Data.Data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  };

  const handleCreateOrg = async () => {
    const name = prompt("Enter organization name:");
    if (name) {
      const response = await httpClient.createOrganization(name);
      if (response.Data) {
        if (response.Data) {
          setUserOrganizations((prev) =>
            response.Data ? [response.Data, ...prev] : prev
          );
        }
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      }
    }
  };

  // const handleCreateInvitee = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (newInviteeEmail) {
  //     const response = await httpClient.createInvitee(
  //       newInviteeEmail,
  //       newInviteeRole
  //     );
  //     if (response.data) {
  //       if (response.data) {
  //         setInvitees((prev) =>
  //           response.data ? [response.data, ...prev] : prev
  //         );
  //       }
  //       setNewInviteeEmail("");
  //       setNewInviteeRole("member");
  //       setShowSuccessMessage(true);
  //       setTimeout(() => setShowSuccessMessage(false), 3000);
  //     }
  //   }
  // };

  const PermissionRestrictContainer = ({
    children,
    permissions,
  }: {
    children: React.ReactNode;
    permissions: string[];
  }) => {
    const userPermissions = Array.isArray(permissions)
      ? permissions
      : [permissions];
    const hasPermission = userPermissions.some((perm) =>
      currentUser?.role.permissions.find((p) => p.name === perm)
    );

    if (!hasPermission) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="bg-red-100 text-red-800 px-6 py-4 rounded-lg shadow-lg">
            You do not have permission to view this content.
          </div>
        </div>
      );
    }
    return <>{children}</>;
  };

  const renderTabContent = () => {
    const content = {
      users: (
        <PermissionRestrictContainer permissions={["users:view"]}>
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Users List</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user, index) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                      style={{
                        animation: `slideIn 0.3s ease-out ${
                          index * 0.05
                        }s both`,
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full transition-all duration-150 ${
                            user.role.name === "admin"
                              ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          {user.role.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </PermissionRestrictContainer>
      ),
      roles: (
        <PermissionRestrictContainer permissions={["roles:view"]}>
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Available Roles</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Permissions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr className="hover:bg-gray-50 transition-colors duration-150 ease-in-out animate-slide-in">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors duration-150">
                        Admin
                      </span>
                    </td>
                    <td className="px-6 py-4">Full system access</td>
                    <td className="px-6 py-4">Create, Read, Update, Delete</td>
                  </tr>
                  <tr
                    className="hover:bg-gray-50 transition-colors duration-150 ease-in-out animate-slide-in"
                    style={{ animationDelay: "0.1s" }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 hover:bg-green-200 transition-colors duration-150">
                        Member
                      </span>
                    </td>
                    <td className="px-6 py-4">Limited access</td>
                    <td className="px-6 py-4">Read only</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </PermissionRestrictContainer>
      ),
      invitees: (
        <PermissionRestrictContainer
          permissions={["invite:view", "invite:create"]}
        >
          <div className="animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Invitees Management</h2>
            {/* {currentUser?.role.name === "admin" && (
              // <form
              //   onSubmit={handleCreateInvitee}
              //   className="mb-6 flex gap-4 animate-slide-up"
              // >
              //   <input
              //     type="email"
              //     value={newInviteeEmail}
              //     onChange={(e) => setNewInviteeEmail(e.target.value)}
              //     placeholder="Email address"
              //     className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-150"
              //     required
              //   />
              //   <select
              //     value={newInviteeRole}
              //     onChange={(e) =>
              //       setNewInviteeRole(e.target.value as "admin" | "member")
              //     }
              //     className="rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-black focus:border-transparent transition-all duration-150"
              //   >
              //     <option value="member">Member</option>
              //     <option value="admin">Admin</option>
              //   </select>

              //   <button
              //     disabled={
              //       currentUser?.role.permissions.find(
              //         (p) => p.name === "invite:create"
              //       )
              //         ? false
              //         : true
              //     }
              //     type="submit"
              //     className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-all duration-150 transform hover:scale-105"
              //   >
              //     Invite User
              //   </button>
              // </form>
            )} */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invitees.map((invitee, index) => (
                    <tr
                      key={invitee.id}
                      className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                      style={{
                        animation: `slideIn 0.3s ease-out ${
                          index * 0.05
                        }s both`,
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {invitee.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full transition-all duration-150 ${
                            invitee.role.name === "admin"
                              ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                              : "bg-green-100 text-green-800 hover:bg-green-200"
                          }`}
                        >
                          {invitee.role.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full transition-all duration-150 ${
                            invitee.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
                          }`}
                        >
                          {invitee.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(invitee.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </PermissionRestrictContainer>
      ),
      organizations: (
        <PermissionRestrictContainer permissions={["org:view", "org:create"]}>
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Organizations</h2>
              {currentUser?.role.name === "admin" && (
                <button
                  onClick={handleCreateOrg}
                  className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-all duration-150 transform hover:scale-105 flex items-center gap-2"
                >
                  <Building className="h-5 w-5" />
                  Create Organization
                </button>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userOrganizations.map((org, index) => (
                    <tr
                      key={org.id}
                      className="hover:bg-gray-50 transition-colors duration-150 ease-in-out"
                      style={{
                        animation: `slideIn 0.3s ease-out ${
                          index * 0.05
                        }s both`,
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {org.name}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </PermissionRestrictContainer>
      ),
    };

    return content[activeTab];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  console.log(currentUser);
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <nav className="bg-black text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <NikeLogo className="h-8 w-auto animate-pulse-once" />
              <span className="text-xl font-bold">Admin Portal</span>
            </div>
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowOrgDropdown((prev) => !prev)}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:ring-2 focus:ring-white focus:outline-none transition-all duration-150 flex items-center"
              >
                {organizations.find(
                  (org) => org.id === currentUser?.organizationId
                )?.name || "Select Organization"}
                <svg
                  className={`ml-2 h-5 w-5 transition-transform duration-300 ${
                    showOrgDropdown ? "transform rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </button>
              {showOrgDropdown && (
                <div
                  className="absolute mt-2 w-full bg-white rounded-lg shadow-lg z-10 overflow-hidden animate-slide-down"
                  style={{ animation: "slideDown 0.3s ease-out" }}
                >
                  {organizations.map((org, index) => (
                    <button
                      key={org.id}
                      onClick={async () => {
                        await switchOrgContext(org.id);
                        setShowOrgDropdown(false);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-all duration-150 ${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      }`}
                      style={{
                        animation: `fadeIn 0.3s ease-out ${index * 0.1}s both`,
                      }}
                    >
                      {org.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="relative flex items-center space-x-4">
            <span className="text-sm">
              {currentUser?.email} ({currentUser?.role.name})
            </span>
            <div className="relative">
              <button
                onClick={() => setShowDropdown((prev) => !prev)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 text-white"
              >
                {currentUser?.email.charAt(0).toUpperCase()}
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 container mx-auto py-8 px-4 gap-8">
        {/* Left Sidebar with Tabs */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg shadow-lg sticky top-8">
            {(["users", "roles", "invitees", "organizations"] as const).map(
              (tab, index) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center space-x-2 px-4 py-3 transition-all duration-150 ${
                    activeTab === tab
                      ? "bg-gray-100 border-l-4 border-black text-black"
                      : "hover:bg-gray-50 text-gray-600 hover:text-black border-l-4 border-transparent"
                  }`}
                  style={{
                    animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                  }}
                >
                  {tab === "users" && <Users className="h-5 w-5" />}
                  {tab === "roles" && <Shield className="h-5 w-5" />}
                  {tab === "invitees" && <UserPlus className="h-5 w-5" />}
                  {tab === "organizations" && <Building className="h-5 w-5" />}
                  <span className="capitalize">{tab}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-6 min-h-[calc(100vh-8rem)]">
          {currentUser?.id}
          {currentUser?.email}
          {JSON.stringify(currentUser?.role)}
          {currentUser?.organizationId}
          {renderTabContent()}
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && (
        <div
          className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-up"
          style={{ animation: "slideUp 0.3s ease-out, fadeIn 0.3s ease-out" }}
        >
          Operation completed successfully!
        </div>
      )}
    </div>
  );
}
