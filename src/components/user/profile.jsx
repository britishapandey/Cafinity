import React, { useState, useEffect } from "react";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import ChangePassword from "./ChangePassword";
import DeleteAccount from "./DeleteAccount";
import { getAuth, updateProfile } from "firebase/auth";
import { createClient } from "@supabase/supabase-js";
import { Link } from "react-router-dom";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function Profile({ setUserRole }) {
  const [profileData, setProfileData] = useState({
    name: "",
    role: "user",
    bio: "",
    preferences: "",
    profilePicture: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [pic, setPic] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [favoriteCafes, setFavoriteCafes] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const user = auth.currentUser;

  // fetch profile data if user is logged in properly
  useEffect(() => {
    if (user) {
      initializeProfile();
      fetchFavoriteCafes();
    }
  }, [user]);

  // Fetch the user's favorite cafes
  const fetchFavoriteCafes = async () => {
    if (!user) return;
    
    setLoadingFavorites(true);
    try {
      // Query the favorites collection for documents where userId matches current user
      const favoritesRef = collection(db, "favorites");
      const q = query(favoritesRef, where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      
      const favorites = [];
      
      // For each favorite, get the associated cafe details
      // Changed the variable name from 'doc' to 'docSnapshot' to avoid conflict
      for (const docSnapshot of querySnapshot.docs) {
        const favorite = docSnapshot.data();
        favorite.id = docSnapshot.id; // Save the favorite document ID
        
        // Try to get cafe details if available
        try {
          // Now we can use the imported 'doc' function correctly
          const cafeDocRef = doc(db, "cafes", favorite.cafeId);
          const cafeDoc = await getDoc(cafeDocRef);
          
          if (cafeDoc.exists()) {
            const cafeData = cafeDoc.data();
            favorite.cafeDetails = {
              ...cafeData,
              id: favorite.cafeId
            };
          }
        } catch (err) {
          console.error("Error fetching cafe details:", err);
        }
        
        favorites.push(favorite);
      }
      
      setFavoriteCafes(favorites);
    } catch (err) {
      console.error("Error fetching favorites:", err);
    } finally {
      setLoadingFavorites(false);
    }
  };

  // Code to update the profile photo, set the correct status, and attach the image url to the authenticated user.
  const updateProfilePhoto = async (imageFile) => {
    const auth = getAuth();
    console.log(SUPABASE_URL, ANON_KEY);
    const supabase = createClient(SUPABASE_URL, ANON_KEY);

    try {
      const randomUuid = crypto.randomUUID();
      // Upload to Supabase storage
      const filePath = `profilePhotos/${randomUuid}`;

      // First remove existing file if it exists
      await supabase.storage.from("public_for_b").remove([filePath]);

      // Then upload new file
      const { data, error } = await supabase.storage
        .from("public_for_b")
        .upload(filePath, imageFile);

      if (error) throw error;

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from("public_for_b")
        .getPublicUrl(filePath);

      const photoURL = publicUrlData.publicUrl;

      // Update Firebase auth profile
      await updateProfile(auth.currentUser, {
        photoURL: photoURL,
      });
      setPic(photoURL);

      return photoURL;
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const initializeProfile = async () => {
    setLoading(true);
    try {
      // firebase profiles collection reference
      const userDocRef = doc(db, "profiles", user.uid);
      const userSnapshot = await getDoc(userDocRef);
      setPic(user.photoURL);

      if (userSnapshot.exists()) {
        const profile = userSnapshot.data();
        setProfileData(profile);
        setUserRole(profile.role);
        
        // Check if user is admin
        setIsAdmin(profile.role === "admin");
        
        localStorage.setItem("userRole", profile.role);
      } else {
        const newProfile = {
          name: user.displayName || "",
          role: "user",
          bio: "",
          preferences: "",
          profilePicture: "",
        };
        await setDoc(userDocRef, newProfile);
        setProfileData(newProfile);
        setUserRole("user");
        setIsAdmin(false);
        localStorage.setItem("userRole", "user");
      }
    } catch (err) {
      console.error("Error initializing profile:", err);
      setError("Failed to load or create profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      await updateProfilePhoto(file);
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setError("Failed to upload profile picture.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      // Create a copy of profileData that we'll modify based on user permissions
      const dataToUpdate = { ...profileData };
      
      // If user is not an admin, remove role from the update
      // This ensures we don't even try to update fields that would be rejected by security rules
      if (!isAdmin) {
        const { role, ...allowedFields } = dataToUpdate;
        Object.assign(dataToUpdate, allowedFields);
      }
      
      // Update Firestore profile
      const userDocRef = doc(db, "profiles", user.uid);
      await updateDoc(userDocRef, dataToUpdate);
      
      // Also update Firebase Auth display name
      await updateProfile(auth.currentUser, {
        displayName: profileData.name
      });
      
      // Only update the role in app state if user is admin
      if (isAdmin) {
        setUserRole(profileData.role);
        localStorage.setItem("userRole", profileData.role);
      }
      
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to save profile changes.");
    }
  };

  const handleChangePasswordClick = () => {
    setShowChangePassword(true);
  };
  
  const handleDeleteAccountClick = () => {
    setShowDeleteAccount(true);
  };

  const LoadingOverlay = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B7AEE]"></div>
        <p className="text-gray-700">Updating profile picture...</p>
      </div>
    </div>
  );

  if (loading || user == null) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B7AEE]"></div>
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Check if user is connected via a password-based method or a provider like Google
  const isPasswordProvider = user.providerData && 
    user.providerData.some(provider => provider.providerId === 'password');

  // Function to render cafe cards for favorites
  const renderFavoriteCafeCard = (favorite) => {
    const getInitials = (name) => {
      return name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    };
    
    const getColorFromName = (name) => {
      const colors = [
        "bg-[#FF6B6B]", "bg-[#4ECDC4]", "bg-[#45B7D1]", "bg-[#96CEB4]",
        "bg-[#6B7AEE]", "bg-[#9D65C9]", "bg-[#FF9671]", "bg-[#59C9A5]",
        "bg-[#6C88C4]",
      ];
      let hash = 0;
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    };
    
    // Helper function to safely format date
    const formatDate = (timestamp) => {
      if (!timestamp) return 'Unknown date';
      
      try {
        if (timestamp.toDate) {
          return new Date(timestamp.toDate()).toLocaleDateString();
        } else if (timestamp instanceof Date) {
          return timestamp.toLocaleDateString();
        } else {
          return new Date(timestamp).toLocaleDateString();
        }
      } catch (err) {
        console.error("Error formatting date:", err);
        return 'Invalid date';
      }
    };
    
    return (
      <Link to={`/cafe/${favorite.cafeId}`} key={favorite.id} 
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className={`${getColorFromName(favorite.cafeName)} h-24 flex items-center justify-center`}>
          <span className="text-2xl font-bold text-white">
            {getInitials(favorite.cafeName)}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-1">{favorite.cafeName}</h3>
          <p className="text-xs text-gray-500">Added on {formatDate(favorite.addedAt)}</p>
        </div>
      </Link>
    );
  };

  return (
    <>
      {uploading && <LoadingOverlay />}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-8">
          {/* Header Section */}
          <div className="relative h-48 bg-gradient-to-r from-[#6B7AEE] to-[#8691F0]">
            <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-white">
                  {pic || user.photoURL ? (
                    <img
                      src={pic ? pic : user.photoURL}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-2xl font-semibold text-gray-600">
                      {user?.displayName?.[0] || "?"}
                    </div>
                  )}

                  {/* Upload Overlay */}
                  <div
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 
                            transition-opacity flex items-center justify-center cursor-pointer"
                    onClick={() => document.getElementById("fileInput").click()}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <input
                  type="file"
                  id="fileInput"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <div className="mb-4">
                <h1 className="text-2xl font-bold">{profileData.name}</h1>
                <p className="opacity-90">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-20 px-8 pb-8">
            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <ProfileField label="Role" value={profileData.role} />
                  <ProfileField label="Name" value={profileData.name} />
                  <ProfileField label="Email" value={user.email} />
                  <ProfileField
                    label="Preferences"
                    value={profileData.preferences || "Not set"}
                  />
                </div>

                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Bio</h3>
                  <p className="text-gray-600">
                    {profileData.bio || "No bio added yet"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleEditToggle}
                    className="px-6 py-2 bg-[#6B7AEE] text-white rounded-lg 
                            hover:bg-[#5563d3] transition-colors flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-8.5 8.5a2 2 0 01-1.414.586H4v-2.5a2 2 0 01.586-1.414l8.5-8.5z" />
                    </svg>
                    Edit Profile
                  </button>

                  {/* Only show password change button for users with password auth */}
                  {isPasswordProvider && (
                    <div className="flex gap-2">
                      <button
                        onClick={handleChangePasswordClick}
                        className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg 
                              hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Change Password
                      </button>
                      
                      {/* Delete Account Button */}
                      <button
                        onClick={handleDeleteAccountClick}
                        className="p-2 bg-red-100 text-red-600 rounded-lg 
                              hover:bg-red-200 transition-colors flex items-center"
                        aria-label="Delete Account"
                        title="Delete Account"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#6B7AEE] focus:border-transparent"
                    />
                  </div>

                  {/* Only show editable role field to admins */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    {isAdmin ? (
                      <select
                        name="role"
                        value={profileData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#6B7AEE] focus:border-transparent"
                      >
                        <option value="user">Regular User</option>
                        <option value="owner">Cafe Owner</option>
                        <option value="admin">Administrator</option>
                      </select>
                    ) : (
                      <p className="w-full px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-500">
                        {profileData.role}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Preferences
                    </label>
                    <input
                      type="text"
                      name="preferences"
                      value={profileData.preferences}
                      onChange={handleChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#6B7AEE] focus:border-transparent"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={profileData.bio}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#6B7AEE] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-[#6B7AEE] text-white rounded-lg hover:bg-[#5563d3] transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Favorites Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Favorite Cafes</h2>
            
            {loadingFavorites ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B7AEE]"></div>
              </div>
            ) : favoriteCafes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {favoriteCafes.map(renderFavoriteCafeCard)}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">You haven't favorited any cafes yet.</p>
                <Link to="/" className="mt-4 inline-block px-6 py-2 bg-[#6B7AEE] text-white rounded-lg hover:bg-[#5563d3] transition-colors">
                  Explore Cafes
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
      )}

      {/* Delete Account Modal */}
      {showDeleteAccount && (
        <DeleteAccount onClose={() => setShowDeleteAccount(false)} />
      )}
    </>
  );
}

// Helper component for displaying profile fields
const ProfileField = ({ label, value }) => (
  <div>
    <h3 className="text-sm font-medium text-gray-500">{label}</h3>
    <p className="mt-1 text-gray-900">{value}</p>
  </div>
);

export default Profile;