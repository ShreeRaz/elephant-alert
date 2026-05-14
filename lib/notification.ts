import * as Notifications from "expo-notifications";
import { supabase } from "./supabase";

export async function registerPushToken() {
  // 1. Ask permission
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    alert("Notification permission denied!");
    return;
  }

  // 2. Get the push token
  const { data: token } = await Notifications.getExpoPushTokenAsync();
  console.log("Push token:", token);

  // 3. Save to Supabase
  const { error } = await supabase.from("push_tokens").upsert({ token });

  if (error) console.log("Error saving token:", error);
}
