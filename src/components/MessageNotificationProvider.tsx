import { useMessageNotifications } from "@/hooks/useMessageNotifications";

export function MessageNotificationProvider() {
  useMessageNotifications();
  return null;
}
