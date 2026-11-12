import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/screen-header";
import { useDemo } from "@/lib/demo-store";
import { requestDemoNotificationPermission, sendDemoNotification } from "@/services/notifications";

function ProfileRow({ icon, title, description, onPress }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; title: string; description: string; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} activeOpacity={0.7} className="flex-row items-center border-b border-border py-4">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-[14px] bg-[#EAF5EE]">
        <MaterialCommunityIcons name={icon} size={21} color="#47745B" />
      </View>
      <View className="flex-1">
        <Text className="text-[14px] font-bold text-foreground">{title}</Text>
        <Text numberOfLines={1} className="mt-0.5 text-[13px] text-muted">{description}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#A0B0A6" />
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const { profile, updateNotificationPreference, clearDemo } = useDemo();

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      const granted = await requestDemoNotificationPermission();
      if (!granted) {
        Alert.alert("Permissão não concedida", "Você pode ativar os avisos nas configurações do dispositivo quando quiser.");
        await updateNotificationPreference(false);
        return;
      }
      await updateNotificationPreference(true);
      await sendDemoNotification();
      return;
    }
    await updateNotificationPreference(false);
  };

  const restartDemo = () => {
    Alert.alert("Reiniciar demonstração?", "Seus dados locais serão restaurados para o estado de apresentação.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Reiniciar", style: "destructive", onPress: () => void clearDemo() },
    ]);
  };

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 13, paddingBottom: 32 }}>
        <ScreenHeader eyebrow="Sua conta" title="Perfil" />
        <View className="mt-6 flex-row items-center rounded-[24px] border border-border bg-surface p-4">
          <View className="h-[58px] w-[58px] items-center justify-center rounded-full bg-primary">
            <Text className="text-[20px] font-bold text-white">{profile.name.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-[18px] font-bold text-foreground">{profile.name}</Text>
            <Text className="mt-0.5 text-[13px] text-muted">Moradora de Vila Verde</Text>
          </View>
          <TouchableOpacity accessibilityRole="button" onPress={() => router.push("/(auth)/cadastro")} activeOpacity={0.7} className="rounded-xl bg-[#EAF5EE] px-3 py-2">
            <Text className="text-[12px] font-bold text-primary">Editar</Text>
          </TouchableOpacity>
        </View>

        <Text className="mt-7 text-[13px] font-bold uppercase tracking-[1.1px] text-muted">Dados cadastrados</Text>
        <View className="mt-2 rounded-[22px] border border-border bg-surface px-4">
          <ProfileRow icon="map-marker-outline" title="Endereço" description={profile.address} onPress={() => router.push("/(auth)/cadastro")} />
          <ProfileRow icon="phone-outline" title="Telefone" description={profile.phone} onPress={() => router.push("/(auth)/cadastro")} />
        </View>

        <Text className="mt-7 text-[13px] font-bold uppercase tracking-[1.1px] text-muted">Preferências</Text>
        <View className="mt-2 rounded-[22px] border border-border bg-surface px-4 py-1">
          <View className="flex-row items-center py-3.5">
            <View className="mr-3 h-10 w-10 items-center justify-center rounded-[14px] bg-[#FFF6DF]">
              <MaterialCommunityIcons name="bell-outline" size={21} color="#8A6A2E" />
            </View>
            <View className="flex-1 pr-3">
              <Text className="text-[14px] font-bold text-foreground">Avisos de coleta</Text>
              <Text className="mt-0.5 text-[13px] text-muted">Caminhões e atualizações importantes</Text>
            </View>
            <Switch value={profile.notificationsEnabled} onValueChange={handleNotificationToggle} trackColor={{ false: "#DDEBE2", true: "#A8D5BA" }} thumbColor={profile.notificationsEnabled ? "#7FB69E" : "#FFFFFF"} />
          </View>
        </View>

        <Text className="mt-7 text-[13px] font-bold uppercase tracking-[1.1px] text-muted">Demonstração</Text>
        <View className="mt-2 rounded-[22px] border border-border bg-surface px-4">
          <ProfileRow icon="restart" title="Reiniciar dados do exemplo" description="Restaura denúncias e avisos da apresentação" onPress={restartDemo} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
