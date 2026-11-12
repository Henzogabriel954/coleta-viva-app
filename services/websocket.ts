import type { Truck } from "@/types/domain";

export const initialTruckPositions: Truck[] = [
  {
    id: "truck-21",
    label: "Caminhão 04 — Vila Verde",
    service: "Coleta seletiva",
    distanceMeters: 500,
    etaMinutes: 6,
    mapX: 72,
    mapY: 31,
    color: "#7FB69E",
  },
  {
    id: "truck-18",
    label: "Caminhão 02 — Centro/Sul",
    service: "Coleta domiciliar",
    distanceMeters: 1200,
    etaMinutes: 15,
    mapX: 21,
    mapY: 68,
    color: "#47745B",
  },
];

export function advanceTruckPositions(trucks: Truck[]): Truck[] {
  return trucks.map((truck, index) => {
    const isNearest = index === 0;
    let nextDistance = truck.distanceMeters - (isNearest ? 35 : 20);
    let nextX = truck.mapX;
    let nextY = truck.mapY;

    if (isNearest) {
      if (nextDistance <= 140) {
        // Reinicia o circuito da rota de coleta seletiva
        nextDistance = 820;
        nextX = 72;
        nextY = 31;
      } else {
        nextX = Math.max(40, nextX - 1.3);
        nextY = Math.min(49, nextY + 0.8);
      }
    } else {
      if (nextDistance <= 420) {
        // Reinicia o circuito da rota domiciliar
        nextDistance = 1380;
        nextX = 21;
        nextY = 68;
      } else {
        nextX = Math.min(35, nextX + 0.9);
        nextY = Math.max(50, nextY - 0.8);
      }
    }

    return {
      ...truck,
      distanceMeters: Math.round(nextDistance),
      etaMinutes: Math.max(1, Math.ceil(nextDistance / 75)),
      mapX: Math.round(nextX * 10) / 10,
      mapY: Math.round(nextY * 10) / 10,
    };
  });
}
