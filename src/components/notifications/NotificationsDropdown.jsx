// src/components/notifications/NotificationsDropdown.jsx
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { db, auth } from '../../config/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  collectionGroup,
  updateDoc,
  doc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const NotificationsDropdown = ({ userRole }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (showDropdown) {
      fetchNotifications();
    }
  }, [showDropdown, userRole]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      let notificationsData = [];

      // Different queries based on user role
      if (userRole === 'admin') {
        // Admin sees recently flagged reviews
        const reportedQuery = query(
          collection(db, "reported"),
          orderBy("dateReported", "desc"),
          limit(5)
        );
        const reportedSnapshot = await getDocs(reportedQuery);
        
        notificationsData = reportedSnapshot.docs.map(doc => ({
          id: doc.id,
          type: 'flagged_review',
          content: `Review from ${doc.data().reportedUser} was flagged`,
          date: doc.data().dateReported,
          cafeId: doc.data().cafeId,
          cafeName: doc.data().cafeName,
          read: doc.data().read || false // Default to false if not set
        }));
      } 
      else if (userRole === 'owner') {
        // Owner sees recent reviews on their cafes
        // First get owner's cafes
        const cafesQuery = query(
          collection(db, "cafes"),
          where("ownerId", "==", userId)
        );
        const cafesSnapshot = await getDocs(cafesQuery);
        
        // Then get recent reviews for each cafe
        const cafePromises = cafesSnapshot.docs.map(async (cafeDoc) => {
          const cafeData = cafeDoc.data();
          const reviewsQuery = query(
            collection(db, "cafes", cafeDoc.id, "reviews"),
            orderBy("date", "desc"),
            limit(3)
          );
          const reviewsSnapshot = await getDocs(reviewsQuery);
          
          return reviewsSnapshot.docs.map(reviewDoc => ({
            id: reviewDoc.id,
            type: 'new_review',
            content: `${reviewDoc.data().user} left a ${reviewDoc.data().rating}-star review`,
            date: reviewDoc.data().date,
            cafeId: cafeDoc.id,
            cafeName: cafeData.name,
            read: reviewDoc.data().notificationRead || false // Use notificationRead field
          }));
        });
        
        const cafeResults = await Promise.all(cafePromises);
        notificationsData = cafeResults.flat();
      } 
      else {
        // Regular user sees activity related to them
        const reviewsQuery = query(
          collectionGroup(db, "reviews"),
          where("userId", "==", userId),
          orderBy("date", "desc"),
          limit(5)
        );
        
        try {
          const reviewsSnapshot = await getDocs(reviewsQuery);
          
          notificationsData = reviewsSnapshot.docs.map(doc => {
            // Getting cafe info requires additional fetching, but we can use the path
            const cafePath = doc.ref.parent.parent.path;
            const cafeId = cafePath.split('/').pop();
            
            return {
              id: doc.id,
              type: 'your_review',
              content: `You left a ${doc.data().rating}-star review`,
              date: doc.data().date,
              cafeId: cafeId,
              read: doc.data().notificationRead || false
            };
          });
        } catch (err) {
          console.error("Error fetching user reviews:", err);
        }
      }
      
      // Sort all notifications by date
      notificationsData.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setNotifications(notificationsData);
      // Calculate unread count
      setUnreadCount(notificationsData.filter(n => !n.read).length);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Update the read status in state first (for immediate UI feedback)
      setNotifications(prevNotifications => 
        prevNotifications.map(n => 
          n.id === notification.id ? { ...n, read: true } : n
        )
      );
      
      // Decrease unread count
      if (!notification.read) {
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      }
      
      // Update in Firestore depending on notification type
      if (notification.type === 'flagged_review' && userRole === 'admin') {
        // For admins, update the read status in the reported collection
        const reportedDocRef = doc(db, "reported", notification.id);
        await updateDoc(reportedDocRef, { read: true });
        
        navigate('/admin');
      } else if (notification.type === 'new_review' && userRole === 'owner') {
        // For cafe owners, update the notificationRead field in the review
        const reviewDocRef = doc(db, "cafes", notification.cafeId, "reviews", notification.id);
        await updateDoc(reviewDocRef, { notificationRead: true });
        
        navigate(`/cafe/${notification.cafeId}`);
      } else if (notification.type === 'your_review') {
        // For users viewing their own reviews
        // First we need to find the review's document reference
        const reviewsQuery = query(
          collectionGroup(db, "reviews"),
          where("userId", "==", auth.currentUser.uid),
          where("date", "==", notification.date)
        );
        
        const reviewsSnapshot = await getDocs(reviewsQuery);
        if (!reviewsSnapshot.empty) {
          const reviewDocRef = reviewsSnapshot.docs[0].ref;
          await updateDoc(reviewDocRef, { notificationRead: true });
        }
        
        if (notification.cafeId) {
          navigate(`/cafe/${notification.cafeId}`);
        }
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // If there's an error, revert the UI change
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Update all notifications in state
      setNotifications(prevNotifications => 
        prevNotifications.map(n => ({ ...n, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
      
      // Update in Firestore
      const updatePromises = notifications
        .filter(n => !n.read)
        .map(notification => {
          if (notification.type === 'flagged_review') {
            const reportedDocRef = doc(db, "reported", notification.id);
            return updateDoc(reportedDocRef, { read: true });
          } else if (notification.type === 'new_review' || notification.type === 'your_review') {
            // Need to find the review document reference
            // This simplified version assumes we already have the cafeId and reviewId
            if (notification.cafeId && notification.id) {
              const reviewDocRef = doc(db, "cafes", notification.cafeId, "reviews", notification.id);
              return updateDoc(reviewDocRef, { notificationRead: true });
            }
          }
          return Promise.resolve(); // For any notifications we can't update
        });
      
      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      // If there's an error, refresh the notifications
      fetchNotifications();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // Otherwise show date
    return date.toLocaleDateString();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative text-white p-2 rounded-full hover:bg-[#4A3C36] transition-colors"
        aria-label="Notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-50">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllAsRead}
                className="text-sm text-white-600"
              >
                Mark all as read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin h-5 w-5 border-2 border-[#6B7AEE] border-t-transparent rounded-full mx-auto mb-2"></div>
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start">
                    {/* Notification icon based on type */}
                    <div className="mr-3">
                      {notification.type === 'flagged_review' ? (
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 6a3 3 0 013-3h10a1 1 0 01.8 1.6L14.25 8l2.55 3.4A1 1 0 0116 13H6a1 1 0 00-1 1v3a1 1 0 11-2 0V6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : notification.type === 'new_review' ? (
                        <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{notification.content}</p>
                      {notification.cafeName && (
                        <p className="text-xs text-gray-600 mt-1">
                          {notification.cafeName}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(notification.date)}
                      </p>
                    </div>
                    
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;