import { Pressable, type ColorValue, type GestureResponderEvent } from "react-native";
import * as Haptics from "expo-haptics";

type TabButtonProps = {
  onPressIn?: ((ev: GestureResponderEvent) => void) | null;
  pressColor?: ColorValue;
  [key: string]: unknown;
};

export function HapticTab(props: TabButtonProps) {
  const { pressColor: _pressColor, ...rest } = props;
  return (
    <Pressable
      {...(rest as any)}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        rest.onPressIn?.(ev);
      }}
    />
  );
}
