import React, { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

function Profile() {
  const [profileData, setProfileData] = useState({
    name: '',
    role: 'user', // Default role
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const user = auth.currentUser; // Get the currently logged-in user

  useEffect(() => {
    if (user) {
      initializeProfile(); // Create or fetch profile on mount
    }
  }, [user]);

  const initializeProfile = async () => {
    setLoading(true);
    try {
      const userDocRef = doc(db, 'profiles', user.uid); // Reference to the document
      const userSnapshot = await getDoc(userDocRef);

      if (userSnapshot.exists()) {
        // If profile exists, set the data
        setProfileData(userSnapshot.data());
      } else {
        // If no profile exists, create a new one
        const newProfile = {
          name: user.displayName || '', // Use Firebase Auth displayName if available
          role: 'user',
        };
        await setDoc(userDocRef, newProfile); // Create document in Firestore
        setProfileData(newProfile); // Update state with default profile
      }
    } catch (err) {
      console.error('Error initializing profile:', err);
      setError('Failed to load or create profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const userDocRef = doc(db, 'profiles', user.uid);
      await updateDoc(userDocRef, profileData); // Save updates to Firestore
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to save profile changes.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Profile</h2>

      {!isEditing ? (
        <div>
          <p><strong>Name:</strong> {profileData.name}</p>
          <p><strong>Role:</strong> {profileData.role}</p>
          <button
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={handleEditToggle}
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <label>
            Name:
            <input
              type="text"
              name="name"
              value={profileData.name}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            />
          </label>
          <label>
            Role:
            <select
              name="role"
              value={profileData.role}
              onChange={handleChange}
              className="border p-2 rounded w-full"
            >
              <option value="user">Regular User</option>
              <option value="owner">Cafe Owner</option>
            </select>
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              onClick={handleEditToggle}
              className="bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
