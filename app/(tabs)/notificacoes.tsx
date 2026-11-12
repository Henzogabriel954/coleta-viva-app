import { FlatList, Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { router } from "expo-router";

import { ScreenContainer } from "@/components/screen-container";
import { ScreenHeader } from "@/components/screen-header";
import { useDemo } from "@/lib/demo-store";
import type { Notice } from "@/types/domain";

const noticeIcon = (notice: Notice) => {
  if (notice.kind === "success") return { icon: "check-circle-outline" as const, background: "#E8F7EA", color: "#427651" };
  if (notice.kind === "report") return { icon: "clipboard-text-outline" as const, background: "#FFF6DF", color: "#8A6A2E" };
  return { icon: "truck-outline" as const, background: "#EAF5EE", color: "#47745B" };
};

function NoticeCard({ notice }: { notice: Notice }) {
  const visual = noticeIcon(notice);
  return (
    <TouchableOpacity accessibilityRole="button" onPress={() => router.push(notice.kind === "report" ? "/(tabs)/denuncias" : "/(tabs)/mapa")} activeOpacity={0.75} style={{ opacity: notice.read ? 0.72 : 1 }} className={`flex-row rounded-[22px] border p-4 ${notice.read ? "border-border bg-surface" : "border-[#CFE5D6] bg-[#F0F8F2]"}`}>
      <View style={{ width: 42, height: 42, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: visual.background }}>
        <MaterialCommunityIcons name={visual.icon} size={22} color={visual.color} />
      </View>
      <View className="ml-3 flex-1">
        <View className="flex-row items-start justify-between gap-2">
          <Text className="flex-1 text-[15px] font-bold leading-5 text-foreground">{notice.title}</Text>
          {!notice.read ? <View className="mt-1.5 h-2 w-2 rounded-full bg-primary" /> : null}
        </View>
        <Text className="mt-1 text-[13px] leading-5 text-muted">{notice.body}</Text>
        <Text className="mt-2 text-[12px] font-bold text-muted">{notice.time}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const { notices, markAllNoticesRead } = useDemo();
  const unread = notices.filter((notice) => !notice.read).length;

  return (
    <ScreenContainer className="px-5" edges={["top", "left", "right"]}>
      <FlatList
        data={notices}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 13, paddingBottom: 32 }}
        ListHeaderComponent={
          <View>
            <View className="mb-3 flex-row items-center justify-between py-1">
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Voltar"
                onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)/mapa"))}
                activeOpacity={0.7}
                className="h-11 w-11 items-center justify-center rounded-full border border-border bg-surface"
              >
                <MaterialCommunityIcons name="arrow-left" size={21} color="#2E4A3D" />
              </TouchableOpacity>
              <Text className="text-[14px] font-bold text-muted">Notificações</Text>
              <View className="w-11" />
            </View>
            <ScreenHeader eyebrow={unread ? `${unread} novidades` : "Tudo em dia"} title="Seus avisos" actionLabel={unread ? "Ler todos" : undefined} onAction={unread ? markAllNoticesRead : undefined} />
            <Text className="mt-4 text-[15px] leading-6 text-muted">Receba atualizações da coleta e do andamento das suas solicitações.</Text>
            <Text className="mt-7 text-[17px] font-bold text-foreground">Recentes</Text>
          </View>
        }
        renderItem={({ item }) => <View className="mt-3"><NoticeCard notice={item} /></View>}
      />
    </ScreenContainer>
  );
}
