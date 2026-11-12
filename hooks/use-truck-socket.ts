import { useEffect, useMemo, useState } from "react";
import { fetchTrucksApi, getWsBaseUrl } from "@/services/api";
import { advanceTruckPositions, initialTruckPositions } from "@/services/websocket";
import type { Truck } from "@/types/domain";

export function useTruckSocket() {
  const [trucks, setTrucks] = useState<Truck[]>(initialTruckPositions);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let isCancelled = false;
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    // 1. Busca inicial imediata na API Go
    async function loadInitial() {
      const data = await fetchTrucksApi();
      if (!isCancelled && data && data.trucks?.length > 0) {
        setTrucks(data.trucks);
        setLastUpdated(new Date());
      }
    }
    void loadInitial();

    // 2. Conecta ao WebSocket do backend Go
    try {
      const wsUrl = `${getWsBaseUrl()}/ws/trucks`;
      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        if (!isCancelled) setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data as string);
          if (payload.trucks && Array.isArray(payload.trucks)) {
            if (!isCancelled) {
              setTrucks(payload.trucks);
              setLastUpdated(new Date());
            }
          }
        } catch {
          // Ignora mensagens malformadas
        }
      };

      ws.onerror = () => {
        // Fallback para polling se o WebSocket falhar
        startPolling();
      };

      ws.onclose = () => {
        if (!isCancelled) setIsConnected(false);
        startPolling();
      };
    } catch {
      startPolling();
    }

    function startPolling() {
      if (pollInterval) return;
      pollInterval = setInterval(async () => {
        const data = await fetchTrucksApi();
        if (!isCancelled) {
          if (data && data.trucks?.length > 0) {
            setTrucks(data.trucks);
          } else {
            // Fallback offline caso o servidor esteja inacessível
            setTrucks((current) => advanceTruckPositions(current));
          }
          setLastUpdated(new Date());
        }
      }, 4000);
    }

    return () => {
      isCancelled = true;
      if (ws) ws.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, []);

  const nearestTruck = useMemo(
    () => [...trucks].sort((a, b) => a.distanceMeters - b.distanceMeters)[0],
    [trucks],
  );

  return { trucks, nearestTruck, lastUpdated, isConnected };
}
