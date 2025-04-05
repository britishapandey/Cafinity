import React, { useState } from "react";
import { Bell } from "lucide-react";

// Dummy notification data
const dummyNotifications = [
  { id: 1, message: "Alice commented on your review for 'The Cozy Corner'.", timestamp: "2 hours ago", type: "comment" },
  { id: 2, message: "Your review for 'Bean Haven' was published.", timestamp: "1 day ago", type: "review_published" },
  { id: 3, message: "Bob liked your review for 'The Grind'.", timestamp: "3 days ago", type: "like" },
  { id: 4, message: "New cafe added near you: 'Sunrise Brews'.", timestamp: "5 days ago", type: "new_cafe" },
  { id: 5, message: "Your profile information was updated.", timestamp: "1 week ago", type: "profile_update" },
];

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  // Simple function to get an icon based on notification type (optional enhancement)
  const getIconForType = (type) => {
    switch(type) {
        case 'comment': return '💬';
        case 'review_published': return '⭐';
        case 'like': return '❤️';
        case 'new_cafe': return '☕';
        case 'profile_update': return '👤';
        default: return '🔔';
    }
  }

  return (
    // Use relative positioning to anchor the dropdown
    <div className="relative m-4 flex items-center">
      {/* Notification Bell Icon/Button */}
      <button
        onClick={toggleNotifications}
        className="relative text-white focus:outline-none" // Added focus:outline-none
        aria-label="Toggle Notifications"
      >
        <Bell color="#6490E1" />
        {/* Optional: Add a badge for unread notifications */}
        {dummyNotifications.length > 0 && (
          <span className="absolute top-[-5px] right-[-5px] flex h-4 w-4">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs justify-center items-center">
              {dummyNotifications.length}
            </span>
          </span>
        )}
      </button>

      {/* Dropdown List - Conditionally Rendered */}
      {isOpen && (
        <div
            className="absolute top-full right-0 mt-2 w-72 sm:w-80 md:w-96 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200"
            // Optional: Add transition for smoother appearance
            // style={{ transition: 'opacity 0.2s ease-in-out, transform 0.2s ease-in-out' }}
        >
          <div className="py-2 px-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
          </div>
          <div className="max-h-80 overflow-y-auto"> {/* Limit height and enable scroll */}
            {dummyNotifications.length > 0 ? (
              <ul>
                {dummyNotifications.map((notification) => (
                  <li
                    key={notification.id}
                    className="flex items-start p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                     <span className="mr-3 mt-1 text-lg">{getIconForType(notification.type)}</span>
                     <div>
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500">{notification.timestamp}</p>
                     </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-gray-500 py-4 px-2 text-sm">No new notifications.</p>
            )}
          </div>
           <div className="p-2 bg-gray-50 border-t border-gray-200 text-center">
                <button className="text-xs text-blue-600 hover:underline">
                    Mark all as read
                </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;