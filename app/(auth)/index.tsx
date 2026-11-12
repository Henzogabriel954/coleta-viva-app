import { Image, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";

import { AppButton } from "@/components/app-button";
import { ScreenContainer } from "@/components/screen-container";

export default function WelcomeScreen() {
  return (
    <ScreenContainer className="px-6 pb-8 pt-5" edges={["top", "bottom", "left", "right"]}>
      <View className="flex-1 justify-between">
        <View className="flex-row items-center gap-2">
          <Image source={require("@/assets/images/icon.png")} style={{ width: 36, height: 36, borderRadius: 12 }} />
          <Text className="text-[18px] font-bold tracking-[-0.3px] text-foreground">Coleta Viva</Text>
        </View>

        <View>
          <View className="mb-7 h-[244px] overflow-hidden rounded-[32px] border border-[#CDE3D5] bg-[#DDEFE2]">
            <View className="absolute -left-8 top-6 h-28 w-36 rounded-full bg-[#C4E3CE]" />
            <View className="absolute -right-8 bottom-0 h-40 w-44 rounded-full bg-[#B8DEC1]" />
            <View className="absolute bottom-9 left-8 right-8 h-1.5 rounded-full bg-white" />
            <View className="absolute bottom-[88px] left-16 h-1.5 w-44 rotate-[-20deg] rounded-full bg-white" />
            <View className="absolute bottom-7 right-12 h-[62px] w-[68px] items-center justify-center rounded-[22px] border-[5px] border-white bg-primary shadow-sm">
              <MaterialCommunityIcons name="truck-outline" size={34} color="#FFFFFF" />
            </View>
            <View className="absolute bottom-[62px] left-11 h-12 w-12 items-center justify-center rounded-full border-4 border-white bg-foreground">
              <MaterialCommunityIcons name="home-outline" size={25} color="#FFFFFF" />
            </View>
            <View className="absolute right-5 top-5 rounded-2xl bg-white/90 px-3 py-2">
              <Text className="text-[12px] font-bold text-foreground">Coleta no seu bairro</Text>
            </View>
          </View>
          <Text className="text-[34px] font-bold leading-[40px] tracking-[-1px] text-foreground">
            A cidade mais limpa começa perto de casa.
          </Text>
          <Text className="mt-4 text-[16px] leading-6 text-muted">
            Acompanhe o caminhão de coleta, receba avisos e participe do cuidado com o seu bairro.
          </Text>
        </View>

        <View className="gap-3">
          <AppButton label="Criar meu cadastro" onPress={() => router.push("/(auth)/cadastro")} />
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => router.push("/(auth)/login" as never)}
            activeOpacity={0.7}
            className="min-h-[50px] items-center justify-center rounded-2xl border border-border bg-surface"
          >
            <Text className="text-[15px] font-bold text-foreground">Já tenho uma conta</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}
