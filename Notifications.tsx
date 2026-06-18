/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Bell, Check, X, ShieldAlert, CheckCircle, Info, Ticket } from 'lucide-react';
import { SystemNotification } from '../types';
import { RealtimeDB } from '../utils/db';

interface NotificationsProps {
  notifications: SystemNotification[];
  onRefresh: () => void;
  darkMode: boolean;
}

export function Notifications({ notifications, onRefresh, darkMode }: NotificationsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const list = RealtimeDB.getNotifications();
    const updated = list.map((n) => ({ ...n, read: true }));
    RealtimeDB.saveNotifications(updated);
    onRefresh();
  };

  const clearAll = () => {
    RealtimeDB.saveNotifications([]);
    onRefresh();
  };

  const deleteNotif = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const list = RealtimeDB.getNotifications();
    const updated = list.filter((n) => n.id !== id);
    RealtimeDB.saveNotifications(updated);
    onRefresh();
  };

  return (
    <div className="relative z-40" id="notification_comp">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-full transition-all duration-200 cursor-pointer ${
          darkMode ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
        }`}
        id="btn_notification_bell"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white leading-none">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40 cursor-default" onClick={() => setIsOpen(false)} />

          {/* Dropdown Card */}
          <div
            className={`absolute right-0 mt-2 w-80 sm:w-96 rounded-xl shadow-2xl border z-50 overflow-hidden transform origin-top-right transition-all duration-200 ${
              darkMode
                ? 'bg-gray-900 border-gray-800 text-white'
                : 'bg-white border-gray-100 text-gray-800'
            }`}
            id="notification_dropdown"
          >
            {/* Header */}
            <div className={`p-4 flex items-center justify-between border-b ${
              darkMode ? 'border-gray-800 bg-gray-950' : 'border-gray-100 bg-gray-50'
            }`}>
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-emerald-500" />
                Notifikasi Realtime
              </h3>
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-emerald-500 hover:text-emerald-400 font-medium btn"
                  >
                    Tandai Semua Dibaca
                  </button>
                )}
                <button
                  onClick={clearAll}
                  className="text-xs text-gray-400 hover:text-red-400 btn"
                >
                  Hapus
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-xs">
                  Tidak ada notifikasi aktif.
                </div>
              ) : (
                notifications.map((n) => {
                  let Icon = Info;
                  let iconColor = 'text-blue-500 bg-blue-500/10';
                  if (n.type === 'success') {
                    Icon = CheckCircle;
                    iconColor = 'text-emerald-500 bg-emerald-500/10';
                  } else if (n.type === 'warning') {
                    Icon = ShieldAlert;
                    iconColor = 'text-amber-500 bg-amber-500/10';
                  } else if (n.type === 'error') {
                    Icon = X;
                    iconColor = 'text-red-500 bg-red-500/10';
                  }

                  return (
                    <div
                      key={n.id}
                      className={`p-3 text-xs flex gap-3 transition-colors duration-150 relative group ${
                        !n.read
                          ? darkMode
                            ? 'bg-emerald-950/10 hover:bg-emerald-950/20'
                            : 'bg-emerald-50/40 hover:bg-emerald-50/70'
                          : darkMode
                          ? 'hover:bg-gray-800/50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`p-1.5 h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 pr-6">
                        <p className={`font-semibold ${!n.read ? 'text-gray-950 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
                          {n.title}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                        <span className="text-[10px] text-gray-400 block mt-1">
                          {new Date(n.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} - {new Date(n.timestamp).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                      <button
                        onClick={(e) => deleteNotif(n.id, e)}
                        className="absolute right-2 top-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-100 transition-all duration-150"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Simple floating Toast Notification Component
export function Toast({ message, type, onClose }: { message: string; type: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl font-medium text-xs border animate-slide-in-up text-white ${
        type === 'success'
          ? 'bg-emerald-600 border-emerald-500'
          : type === 'error'
          ? 'bg-red-600 border-red-500'
          : 'bg-gray-800 border-gray-700'
      }`}
      id="toast_alert"
    >
      {type === 'success' ? (
        <CheckCircle className="w-4 h-4 text-emerald-100 animate-bounce" />
      ) : (
        <Info className="w-4 h-4 text-red-100" />
      )}
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-80">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
