import React, { useState, useEffect } from "react";
import { auth, db } from "../config/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Loader2 } from "lucide-react";

function Profile({ setUserRole }) {
  const [profileData, setProfileData] = useState({
    name: "",
    role: "user",
    bio: "",
    preferences: "",
    profilePicture: "",
    location: "Long Beach, CA",
    memberSince: "February 2025",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveAttempted, setSaveAttempted] = useState(false); // Track if save was attempted

  const user = auth.currentUser;

  // Fetch profile data if user is logged in properly
  useEffect(() => {
    if (user) {
      initializeProfile();
    }
  }, [user]);

  const initializeProfile = async () => {
    setLoading(true);
    try {
      const userDocRef = doc(db, "profiles", user.uid);
      const userSnapshot = await getDoc(userDocRef);
  
      if (userSnapshot.exists()) {
        const profile = userSnapshot.data();
        
        // If memberSince doesn't exist, set it to the current month and year
        if (!profile.memberSince) {
          const currentDate = new Date();
          const formattedDate = currentDate.toLocaleString("en-US", { 
            month: "long", 
            year: "numeric" 
          });
  
          await updateDoc(userDocRef, { memberSince: formattedDate });
  
          profile.memberSince = formattedDate; // Update locally
        }
  
        setProfileData(profile);
        setUserRole(profile.role);
        localStorage.setItem("userRole", profile.role);
      } else {
        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleString("en-US", { 
          month: "long", 
          year: "numeric" 
        });
  
        const newProfile = {
          name: user.displayName || "",
          role: "user",
          bio: "",
          preferences: "",
          profilePicture: "https://s3-media0.fl.yelpcdn.com/assets/public/default_user_avatar_120x120_v2.yji-de626b6fb1609a681724.png",
          location: "Long Beach, CA",
          memberSince: formattedDate, // Set to current month and year
        };
  
        await setDoc(userDocRef, newProfile);
        setProfileData(newProfile);
        setUserRole("user");
        localStorage.setItem("userRole", "user");
      }
    } catch (err) {
      console.error("Error initializing profile:", err);
      setError("Failed to load or create profile.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setError(""); // Clear error when toggling edit mode
    setSaveAttempted(false); // Reset save attempt status
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleSave = async () => {
    setSaveAttempted(true); // Mark that a save attempt was made
    if (!isValidUrl(profileData.profilePicture)) {
      setError("Please enter a valid image URL.");
      return;
    }

    try {
      const userDocRef = doc(db, "profiles", user.uid);
      await updateDoc(userDocRef, profileData);
      setUserRole(profileData.role);
      localStorage.setItem("userRole", profileData.role);
      setIsEditing(false);
      setError(""); // Clear any previous errors
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to save profile changes. Please try again.");
    }
  };

  const handleAddPhoto = () => {
    setIsAddingPhoto(true); // Show the Add Photo input
  };

  const handleSavePhoto = async () => {
    if (!isValidUrl(profileData.profilePicture)) {
      setError("Please enter a valid image URL.");
      return;
    }
  
    try {
      const userDocRef = doc(db, "profiles", user.uid);
      await updateDoc(userDocRef, { profilePicture: profileData.profilePicture });
  
      setIsAddingPhoto(false);
      alert("Profile picture updated successfully!");
    } catch (err) {
      console.error("Error updating profile picture:", err);
      setError("Failed to update profile picture. Please try again.");
    }
  };
  

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" /> {/* Lucide spinner */}
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 border rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Profile Overview</h2>

      {/* Profile Picture and Basic Info */}
      <div className="flex items-center mb-6">
        <img
          src={profileData.profilePicture} // Mock image URL
          alt="Profile"
          className="w-24 h-24 rounded-full mr-4"
        />
        <div>
          <h3 className="text-xl font-semibold">{profileData.name}</h3>
          <p className="text-gray-600">{profileData.location}</p>
          <p className="text-gray-600">Cafe lover since {profileData.memberSince}</p>
        </div>
      </div>

      {/* Edit Profile Options */}
      <div className="flex gap-2 mb-6">
        <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={handleEditToggle}>
          Edit Profile
        </button>
        <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={handleAddPhoto}>
          Add Photo
        </button>
        <button className="bg-gray-500 text-white px-4 py-2 rounded">Add Friends</button>
      </div>

      {/* Add Photo Input (Modal-like) */}
      {isAddingPhoto && (
        <div className="mb-6 p-4 border rounded-lg bg-gray-50">
          <label>
            Paste Image URL:
            <input
              type="text"
              name="profilePicture"
              value={profileData.profilePicture}
              onChange={handleChange}
              className="border p-2 rounded w-full mt-2"
              placeholder="Enter image URL"
            />
          </label>
          <div className="flex gap-2 mt-2">
            <button onClick={handleSavePhoto} className="bg-green-500 text-white px-4 py-2 rounded">
              Save Photo
            </button>
            <button onClick={() => setIsAddingPhoto(false)} className="bg-gray-500 text-white px-4 py-2 rounded">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Profile Overview Sections */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 border rounded-lg">
          <h4 className="font-bold mb-2">Reviews</h4>
          <p>No reviews yet.</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-bold mb-2">Reservations</h4>
          <p>No reservations yet.</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-bold mb-2">Check-ins</h4>
          <p>No check-ins yet.</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-bold mb-2">Collections</h4>
          <p>No collections yet.</p>
        </div>
        <div className="p-4 border rounded-lg">
          <h4 className="font-bold mb-2">Order History</h4>
          <p>No orders yet.</p>
        </div>
      </div>

      {/* More About Me Section */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">More About Me</h3>
        <p><strong>Location:</strong> {profileData.location}</p>
        <p><strong>Cafe Lover Since:</strong> {profileData.memberSince}</p>
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <div className="flex flex-col gap-3">
          <label>
            Name:
            <input type="text" name="name" value={profileData.name} onChange={handleChange} className="border p-2 rounded w-full" />
          </label>
          <label>
            Role:
            <select name="role" value={profileData.role} onChange={handleChange} className="border p-2 rounded w-full bg-white">
              <option value="user">Regular User</option>
              <option value="owner">Cafe Owner</option>
            </select>
          </label>
          <label>
            Bio:
            <textarea name="bio" value={profileData.bio} onChange={handleChange} className="border p-2 rounded w-full bg-white" />
          </label>
          <label>
            Preferences:
            <input type="text" name="preferences" value={profileData.preferences} onChange={handleChange} className="border p-2 rounded w-full" />
          </label>
          <div className="flex gap-2">
            <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded">
              Save
            </button>
            <button onClick={handleEditToggle} className="bg-gray-500 text-white px-4 py-2 rounded">
              Cancel
            </button>
          </div>
          {error && saveAttempted && ( // Show error message if save was attempted and failed
            <p className="text-red-500">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Profile;