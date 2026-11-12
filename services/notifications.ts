import { Alert, Platform } from "react-native";
import { isRunningInExpoGo } from "expo";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { router } from "expo-router";

// Expo Go on Android does not support expo-notifications (removed in SDK 53+).
// Importing or requiring it in Expo Go on Android throws an unhandled error.
const isExpoGo = isRunningInExpoGo() || Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isUnsupportedPlatform = Platform.OS === "web" || (Platform.OS === "android" && isExpoGo);

let Notifications: typeof import("expo-notifications") | null = null;

function getNotifications(): typeof import("expo-notifications") | null {
  if (isUnsupportedPlatform) {
    return null;
  }
  if (!Notifications) {
    try {
      Notifications = require("expo-notifications");
    } catch (e) {
      console.warn("[Notifications] expo-notifications não pôde ser carregado:", e);
      return null;
    }
  }
  return Notifications;
}

/**
 * Register the foreground notification handler.
 * Must be called as early as possible (root _layout.tsx) so that
 * notifications received while the app is open are displayed correctly.
 */
export function initNotifications() {
  const notif = getNotifications();
  if (!notif) return;

  try {
    notif.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Create Android notification channel at startup so every notification
    // lands in the correct channel regardless of user toggle state.
    if (Platform.OS === "android") {
      void notif.setNotificationChannelAsync("coleta-viva", {
        name: "Avisos de coleta",
        importance: notif.AndroidImportance.HIGH,
        lightColor: "#7FB69E",
      });
    }

    // Listen for notification taps and navigate to the embedded URL.
    notif.addNotificationResponseReceivedListener((response) => {
      const url = response.notification.request.content.data?.url;
      if (typeof url === "string") {
        router.push(url as never);
      }
    });
  } catch (err) {
    console.warn("[Notifications] Erro ao inicializar notificações:", err);
  }
}

export async function requestDemoNotificationPermission(): Promise<boolean> {
  const notif = getNotifications();
  if (!notif) {
    // No Expo Go ou Web, simula concessão para teste fluido da UI
    return true;
  }

  try {
    const current = await notif.getPermissionsAsync();
    if (current.status === "granted") return true;

    const requested = await notif.requestPermissionsAsync();
    return requested.status === "granted";
  } catch (err) {
    console.warn("[Notifications] Erro ao solicitar permissão:", err);
    return true;
  }
}

export async function sendDemoNotification() {
  const notif = getNotifications();
  if (!notif) {
    // Feedback visual quando rodando no Expo Go Android ou Web
    Alert.alert("Aviso de Coleta (Expo Go)", "Caminhão a 500 m de você.");
    return;
  }

  try {
    await notif.scheduleNotificationAsync({
      content: {
        title: "Coleta Viva",
        body: "Caminhão a 500 m de você.",
        data: { url: "/(tabs)/mapa" },
      },
      trigger: { channelId: "coleta-viva" },
    });
  } catch (err) {
    console.warn("[Notifications] Erro ao agendar notificação:", err);
    Alert.alert("Coleta Viva", "Caminhão a 500 m de você.");
  }
}
