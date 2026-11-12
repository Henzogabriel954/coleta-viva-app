import { Image, View } from "react-native";
import Svg, { Circle, Path, Rect } from "react-native-svg";

import type { Report } from "@/types/domain";

export function ReportThumbnail({ report, size = 70 }: { report: Pick<Report, "imageUri" | "imageTone">; size?: number }) {
  if (report.imageUri) {
    return <Image source={{ uri: report.imageUri }} style={{ width: size, height: size, borderRadius: 16, backgroundColor: "#EAF5EE" }} />;
  }

  const background = report.imageTone === "sage" ? "#C7E6D0" : report.imageTone === "sand" ? "#F2E7C8" : "#F0D29A";
  const ground = report.imageTone === "sage" ? "#8FCB9B" : report.imageTone === "sand" ? "#D6BE82" : "#D49B58";
  return (
    <View style={{ width: size, height: size, borderRadius: 16, overflow: "hidden", backgroundColor: background }}>
      <Svg width={size} height={size} viewBox="0 0 70 70">
        <Rect width="70" height="70" fill={background} />
        <Path d="M0 45 C16 35 31 54 47 43 C57 36 62 39 70 34 V70 H0 Z" fill={ground} opacity="0.75" />
        <Path d="M17 45 L23 31 L36 33 L43 47 Z" fill="#FAFBF8" opacity="0.92" />
        <Path d="M25 42 L30 27 L40 34 L39 46 Z" fill="#A97643" />
        <Circle cx="19" cy="22" r="7" fill="#FFFFFF" opacity="0.45" />
      </Svg>
    </View>
  );
}
