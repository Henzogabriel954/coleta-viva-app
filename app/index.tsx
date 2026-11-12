/* eslint-disable react-hooks/refs */
import { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Easing, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";

import { AppButton } from "@/components/app-button";
import { ScreenContainer } from "@/components/screen-container";
import { useDemo } from "@/lib/demo-store";

const introSlides = [
  {
    eyebrow: "Coleta Viva",
    title: "Tudo sobre a coleta do seu bairro, em um só lugar.",
    description: "Acompanhe a rota, descubra quando o caminhão passa e receba informações importantes sobre sua rua.",
    icon: "map-marker-path" as const,
    color: "#EAF5EE",
  },
  {
    eyebrow: "Mais participação",
    title: "Ajude a cidade a ficar mais limpa.",
    description: "Registre descartes irregulares com foto e localização. A equipe recebe sua denúncia com mais contexto para agir.",
    icon: "camera-outline" as const,
    color: "#FFF6DF",
  },
  {
    eyebrow: "Feito para você",
    title: "Seus dados, seus avisos, seu bairro.",
    description: "Cadastre seu endereço uma vez e tenha uma experiência simples para acompanhar a coleta todos os dias.",
    icon: "account-heart-outline" as const,
    color: "#E8F7EA",
  },
];

function OpeningAnimation({ onComplete }: { onComplete: () => void }) {
  const truckX = useRef(new Animated.Value(-110)).current;
  const leafScale = useRef(new Animated.Value(0.5)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
      Animated.timing(leafScale, { toValue: 1, duration: 520, easing: Easing.out(Easing.back(1.2)), useNativeDriver: true }),
      Animated.timing(truckX, { toValue: 112, duration: 1500, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onComplete();
    });
  }, [leafScale, opacity, onComplete, truckX]);

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <Animated.View style={{ opacity, transform: [{ scale: leafScale }] }} className="h-[116px] w-[116px] items-center justify-center rounded-[38px] bg-[#DDEFE2]">
        <MaterialCommunityIcons name="leaf-circle-outline" size={72} color="#47745B" />
      </Animated.View>
      <View className="mt-10 h-[76px] w-full max-w-[290px] overflow-hidden rounded-full border border-[#CDE3D5] bg-[#EAF5EE]">
        <View className="absolute bottom-5 left-4 right-4 h-1.5 rounded-full bg-white" />
        <Animated.View style={{ transform: [{ translateX: truckX }] }} className="absolute bottom-3 left-0 h-12 w-16 items-center justify-center rounded-2xl border-4 border-white bg-primary">
          <MaterialCommunityIcons name="truck-outline" size={29} color="#FFFFFF" />
        </Animated.View>
      </View>
      <Text className="mt-7 text-[26px] font-bold tracking-[-0.6px] text-foreground">Coleta Viva</Text>
      <Text className="mt-2 text-[14px] text-muted">Cuidar da cidade começa perto de casa.</Text>
    </View>
  );
}

export default function RootIndex() {
  const { hydrated, hasCompletedOnboarding } = useDemo();
  const [hasShownOpening, setHasShownOpening] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = introSlides[slideIndex];

  const handleOpeningComplete = useCallback(() => setHasShownOpening(true), []);

  useEffect(() => {
    if (hydrated && hasCompletedOnboarding) {
      router.replace("/(tabs)/mapa");
    }
  }, [hasCompletedOnboarding, hydrated]);

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <View className="h-[92px] w-[92px] items-center justify-center rounded-[30px] bg-[#DDEFE2]"><MaterialCommunityIcons name="leaf-circle-outline" size={58} color="#47745B" /></View>
        <Text className="mt-5 text-[23px] font-bold text-foreground">Coleta Viva</Text>
      </View>
    );
  }

  if (hasCompletedOnboarding) return null;

  if (!hasShownOpening) {
    return <OpeningAnimation onComplete={handleOpeningComplete} />;
  }

  return (
    <ScreenContainer className="px-6 pb-7 pt-5" edges={["top", "bottom", "left", "right"]}>
      <View className="flex-1 justify-between">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#DDEFE2]"><MaterialCommunityIcons name="leaf" size={22} color="#47745B" /></View>
            <Text className="text-[18px] font-bold text-foreground">Coleta Viva</Text>
          </View>
          <Text className="text-[12px] font-bold text-muted">{slideIndex + 1} de {introSlides.length}</Text>
        </View>

        <View>
          <View style={{ backgroundColor: slide.color }} className="mb-8 h-[230px] items-center justify-center overflow-hidden rounded-[32px] border border-border">
            <View className="absolute -left-10 top-5 h-28 w-36 rounded-full bg-white/30" />
            <View className="absolute -right-8 bottom-0 h-40 w-44 rounded-full bg-white/25" />
            <View className="h-[104px] w-[104px] items-center justify-center rounded-[32px] bg-white/80">
              <MaterialCommunityIcons name={slide.icon} size={58} color="#47745B" />
            </View>
          </View>
          <Text className="text-[12px] font-bold uppercase tracking-[1.4px] text-muted">{slide.eyebrow}</Text>
          <Text className="mt-3 text-[31px] font-bold leading-[37px] tracking-[-0.8px] text-foreground">{slide.title}</Text>
          <Text className="mt-4 text-[16px] leading-6 text-muted">{slide.description}</Text>
        </View>

        <View>
          <View className="mb-5 flex-row gap-2">
            {introSlides.map((item, index) => <View key={item.title} className={`h-1.5 rounded-full ${index === slideIndex ? "w-8 bg-primary" : "w-2 bg-border"}`} />)}
          </View>
          {slideIndex < introSlides.length - 1 ? (
            <View className="gap-3">
              <AppButton label="Continuar" onPress={() => setSlideIndex((current) => current + 1)} />
              <TouchableOpacity accessibilityRole="button" onPress={() => setSlideIndex(introSlides.length - 1)} activeOpacity={0.7} className="items-center py-2"><Text className="text-[14px] font-bold text-primary">Pular apresentação</Text></TouchableOpacity>
            </View>
          ) : (
            <View className="gap-3">
              <AppButton label="Criar meu cadastro" onPress={() => router.push("/(auth)/cadastro")} />
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => router.push("/(auth)/login" as never)}
                activeOpacity={0.7}
                className="items-center py-2"
              >
                <Text className="text-[14px] font-bold text-primary">Já tenho uma conta (Entrar)</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}
