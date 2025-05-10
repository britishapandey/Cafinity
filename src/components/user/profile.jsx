import React, { useState, useEffect } from "react";
import { auth, db } from "../../config/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import ChangePassword from "./ChangePassword";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

import { getAuth, updateProfile } from "firebase/auth";

import { createClient } from "@supabase/supabase-js";

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

  const user = auth.currentUser;

  // fetch profile data if user is logged in properly
  useEffect(() => {
    if (user) {
      initializeProfile();
    }
  }, [user]);

  // Code to update the profile photo, set the correct status, and attach the image url to th authenticated user.
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
      const userDocRef = doc(db, "profiles", user.uid);
      await updateDoc(userDocRef, profileData);
      setUserRole(profileData.role);
      localStorage.setItem("userRole", profileData.role);
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

  return (
    <>
      {uploading && <LoadingOverlay />}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
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
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePassword onClose={() => setShowChangePassword(false)} />
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