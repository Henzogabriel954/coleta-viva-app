/* eslint-disable react-hooks/refs */
import { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Svg, { Circle, Path, Rect } from "react-native-svg";

import type { Truck } from "@/types/domain";

function TruckMarker({ truck }: { truck: Truck }) {
  const x = useRef(new Animated.Value(truck.mapX)).current;
  const y = useRef(new Animated.Value(truck.mapY)).current;
  const prevX = useRef(truck.mapX);

  useEffect(() => {
    // Se o caminhão reiniciou o circuito (salto grande de coordenadas), reseta direto sem transição reversa
    if (Math.abs(truck.mapX - prevX.current) > 20) {
      x.setValue(truck.mapX);
      y.setValue(truck.mapY);
    } else {
      Animated.parallel([
        Animated.timing(x, { toValue: truck.mapX, duration: 2400, useNativeDriver: false }),
        Animated.timing(y, { toValue: truck.mapY, duration: 2400, useNativeDriver: false }),
      ]).start();
    }
    prevX.current = truck.mapX;
  }, [truck.mapX, truck.mapY, x, y]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        left: x.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
        top: y.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] }),
        marginLeft: -18,
        marginTop: -18,
      }}
    >
      <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", backgroundColor: truck.color, borderWidth: 3, borderColor: "#FFFFFF", shadowColor: "#2E4A3D", shadowOpacity: 0.16, shadowRadius: 7, elevation: 3 }}>
        <MaterialCommunityIcons name="truck-outline" size={19} color="#FFFFFF" />
      </View>
    </Animated.View>
  );
}

export function MapaCaminhoes({ trucks, address, height = 356 }: { trucks: Truck[]; address: string; height?: number }) {
  const displayAddress = address?.trim() ? address.split("—")[0].trim() : "Sua residência";

  return (
    <View style={{ height, overflow: "hidden", borderRadius: 28, backgroundColor: "#DDEFE2", borderWidth: 1, borderColor: "#CDE3D5" }}>
      <Svg width="100%" height="100%" viewBox="0 0 330 356" preserveAspectRatio="none">
        <Rect width="330" height="356" fill="#DDEFE2" />
        <Path d="M-10 286 C45 236 85 286 132 226 S206 157 340 117" stroke="#F8FCF9" strokeWidth="25" fill="none" opacity="0.95" />
        <Path d="M54 -10 C77 73 53 127 122 177 S232 220 337 188" stroke="#F8FCF9" strokeWidth="20" fill="none" opacity="0.95" />
        <Path d="M-10 286 C45 236 85 286 132 226 S206 157 340 117" stroke="#B9D7C2" strokeWidth="2" fill="none" strokeDasharray="6 6" />
        <Path d="M54 -10 C77 73 53 127 122 177 S232 220 337 188" stroke="#B9D7C2" strokeWidth="2" fill="none" strokeDasharray="6 6" />
        <Circle cx="252" cy="70" r="44" fill="#B8DEBF" opacity="0.55" />
        <Circle cx="282" cy="54" r="20" fill="#A8D5BA" opacity="0.5" />
        <Circle cx="38" cy="85" r="28" fill="#C5E2CB" opacity="0.72" />
        <Circle cx="171" cy="315" r="44" fill="#C5E2CB" opacity="0.45" />
      </Svg>

      <View style={{ position: "absolute", left: "34%", top: "48%", alignItems: "center" }}>
        <View style={{ width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", backgroundColor: "#2E4A3D", borderWidth: 3, borderColor: "#FFFFFF", shadowColor: "#2E4A3D", shadowOpacity: 0.2, shadowRadius: 7, elevation: 4 }}>
          <MaterialCommunityIcons name="home-outline" size={20} color="#FFFFFF" />
        </View>
        <View style={{ marginTop: 7, maxWidth: 132, borderRadius: 10, backgroundColor: "#FFFFFF", paddingHorizontal: 8, paddingVertical: 5 }}>
          <Text numberOfLines={1} style={{ color: "#2E4A3D", fontSize: 11, fontWeight: "700" }}>{displayAddress || "Sua residência"}</Text>
        </View>
      </View>

      {trucks.map((truck) => <TruckMarker key={truck.id} truck={truck} />)}
      <View style={{ position: "absolute", left: 14, bottom: 14, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.94)", paddingHorizontal: 11, paddingVertical: 8 }}>
        <Text style={{ color: "#2E4A3D", fontSize: 11, fontWeight: "700" }}>{trucks.length} caminhões na região</Text>
      </View>
    </View>
  );
}
