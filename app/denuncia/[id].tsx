import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router, useLocalSearchParams } from "expo-router";

import { BadgeStatus } from "@/components/badge-status";
import { ReportThumbnail } from "@/components/report-thumbnail";
import { ScreenContainer } from "@/components/screen-container";
import { dateLabel } from "@/lib/demo-utils";
import { useDemo } from "@/lib/demo-store";

export default function ReportDetailScreen() {
  const { id, created } = useLocalSearchParams<{ id: string; created?: string }>();
  const { reports } = useDemo();
  const report = reports.find((item) => item.id === id);

  if (!report) {
    return (
      <ScreenContainer className="items-center justify-center p-6" edges={["top", "bottom", "left", "right"]}>
        <Text className="text-[18px] font-bold text-foreground">Denúncia não encontrada</Text>
        <TouchableOpacity accessibilityRole="button" onPress={() => router.replace("/(tabs)/denuncias")} activeOpacity={0.7} className="mt-4 rounded-xl bg-primary px-4 py-3"><Text className="font-bold text-white">Voltar para denúncias</Text></TouchableOpacity>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 8, paddingBottom: 35 }}>
        <View className="flex-row items-center justify-between py-2">
          <TouchableOpacity
            accessibilityRole="button"
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/denuncias"))}
            activeOpacity={0.7}
            className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface"
          >
            <MaterialCommunityIcons name="arrow-left" size={21} color="#2E4A3D" />
          </TouchableOpacity>
          <Text className="text-[15px] font-bold text-foreground">Detalhe da denúncia</Text>
          <View className="w-11" />
        </View>
        {created === "true" ? (
          <View className="mt-5 flex-row rounded-[18px] border border-[#BFE0C7] bg-[#E8F7EA] p-3.5">
            <MaterialCommunityIcons name="check-circle-outline" size={21} color="#427651" />
            <View className="ml-2.5 flex-1"><Text className="text-[14px] font-bold text-foreground">Denúncia enviada com sucesso</Text><Text className="mt-1 text-[12px] leading-4 text-muted">Você receberá atualizações sobre o protocolo por aqui.</Text></View>
          </View>
        ) : null}

        <View className="mt-6 flex-row items-start">
          <ReportThumbnail report={report} size={86} />
          <View className="ml-4 flex-1">
            <BadgeStatus status={report.status} />
            <Text className="mt-3 text-[23px] font-bold leading-7 text-foreground">{report.category}</Text>
            <Text className="mt-1 text-[13px] text-muted">Registrada em {dateLabel(report.createdAt)}</Text>
          </View>
        </View>
        <View className="mt-6 rounded-[22px] border border-border bg-surface p-4">
          <Text className="text-[13px] font-bold uppercase tracking-[1px] text-muted">Descrição</Text>
          <Text className="mt-2 text-[15px] leading-6 text-foreground">{report.description}</Text>
          <View className="mt-4 flex-row items-start border-t border-border pt-4">
            <MaterialCommunityIcons name="map-marker-outline" size={20} color="#47745B" />
            <Text className="ml-2 flex-1 text-[13px] leading-5 text-muted">{report.address}</Text>
          </View>
        </View>

        <Text className="mt-8 text-[19px] font-bold text-foreground">Acompanhamento</Text>
        <View className="mt-4">
          {report.updates.map((update, index) => (
            <View key={`${update.title}-${update.at}`} className="flex-row">
              <View className="items-center">
                <View className={`h-8 w-8 items-center justify-center rounded-full ${index === report.updates.length - 1 ? "bg-primary" : "bg-[#DDEBE2]"}`}>
                  <MaterialCommunityIcons name={index === report.updates.length - 1 ? "clock-outline" : "check"} size={16} color={index === report.updates.length - 1 ? "#FFFFFF" : "#47745B"} />
                </View>
                {index < report.updates.length - 1 ? <View className="h-12 w-px bg-border" /> : null}
              </View>
              <View className="ml-3 flex-1 pb-5">
                <View className="flex-row items-start justify-between gap-3"><Text className="flex-1 text-[14px] font-bold text-foreground">{update.title}</Text><Text className="text-[11px] font-medium text-muted">{update.at}</Text></View>
                <Text className="mt-1 text-[13px] leading-5 text-muted">{update.detail}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
