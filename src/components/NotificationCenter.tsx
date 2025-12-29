import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellRing, Check, CheckCheck, MessageCircle, Heart, Star, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationCenterProps {
  children?: React.ReactNode;
}

const iconMap: Record<string, React.ReactNode> = {
  message: <MessageCircle className="w-5 h-5 text-blue-500" />,
  reaction: <Heart className="w-5 h-5 text-pink-500" />,
  badge: <Gift className="w-5 h-5 text-purple-500" />,
  level: <Star className="w-5 h-5 text-yellow-500" />,
};

export function NotificationCenter({ children }: NotificationCenterProps) {
  const {
    notifications,
    unreadCount,
    permission,
    requestPermission,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [open, setOpen] = useState(false);

  const handleEnableNotifications = async () => {
    await requestPermission();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className="relative rounded-full">
            {unreadCount > 0 ? (
              <BellRing className="w-6 h-6 animate-wiggle" />
            ) : (
              <Bell className="w-6 h-6" />
            )}
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 min-w-5 flex items-center justify-center p-0 text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>
        )}
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </SheetTitle>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                <CheckCheck className="w-4 h-4 mr-1" />
                Tout lire
              </Button>
            )}
          </div>
        </SheetHeader>

        {permission !== "granted" && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-2xl bg-primary/10 border border-primary/20"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                <BellRing className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">Activer les notifications</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Reçois une alerte pour chaque nouveau message ou réaction
                </p>
                <Button
                  size="sm"
                  className="mt-3"
                  onClick={handleEnableNotifications}
                >
                  Activer
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-200px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mb-4 opacity-50" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  index={index}
                  onMarkAsRead={() => markAsRead(notification.id)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface NotificationItemProps {
  notification: Notification;
  index: number;
  onMarkAsRead: () => void;
}

function NotificationItem({ notification, index, onMarkAsRead }: NotificationItemProps) {
  const isUnread = !notification.read_at;
  const icon = iconMap[notification.type] || <Bell className="w-5 h-5" />;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "p-4 rounded-2xl transition-colors cursor-pointer",
        isUnread ? "bg-primary/5 border border-primary/10" : "bg-muted/30 hover:bg-muted/50"
      )}
      onClick={onMarkAsRead}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
            isUnread ? "bg-primary/10" : "bg-muted"
          )}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={cn("text-sm", isUnread && "font-medium")}>{notification.title}</p>
            {isUnread && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />}
          </div>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.body}</p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatDistanceToNow(new Date(notification.created_at), {
              addSuffix: true,
              locale: fr,
            })}
          </p>
        </div>
        {isUnread && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAsRead();
            }}
          >
            <Check className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
