// src/components/user/DeleteAccount.jsx
import React, { useState } from 'react';
import { getAuth, deleteUser, reauthenticateWithCredential, EmailAuthProvider, signOut } from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useNavigate } from 'react-router-dom';

const DeleteAccount = ({ onClose }) => {
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const auth = getAuth();
  const user = auth.currentUser;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Check confirmation text
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm account deletion');
      setLoading(false);
      return;
    }

    try {
      // For email providers, we need to reauthenticate first
      if (user.providerData.some(provider => provider.providerId === 'password')) {
        try {
          // Reauthenticate user
          const credential = EmailAuthProvider.credential(user.email, password);
          await reauthenticateWithCredential(user, credential);
        } catch (reauthError) {
          console.error('Reauthentication error:', reauthError);
          if (reauthError.code === 'auth/wrong-password') {
            setError('Current password is incorrect.');
          } else {
            setError(`Authentication error: ${reauthError.message}`);
          }
          setLoading(false);
          return;
        }
      } else {
        // For non-password providers, we still need to check if recent sign-in is required
        try {
          // Test if we can get the user token (this will throw if recent auth is needed)
          await user.getIdToken(true);
        } catch (tokenError) {
          console.error('Token refresh error (recent auth needed):', tokenError);
          setError('This operation requires recent authentication. Please log out and log back in before retrying.');
          setLoading(false);
          return;
        }
      }

      // Delete user data from Firestore
      await deleteDoc(doc(db, "profiles", user.uid));
      
      // Delete favorites
      const favoritesRef = collection(db, "favorites");
      const q = query(favoritesRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      const deletePromises = [];
      querySnapshot.forEach((document) => {
        deletePromises.push(deleteDoc(doc(db, "favorites", document.id)));
      });

      // Wait for all favorite deletions to complete
      await Promise.all(deletePromises);

      try {
        // Delete user authentication account
        console.log("Attempting to delete user account...");
        await deleteUser(user);
        console.log("User account deleted successfully");
        
        // Show success message
        alert("Your account has been successfully deleted.");
        
        // Navigate to home page
        navigate('/');
      } catch (deleteError) {
        console.error('Error deleting user account:', deleteError);
        
        // If we can't delete the account but did delete the profile data,
        // we should sign out the user anyway
        await signOut(auth);
        alert("Your account data has been deleted, but there was an issue with removing your authentication account. You have been signed out.");
        navigate('/');
      }
    } catch (err) {
      console.error('Error in account deletion process:', err);
      if (err.code === 'auth/requires-recent-login') {
        setError('This operation requires recent authentication. Please log out and log back in before retrying.');
      } else {
        setError(`Failed to delete account: ${err.message}`);
      }
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-white-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center mb-6">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 mx-auto text-red-500" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
            />
          </svg>
          <h2 className="text-xl font-semibold mt-2">Delete Account</h2>
          <p className="text-gray-600 mt-1">
            This action is permanent and cannot be undone. All your data will be removed.
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {user?.providerData?.some(provider => provider.providerId === 'password') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                Current Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                required={user?.providerData?.some(provider => provider.providerId === 'password')}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirm-text">
              Type <span className="font-bold">DELETE</span> to confirm
            </label>
            <input
              id="confirm-text"
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading || confirmText !== 'DELETE'}
              className={`flex-1 py-2 px-4 rounded-md text-white ${
                loading || confirmText !== 'DELETE' ? 'bg-gray-400' : 'bg-red-600 hover:bg-red-700'
              } transition-colors`}
            >
              {loading ? 'Processing...' : 'Delete My Account'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteAccount;