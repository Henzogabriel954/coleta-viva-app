import { ActivityIndicator, Pressable, Text } from "react-native";

type AppButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
  disabled?: boolean;
};

export function AppButton({ label, onPress, variant = "primary", loading = false, disabled = false }: AppButtonProps) {
  const styles = {
    primary: { backgroundColor: "#7FB69E", borderColor: "#7FB69E", textColor: "#FFFFFF" },
    secondary: { backgroundColor: "#EAF5EE", borderColor: "#A8D5BA", textColor: "#2E4A3D" },
    ghost: { backgroundColor: "transparent", borderColor: "transparent", textColor: "#547162" },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }: any) => ({
        minHeight: 52,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 16,
        borderWidth: variant === "ghost" ? 0 : 1,
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        opacity: disabled ? 0.55 : pressed ? 0.88 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        paddingHorizontal: 18,
      })}
    >
      {loading ? <ActivityIndicator color={styles.textColor} /> : <Text style={{ color: styles.textColor, fontSize: 16, fontWeight: "700" }}>{label}</Text>}
    </Pressable>
  );
}
