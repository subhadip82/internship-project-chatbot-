'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle2, AlertCircle, FileCheck, Zap, CheckCheck } from 'lucide-react';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead?: boolean;
  is_read?: boolean;
  created_at?: Date | string;
  createdAt?: Date | string;
}

interface NotificationsProps {
  notifications: NotificationItem[];
  onDismiss: (id: string) => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead?: () => void;
  isDropdown?: boolean;
  onClose?: () => void;
}

const notificationIcons: Record<string, React.ReactNode> = {
  document_uploaded: <FileCheck className="h-4 w-4 text-blue-500" />,
  document_processed: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
  document_failed: <AlertCircle className="h-4 w-4 text-red-500" />,
  system: <Zap className="h-4 w-4 text-amber-500" />,
};

export default function Notifications({
  notifications,
  onDismiss,
  onMarkRead,
  onMarkAllRead,
  isDropdown = false,
  onClose,
}: NotificationsProps) {
  const unreadCount = notifications.filter((n) => !n.isRead && !n.is_read).length;

  return (
    <div
      className={`rounded-2xl border bg-slate-900/95 p-4 shadow-2xl backdrop-blur-2xl space-y-3 ${
        isDropdown ? 'w-80 sm:w-96 max-h-[480px] flex flex-col' : ''
      }`}
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
        color: 'var(--text-primary)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-1 border-b pb-2.5" style={{ borderColor: 'var(--card-border)' }}>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="h-4 w-4 text-blue-500" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
            )}
          </div>
          <h3 className="text-sm font-semibold tracking-wide" style={{ color: 'var(--text-primary)' }}>
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span className="rounded-full bg-blue-500/15 text-blue-500 border border-blue-500/20 px-2 py-0.5 text-[10px] font-mono font-medium">
              {unreadCount} new
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && onMarkAllRead && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-400 transition font-medium"
              title="Mark all as read"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span>Mark all read</span>
            </button>
          )}
          {isDropdown && onClose && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition p-1 rounded-lg hover:bg-slate-800/50"
              title="Close notifications"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1 max-h-72">
        <AnimatePresence>
          {notifications.length === 0 ? (
            <div className="py-8 text-center" style={{ color: 'var(--text-muted)' }}>
              <Bell className="mx-auto mb-2 h-7 w-7 opacity-30" />
              <p className="text-xs font-medium">No alerts right now</p>
              <p className="text-[11px] opacity-75 mt-0.5">Upload documents or chat to receive updates</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isRead = notif.isRead || notif.is_read || false;
              const dateVal = notif.createdAt || notif.created_at;

              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  onClick={() => onMarkRead(notif.id)}
                  className={`flex cursor-pointer gap-2.5 rounded-xl border p-3 transition-all text-xs ${
                    isRead
                      ? 'border-transparent opacity-75 hover:opacity-100'
                      : 'border-blue-500/40 shadow-sm'
                  }`}
                  style={{
                    backgroundColor: isRead ? 'var(--card-inner)' : 'var(--card-hover)',
                  }}
                >
                  <div className="mt-0.5 flex-shrink-0">
                    {notificationIcons[notif.type] || (
                      <Zap className="h-4 w-4 text-blue-500" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {notif.title}
                      </h4>
                      {dateVal && (
                        <span className="text-[10px] opacity-60 flex-shrink-0">
                          {new Date(dateVal).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                      {notif.message}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDismiss(notif.id);
                    }}
                    className="flex-shrink-0 text-slate-400 hover:text-red-400 p-0.5 rounded transition"
                    title="Dismiss alert"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
