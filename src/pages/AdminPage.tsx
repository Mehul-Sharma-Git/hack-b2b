import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Building,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { httpClient } from "../lib/api-client";
import { User, Organization } from "../types";
import { NikeLogo } from "../components/NikeLogo";
import { useAuth } from "../context/AuthContext";

type Tab = "users" | "roles" | "invitees" | "organizations";

export function AdminPage() {
  const { currentUser, logout, organizations, switchOrgContext } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("users");
  const [users, setUsers] = useState<any[]>([]);
  const [invitees, setInvitees] = useState<any[]>([]);
  const [showOrgDropdown, setShowOrgDropdown] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [showInvitePopup, setShowInvitePopup] = useState(false);
  const [showCreateOrgPopup, setShowCreateOrgPopup] = useState(false);
  const [userOrganizations, setUserOrganizations] = useState<Organization[]>(
    []
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  console.log("currentUser", currentUser);
  useEffect(() => {
    fetchData();

    // Close dropdowns when clicking outside
    const handleClickOutside = () => {
      setShowDropdown(false);
      setShowOrgDropdown(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [currentUser?.organizationId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, inviteesRes, orgsRes, rolesRes] = await Promise.all([
        httpClient.getUsers(currentUser?.organizationId || ""),
        httpClient.getInvitees(currentUser?.organizationId || ""),
        httpClient.getOrganizations(currentUser?.organizationId || ""),
        httpClient.getRoles(currentUser?.organizationId || ""),
      ]);
      if (usersRes.Data) setUsers(usersRes.Data.Data ?? []);
      if (inviteesRes.Data) setInvitees(inviteesRes.Data.Data ?? []);
      if (orgsRes.Data && orgsRes.Data.Data)
        setUserOrganizations(orgsRes.Data.Data);
      if (rolesRes.Data) setRoles(rolesRes.Data.Data ?? []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setIsLoading(false);
  };
  const roleMap = useMemo(() => {
    return roles.reduce((acc, role) => {
      acc[role.Id] = role.Name;
      return acc;
    }, {});
  }, [roles]);

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
      currentUser?.role.some((role) =>
        role.Permissions.some((p) => p.Name === perm)
      )
    );

    console.log(userOrganizations);
    if (!hasPermission) {
      return (
        <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
          <div className="nike-card bg-red-50 text-red-800 animate-fade-in">
            <Shield className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Access Restricted</h3>
            <p>You do not have permission to view this content.</p>
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Users List</h2>
              <div className="flex gap-2">
                <input
                  type="search"
                  placeholder="Search users..."
                  className="nike-input"
                />
              </div>
            </div>
            <div className="nike-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user, index) => (
                      <tr
                        key={user?.Id}
                        className="hover:bg-gray-50 transition-all duration-200"
                        style={{
                          animation: `slideIn 0.3s ease-out ${
                            index * 0.05
                          }s both`,
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              {user.Email[0]}
                            </div>
                            <div className="ml-4">{user.Email}</div>
                            <div className="ml-4">{user.Username}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${
                              roleMap[user.RoleId] === "Admin"
                                ? "bg-purple-100 text-purple-800"
                                : roleMap[user.RoleId] === "SuperAdmin"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {roleMap[user.RoleId]}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user?.CreatedDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </PermissionRestrictContainer>
      ),
      roles: (
        <PermissionRestrictContainer permissions={["roles:view"]}>
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold mb-6">Available Roles</h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="nike-card hover:scale-[1.02] transition-transform duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-purple-100 text-purple-800">
                    Admin
                  </span>
                  <Shield className="h-5 w-5 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Full System Access
                </h3>
                <p className="text-gray-600">
                  Complete control over all system features and settings
                </p>
                <div className="mt-4 space-y-2">
                  {["Create", "Read", "Update", "Delete"].map((perm, i) => (
                    <div
                      key={perm}
                      className="flex items-center text-sm text-gray-500"
                      style={{
                        animation: `slideIn 0.3s ease-out ${i * 0.1}s both`,
                      }}
                    >
                      <div className="w-2 h-2 rounded-full bg-purple-400 mr-2" />
                      {perm}
                    </div>
                  ))}
                </div>
              </div>

              <div className="nike-card hover:scale-[1.02] transition-transform duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800">
                    Member
                  </span>
                  <Users className="h-5 w-5 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Limited Access</h3>
                <p className="text-gray-600">
                  Restricted access to system features
                </p>
                <div className="mt-4 space-y-2">
                  {["No Admin Access"].map((perm, i) => (
                    <div
                      key={perm}
                      className="flex items-center text-sm text-gray-500"
                      style={{
                        animation: `slideIn 0.3s ease-out ${i * 0.1}s both`,
                      }}
                    >
                      <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                      {perm}
                    </div>
                  ))}
                </div>
              </div>
              <div className="nike-card hover:scale-[1.02] transition-transform duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                    Super Admin
                  </span>
                  <Shield className="h-5 w-5 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">
                  Highest Level Access
                </h3>
                <p className="text-gray-600">
                  Unrestricted access to all system features and settings
                </p>
                <div className="mt-4 space-y-2">
                  {[
                    "Create",
                    "Read",
                    "Update",
                    "Delete",
                    "Manage Organizations",
                  ].map((perm, i) => (
                    <div
                      key={perm}
                      className="flex items-center text-sm text-gray-500"
                      style={{
                        animation: `slideIn 0.3s ease-out ${i * 0.1}s both`,
                      }}
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-400 mr-2" />
                      {perm}
                    </div>
                  ))}
                </div>
              </div>
              <div className="nike-card hover:scale-[1.02] transition-transform duration-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 text-sm font-semibold rounded-full bg-red-100 text-red-800">
                    Developer
                  </span>
                  <Shield className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Developer Access</h3>
                <p className="text-gray-600">
                  Access to development-related features and settings
                </p>
                <div className="mt-4 space-y-2">
                  {["View Content", "Basic Interactions"].map((perm, i) => (
                    <div
                      key={perm}
                      className="flex items-center text-sm text-gray-500"
                      style={{
                        animation: `slideIn 0.3s ease-out ${i * 0.1}s both`,
                      }}
                    >
                      <div className="w-2 h-2 rounded-full bg-red-400 mr-2" />
                      {perm}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PermissionRestrictContainer>
      ),
      invitees: (
        <PermissionRestrictContainer
          permissions={["invite:view", "invite:create"]}
        >
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Invitees Management</h2>

              <button
                className="nike-button flex items-center gap-2"
                onClick={() => setShowInvitePopup(true)}
              >
                <UserPlus className="h-4 w-4" />
                Invite User
              </button>

              {showInvitePopup && currentUser && (
                <InvitePopup
                  setShowInvitePopup={setShowInvitePopup}
                  currentUser={currentUser as User}
                  setInvitees={setInvitees}
                  setShowSuccessMessage={setShowSuccessMessage}
                  roles={roles}
                />
              )}
            </div>
            <div className="nike-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        EmailId
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created Date
                      </th>
                    </tr>
                  </thead>
                  {invitees.length ? (
                    <tbody className="bg-white divide-y divide-gray-200">
                      {invitees.map((invitee, index) => (
                        <tr
                          key={invitee?.id}
                          className="hover:bg-gray-50 transition-all duration-200"
                          style={{
                            animation: `slideIn 0.3s ease-out ${
                              index * 0.05
                            }s both`,
                          }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                {invitee.EmailId[0]}
                              </div>
                              <div className="ml-4">{invitee?.EmailId}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${
                              roleMap[invitee.RoleIds[0]] === "Admin"
                                ? "bg-purple-100 text-purple-800"
                                : roleMap[invitee.RoleIds[0]] === "SuperAdmin"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                            >
                              {roleMap[invitee?.RoleIds[0]]}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${
                              invitee?.Status === "Invited"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                            >
                              {invitee?.Status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(
                              invitee?.CreatedDate
                            ).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  ) : (
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td
                          colSpan={4}
                          className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                        >
                          No invitees available to display.
                        </td>
                      </tr>
                    </tbody>
                  )}
                </table>
              </div>
            </div>
          </div>
        </PermissionRestrictContainer>
      ),
      organizations: (
        <PermissionRestrictContainer permissions={["org:view", "org:create"]}>
          <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Organizations</h2>
              {currentUser?.role.find((role) =>
                role.Permissions.some((p) => p.Name === "org:create")
              ) && (
                <button
                  onClick={() => setShowCreateOrgPopup(true)}
                  className="nike-button flex items-center gap-2"
                >
                  <Building className="h-4 w-4" />
                  Create Organization
                </button>
              )}
            </div>
            {showCreateOrgPopup && (
              <CreateOrgPopup
                setShowCreateOrgPopup={setShowCreateOrgPopup}
                setShowSuccessMessage={setShowSuccessMessage}
                currentUser={currentUser as User}
              />
            )}
            {userOrganizations.length ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {userOrganizations.map((org, index) => (
                  <div
                    key={org.OrgId}
                    className="nike-card hover:scale-[1.02] transition-transform duration-200"
                    style={{
                      animation: `fadeIn 0.3s ease-out ${index * 0.1}s both`,
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold">{org.Name}</h3>
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>0 Members</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
                <div className="nike-card bg-gray-50 text-gray-800 animate-fade-in p-6 text-center">
                  <Building className="w-12 h-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No Organizations Available
                  </h3>
                  <p>There are no organizations available to display.</p>
                </div>
              </div>
            )}
          </div>
        </PermissionRestrictContainer>
      ),
    };

    return content[activeTab];
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="nike-gradient text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <NikeLogo className="h-8 w-auto text-white animate-pulse-once" />
                <span className="text-xl font-bold">Admin Portal</span>
              </div>

              <div
                className="relative ml-6"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowOrgDropdown((prev) => !prev)}
                  className="glass-effect px-4 py-2 rounded-lg focus:ring-2 focus:ring-white/20 outline-none
                           transition-all duration-200 flex items-center gap-2"
                >
                  <span>
                    {organizations.find(
                      (org) => org.OrgId === currentUser?.organizationId
                    )?.Name || "Select Organization"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      showOrgDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showOrgDropdown && (
                  <div className="absolute mt-2 w-64 bg-white rounded-lg shadow-lg z-10 animate-scale-in">
                    {organizations.map((org, index) => (
                      <button
                        key={org.OrgId}
                        onClick={async () => {
                          await switchOrgContext(org.OrgId);
                          setShowOrgDropdown(false);
                        }}
                        className="w-full px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center gap-2
                                 transition-colors duration-200 first:rounded-t-lg last:rounded-b-lg"
                        style={{
                          animation: `fadeIn 0.3s ease-out ${
                            index * 0.05
                          }s both`,
                        }}
                      >
                        <Building className="h-4 w-4" />
                        {org.Name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-sm">{currentUser?.email}</div>
              <div className="flex items-center space-x-4">
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full
                  ${
                    roleMap[currentUser?.role[0]?.Id ?? ""] === "Admin"
                      ? "bg-purple-100 text-purple-800"
                      : currentUser?.role[0]?.Id &&
                        roleMap[currentUser.role[0].Id] === "SuperAdmin"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {currentUser?.role[0] && roleMap[currentUser.role[0].Id]}
                </span>
              </div>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => setShowDropdown((prev) => !prev)}
                  className="flex items-center justify-center w-10 h-10 rounded-full glass-effect
                           transition-transform duration-200 hover:scale-105"
                >
                  {currentUser?.email[0].toUpperCase()}
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 animate-scale-in">
                    <button
                      onClick={logout}
                      className="w-full px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg
                               flex items-center gap-2 transition-colors duration-200"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 container mx-auto py-8 px-4 gap-8">
        <div className="w-64 flex-shrink-0">
          <div className="nike-card sticky top-8 divide-y divide-gray-100">
            {(["users", "roles", "invitees", "organizations"] as const).map(
              (tab, index) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center gap-3 p-4 transition-all duration-200
                  ${
                    activeTab === tab
                      ? "text-black bg-gray-50"
                      : "text-gray-500 hover:text-black hover:bg-gray-50"
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

        <div className="flex-1">{renderTabContent()}</div>
      </div>

      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 animate-slide-up">
          <div className="nike-card bg-green-50 text-green-800 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            Operation completed successfully!
          </div>
        </div>
      )}
    </div>
  );
}

const InvitePopup = ({
  currentUser,
  setShowInvitePopup,
  setShowSuccessMessage,
  roles,
}: {
  currentUser: User;
  setShowInvitePopup: React.Dispatch<React.SetStateAction<boolean>>;
  setInvitees: React.Dispatch<React.SetStateAction<any[]>>;
  setShowSuccessMessage: React.Dispatch<React.SetStateAction<boolean>>;
  roles: any[];
}) => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const handleInviteUser = async () => {
    if (inviteEmail && inviteRole) {
      try {
        const response = await httpClient.createInvitee(
          currentUser?.organizationId || "",
          inviteEmail,
          inviteRole,
          currentUser.Id
        );

        if (response) {
          httpClient.getInvitees(currentUser?.organizationId || "");
          setShowInvitePopup(false);
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
        }
      } catch (error) {
        console.error("Error inviting user:", error);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="nike-card p-6 w-full max-w-md animate-scale-in">
        <h3 className="text-xl font-semibold mb-4">Invite User</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            className="nike-input w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Role
          </label>
          <select
            value={inviteRole}
            onChange={(e) => setInviteRole(e.target.value)}
            className="nike-input w-full"
          >
            <option value="">Select Role</option>
            {roles.map((role) => (
              <option key={role.Name} label={role.Name} value={role.Id}>
                {role.Name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="nike-button-secondary"
            onClick={() => setShowInvitePopup(false)}
          >
            Cancel
          </button>
          <button className="nike-button" onClick={handleInviteUser}>
            Invite
          </button>
        </div>
      </div>
    </div>
  );
};

const CreateOrgPopup = ({
  setShowCreateOrgPopup,
  setShowSuccessMessage,
  currentUser,
}: {
  setShowCreateOrgPopup: React.Dispatch<React.SetStateAction<boolean>>;
  setShowSuccessMessage: React.Dispatch<React.SetStateAction<boolean>>;
  currentUser: User;
}) => {
  const [orgName, setOrgName] = useState("");
  const handleCreateOrg = async () => {
    if (orgName) {
      try {
        const response = await httpClient.createOrganization(
          orgName,
          currentUser.organizationName,
          currentUser.organizationId,
          currentUser.Id
        );

        if (response) {
          httpClient.getOrganizations(currentUser.organizationId);
          setShowCreateOrgPopup(false);
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
        }
      } catch (error) {
        console.error("Error creating organization:", error);
      }
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="nike-card p-6 w-full max-w-md animate-scale-in">
        <h3 className="text-xl font-semibold mb-4">Create Organization</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Organization Name
          </label>
          <input
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="nike-input w-full"
          />
        </div>
        <div className="flex justify-end gap-2">
          <button
            className="nike-button-secondary"
            onClick={() => setShowCreateOrgPopup(false)}
          >
            Cancel
          </button>
          <button className="nike-button" onClick={handleCreateOrg}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
};
