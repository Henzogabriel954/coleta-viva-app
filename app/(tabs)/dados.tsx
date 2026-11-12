import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/screen-header";
import { useDemo } from "@/lib/demo-store";
import { requestDemoNotificationPermission, sendDemoNotification } from "@/services/notifications";

function DetailRow({ icon, label, value }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: string }) {
  return (
    <View className="flex-row items-center border-b border-border py-4">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-[14px] bg-[#EAF5EE]">
        <MaterialCommunityIcons name={icon} size={21} color="#47745B" />
      </View>
      <View className="flex-1">
        <Text className="text-[12px] font-bold uppercase tracking-[0.7px] text-muted">{label}</Text>
        <Text className="mt-1 text-[15px] font-semibold leading-5 text-foreground">{value}</Text>
      </View>
    </View>
  );
}

export default function DataScreen() {
  const { profile, updateNotificationPreference } = useDemo();

  const toggleNotifications = async (enabled: boolean) => {
    if (!enabled) {
      await updateNotificationPreference(false);
      return;
    }
    const granted = await requestDemoNotificationPermission();
    if (!granted) {
      Alert.alert("Avisos desativados", "Você pode permitir os avisos nas configurações do dispositivo.");
      await updateNotificationPreference(false);
      return;
    }
    await updateNotificationPreference(true);
    await sendDemoNotification();
  };

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 13, paddingBottom: 35 }}>
        <ScreenHeader eyebrow="Minha conta" title="Dados" />
        <Text className="mt-4 text-[15px] leading-6 text-muted">Confira os dados usados para personalizar sua experiência e os avisos da coleta.</Text>

        <View className="mt-7 items-center rounded-[26px] border border-border bg-surface p-5">
          <View className="h-[76px] w-[76px] items-center justify-center rounded-full bg-primary">
            <Text className="text-[28px] font-bold text-white">{(profile?.name || "M").slice(0, 1).toUpperCase()}</Text>
          </View>
          <Text className="mt-3 text-[20px] font-bold text-foreground">{profile?.name || "Morador"}</Text>
          <Text className="mt-1 text-[13px] text-muted">{profile?.address ? profile.address.split("—")[0].trim() : "Conta de morador"}</Text>
        </View>

        <Text className="mt-7 text-[13px] font-bold uppercase tracking-[1.1px] text-muted">Informações pessoais</Text>
        <View className="mt-2 rounded-[22px] border border-border bg-surface px-4">
          <DetailRow icon="account-outline" label="Nome completo" value={profile?.name || "Não informado"} />
          {profile?.email ? <DetailRow icon="email-outline" label="E-mail" value={profile.email} /> : null}
          <DetailRow icon="phone-outline" label="Telefone" value={profile?.phone || "Não informado"} />
          <DetailRow icon="map-marker-outline" label="Endereço cadastrado" value={profile?.address || "Não informado"} />
        </View>

        <View className="mt-6">
          <TouchableOpacity accessibilityRole="button" onPress={() => router.push({ pathname: "/(auth)/cadastro", params: { edit: "true" } })} activeOpacity={0.82} className="min-h-[54px] flex-row items-center justify-center gap-2 rounded-2xl bg-primary">
            <MaterialCommunityIcons name="pencil-outline" size={20} color="#FFFFFF" />
            <Text className="text-[15px] font-bold text-white">Editar meus dados</Text>
          </TouchableOpacity>
        </View>

        <View className="mt-5 flex-row items-center rounded-[19px] border border-border bg-surface p-3.5">
          <View className="mr-3 h-10 w-10 items-center justify-center rounded-[14px] bg-[#FFF6DF]"><MaterialCommunityIcons name="bell-outline" size={21} color="#8A6A2E" /></View>
          <View className="flex-1 pr-3"><Text className="text-[14px] font-bold text-foreground">Avisos de coleta</Text><Text className="mt-0.5 text-[12px] leading-4 text-muted">Receba atualizações sobre sua rua</Text></View>
          <Switch value={profile.notificationsEnabled} onValueChange={toggleNotifications} trackColor={{ false: "#DDEBE2", true: "#A8D5BA" }} thumbColor={profile.notificationsEnabled ? "#7FB69E" : "#FFFFFF"} />
        </View>

        <View className="mt-5 flex-row rounded-[19px] border border-[#CFE5D6] bg-[#EEF8F0] p-3.5">
          <MaterialCommunityIcons name="shield-check-outline" size={21} color="#47745B" />
          <Text className="ml-2.5 flex-1 text-[12px] leading-5 text-muted">Seus dados ficam associados ao seu endereço para que os avisos sejam mais úteis para você.</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
