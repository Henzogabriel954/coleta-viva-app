import { useCallback, useState } from "react";
import * as Location from "expo-location";

export type ResidentLocation = {
  latitude: number;
  longitude: number;
  label: string;
};

export function useLocation() {
  const [location, setLocation] = useState<ResidentLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        setError("Ative os serviços de localização para atualizar sua posição.");
        return null;
      }

      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== "granted") {
        setError("A localização não foi autorizada. Você ainda pode continuar usando o endereço cadastrado.");
        return null;
      }

      const current = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const nextLocation = {
        latitude: current.coords.latitude,
        longitude: current.coords.longitude,
        label: "Localização atual",
      };
      setLocation(nextLocation);
      return nextLocation;
    } catch {
      setError("Não foi possível obter sua localização neste momento.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { location, isLoading, error, requestLocation };
}
