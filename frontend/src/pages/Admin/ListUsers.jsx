import React, { useState, useEffect } from "react";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import api from "../../config/api"; 

import { useAuth } from "../../context/AuthProvider"; 

const ListUsers = () => {
  // ✅ Get token from Auth Context
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  
  // UI States
  const [showUserDetails, setShowUserDetails] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const roleOptions = ["All", "SuperAdmin", "Admin", "Customer"];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/v1/customers");
      setUsers(response.data);
      setErrorMessage("");
    } catch (error) {
      console.error("Error fetching users:", error);
      setErrorMessage("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIX: Only fetch when token is available/refreshed
  useEffect(() => {
    if (token) {
        fetchUsers();
    }
  }, [token]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      const userToUpdate = users.find((user) => user._id === userId);
      if (!userToUpdate) return;

      await api.put(`/v1/user/${userToUpdate.email}`, { status: newStatus });

      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, status: newStatus } : user
        )
      );
      setSuccessMessage(`User status updated to ${newStatus}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating user status:", error);
      setErrorMessage("Failed to update user status. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const userToUpdate = users.find((user) => user._id === userId);
      if (!userToUpdate) return;

      if (newRole === "Admin" && userToUpdate.role === "Customer") {
        await api.post("/v1/make-admin", { email: userToUpdate.email });
      } else if (newRole === "Customer" && userToUpdate.role === "Admin") {
        await api.post("/v1/demote-admin", { email: userToUpdate.email });
      } else {
        await api.put(`/v1/user/${userToUpdate.email}`, { role: newRole });
      }

      setUsers(
        users.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
      setSuccessMessage(`User role updated to ${newRole}`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating user role:", error);
      setErrorMessage("Failed to update user role. Please try again.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const userToDelete = users.find((user) => user._id === userId);
        if (!userToDelete) return;

        await api.put(`/v1/user/${userToDelete.email}`, { status: "Inactive" });

        setUsers(users.filter((user) => user._id !== userId));
        setSuccessMessage("User successfully deleted");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        console.error("Error deleting user:", error);
        setErrorMessage("Failed to delete user. Please try again.");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    }
  };

  const saveEditedUser = async () => {
    if (editingUser) {
      try {
        const { _id, ...userDataToUpdate } = editingUser;

        if (!userDataToUpdate.password) {
          delete userDataToUpdate.password;
        }

        await api.put(`/v1/user/${editingUser.email}`, userDataToUpdate);

        setUsers(
          users.map((user) =>
            user._id === editingUser._id ? { ...editingUser } : user
          )
        );
        setEditingUser(null);
        setSuccessMessage("User updated successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (error) {
        console.error("Error saving user:", error);
        setErrorMessage("Failed to save user changes. Please try again.");
        setTimeout(() => setErrorMessage(""), 3000);
      }
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "SuperAdmin": return "bg-red-100 text-red-800";
      case "Admin": return "bg-purple-100 text-purple-800";
      case "Customer": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Active": return "bg-green-100 text-green-800";
      case "Inactive": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole =
      roleFilter === "" || roleFilter === "All" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (typeof aValue === "string") {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (aValue < bValue) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateTimeString).toLocaleString(undefined, options);
  };

  

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      {/* Notification Messages */}
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
          {errorMessage}
        </div>
      )}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-800 rounded">
          {successMessage}
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl md:text-2xl font-semibold">User Management</h2>
        <div className="text-sm text-gray-500">Total: {users.length}</div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            {roleOptions.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Loading users...</p>
        </div>
      ) : (
        <>
          {/* 📱 MOBILE VIEW: Cards */}
          <div className="md:hidden space-y-4">
             {sortedUsers.length === 0 ? (
                <div className="text-center text-gray-500 py-4">No users found</div>
             ) : (
                sortedUsers.map(user => (
                   <div key={user._id} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                         <div>
                            <div className="font-bold text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                         </div>
                         <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeClass(user.role)}`}>
                            {user.role}
                         </span>
                      </div>
                      
                      <div className="flex justify-between items-center text-sm mb-3">
                         <span className={`px-2 py-0.5 rounded text-xs ${getStatusBadgeClass(user.status)}`}>
                            {user.status}
                         </span>
                         <span className="text-xs text-gray-500">Joined: {formatDate(user.joined)}</span>
                      </div>

                      <div className="flex justify-end gap-3 border-t pt-3">
                        <button onClick={() => setShowUserDetails(showUserDetails === user._id ? null : user._id)} className="text-indigo-600 flex items-center text-xs font-medium bg-indigo-50 px-2 py-1 rounded">
                           <EyeIcon className="h-4 w-4 mr-1"/> Details
                        </button>
                        <button onClick={() => setEditingUser(user)} className="text-blue-600 flex items-center text-xs font-medium bg-blue-50 px-2 py-1 rounded">
                           <PencilIcon className="h-4 w-4 mr-1"/> Edit
                        </button>
                        <button onClick={() => deleteUser(user._id)} className="text-red-600 flex items-center text-xs font-medium bg-red-50 px-2 py-1 rounded">
                           <TrashIcon className="h-4 w-4 mr-1"/> Delete
                        </button>
                      </div>

                      {/* Mobile Details Expanded */}
                      {showUserDetails === user._id && (
                         <div className="mt-3 pt-3 border-t bg-white p-3 rounded text-sm">
                            <p><strong>ID:</strong> {user._id}</p>
                            <p><strong>Last Login:</strong> {formatDateTime(user.lastLogin)}</p>
                            
                            <div className="mt-3">
                               <p className="font-bold mb-1 text-xs uppercase text-gray-500">Quick Actions</p>
                               <div className="flex flex-wrap gap-2">
                                  {user.role === "Customer" && (
                                     <button onClick={() => updateUserRole(user._id, "Admin")} className="bg-gray-200 text-xs px-2 py-1 rounded hover:bg-gray-300">Make Admin</button>
                                  )}
                                  {user.role === "Admin" && (
                                     <button onClick={() => updateUserRole(user._id, "Customer")} className="bg-gray-200 text-xs px-2 py-1 rounded hover:bg-gray-300">Demote</button>
                                  )}
                                  <button onClick={() => updateUserStatus(user._id, user.status === 'Active' ? 'Inactive' : 'Active')} className={`text-xs px-2 py-1 rounded text-white ${user.status === 'Active' ? 'bg-red-500' : 'bg-green-500'}`}>
                                     {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                                  </button>
                               </div>
                            </div>
                         </div>
                      )}
                   </div>
                ))
             )}
          </div>

          {/* 💻 LAPTOP VIEW: Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("_id")}>ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("name")}>Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("email")}>Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("role")}>Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("status")}>Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("joined")}>Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedUsers.length === 0 ? (
                  <tr><td colSpan="7" className="px-6 py-4 text-center text-gray-500">No users found</td></tr>
                ) : (
                  sortedUsers.map((user) => (
                    <React.Fragment key={user._id}>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{user._id.substring(0, 8)}...</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeClass(user.role)}`}>{user.role}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(user.status)}`}>{user.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{formatDate(user.joined)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button onClick={() => setShowUserDetails(showUserDetails === user._id ? null : user._id)} className="text-indigo-600 hover:text-indigo-900 mr-3">
                            <EyeIcon className="h-5 w-5" />
                          </button>
                          <button onClick={() => setEditingUser(user)} className="text-blue-600 hover:text-blue-900 mr-3">
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button onClick={() => deleteUser(user._id)} className="text-red-600 hover:text-red-900">
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>

                      {showUserDetails === user._id && (
                        <tr>
                          <td colSpan="7" className="px-6 py-4 bg-gray-50">
                             {/* Desktop Details View */}
                             <div className="grid grid-cols-2 gap-4">
                                <div>
                                   <p><strong>ID:</strong> {user._id}</p>
                                   <p><strong>Last Login:</strong> {formatDateTime(user.lastLogin)}</p>
                                </div>
                                <div>
                                   <div className="flex gap-2">
                                      <button onClick={() => updateUserStatus(user._id, user.status === 'Active' ? 'Inactive' : 'Active')} className="bg-gray-200 px-2 py-1 rounded text-xs hover:bg-gray-300">Toggle Status</button>
                                      {user.role === 'Customer' && <button onClick={() => updateUserRole(user._id, 'Admin')} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs hover:bg-blue-200">Promote to Admin</button>}
                                      {user.role === 'Admin' && <button onClick={() => updateUserRole(user._id, 'Customer')} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs hover:bg-orange-200">Demote to Customer</button>}
                                   </div>
                                </div>
                             </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Edit User Modal (Responsive) */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Edit User</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={editingUser.name || ""} onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={editingUser.email || ""} onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select value={editingUser.role || ""} onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  {roleOptions.filter((role) => role !== "All").map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editingUser.status || ""} onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input type="password" placeholder="Leave blank to keep current" onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
            </div>
            <div className="flex justify-end mt-6 gap-3">
              <button onClick={() => setEditingUser(null)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">Cancel</button>
              <button onClick={saveEditedUser} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListUsers;