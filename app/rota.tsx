import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";

import { MapaCaminhoes } from "@/components/mapa-caminhoes";
import { ScreenContainer } from "@/components/screen-container";
import { useDemo } from "@/lib/demo-store";
import { useTruckSocket } from "@/hooks/use-truck-socket";

export default function RouteScreen() {
  const { profile } = useDemo();
  const { trucks, nearestTruck } = useTruckSocket();

  const distanceFormatted = nearestTruck
    ? nearestTruck.distanceMeters >= 1000
      ? `${(nearestTruck.distanceMeters / 1000).toFixed(1).replace(".", ",")} km`
      : `${nearestTruck.distanceMeters} m`
    : "—";

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 8, paddingBottom: 35 }}>
        <View className="flex-row items-center justify-between py-2">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Voltar para o mapa"
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/mapa"))}
            activeOpacity={0.7}
            className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface"
          >
            <MaterialCommunityIcons name="arrow-left" size={21} color="#2E4A3D" />
          </TouchableOpacity>
          <View className="items-center"><Text className="text-[15px] font-bold text-foreground">Acompanhar rota</Text><Text className="mt-0.5 text-[11px] text-muted">Visão ampliada</Text></View>
          <View className="w-11" />
        </View>

        <View className="mt-5"><MapaCaminhoes trucks={trucks} address={profile.address} height={520} /></View>

        {nearestTruck ? <View className="mt-4 rounded-[24px] border border-[#CFE5D6] bg-[#EAF5EE] p-4">
          <View className="flex-row items-center justify-between"><View className="flex-row items-center gap-2"><View className="h-9 w-9 items-center justify-center rounded-full bg-primary"><MaterialCommunityIcons name="truck-outline" size={19} color="#FFFFFF" /></View><Text className="text-[15px] font-bold text-foreground">{nearestTruck.label}</Text></View><Text className="text-[13px] font-bold text-primary">Em aproximação</Text></View>
          <View className="mt-4 flex-row gap-3"><View className="flex-1 rounded-[18px] bg-surface p-3"><Text className="text-[11px] font-bold uppercase tracking-[0.7px] text-muted">Distância</Text><Text className="mt-1 text-[21px] font-bold text-foreground">{distanceFormatted}</Text></View><View className="flex-1 rounded-[18px] bg-surface p-3"><Text className="text-[11px] font-bold uppercase tracking-[0.7px] text-muted">Chegada</Text><Text className="mt-1 text-[21px] font-bold text-foreground">{nearestTruck.etaMinutes} min</Text></View></View>
        </View> : null}

        <View className="mt-6 flex-row items-start rounded-[20px] border border-border bg-surface p-4"><MaterialCommunityIcons name="information-outline" size={21} color="#47745B" /><Text className="ml-2.5 flex-1 text-[13px] leading-5 text-muted">A posição dos caminhões é atualizada automaticamente enquanto você acompanha a rota.</Text></View>
      </ScrollView>
    </ScreenContainer>
  );
}
