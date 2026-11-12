import { describe, expect, it } from "vitest";

import { statusLabel, statusTheme } from "@/lib/demo-utils";
import { advanceTruckPositions, initialTruckPositions } from "@/services/websocket";

describe("regras visuais da demonstração", () => {
  it("traduz todos os status de denúncia para rótulos em português", () => {
    expect(statusLabel("pendente")).toBe("Pendente");
    expect(statusLabel("andamento")).toBe("Em andamento");
    expect(statusLabel("resolvido")).toBe("Resolvido");
  });

  it("usa uma paleta de atenção e sucesso consistente para os status", () => {
    expect(statusTheme("pendente").background).toBe("#FFF6DF");
    expect(statusTheme("resolvido").border).toBe("#8FCB9B");
  });

  it("avança os caminhões sem permitir distância negativa", () => {
    const nextPositions = advanceTruckPositions(initialTruckPositions);
    expect(nextPositions[0].distanceMeters).toBeLessThan(initialTruckPositions[0].distanceMeters);
    expect(nextPositions[0].distanceMeters).toBeGreaterThanOrEqual(180);
    expect(nextPositions[1].distanceMeters).toBeGreaterThanOrEqual(650);
  });
});
