import { useState, useRef, useEffect } from "react";
import { Bell, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { notificationApi, type NotificationData } from "../../api/notification.api";
import { cn } from "@chambitas/ui";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    const data = await notificationApi.getNotifications(10, 0);
    if (data) {
      setNotifications(data.notifications || []);
      setUnreadCount(data.unread_count || 0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Fetch periodically every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleNotificationClick = async (notification: NotificationData) => {
    if (!notification.read_at) {
      await notificationApi.markAsRead(notification.id);
      // Optimistic update
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }

    setIsOpen(false);

    // Navigate based on type
    try {
      const metadata = JSON.parse(notification.metadata_json || '{}');
      if (notification.type === 'MATCH' && metadata.project_id) {
        navigate(`/employer/projects/${metadata.project_id}`);
      } else if (notification.type === 'APPLICATION' && metadata.project_id) {
        navigate(`/employer/projects/${metadata.project_id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications(); // Refresh on open
        }}
        className="relative p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-500 hover:text-emerald-600 focus:outline-none"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <h3 className="font-bold text-slate-800">Notificaciones</h3>
            {unreadCount > 0 && (
              <span className="text-xs font-black bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                {unreadCount} nuevas
              </span>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="h-8 w-8 mx-auto text-slate-300 mb-3" />
                <p className="text-sm font-medium">No tienes notificaciones</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={cn(
                      "p-4 hover:bg-slate-50 cursor-pointer transition-colors flex gap-3",
                      !notification.read_at ? "bg-emerald-50/50" : ""
                    )}
                  >
                    <div className="mt-1 shrink-0">
                      {!notification.read_at ? (
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className={cn(
                        "text-sm leading-tight",
                        !notification.read_at ? "font-bold text-slate-900" : "font-medium text-slate-600"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider pt-1">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-2 border-t border-slate-100 bg-slate-50">
            <button
              className="w-full py-2 text-xs font-bold text-slate-500 hover:text-emerald-600 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
