import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { HiBell, HiCheck, HiX } from 'react-icons/hi';
import { format } from 'date-fns';

interface Notification {
  id: string;
  amount: number;
  createdAt: any;
  message: string;
  read: boolean;
  status: 'success' | 'error' | 'pending';
  type: string;
  userId: string;
}

const Notifications = () => {
  const { currentUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      console.log('No current user found');
      return;
    }

    console.log('Current user ID:', currentUser.uid);

    // Query notifications from the user's notifications subcollection
    const notificationsRef = collection(db, 'users', currentUser.uid, 'notifications');
    console.log('Notifications collection path:', `users/${currentUser.uid}/notifications`);

    const q = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    console.log('Setting up notifications listener...');

    // Set up real-time listener
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Received snapshot with', snapshot.docs.length, 'notifications');
      
      if (snapshot.empty) {
        console.log('No notifications found in the collection');
      }

      const newNotifications = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Notification data:', { id: doc.id, ...data });
        return {
          id: doc.id,
          ...data
        };
      }) as Notification[];
      
      setNotifications(newNotifications);
      const unread = newNotifications.filter(n => !n.read).length;
      console.log('Unread notifications:', unread);
      setUnreadCount(unread);
    }, (error) => {
      console.error('Error in notifications listener:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
    });

    return () => {
      console.log('Cleaning up notifications listener');
      unsubscribe();
    };
  }, [currentUser]);

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'users', currentUser!.uid, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.read);
      const updatePromises = unreadNotifications.map(notification =>
        updateDoc(doc(db, 'users', currentUser!.uid, 'notifications', notification.id), {
          read: true
        })
      );
      await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-blue-600 rounded-full hover:bg-blue-50 transition-colors duration-200 relative"
      >
        <HiBell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg overflow-hidden z-30">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors duration-200 ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.message}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {format(notification.createdAt.toDate(), 'MMM d, yyyy h:mm a')}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(notification.status)}`}>
                            {notification.status}
                          </span>
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              <HiCheck className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Notifications; 