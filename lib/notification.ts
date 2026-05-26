import messaging from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { supabase } from "./supabase";


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerPushToken(): Promise<string | null> {
  try {

    const authStatus = await messaging().requestPermission();
    const granted =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!granted) {
      console.warn("❌ Notification permission denied");
      return null;
    }

    // 2. Create Android notification channel
    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("elephant_alerts", {
        name:             "Elephant Alerts",
        importance:       Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 300, 200, 300],
        lightColor:       "#f97316",
        sound:            "default",
        enableVibrate:    true,
        showBadge:        true,
      });
    }

    // 3. Get FCM token (not Expo token)
    const token = await messaging().getToken();
    if (!token) {
      console.error("❌ Failed to get FCM token");
      return null;
    }

    console.log("✅ FCM token:", token);

    // 4. Save to Supabase
    const { error } = await supabase
      .from("push_tokens")
      .upsert(
        {
          token,
          platform:   Platform.OS,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "token" }
      );

    if (error) console.error("❌ Failed to save token:", error);
    else       console.log("✅ Token saved to Supabase");

    return token;
  } catch (err) {
    console.error("❌ registerPushToken error:", err);
    return null;
  }
}

export function setupNotificationListeners(
  onTap: (data: Record<string, unknown>) => void
): () => void {
  // App killed → opened by tapping notification
  messaging()
    .getInitialNotification()
    .then((msg) => {
      if (msg?.data) onTap(msg.data as Record<string, unknown>);
    });

  // App backgrounded → user taps notification
  const unsubBackground = messaging().onNotificationOpenedApp((msg) => {
    if (msg?.data) onTap(msg.data as Record<string, unknown>);
  });

  // App foregrounded → show via expo-notifications
  const unsubForeground = messaging().onMessage(async (msg) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: msg.notification?.title ?? "🐘 Elephant Alert!",
        body:  msg.notification?.body  ?? "Elephant spotted nearby",
        data:  msg.data ?? {},
        sound: "default",
      },
      trigger: null,
    });
  });

  // Token refresh — update Supabase if token changes
  const unsubTokenRefresh = messaging().onTokenRefresh(async (newToken) => {
    console.log("🔄 FCM token refreshed:", newToken);
    await supabase
      .from("push_tokens")
      .upsert(
        { token: newToken, platform: Platform.OS, updated_at: new Date().toISOString() },
        { onConflict: "token" }
      );
  });

  return () => {
    unsubBackground();
    unsubForeground();
    unsubTokenRefresh();
  };
}