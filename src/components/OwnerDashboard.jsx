import React, { useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { doc, getDoc, setDoc, getDocs, collection } from 'firebase/firestore';
import CafeList from './CafeList';

const OwnerDashboard = () => {
  // currently borrowing from Profile.jsx + using CafeList component
  // FIXME: Cafelist does not display user's owned cafes
  const [userRole, setUserRole] = useState("user"); // State for user role
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
  const [cafeList, setCafeList] = useState([]); // State for cafe list
  const cafesCollectionRef = collection(db, "cafes");

  const user = auth.currentUser;

  // Fetch cafe list from Firebase
  const getCafeList = async () => {
    try {
        const data = await getDocs(cafesCollectionRef);
        const filteredData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setCafeList(filteredData);
    } catch (err) {
        console.error(err);
    }
    };

  // Fetch cafe list when user is logged in
  useEffect(() => {
    if (user) {
      initializeProfile();
      getCafeList();
    }
  }, [user]);

  const initializeProfile = async () => {
    setLoading(true);
    try {
      const userDocRef = doc(db, "profiles", user.uid);
      const userSnapshot = await getDoc(userDocRef);

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
      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      setProfileData((prev) => ({ ...prev, profilePicture: downloadURL }));
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

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

    return(
        <>
          <div className="max-w-md mx-auto mt-10 p-4 border rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Profile</h2>
            {!isEditing ? (
              <div>
                {profileData.profilePicture && (
                  <img
                    src={profileData.profilePicture}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mx-auto mb-4"
                  />
                )}
                <p><strong>Name:</strong> {profileData.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {profileData.role}</p>
                <p><strong>Bio:</strong> {profileData.bio}</p>
                <p><strong>Preferences:</strong> {profileData.preferences}</p>
                <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded" onClick={handleEditToggle}>
                  Edit Profile
                </button>
              </div>
            ) : (
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
                <label>
                  Profile Picture:
                  <input type="file" onChange={handleFileChange} className="border p-2 rounded w-full" disabled={uploading} />
                  {uploading && <p>Uploading...</p>}
                </label>
                <div className="flex gap-2">
                  <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded">Save</button>
                  <button onClick={handleEditToggle} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                </div>
              </div>
            )}
          </div>
          <CafeList cafes={cafeList}/>
        </>
    )
}

export default OwnerDashboard;