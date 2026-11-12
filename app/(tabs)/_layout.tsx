import { Platform } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HapticTab } from "@/components/haptic-tab";
import { useColors } from "@/hooks/use-colors";

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: "#92A79B",
        tabBarButton: HapticTab,
        tabBarStyle: { height: 61 + bottomPadding, paddingTop: 9, paddingBottom: bottomPadding, backgroundColor: "#FFFFFF", borderTopColor: "#DDEBE2", borderTopWidth: 1 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "700", marginTop: 2 },
      }}
    >
      <Tabs.Screen name="mapa" options={{ title: "Mapa", tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons name={focused ? "map" : "map-outline"} size={24} color={color} /> }} />
      <Tabs.Screen name="denuncias" options={{ title: "Denúncias", tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons name={focused ? "clipboard-text" : "clipboard-text-outline"} size={24} color={color} /> }} />
      <Tabs.Screen name="dados" options={{ title: "Dados", tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons name={focused ? "account" : "account-outline"} size={24} color={color} /> }} />
      <Tabs.Screen name="menu" options={{ href: null, tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="notificacoes" options={{ href: null, tabBarStyle: { display: "none" } }} />
      <Tabs.Screen name="perfil" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
