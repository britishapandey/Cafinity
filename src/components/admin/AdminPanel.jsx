// src/components/admin/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { auth } from '../../config/firebase';
import { checkAdminAccess } from '../../utils/adminAuth';
import FeedbackDashboard from './FeedbackDashboard';
import { onAuthStateChanged } from 'firebase/auth';
import UserManagement from './UserManagement';

function AdminPanel() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feedback'); //default tab

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        const adminStatus = await checkAdminAccess(currentUser.uid);
        setIsAdmin(adminStatus);
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B7AEE]"></div>
          <p className="text-gray-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      {/* Tab Navigation */}
      <div className="mb-8 border-b border-gray-200">
        <div className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('feedback')}
            className={`${
              activeTab === 'feedback'
                ? 'border-[#6B7AEE] text-white'
                : 'border-transparent text-white-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Feedback Dashboard
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-[#6B7AEE] text-white'
                : 'border-transparent text-white-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            User Management
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'feedback' ? (
        <FeedbackDashboard />
      ) : (
        <UserManagement />
      )}
    </div>
  );
}

export default AdminPanel;