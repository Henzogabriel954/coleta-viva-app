/* eslint-disable react-hooks/refs */
import { useEffect, useRef } from "react";
import { Alert, Animated, Easing, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { useDemo } from "@/lib/demo-store";

function MenuItem({ icon, title, description, onPress }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; title: string; description: string; onPress: () => void }) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} activeOpacity={0.75} className="flex-row items-center border-b border-border py-4">
      <View className="mr-3 h-10 w-10 items-center justify-center rounded-[14px] bg-[#EAF5EE]"><MaterialCommunityIcons name={icon} size={21} color="#47745B" /></View>
      <View className="flex-1"><Text className="text-[14px] font-bold text-foreground">{title}</Text><Text className="mt-0.5 text-[12px] leading-4 text-muted">{description}</Text></View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#A0B0A6" />
    </TouchableOpacity>
  );
}

export default function MenuScreen() {
  const { profile, logout } = useDemo();
  const panelX = useRef(new Animated.Value(-340)).current;

  useEffect(() => {
    Animated.timing(panelX, { toValue: 0, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [panelX]);

  const displayName = profile?.name?.trim() || "Morador";
  const initial = (profile?.name?.trim() || "M").slice(0, 1).toUpperCase();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/mapa");
    }
  };

  return (
    <ScreenContainer containerClassName="bg-[#DCE9E0]" safeAreaClassName="bg-[#DCE9E0]" className="flex-1" edges={["top", "bottom", "left", "right"]}>
      <View className="flex-1">
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Fechar menu" onPress={handleClose} activeOpacity={0.8} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(46,74,61,0.25)" }} />
        <Animated.View style={{ width: "84%", transform: [{ translateX: panelX }] }} className="h-full rounded-r-[30px] bg-background px-5 pb-7 pt-5 shadow-lg">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="h-10 w-10 items-center justify-center rounded-[14px] bg-[#DDEFE2]"><MaterialCommunityIcons name="leaf" size={23} color="#47745B" /></View>
              <View><Text className="text-[16px] font-bold text-foreground">Coleta Viva</Text><Text className="text-[11px] font-medium text-muted">Menu principal</Text></View>
            </View>
            <TouchableOpacity accessibilityRole="button" onPress={handleClose} activeOpacity={0.7} className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface"><MaterialCommunityIcons name="close" size={20} color="#2E4A3D" /></TouchableOpacity>
          </View>

          <View className="mt-7 flex-row items-center rounded-[20px] border border-border bg-surface p-3">
            <View className="h-11 w-11 items-center justify-center rounded-full bg-primary"><Text className="text-[18px] font-bold text-white">{initial}</Text></View>
            <View className="ml-3 flex-1"><Text className="text-[15px] font-bold text-foreground">{displayName}</Text><Text className="mt-0.5 text-[12px] text-muted">{profile?.address ? profile.address.split("—")[0].trim() : "Morador"}</Text></View>
          </View>

          <Text className="mt-7 text-[12px] font-bold uppercase tracking-[1.1px] text-muted">Navegação</Text>
          <View className="mt-1">
            <MenuItem icon="account-outline" title="Meus dados" description="Nome, telefone e endereço" onPress={() => router.push("/(tabs)/dados")} />
            <MenuItem icon="clipboard-text-outline" title="Minhas denúncias" description="Acompanhe suas solicitações" onPress={() => router.push("/(tabs)/denuncias")} />
            <MenuItem icon="bell-outline" title="Avisos e notificações" description="Veja todos os alertas da coleta" onPress={() => router.push("/(tabs)/notificacoes")} />
          </View>

          <Text className="mt-7 text-[12px] font-bold uppercase tracking-[1.1px] text-muted">Sobre o app</Text>
          <View className="mt-1">
            <MenuItem icon="information-outline" title="Sobre o Coleta Viva" description="Como ajudamos a cuidar da cidade" onPress={() => Alert.alert("Sobre o Coleta Viva", "Um espaço simples para acompanhar a coleta e participar do cuidado com a cidade.")} />
            <MenuItem icon="help-circle-outline" title="Ajuda e suporte" description="Tire suas dúvidas" onPress={() => Alert.alert("Ajuda e suporte", "Para dúvidas ou sugestões, fale com a central da sua prefeitura ou equipe de coleta.")} />
          </View>

          <View className="mt-auto pt-4 border-t border-border">
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                Alert.alert("Sair da conta", "Deseja realmente sair da sua conta?", [
                  { text: "Cancelar", style: "cancel" },
                  { text: "Sair", style: "destructive", onPress: () => void logout() },
                ]);
              }}
              activeOpacity={0.7}
              className="flex-row items-center gap-2 py-2"
            >
              <MaterialCommunityIcons name="logout" size={20} color="#D98272" />
              <Text className="text-[14px] font-bold text-[#D98272]">Sair da conta</Text>
            </TouchableOpacity>
            <Text className="mt-2 text-[11px] leading-4 text-muted">Coleta Viva · Conectado ao PostgreSQL</Text>
          </View>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}
