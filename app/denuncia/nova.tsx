import { useEffect, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";

import { AppButton } from "@/components/app-button";
import { ScreenContainer } from "@/components/screen-container";
import { useDemo } from "@/lib/demo-store";
import { useLocation } from "@/hooks/use-location";
import type { ReportCategory } from "@/types/domain";

const categories: ReportCategory[] = ["Descarte irregular", "Entulho", "Lixo doméstico"];

export default function NewReportScreen() {
  const { profile, addReport } = useDemo();
  const { location, isLoading: locating, error: locationError, requestLocation } = useLocation();
  const [category, setCategory] = useState<ReportCategory>("Descarte irregular");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>();
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void requestLocation();
  }, [requestLocation]);

  const updateImage = async (action: "camera" | "library") => {
    setIsOptionsOpen(false);
    try {
      if (action === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.status !== "granted") {
          Alert.alert("Câmera não autorizada", "Você pode escolher uma foto da galeria ou permitir a câmera nas configurações.");
          return;
        }
        const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 3], quality: 0.75 });
        if (!result.canceled) setImageUri(result.assets[0].uri);
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [4, 3], quality: 0.75 });
      if (!result.canceled) setImageUri(result.assets[0].uri);
    } catch {
      Alert.alert("Não foi possível abrir as imagens", "Tente novamente em alguns instantes.");
    }
  };

  const submitReport = async () => {
    if (description.trim().length < 6) {
      Alert.alert("Descreva um pouco mais", "Conte brevemente o que está acontecendo no local.");
      return;
    }
    const reportAddress = location
      ? `${location.label} — ${profile.address?.trim() || "Vila Verde"}`
      : profile.address?.trim() || "Local não informado";

    try {
      setIsSaving(true);
      const report = await addReport({
        category,
        description: description.trim(),
        imageUri,
        address: reportAddress,
      });
      router.replace({ pathname: "/denuncia/[id]", params: { id: report.id, created: "true" } });
    } catch {
      Alert.alert("Erro ao registrar", "Não foi possível registrar a denúncia no momento. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer className="px-5" edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
        <View className="flex-row items-center justify-between py-2">
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/denuncias"))}
            activeOpacity={0.7}
            className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface"
          >
            <MaterialCommunityIcons name="close" size={22} color="#2E4A3D" />
          </TouchableOpacity>
          <Text className="text-[15px] font-bold text-foreground">Nova denúncia</Text>
          <View className="w-11" />
        </View>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 18, paddingBottom: 16 }}>
          <Text className="text-[28px] font-bold leading-[34px] tracking-[-0.5px] text-foreground">Conte o que aconteceu.</Text>
          <Text className="mt-2 text-[15px] leading-6 text-muted">Sua contribuição ajuda a equipe a priorizar o atendimento no bairro.</Text>

          <Text className="mt-7 text-[13px] font-bold text-foreground">Foto do local</Text>
          <TouchableOpacity accessibilityRole="button" onPress={() => setIsOptionsOpen(true)} activeOpacity={0.78} className="mt-2 h-[156px] items-center justify-center overflow-hidden rounded-[22px] border border-dashed border-[#B9D7C2] bg-[#EEF8F0]">
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            ) : (
              <>
                <View className="h-12 w-12 items-center justify-center rounded-[16px] bg-surface">
                  <MaterialCommunityIcons name="camera-outline" size={25} color="#47745B" />
                </View>
                <Text className="mt-3 text-[14px] font-bold text-foreground">Adicionar foto</Text>
                <Text className="mt-1 text-[12px] text-muted">Câmera ou galeria</Text>
              </>
            )}
            {imageUri ? <View className="absolute bottom-3 right-3 rounded-xl bg-black/50 px-3 py-2"><Text className="text-[12px] font-bold text-white">Trocar foto</Text></View> : null}
          </TouchableOpacity>

          <Text className="mt-7 text-[13px] font-bold text-foreground">Tipo de ocorrência</Text>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {categories.map((item) => {
              const selected = item === category;
              return <TouchableOpacity key={item} accessibilityRole="button" onPress={() => setCategory(item)} activeOpacity={0.7} style={{ backgroundColor: selected ? "#7FB69E" : "#FFFFFF", borderColor: selected ? "#7FB69E" : "#DDEBE2" }} className="rounded-full border px-4 py-2.5"><Text style={{ color: selected ? "#FFFFFF" : "#547162" }} className="text-[13px] font-bold">{item}</Text></TouchableOpacity>;
            })}
          </View>

          <Text className="mt-7 text-[13px] font-bold text-foreground">Descrição</Text>
          <TextInput value={description} onChangeText={setDescription} placeholder="Ex.: resíduos e móveis deixados na calçada." placeholderTextColor="#91A598" multiline textAlignVertical="top" maxLength={260} className="mt-2 min-h-[108px] rounded-[18px] border border-border bg-surface px-4 py-3 text-[15px] leading-6 text-foreground" />
          <Text className="mt-1.5 text-right text-[11px] font-medium text-muted">{description.length}/260</Text>

          <View className="mt-5 flex-row rounded-[18px] border border-border bg-surface p-3">
            <View className="mr-3 h-9 w-9 items-center justify-center rounded-[13px] bg-[#EAF5EE]">
              <MaterialCommunityIcons name="map-marker-outline" size={20} color="#47745B" />
            </View>
            <View className="flex-1">
              <Text className="text-[13px] font-bold text-foreground">Localização da denúncia</Text>
              <Text className="mt-0.5 text-[12px] leading-4 text-muted">{locating ? "Obtendo sua localização…" : location ? "Localização atual identificada" : locationError ?? profile.address}</Text>
            </View>
            {!location && !locating ? <TouchableOpacity accessibilityRole="button" onPress={() => void requestLocation()} activeOpacity={0.7} className="justify-center px-1"><Text className="text-[12px] font-bold text-primary">Atualizar</Text></TouchableOpacity> : null}
          </View>
        </ScrollView>
        <View className="border-t border-border pt-4">
          <AppButton label="Enviar denúncia" onPress={submitReport} loading={isSaving} />
        </View>
      </KeyboardAvoidingView>

      <Modal transparent visible={isOptionsOpen} animationType="slide" onRequestClose={() => setIsOptionsOpen(false)}>
        <View className="flex-1 justify-end bg-black/30 p-5">
          <View className="rounded-[28px] bg-surface p-5">
            <View className="items-center"><View className="h-1.5 w-11 rounded-full bg-border" /></View>
            <Text className="mt-5 text-[20px] font-bold text-foreground">Adicionar foto</Text>
            <Text className="mt-1 text-[14px] leading-5 text-muted">Registre o local ou use uma imagem do seu aparelho.</Text>
            <View className="mt-5 gap-3">
              <AppButton label="Usar câmera" onPress={() => void updateImage("camera")} />
              <AppButton label="Escolher da galeria" variant="secondary" onPress={() => void updateImage("library")} />
              <AppButton label="Cancelar" variant="ghost" onPress={() => setIsOptionsOpen(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
