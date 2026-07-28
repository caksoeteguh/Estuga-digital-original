import { useState, useEffect } from 'react';
import { AppNotification } from '../types';
import { loadFromStorage, saveToStorage } from '../mockData';

export const useNotifications = (recipientId: string, role: string) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!recipientId && !role) return;

    const fetchLocalNotifs = () => {
      const allNotifs: AppNotification[] = loadFromStorage('app_notifications', []);
      const userNotifs = allNotifs.filter(n => 
        n.recipientId === recipientId || n.recipientId === role || n.recipientId === 'all'
      ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setNotifications(userNotifs);
    };
    
    fetchLocalNotifs();
    
    const interval = setInterval(fetchLocalNotifs, 2000);
    return () => clearInterval(interval);
  }, [recipientId, role]);

  const markAsRead = async (notificationId: string) => {
    const allNotifs: AppNotification[] = loadFromStorage('app_notifications', []);
    const updated = allNotifs.map(n => n.id === notificationId ? { ...n, read: true } : n);
    saveToStorage('app_notifications', updated);
  };

  const markAllAsRead = async () => {
    const allNotifs: AppNotification[] = loadFromStorage('app_notifications', []);
    const updated = allNotifs.map(n => 
      (n.recipientId === recipientId || n.recipientId === role || n.recipientId === 'all') 
        ? { ...n, read: true } 
        : n
    );
    saveToStorage('app_notifications', updated);
  };

  return { notifications, markAsRead, markAllAsRead };
};

export const sendNotification = (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
  const allNotifs: AppNotification[] = loadFromStorage('app_notifications', []);
  const newNotif: AppNotification = {
    ...notification,
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toISOString(),
    read: false,
  };
  
  const updated = [...allNotifs, newNotif];
  saveToStorage('app_notifications', updated);
};
