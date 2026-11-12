import { Pressable, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { BadgeStatus } from "@/components/badge-status";
import { ReportThumbnail } from "@/components/report-thumbnail";
import { dateLabel } from "@/lib/demo-utils";
import type { Report } from "@/types/domain";

export function CardDenuncia({ report, onPress }: { report: Report; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir denúncia ${report.category}`} onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.74 : 1 })}>
      <View className="flex-row rounded-[22px] border border-border bg-surface p-3.5">
        <ReportThumbnail report={report} size={76} />
        <View className="ml-3 flex-1 justify-between py-0.5">
          <View className="flex-row items-start justify-between gap-2">
            <Text className="flex-1 text-[15px] font-bold leading-5 text-foreground">{report.category}</Text>
            <BadgeStatus status={report.status} />
          </View>
          <Text numberOfLines={1} className="mt-1 text-[13px] leading-5 text-muted">{report.address}</Text>
          <View className="mt-2 flex-row items-center justify-between">
            <View className="flex-row items-center gap-1">
              <MaterialCommunityIcons name="calendar-blank-outline" size={14} color="#6D8377" />
              <Text className="text-[12px] font-medium text-muted">{dateLabel(report.createdAt)}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#7FB69E" />
          </View>
        </View>
      </View>
    </Pressable>
  );
}
