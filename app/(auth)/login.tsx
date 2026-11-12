import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";

import { AppButton } from "@/components/app-button";
import { ScreenContainer } from "@/components/screen-container";
import { useDemo } from "@/lib/demo-store";

export default function LoginScreen() {
  const { login } = useDemo();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = isValidEmail && password.length >= 6;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setIsLoading(true);

    try {
      const res = await login(email.trim(), password);
      if (!res.success) {
        Alert.alert("Não foi possível entrar", res.error || "Verifique seu e-mail e senha.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="px-6 pb-7" edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View className="flex-row items-center justify-between py-3">
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(auth)"))}
            activeOpacity={0.7}
            className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface"
          >
            <MaterialCommunityIcons name="arrow-left" size={21} color="#2E4A3D" />
          </TouchableOpacity>
          <Text className="text-[13px] font-bold text-muted">Acesso</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 16, paddingBottom: 24 }}>
          <Text className="text-[32px] font-bold leading-[38px] tracking-[-0.6px] text-foreground">
            Acesse sua conta.
          </Text>
          <Text className="mt-3 text-[16px] leading-6 text-muted">
            Entre com seus dados para acompanhar a rota e gerenciar suas denúncias.
          </Text>

          <View className="mt-8 gap-4">
            <View>
              <Text className="mb-2 text-[13px] font-bold text-foreground">E-mail</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="seu.email@exemplo.com"
                placeholderTextColor="#91A598"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                className="h-[54px] rounded-2xl border border-border bg-surface px-4 text-[16px] text-foreground"
              />
            </View>

            <View>
              <Text className="mb-2 text-[13px] font-bold text-foreground">Senha</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#91A598"
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                className="h-[54px] rounded-2xl border border-border bg-surface px-4 text-[16px] text-foreground"
              />
            </View>
          </View>

          <View className="mt-10 gap-3">
            <AppButton label="Entrar" onPress={handleLogin} loading={isLoading} disabled={!canSubmit} />

            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => router.replace("/(auth)/cadastro")}
              activeOpacity={0.7}
              className="items-center py-3"
            >
              <Text className="text-[14px] font-semibold text-muted">
                Ainda não tem conta? <Text className="font-bold text-primary">Cadastre-se</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
