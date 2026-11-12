import { Text, View } from "react-native";

import { statusLabel, statusTheme } from "@/lib/demo-utils";
import type { ReportStatus } from "@/types/domain";

export function BadgeStatus({ status }: { status: ReportStatus }) {
  const theme = statusTheme(status);
  return (
    <View style={{ backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
      <Text style={{ color: theme.text, fontSize: 12, fontWeight: "700" }}>{statusLabel(status)}</Text>
    </View>
  );
}
