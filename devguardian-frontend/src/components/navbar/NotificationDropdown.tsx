import * as React from "react";
import { Bell, Check, Loader2 } from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import { notificationApi } from "@/features/notification/notificationApi";
import { NotificationResponse } from "@/features/notification/notificationTypes";
import { cn } from "@/lib/utils";

import { useNotificationSocket } from "@/hooks/useNotificationSocket";

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);

  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const { user } = useAppSelector((state) => state.auth);
  const userId = user?.userId ? String(user.userId) : "";

  const fetchNotifications = React.useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await notificationApi.getUserNotifications(userId);
      setNotifications(data);
      const count = await notificationApi.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Initial fetch on login/mount
  React.useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, fetchNotifications]);

  // Real-time WebSocket listener (replaces HTTP polling)
  useNotificationSocket({
    userId,
    onNotification: (newNotification) => {
      setNotifications((prev) => [
        newNotification,
        ...prev.filter((n) => n.id !== newNotification.id),
      ]);
      setUnreadCount((prev) => prev + 1);
    },
  });

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!userId) return;
    try {
      await notificationApi.markAllAsRead(userId);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const formatDistanceToNow = (dateString: string) => {
    if (!dateString) return "";
    try {
      let normalized = typeof dateString === "string" ? dateString.trim().replace(" ", "T") : String(dateString);
      // If timestamp is ISO without timezone offset (e.g. 2026-08-19T23:32:14), parse as UTC
      if (!normalized.endsWith("Z") && !/[+-]\d{2}(?::?\d{2})?$/.test(normalized)) {
        normalized += "Z";
      }
      const date = new Date(normalized);
      if (isNaN(date.getTime())) {
        return "";
      }
      const now = new Date();
      const diffMs = Math.max(0, now.getTime() - date.getTime());
      const diffSecs = Math.floor(diffMs / 1000);
      const diffMins = Math.floor(diffSecs / 60);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffSecs < 45) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return "";
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notifications Icon Button */}
      <button
        onClick={handleToggle}
        className={cn(
          "relative p-2.5 bg-[#12121a]/60 hover:bg-[#1a1a2e]/80 border text-muted-foreground hover:text-cyber-cyan hover:border-cyber-cyan/30 transition-all duration-300 cyber-btn-clip cursor-pointer focus:outline-none",
          isOpen ? "border-cyber-cyan/40 text-cyber-cyan shadow-[0_0_8px_rgba(0,240,255,0.2)]" : "border-border/50"
        )}
        aria-label="View notifications"
      >
        <Bell className="h-4 w-4" />
      </button>
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-cyber-pink text-[9px] font-bold text-white flex items-center justify-center animate-pulse shadow-[0_0_8px_#ff007f] font-orbitron pointer-events-none z-10">
          {unreadCount}
        </span>
      )}

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-[#07070c] border border-border rounded-none shadow-2xl overflow-hidden z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-[#0c0c14] border-b border-border flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-widest text-white uppercase font-orbitron">
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[9px] font-semibold text-cyber-cyan hover:text-white uppercase font-mono tracking-wider transition-colors cursor-pointer"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-72 overflow-y-auto divide-y divide-border/60 scrollbar-thin">
            {isLoading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-zinc-500 text-xs font-mono">
                <Loader2 className="h-5 w-5 animate-spin text-cyber-cyan mb-2" />
                <span>RETRIEVING NOTIFICATIONS...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                // No new notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "p-3.5 flex items-start gap-3 transition-colors text-left",
                    n.isRead ? "bg-black/20 hover:bg-black/40" : "bg-[#ff0055]/5 hover:bg-[#ff0055]/10 border-l-2 border-cyber-pink"
                  )}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-[10px] font-bold uppercase tracking-wider font-orbitron",
                        n.isRead ? "text-zinc-400" : "text-white"
                      )}>
                        {n.title}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">
                        {formatDistanceToNow(n.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 font-sans leading-relaxed break-words antialiased">
                      {n.message}
                    </p>
                  </div>

                  {/* Actions */}
                  {!n.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      className="p-1 hover:bg-[#ff0055]/20 text-zinc-500 hover:text-cyber-pink rounded-sm transition-colors cursor-pointer shrink-0 mt-0.5"
                      title="Mark as read"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;
