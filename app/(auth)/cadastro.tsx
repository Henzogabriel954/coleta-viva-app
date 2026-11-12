/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
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
import { router, useLocalSearchParams } from "expo-router";

import { AppButton } from "@/components/app-button";
import { ScreenContainer } from "@/components/screen-container";
import { useDemo } from "@/lib/demo-store";

export default function RegisterScreen() {
  const { profile, register, completeProfile } = useDemo();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEditing = edit === "true";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    setName(profile.name);
    setEmail(profile.email || "");
    setAddress(profile.address);
    setPhone(profile.phone);
  }, [isEditing, profile.address, profile.email, profile.name, profile.phone]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const canContinue = isEditing
    ? name.trim().length > 1 && address.trim().length > 4 && phone.trim().length > 7 && (!email.trim() || isValidEmail)
    : name.trim().length > 1 &&
      isValidEmail &&
      address.trim().length > 4 &&
      phone.trim().length > 7 &&
      password.length >= 6;

  const handleContinue = async () => {
    if (!canContinue) return;
    setIsSaving(true);

    try {
      if (isEditing) {
        await completeProfile({
          name: name.trim(),
          address: address.trim(),
          phone: phone.trim(),
          email: email.trim(),
        });
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace("/(tabs)/dados");
        }
      } else {
        const res = await register({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: address.trim(),
          password,
        });

        if (!res.success) {
          Alert.alert("Erro ao cadastrar", res.error || "Não foi possível criar seu cadastro. Tente novamente.");
        }
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer className="px-6 pb-7" edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View className="flex-row items-center justify-between py-3">
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => (router.canGoBack() ? router.back() : router.replace(isEditing ? "/(tabs)/dados" : "/(auth)"))}
            activeOpacity={0.7}
            className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface"
          >
            <MaterialCommunityIcons name="arrow-left" size={21} color="#2E4A3D" />
          </TouchableOpacity>
          <Text className="text-[13px] font-bold text-muted">{isEditing ? "Dados pessoais" : "Cadastro"}</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}>
          <Text className="text-[30px] font-bold leading-[36px] tracking-[-0.6px] text-foreground">
            {isEditing ? "Atualize seus dados." : "Crie sua conta."}
          </Text>
          <Text className="mt-3 text-[15px] leading-6 text-muted">
            {isEditing
              ? "Mantenha suas informações atualizadas para receber os avisos certos no seu endereço."
              : "Cadastre-se para acompanhar a rota em tempo real e registrar denúncias no seu bairro."}
          </Text>

          <View className="mt-7 gap-4">
            <View>
              <Text className="mb-1.5 text-[13px] font-bold text-foreground">Nome completo</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                placeholderTextColor="#91A598"
                autoCapitalize="words"
                returnKeyType="next"
                className="h-[52px] rounded-2xl border border-border bg-surface px-4 text-[15px] text-foreground"
              />
            </View>

            <View>
              <Text className="mb-1.5 text-[13px] font-bold text-foreground">E-mail</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="seu.email@exemplo.com"
                placeholderTextColor="#91A598"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                className="h-[52px] rounded-2xl border border-border bg-surface px-4 text-[15px] text-foreground"
              />
            </View>

            <View>
              <Text className="mb-1.5 text-[13px] font-bold text-foreground">Endereço da residência</Text>
              <TextInput
                value={address}
                onChangeText={setAddress}
                placeholder="Rua, número e bairro"
                placeholderTextColor="#91A598"
                autoCapitalize="words"
                returnKeyType="next"
                className="h-[52px] rounded-2xl border border-border bg-surface px-4 text-[15px] text-foreground"
              />
            </View>

            <View>
              <Text className="mb-1.5 text-[13px] font-bold text-foreground">Telefone</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="(00) 00000-0000"
                placeholderTextColor="#91A598"
                keyboardType="phone-pad"
                returnKeyType={isEditing ? "done" : "next"}
                className="h-[52px] rounded-2xl border border-border bg-surface px-4 text-[15px] text-foreground"
              />
            </View>

            {!isEditing && (
              <View>
                <Text className="mb-1.5 text-[13px] font-bold text-foreground">Senha</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#91A598"
                  secureTextEntry
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                  className="h-[52px] rounded-2xl border border-border bg-surface px-4 text-[15px] text-foreground"
                />
              </View>
            )}
          </View>

          <View className="mt-8 gap-3">
            <AppButton
              label={isEditing ? "Salvar alterações" : "Criar meu cadastro"}
              onPress={handleContinue}
              loading={isSaving}
              disabled={!canContinue}
            />

            {!isEditing && (
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => router.replace("/(auth)/login" as never)}
                activeOpacity={0.7}
                className="items-center py-3"
              >
                <Text className="text-[14px] font-semibold text-muted">
                  Já possui uma conta? <Text className="font-bold text-primary">Entrar</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}
