// src/context/NotificationsContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  collectionGroup,
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore';

// Create the context
const NotificationsContext = createContext();

// Hook to use the notifications context
export const useNotifications = () => {
  return useContext(NotificationsContext);
};

// Provider component
export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState(null);
  
  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Get user role
          const userDoc = await getDocs(query(collection(db, "profiles"), where("email", "==", user.email)));
          if (!userDoc.empty) {
            setUserRole(userDoc.docs[0].data().role);
          } else {
            setUserRole("user");
          }
          
          // Set up listeners for notifications based on role
          setupNotificationListeners(user.uid);
        } catch (error) {
          console.error("Error getting user role:", error);
          setUserRole("user");
        }
      } else {
        setNotifications([]);
        setUnreadCount(0);
        setUserRole(null);
      }
    });
    
    return () => {
      unsubscribeAuth();
    };
  }, []);
  
  useEffect(() => {
    // Update unread count whenever notifications change
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);
  
  const setupNotificationListeners = (userId) => {
    if (!userId || !userRole) return;
    
    setLoading(true);
    
    let unsubscribe;
    
    // Different listeners based on user role
    if (userRole === 'admin') {
      // Admin: Listen for reported reviews
      unsubscribe = onSnapshot(
        query(
          collection(db, "reported"),
          orderBy("dateReported", "desc"),
          limit(10)
        ),
        (snapshot) => {
          const notificationsData = snapshot.docs.map(doc => ({
            id: doc.id,
            type: 'flagged_review',
            content: `Review from ${doc.data().reportedUser} was flagged`,
            date: doc.data().dateReported,
            cafeId: doc.data().cafeId,
            cafeName: doc.data().cafeName || 'Unknown Cafe',
            read: false
          }));
          
          setNotifications(notificationsData);
          setLoading(false);
        },
        (error) => {
          console.error("Error setting up admin notifications:", error);
          setLoading(false);
        }
      );
    } 
    else if (userRole === 'owner') {
      // First get all cafes owned by the user
      getDocs(query(collection(db, "cafes"), where("ownerId", "==", userId)))
        .then((cafesSnapshot) => {
          const cafeIds = cafesSnapshot.docs.map(doc => doc.id);
          
          if (cafeIds.length === 0) {
            setNotifications([]);
            setLoading(false);
            return;
          }
          
          // Set up a listener for each cafe's reviews
          const cafeListeners = cafeIds.map(cafeId => {
            return onSnapshot(
              query(
                collection(db, "cafes", cafeId, "reviews"),
                orderBy("date", "desc"),
                limit(5)
              ),
              (reviewsSnapshot) => {
                const cafeData = cafesSnapshot.docs.find(doc => doc.id === cafeId)?.data();
                const cafeNotifications = reviewsSnapshot.docs.map(doc => ({
                  id: doc.id,
                  type: 'new_review',
                  content: `${doc.data().user} left a ${doc.data().rating}-star review`,
                  date: doc.data().date,
                  cafeId: cafeId,
                  cafeName: cafeData?.name || 'Your Cafe',
                  read: false
                }));
                
                // Update the notifications state, merging with existing
                setNotifications(prev => {
                  // Filter out existing notifications for this cafe
                  const otherCafeNotifications = prev.filter(n => n.cafeId !== cafeId);
                  // Merge with new notifications
                  return [...otherCafeNotifications, ...cafeNotifications]
                    .sort((a, b) => new Date(b.date) - new Date(a.date));
                });
                
                setLoading(false);
              },
              (error) => {
                console.error(`Error setting up notifications for cafe ${cafeId}:`, error);
                setLoading(false);
              }
            );
          });
          
          // Store unsubscribe functions for cleanup
          unsubscribe = () => {
            cafeListeners.forEach(listener => listener());
          };
        })
        .catch(error => {
          console.error("Error getting owner cafes:", error);
          setLoading(false);
        });
    } 
    else {
      // Regular user: Listen for activity on their reviews
      unsubscribe = onSnapshot(
        query(
          collectionGroup(db, "reviews"),
          where("userId", "==", userId),
          orderBy("date", "desc"),
          limit(10)
        ),
        (snapshot) => {
          const notificationsData = snapshot.docs.map(doc => {
            const cafePath = doc.ref.parent.parent.path;
            const cafeId = cafePath.split('/').pop();
            
            return {
              id: doc.id,
              type: 'your_review',
              content: `You left a ${doc.data().rating}-star review`,
              date: doc.data().date,
              cafeId: cafeId,
              read: false
            };
          });
          
          setNotifications(notificationsData);
          setLoading(false);
        },
        (error) => {
          console.error("Error setting up user notifications:", error);
          setLoading(false);
        }
      );
    }
    
    // Return cleanup function
    return unsubscribe;
  };
  
  const markAsRead = async (notificationId) => {
    // Find the notification
    const notification = notifications.find(n => n.id === notificationId);
    if (!notification) return;
    
    // Update notification in state
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      )
    );
    
    // In a real app, you'd also update the read status in Firestore
    // This would depend on where you're storing notifications
    // For simplicity, we're just updating local state here
  };
  
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    // Same as above - in a real app, update Firestore accordingly
  };
  
  const value = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead
  };
  
  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};