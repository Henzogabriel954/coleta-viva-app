import { FlatList, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";

import { CardDenuncia } from "@/components/card-denuncia";
import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/screen-header";
import { useDemo } from "@/lib/demo-store";

export default function ReportsScreen() {
  const { reports } = useDemo();
  const activeCount = reports.filter((report) => report.status !== "resolvido").length;

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 13, paddingBottom: 112 }}
        ListHeaderComponent={
          <View>
            <ScreenHeader eyebrow="Cidadania ativa" title="Minhas denúncias" />
            <View className="mt-5 flex-row rounded-[20px] border border-[#E9D7A9] bg-[#FFF9EA] p-4">
              <View className="mr-3 h-10 w-10 items-center justify-center rounded-[14px] bg-warning">
                <MaterialCommunityIcons name="clipboard-check-outline" size={22} color="#765B25" />
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-bold text-foreground">Você acompanha cada etapa</Text>
                <Text className="mt-1 text-[13px] leading-5 text-muted">{activeCount} {activeCount === 1 ? "solicitação está" : "solicitações estão"} em atendimento.</Text>
              </View>
            </View>
            <View className="mt-7 flex-row items-center justify-between">
              <Text className="text-[17px] font-bold text-foreground">Histórico</Text>
              <Text className="text-[13px] font-bold text-muted">{reports.length} registros</Text>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View className="mt-3">
            <CardDenuncia report={item} onPress={() => router.push({ pathname: "/denuncia/[id]", params: { id: item.id } })} />
          </View>
        )}
      />
      <TouchableOpacity accessibilityRole="button" accessibilityLabel="Criar nova denúncia" onPress={() => router.push("/denuncia/nova")} activeOpacity={0.82} className="absolute bottom-5 right-5 h-[58px] flex-row items-center gap-2 rounded-[19px] bg-primary px-5 shadow-sm">
        <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
        <Text className="text-[15px] font-bold text-white">Nova denúncia</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}
