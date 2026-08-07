import { EmailNotificationProvider } from "@/lib/notifications/email";
import type { NotificationProvider } from "@/lib/notifications/types";

export function getNotificationProvider(): NotificationProvider {
  return EmailNotificationProvider;
}
