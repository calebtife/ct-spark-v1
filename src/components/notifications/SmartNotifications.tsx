import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { HiBell, HiExclamationTriangle, HiInformationCircle, HiCheckCircle } from 'react-icons/hi';
import { usePWA } from '../../hooks/usePWA';

interface SmartNotification {
  id: string;
  type: 'usage_alert' | 'plan_expiry' | 'maintenance' | 'promotion';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  createdAt: any;
  actionUrl?: string;
}

const SmartNotifications: React.FC = () => {
  const { currentUser } = useAuth();
  const { requestNotificationPermission } = usePWA();
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!currentUser) return;

    // Request notification permission
    requestNotificationPermission();

    // Listen for notifications
    const notificationsRef = collection(db, 'users', currentUser.uid, 'notifications');
    const q = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as SmartNotification[];

      setNotifications(newNotifications);
      setUnreadCount(newNotifications.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [currentUser, requestNotificationPermission]);

  // Simulate smart notifications based on usage patterns
  useEffect(() => {
    if (!currentUser) return;

    const checkUsagePatterns = async () => {
      // This would normally check actual usage data
      // For demo purposes, we'll create sample notifications
      const sampleNotifications = [
        {
          type: 'usage_alert' as const,
          title: 'Data Usage Alert',
          message: 'You have used 75% of your monthly data allowance',
          priority: 'medium' as const,
          read: false,
          createdAt: new Date()
        },
        {
          type: 'plan_expiry' as const,
          title: 'Plan Expiring Soon',
          message: 'Your current plan expires in 3 days. Renew now to avoid interruption.',
          priority: 'high' as const,
          read: false,
          createdAt: new Date(),
          actionUrl: '/plans'
        }
      ];

      // Add notifications to Firestore (in a real app, this would be done server-side)
      // This is just for demonstration
    };

    // Check patterns every hour
    const interval = setInterval(checkUsagePatterns, 3600000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const getNotificationIcon = (type: SmartNotification['type']) => {
    switch (type) {
      case 'usage_alert':
        return <HiExclamationTriangle className="w-5 h-5 text-orange-500" />;
      case 'plan_expiry':
        return <HiExclamationTriangle className="w-5 h-5 text-red-500" />;
      case 'maintenance':
        return <HiInformationCircle className="w-5 h-5 text-blue-500" />;
      case 'promotion':
        return <HiCheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <HiBell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: SmartNotification['priority']) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-orange-500 bg-orange-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Smart Notifications</h3>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <HiBell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 border-l-4 rounded-lg ${getPriorityColor(notification.priority)} ${
                !notification.read ? 'shadow-md' : 'opacity-75'
              }`}
            >
              <div className="flex items-start gap-3">
                {getNotificationIcon(notification.type)}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{notification.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {notification.createdAt?.toDate?.()?.toLocaleString() || 'Just now'}
                    </span>
                    {notification.actionUrl && (
                      <a
                        href={notification.actionUrl}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Take Action →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SmartNotifications;