import { Text, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type ScreenHeaderProps = {
  eyebrow?: string;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function ScreenHeader({ eyebrow, title, actionLabel, onAction }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-end justify-between">
      <View className="flex-1 pr-3">
        {eyebrow ? <Text className="text-[12px] font-bold uppercase tracking-[1.3px] text-muted">{eyebrow}</Text> : null}
        <Text className="mt-1 text-[28px] font-bold leading-[34px] text-foreground">{title}</Text>
      </View>
      {actionLabel && onAction ? (
        <TouchableOpacity accessibilityRole="button" onPress={onAction} activeOpacity={0.7} style={{ minHeight: 40, justifyContent: "center", paddingLeft: 8 }}>
          <View className="flex-row items-center gap-1">
            <Text className="text-[14px] font-bold text-primary">{actionLabel}</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color="#7FB69E" />
          </View>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
