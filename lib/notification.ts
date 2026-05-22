import { getApp, getApps } from "@react-native-firebase/app";
import {
    getMessaging,
    getToken,
    onMessage,
    onNotificationOpenedApp,
    onTokenRefresh,
} from "@react-native-firebase/messaging";
import { supabase } from "./supabase";

export async function registerPushToken() {
  try {
    // Firebase auto-initializes from google-services.json
    // Just get the default app
    const app = getApps().length > 0 ? getApp() : undefined;
    const messagingInstance = getMessaging(app);

    // 1. Get FCM token
    const token = await getToken(messagingInstance);
    console.log("FCM token:", token);

    // 2. Save to Supabase
    const { error } = await supabase
      .from("push_tokens")
      .upsert({ token }, { onConflict: "token" });

    if (error) console.log("Error saving token:", error);

    // 3. Handle token refresh
    onTokenRefresh(messagingInstance, async (newToken) => {
      await supabase
        .from("push_tokens")
        .upsert({ token: newToken }, { onConflict: "token" });
    });

  } catch (err) {
    console.log("Error registering push token:", err);
  }
}

export function setupNotificationHandlers() {
  try {
    const app = getApps().length > 0 ? getApp() : undefined;
    const messagingInstance = getMessaging(app);

    // Foreground notifications
    onMessage(messagingInstance, async (remoteMessage) => {
      console.log("Foreground notification:", remoteMessage.notification?.title);
    });

    // Background notification tap
    onNotificationOpenedApp(messagingInstance, (remoteMessage) => {
      console.log("Notification opened app:", remoteMessage.notification?.title);
    });

  } catch (err) {
    console.log("Error setting up notification handlers:", err);
  }
}