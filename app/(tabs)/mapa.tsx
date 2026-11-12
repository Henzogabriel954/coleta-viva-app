import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";

import { AppButton } from "@/components/app-button";
import { MapaCaminhoes } from "@/components/mapa-caminhoes";
import { ScreenContainer } from "@/components/screen-container";
import { useDemo } from "@/lib/demo-store";
import { useTruckSocket } from "@/hooks/use-truck-socket";
import { useState } from "react";

export default function MapScreen() {
  const { profile, notices, markAllNoticesRead } = useDemo();
  const { trucks, nearestTruck } = useTruckSocket();
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);

  const distanceLabel = nearestTruck
    ? nearestTruck.distanceMeters >= 1000
      ? `${(nearestTruck.distanceMeters / 1000).toFixed(1).replace(".", ",")} km`
      : `${nearestTruck.distanceMeters} m`
    : "—";

  const progressPercent = nearestTruck
    ? Math.min(96, Math.max(15, Math.round((1 - Math.min(nearestTruck.distanceMeters, 2000) / 2000) * 100)))
    : 70;

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 12, paddingBottom: 28 }}>
        {/* Top Header: Menu no canto superior esquerdo e Notificações no canto superior direito */}
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Abrir menu"
            onPress={() => router.push("/(tabs)/menu")}
            activeOpacity={0.7}
            className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface shadow-sm"
          >
            <MaterialCommunityIcons name="menu" size={22} color="#2E4A3D" />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Abrir avisos"
            onPress={() => { setIsNoticeOpen(true); void markAllNoticesRead(); }}
            activeOpacity={0.7}
            className="relative h-11 w-11 items-center justify-center rounded-full border border-border bg-surface shadow-sm"
          >
            <MaterialCommunityIcons name="bell-outline" size={22} color="#2E4A3D" />
            {notices.some((notice) => !notice.read) ? (
              <View className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-surface bg-primary" />
            ) : null}
          </TouchableOpacity>
        </View>

        <View className="mt-4">
          <Text className="text-[13px] font-bold uppercase tracking-[1.1px] text-muted">
            Olá, {profile?.name ? profile.name.trim().split(" ")[0] : "Morador"}
          </Text>
          <Text className="mt-1 text-[27px] font-bold leading-[33px] tracking-[-0.6px] text-foreground">
            Sua coleta está a caminho
          </Text>
        </View>

        <View className="mt-6">
          <MapaCaminhoes trucks={trucks} address={profile.address} />
        </View>

        {nearestTruck ? (
          <View className="mt-4 rounded-[24px] border border-[#CFE5D6] bg-[#EAF5EE] p-4">
            <View className="flex-row items-start justify-between">
              <View className="flex-1 pr-3">
                <View className="flex-row items-center gap-2">
                  <View className="h-8 w-8 items-center justify-center rounded-full bg-primary">
                    <MaterialCommunityIcons name="truck-outline" size={18} color="#FFFFFF" />
                  </View>
                  <Text className="text-[15px] font-bold text-foreground">{nearestTruck.label}</Text>
                </View>
                <Text className="mt-3 text-[13px] font-medium text-muted">{nearestTruck.service} · rota atualizada</Text>
              </View>
              <View className="rounded-2xl bg-surface px-3 py-2">
                <Text className="text-center text-[20px] font-bold text-foreground">{distanceLabel}</Text>
                <Text className="text-center text-[11px] font-bold text-muted">até você</Text>
              </View>
            </View>
            <View className="mt-4 h-1.5 overflow-hidden rounded-full bg-[#D3E9D9]">
              <View style={{ width: `${progressPercent}%` }} className="h-full rounded-full bg-primary" />
            </View>
            <Text className="mt-2 text-[12px] font-medium text-muted">Estimativa de chegada: {nearestTruck.etaMinutes} min</Text>
          </View>
        ) : (
          <View className="mt-4 rounded-[24px] border border-border bg-surface p-5 items-center">
            <MaterialCommunityIcons name="truck-outline" size={28} color="#92A79B" />
            <Text className="mt-2 text-[14px] font-bold text-muted">Carregando informações da rota…</Text>
          </View>
        )}

        <View className="mt-7 flex-row items-center justify-between">
          <Text className="text-[19px] font-bold text-foreground">Ações rápidas</Text>
          <Text className="text-[12px] font-bold text-muted">Resolva em poucos toques</Text>
        </View>
        <View className="mt-3 flex-row gap-3">
          <TouchableOpacity accessibilityRole="button" onPress={() => router.push("/denuncia/nova")} activeOpacity={0.78} className="flex-1 rounded-[22px] border border-border bg-surface p-4">
            <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-warning">
              <MaterialCommunityIcons name="camera-outline" size={22} color="#765B25" />
            </View>
            <Text className="mt-3 text-[14px] font-bold text-foreground">Denunciar descarte</Text>
            <Text className="mt-1 text-[12px] leading-4 text-muted">Ajude a cuidar da rua.</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityRole="button" onPress={() => router.push("/(tabs)/dados")} activeOpacity={0.78} className="flex-1 rounded-[22px] border border-border bg-surface p-4">
            <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-[#EAF5EE]">
              <MaterialCommunityIcons name="account-edit-outline" size={22} color="#47745B" />
            </View>
            <Text className="mt-3 text-[14px] font-bold text-foreground">Editar meus dados</Text>
            <Text className="mt-1 text-[12px] leading-4 text-muted">Atualize seu endereço.</Text>
          </TouchableOpacity>
        </View>
        <View className="mt-6">
          <AppButton label="Acompanhar rota no mapa" variant="secondary" onPress={() => router.push("/rota")} />
        </View>
      </ScrollView>

      <Modal visible={isNoticeOpen} transparent animationType="fade" onRequestClose={() => setIsNoticeOpen(false)}>
        <View className="flex-1 items-center bg-[#2E4A3D]/25 px-4 pt-16">
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Fechar avisos" onPress={() => setIsNoticeOpen(false)} activeOpacity={1} className="absolute inset-0" />
          <View className="w-full max-w-[360px] rounded-[24px] border border-border bg-background p-4 shadow-lg">
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="text-[18px] font-bold text-foreground">Avisos</Text>
                <Text className="mt-0.5 text-[12px] text-muted">Atualizações da sua coleta</Text>
              </View>
              <TouchableOpacity accessibilityRole="button" onPress={() => setIsNoticeOpen(false)} className="h-9 w-9 items-center justify-center rounded-full bg-surface">
                <MaterialCommunityIcons name="close" size={18} color="#2E4A3D" />
              </TouchableOpacity>
            </View>
            <View className="mt-3 gap-2">
              {notices.length === 0 ? (
                <View className="items-center py-4">
                  <Text className="text-[13px] text-muted">Nenhum aviso no momento.</Text>
                </View>
              ) : (
                notices.slice(0, 3).map((notice) => (
                  <View key={notice.id} className="rounded-[16px] border border-border bg-surface p-3">
                    <Text className="text-[13px] font-bold text-foreground">{notice.title}</Text>
                    <Text className="mt-1 text-[12px] leading-4 text-muted">{notice.body}</Text>
                    <Text className="mt-2 text-[11px] font-bold text-muted">{notice.time}</Text>
                  </View>
                ))
              )}
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                setIsNoticeOpen(false);
                router.push("/(tabs)/notificacoes");
              }}
              activeOpacity={0.7}
              className="mt-3 items-center py-2"
            >
              <Text className="text-[13px] font-bold text-primary">Ver todos os avisos</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
