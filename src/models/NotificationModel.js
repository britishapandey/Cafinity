// src/models/NotificationModel.js
import { db } from '../config/firebase';
import { 
  collection, 
  addDoc, 
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  limit,
  Timestamp,
  deleteDoc
} from 'firebase/firestore';

// Function to create a new notification in Firestore
export const createNotification = async (notification) => {
  try {
    // Ensure required fields are present
    if (!notification.userId || !notification.type || !notification.content) {
      throw new Error('Missing required notification fields');
    }

    // Add date if not provided
    if (!notification.date) {
      notification.date = Timestamp.now();
    }

    // Default read status
    if (notification.read === undefined) {
      notification.read = false;
    }

    // Add notification to Firestore
    const notificationsRef = collection(db, "notifications");
    const docRef = await addDoc(notificationsRef, notification);
    
    return { ...notification, id: docRef.id };
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Function to get notifications for a user
export const getUserNotifications = async (userId, options = {}) => {
  try {
    const { limit: queryLimit = 20, markAsRead = false, onlyUnread = false } = options;
    
    // Create query to get user's notifications
    let notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("date", "desc"),
      limit(queryLimit)
    );
    
    // Add filter for unread notifications if requested
    if (onlyUnread) {
      notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        where("read", "==", false),
        orderBy("date", "desc"),
        limit(queryLimit)
      );
    }
    
    const querySnapshot = await getDocs(notificationsQuery);
    
    // Process notifications
    const notifications = [];
    for (const docSnapshot of querySnapshot.docs) {
      const notification = {
        id: docSnapshot.id,
        ...docSnapshot.data(),
        // Convert Firestore timestamps to JS Date
        date: docSnapshot.data().date.toDate().toISOString()
      };
      
      notifications.push(notification);
      
      // Mark as read if requested
      if (markAsRead && !notification.read) {
        await updateDoc(doc(db, "notifications", notification.id), {
          read: true
        });
      }
    }
    
    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    throw error;
  }
};

// Function to mark a notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      read: true
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Function to mark all notifications for a user as read
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const unreadQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("read", "==", false)
    );
    
    const querySnapshot = await getDocs(unreadQuery);
    
    // Create a batch of update operations
    const updatePromises = querySnapshot.docs.map(docSnapshot => 
      updateDoc(doc(db, "notifications", docSnapshot.id), { read: true })
    );
    
    await Promise.all(updatePromises);
    
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Function to delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    await deleteDoc(doc(db, "notifications", notificationId));
    return true;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

// Function to clear all notifications for a user
export const clearAllNotifications = async (userId) => {
  try {
    const userNotificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );
    
    const querySnapshot = await getDocs(userNotificationsQuery);
    
    const deletePromises = querySnapshot.docs.map(docSnapshot => 
      deleteDoc(doc(db, "notifications", docSnapshot.id))
    );
    
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error('Error clearing notifications:', error);
    throw error;
  }
};

// Utility function to create review notification for cafe owners
export const createReviewNotification = async (review, cafeId, cafeName, ownerId) => {
  try {
    const notification = {
      userId: ownerId,
      type: 'new_review',
      content: `${review.user} left a ${review.rating}-star review`,
      cafeId,
      cafeName,
      reviewId: review.id,
      date: Timestamp.now(),
      read: false
    };
    
    return await createNotification(notification);
  } catch (error) {
    console.error('Error creating review notification:', error);
    throw error;
  }
};

// Utility function to create flagged review notification for admins
export const createFlaggedReviewNotification = async (report, adminIds) => {
  try {
    // Create a notification for each admin
    const notificationPromises = adminIds.map(adminId => {
      const notification = {
        userId: adminId,
        type: 'flagged_review',
        content: `Review from ${report.reportedUser} was flagged`,
        cafeId: report.cafeId,
        cafeName: report.cafeName,
        reportId: report.id,
        date: Timestamp.now(),
        read: false
      };
      
      return createNotification(notification);
    });
    
    await Promise.all(notificationPromises);
    return true;
  } catch (error) {
    console.error('Error creating flagged review notification:', error);
    throw error;
  }
};