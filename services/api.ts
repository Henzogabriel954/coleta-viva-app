import { Platform } from "react-native";
import Constants from "expo-constants";
import type { AuthResponse, Notice, Report, ResidentProfile, Truck, User } from "@/types/domain";

export function getApiBaseUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === "web") {
    if (typeof window !== "undefined" && window.location?.hostname) {
      const host = window.location.hostname;
      if (host !== "localhost" && host !== "127.0.0.1") {
        return `${window.location.protocol}//${host}:8080`;
      }
    }
    return "http://localhost:8080";
  }
  // No Expo Go, detecta o IP do host Metro automaticamente
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;
  if (hostUri) {
    const ip = hostUri.split(":")[0];
    return `http://${ip}:8080`;
  }
  return "http://192.168.3.60:8080";
}

export function getWsBaseUrl(): string {
  const base = getApiBaseUrl();
  return base.replace(/^https?:\/\//, (match) => (match === "https://" ? "wss://" : "ws://"));
}

export const defaultProfile: ResidentProfile = {
  name: "",
  address: "",
  phone: "",
  email: "",
  notificationsEnabled: true,
};

export const demoReports: Report[] = [
  {
    id: "den-1042",
    category: "Descarte irregular",
    description: "Sacos e restos de material descartados próximo à praça.",
    address: "Praça das Acácias, Vila Verde",
    createdAt: "2026-08-24T11:00:00.000Z",
    status: "andamento",
    imageTone: "amber",
    updates: [
      { title: "Denúncia recebida", detail: "Encaminhamos seu relato para a equipe responsável.", at: "24 ago, 11:00" },
      { title: "Vistoria programada", detail: "Uma equipe está prevista para passar pelo local.", at: "25 ago, 09:30" },
    ],
  },
  {
    id: "den-0978",
    category: "Entulho",
    description: "Restos de obra foram deixados na calçada.",
    address: "Rua do Ipê, 41 — Vila Verde",
    createdAt: "2026-08-11T15:40:00.000Z",
    status: "resolvido",
    imageTone: "sage",
    updates: [
      { title: "Denúncia recebida", detail: "Sua solicitação foi registrada.", at: "11 ago, 15:40" },
      { title: "Coleta concluída", detail: "O material foi removido pela equipe de coleta.", at: "13 ago, 14:10" },
    ],
  },
  {
    id: "den-0911",
    category: "Lixo doméstico",
    description: "Acúmulo de resíduos fora do horário de coleta.",
    address: "Alameda dos Lírios, 92 — Vila Verde",
    createdAt: "2026-08-03T08:20:00.000Z",
    status: "pendente",
    imageTone: "sand",
    updates: [{ title: "Denúncia recebida", detail: "Estamos analisando as informações enviadas.", at: "03 ago, 08:20" }],
  },
];

export const demoNotices: Notice[] = [
  {
    id: "not-1",
    title: "Caminhão a 500 m de você",
    body: "A coleta de recicláveis está se aproximando da Rua das Palmeiras.",
    time: "Agora",
    kind: "route",
    read: false,
  },
  {
    id: "not-2",
    title: "Coleta concluída na sua rua",
    body: "A rota de resíduos orgânicos foi finalizada às 09:45.",
    time: "Hoje, 09:45",
    kind: "success",
    read: false,
  },
  {
    id: "not-3",
    title: "Atualização na sua denúncia",
    body: "A vistoria da Praça das Acácias foi programada.",
    time: "Ontem, 16:20",
    kind: "report",
    read: true,
  },
];

// Helper com timeout para fetch
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${getApiBaseUrl()}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options?.headers,
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ==================== ENDPOINTS DE AUTENTICAÇÃO ====================

export async function registerApi(input: {
  name: string;
  email: string;
  phone: string;
  address: string;
  password: string;
}): Promise<AuthResponse> {
  return await apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function loginApi(input: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getCurrentUserApi(token: string): Promise<User | null> {
  try {
    return await apiFetch<User>("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch {
    return null;
  }
}

export async function logoutApi(token?: string): Promise<void> {
  try {
    await apiFetch("/api/auth/logout", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch {
    // Silencioso se offline
  }
}

// ==================== ENDPOINTS CONECTADOS AO BACKEND GO ====================

export async function fetchProfileApi(): Promise<ResidentProfile | null> {
  try {
    return await apiFetch<ResidentProfile>("/api/profile");
  } catch (err) {
    return null;
  }
}

export async function saveProfileApi(
  profile: Omit<ResidentProfile, "notificationsEnabled"> & { notificationsEnabled?: boolean },
  token?: string | null,
): Promise<ResidentProfile | null> {
  try {
    return await apiFetch<ResidentProfile>("/api/profile", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(profile),
    });
  } catch (err) {
    console.log("[API] Falha ao sincronizar perfil com backend:", (err as Error).message);
    return null;
  }
}

export async function updateNotificationPreferenceApi(
  enabled: boolean,
  token?: string | null,
): Promise<ResidentProfile | null> {
  try {
    return await apiFetch<ResidentProfile>("/api/profile/notifications", {
      method: "PATCH",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify({ enabled }),
    });
  } catch (err) {
    console.log("[API] Falha ao atualizar notificação no backend:", (err as Error).message);
    return null;
  }
}

export async function fetchReportsApi(): Promise<Report[] | null> {
  try {
    return await apiFetch<Report[]>("/api/reports");
  } catch (err) {
    console.log("[API] Usando denúncias offline:", (err as Error).message);
    return null;
  }
}

export async function createReportApi(
  input: { category: string; description: string; address: string; imageUri?: string },
  token?: string | null,
): Promise<Report | null> {
  try {
    return await apiFetch<Report>("/api/reports", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: JSON.stringify(input),
    });
  } catch (err) {
    console.log("[API] Falha ao enviar denúncia para o backend:", (err as Error).message);
    return null;
  }
}

export async function fetchNoticesApi(): Promise<Notice[] | null> {
  try {
    return await apiFetch<Notice[]>("/api/notices");
  } catch (err) {
    console.log("[API] Usando avisos offline:", (err as Error).message);
    return null;
  }
}

export async function markAllNoticesReadApi(): Promise<boolean> {
  try {
    await apiFetch<{ success: boolean }>("/api/notices/read-all", {
      method: "POST",
    });
    return true;
  } catch (err) {
    console.log("[API] Falha ao sincronizar leitura de avisos:", (err as Error).message);
    return false;
  }
}

export async function fetchTrucksApi(): Promise<{ trucks: Truck[]; nearestTruck?: Truck } | null> {
  try {
    return await apiFetch<{ trucks: Truck[]; nearestTruck?: Truck }>("/api/trucks");
  } catch (err) {
    return null;
  }
}
