// src/components/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../../config/firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const profilesCollection = collection(db, "profiles");
        const profilesQuery = query(profilesCollection, orderBy("email"));
        const profilesSnapshot = await getDocs(profilesQuery);
        
        const usersData = profilesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          originalRole: doc.data().role // Keep track of original role for comparison
        }));
        
        setUsers(usersData);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Handle role change
  const handleRoleChange = (userId, newRole) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      )
    );
  };

  // Save role changes
  const saveRoleChange = async (userId) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;

    // If role hasn't changed, just exit edit mode
    if (user.role === user.originalRole) {
      setEditingUser(null);
      return;
    }

    try {
      const userRef = doc(db, "profiles", userId);
      await updateDoc(userRef, { role: user.role });
      
      // Update originalRole to reflect the change
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, originalRole: u.role } : u
        )
      );
      
      setEditingUser(null);
    } catch (err) {
      console.error("Error updating user role:", err);
      setError("Failed to update user role. Please try again.");
      
      // Revert to original role
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === userId ? { ...u, role: u.originalRole } : u
        )
      );
    }
  };

  // Cancel role edit
  const cancelEdit = (userId) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, role: user.originalRole } : user
      )
    );
    setEditingUser(null);
  };

  // Filter users based on search and filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'admin' && user.role === 'admin') ||
      (filter === 'owner' && user.role === 'owner') ||
      (filter === 'user' && user.role === 'user');
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B7AEE]"></div>
          <p className="text-gray-500">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">User Management</h2>
      
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'all'
                ? 'bg-[#6B7AEE] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border border-gray-300 rounded-l-lg`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('admin')}
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'admin'
                ? 'bg-[#6B7AEE] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border-t border-b border-r border-gray-300`}
          >
            Admins
          </button>
          <button
            onClick={() => setFilter('owner')}
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'owner'
                ? 'bg-[#6B7AEE] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border-t border-b border-r border-gray-300`}
          >
            Owners
          </button>
          <button
            onClick={() => setFilter('user')}
            className={`px-4 py-2 text-sm font-medium ${
              filter === 'user'
                ? 'bg-[#6B7AEE] text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            } border-t border-b border-r border-gray-300 rounded-r-lg`}
          >
            Users
          </button>
        </div>
      </div>
      
      {/* User Count */}
      <p className="mb-4 text-gray-600">
        Found {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
      </p>
      
      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email Verified
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{user.name || "Not set"}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingUser === user.id ? (
                    <select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="text-sm border border-gray-300 rounded p-1 w-full"
                    >
                      <option value="user">User</option>
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800' 
                        : user.role === 'owner'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.emailVerified ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Verified
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      Not Verified
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {editingUser === user.id ? (
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => saveRoleChange(user.id)}
                        className="text-[#6B7AEE] hover:text-[#5563d3]"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => cancelEdit(user.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingUser(user.id)}
                      className="text-white hover:text-[#5563d3]"
                    >
                      Change Role
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No users found matching your search criteria.
        </div>
      )}
    </div>
  );
}

export default UserManagement;