import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { router } from "expo-router";

import {
  defaultProfile,
  demoNotices,
  demoReports,
  fetchReportsApi,
  fetchNoticesApi,
  saveProfileApi,
  updateNotificationPreferenceApi,
  createReportApi,
  markAllNoticesReadApi,
  loginApi,
  registerApi,
  getCurrentUserApi,
  logoutApi,
} from "@/services/api";
import type { Notice, Report, ReportCategory, ResidentProfile, User } from "@/types/domain";

const STORAGE_KEYS = {
  token: "coleta-viva.token",
  profile: "coleta-viva.profile",
  reports: "coleta-viva.reports",
  notices: "coleta-viva.notices",
  onboarding: "coleta-viva.onboarding",
};

type NewReport = {
  category: ReportCategory;
  description: string;
  imageUri?: string;
  address: string;
};

type DemoContextValue = {
  hydrated: boolean;
  hasCompletedOnboarding: boolean;
  isAuthenticated: boolean;
  token: string | null;
  profile: ResidentProfile;
  reports: Report[];
  notices: Notice[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (input: { name: string; email: string; phone: string; address: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  completeProfile: (profile: Omit<ResidentProfile, "notificationsEnabled"> & { notificationsEnabled?: boolean }) => Promise<void>;
  updateNotificationPreference: (enabled: boolean) => Promise<void>;
  addReport: (report: NewReport) => Promise<Report>;
  markAllNoticesRead: () => Promise<void>;
  clearDemo: () => Promise<void>;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: PropsWithChildren) {
  const [hydrated, setHydrated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<ResidentProfile>(defaultProfile);
  const [reports, setReports] = useState<Report[]>(demoReports);
  const [notices, setNotices] = useState<Notice[]>(demoNotices);

  useEffect(() => {
    async function restoreAndSync() {
      let savedToken: string | null = null;
      let loadedProfile: ResidentProfile | null = null;

      // 1. Carrega dados do cache local imediatamente (fast load)
      try {
        const [tokenVal, savedProfile, savedReports, savedNotices, savedOnboarding] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.token),
          AsyncStorage.getItem(STORAGE_KEYS.profile),
          AsyncStorage.getItem(STORAGE_KEYS.reports),
          AsyncStorage.getItem(STORAGE_KEYS.notices),
          AsyncStorage.getItem(STORAGE_KEYS.onboarding),
        ]);

        if (tokenVal) {
          savedToken = tokenVal;
          setToken(tokenVal);
        }

        if (savedProfile) {
          const parsed = JSON.parse(savedProfile);
          // Se for o mock antigo "Mariana Costa", descarta para começar limpo
          if (parsed.name && parsed.name !== "Mariana Costa") {
            loadedProfile = parsed;
            setProfile(parsed);
          }
        }

        if (savedOnboarding === "true" && (savedToken || loadedProfile?.name)) {
          setHasCompletedOnboarding(true);
        } else {
          setHasCompletedOnboarding(false);
        }

        if (savedReports) setReports(JSON.parse(savedReports));
        if (savedNotices) setNotices(JSON.parse(savedNotices));
      } catch (error) {
        console.warn("[DemoStore] Falha ao restaurar dados locais:", error);
      } finally {
        setHydrated(true);
      }

      // 2. Sincroniza em background com a API Go + PostgreSQL
      try {
        if (savedToken) {
          const remoteUser = await getCurrentUserApi(savedToken);
          if (remoteUser) {
            const userProfile: ResidentProfile = {
              name: remoteUser.name,
              address: remoteUser.address,
              phone: remoteUser.phone,
              email: remoteUser.email,
              notificationsEnabled: remoteUser.notificationsEnabled,
            };
            setProfile(userProfile);
            setHasCompletedOnboarding(true);
            await AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(userProfile));
          }
        }

        const [remoteReports, remoteNotices] = await Promise.all([
          fetchReportsApi(),
          fetchNoticesApi(),
        ]);

        if (remoteReports && remoteReports.length > 0) {
          setReports(remoteReports);
          await AsyncStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(remoteReports));
        }
        if (remoteNotices && remoteNotices.length > 0) {
          setNotices(remoteNotices);
          await AsyncStorage.setItem(STORAGE_KEYS.notices, JSON.stringify(remoteNotices));
        }
      } catch (syncErr) {
        console.log("[DemoStore] Sincronização remota em background:", (syncErr as Error).message);
      }
    }

    void restoreAndSync();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await loginApi({ email, password });
      const userProfile: ResidentProfile = {
        name: res.user.name,
        address: res.user.address,
        phone: res.user.phone,
        email: res.user.email,
        notificationsEnabled: res.user.notificationsEnabled,
      };

      setToken(res.token);
      setProfile(userProfile);
      setHasCompletedOnboarding(true);

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.token, res.token),
        AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(userProfile)),
        AsyncStorage.setItem(STORAGE_KEYS.onboarding, "true"),
      ]);

      router.replace("/(tabs)/mapa");
      return { success: true };
    } catch (err: any) {
      const errMsg = err?.message || "";
      const isNetworkError = errMsg.includes("fetch") || errMsg.includes("aborted") || errMsg.includes("Network") || errMsg.includes("failed");
      if (isNetworkError) {
        console.warn("[Login] Servidor indisponível, iniciando com perfil de demonstração local:", errMsg);
        const demoUser: ResidentProfile = {
          name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          email,
          phone: "(11) 98765-4321",
          address: "Rua das Palmeiras, 120 — Vila Verde",
          notificationsEnabled: true,
        };
        const localToken = `local-demo-${Date.now()}`;
        setToken(localToken);
        setProfile(demoUser);
        setHasCompletedOnboarding(true);
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.token, localToken),
          AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(demoUser)),
          AsyncStorage.setItem(STORAGE_KEYS.onboarding, "true"),
        ]);
        router.replace("/(tabs)/mapa");
        return { success: true };
      }
      return { success: false, error: err.message || "Erro ao fazer login" };
    }
  };

  const register = async (input: { name: string; email: string; phone: string; address: string; password: string }) => {
    try {
      const res = await registerApi(input);
      const userProfile: ResidentProfile = {
        name: res.user.name,
        address: res.user.address,
        phone: res.user.phone,
        email: res.user.email,
        notificationsEnabled: res.user.notificationsEnabled,
      };

      setToken(res.token);
      setProfile(userProfile);
      setHasCompletedOnboarding(true);

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.token, res.token),
        AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(userProfile)),
        AsyncStorage.setItem(STORAGE_KEYS.onboarding, "true"),
      ]);

      router.replace("/(tabs)/mapa");
      return { success: true };
    } catch (err: any) {
      const errMsg = err?.message || "";
      const isNetworkError = errMsg.includes("fetch") || errMsg.includes("aborted") || errMsg.includes("Network") || errMsg.includes("failed");
      if (isNetworkError) {
        console.warn("[Register] Servidor indisponível, salvando cadastro localmente:", errMsg);
        const fallbackProfile: ResidentProfile = {
          name: input.name,
          email: input.email,
          phone: input.phone,
          address: input.address,
          notificationsEnabled: true,
        };
        const localToken = `local-demo-${Date.now()}`;
        setToken(localToken);
        setProfile(fallbackProfile);
        setHasCompletedOnboarding(true);
        await Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.token, localToken),
          AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(fallbackProfile)),
          AsyncStorage.setItem(STORAGE_KEYS.onboarding, "true"),
        ]);
        router.replace("/(tabs)/mapa");
        return { success: true };
      }
      return { success: false, error: err.message || "Erro ao realizar cadastro" };
    }
  };

  const logout = async () => {
    if (token) {
      void logoutApi(token);
    }
    setToken(null);
    setProfile(defaultProfile);
    setHasCompletedOnboarding(false);

    await AsyncStorage.multiRemove([
      STORAGE_KEYS.token,
      STORAGE_KEYS.profile,
      STORAGE_KEYS.onboarding,
    ]);

    router.replace("/(auth)");
  };

  const completeProfile = async (nextProfile: Omit<ResidentProfile, "notificationsEnabled"> & { notificationsEnabled?: boolean }) => {
    const value: ResidentProfile = {
      ...nextProfile,
      notificationsEnabled: nextProfile.notificationsEnabled ?? profile.notificationsEnabled,
    };
    setProfile(value);
    setHasCompletedOnboarding(true);

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(value)),
      AsyncStorage.setItem(STORAGE_KEYS.onboarding, "true"),
      saveProfileApi(value, token),
    ]);
  };

  const updateNotificationPreference = async (enabled: boolean) => {
    const value = { ...profile, notificationsEnabled: enabled };
    setProfile(value);
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.profile, JSON.stringify(value)),
      updateNotificationPreferenceApi(enabled, token),
    ]);
  };

  const addReport = async (input: NewReport) => {
    const now = new Date();
    const tone = input.category === "Entulho" ? "sage" : input.category === "Lixo doméstico" ? "sand" : "amber";

    // Tenta enviar para a API em Go conectada ao PostgreSQL
    const remoteReport = await createReportApi(input, token);

    const report: Report = remoteReport || {
      id: `den-${now.getTime()}`,
      category: input.category,
      description: input.description,
      imageUri: input.imageUri,
      address: input.address,
      createdAt: now.toISOString(),
      status: "pendente",
      imageTone: tone,
      updates: [{ title: "Denúncia recebida", detail: "Recebemos seu relato e iniciaremos a triagem.", at: "Agora" }],
    };

    const nextReports = [report, ...reports.filter((r) => r.id !== report.id)];
    const nextNotices: Notice[] = [
      {
        id: `not-${now.getTime()}`,
        title: "Denúncia registrada",
        body: "Seu protocolo foi criado e está aguardando análise.",
        time: "Agora",
        kind: "report",
        read: false,
      },
      ...notices,
    ];

    setReports(nextReports);
    setNotices(nextNotices);

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(nextReports)),
      AsyncStorage.setItem(STORAGE_KEYS.notices, JSON.stringify(nextNotices)),
    ]);

    return report;
  };

  const markAllNoticesRead = async () => {
    const value = notices.map((notice) => ({ ...notice, read: true }));
    setNotices(value);
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.notices, JSON.stringify(value)),
      markAllNoticesReadApi(),
    ]);
  };

  const clearDemo = async () => {
    await logout();
  };

  const isAuthenticated = Boolean(profile.name && profile.name.trim().length > 0);

  const value = useMemo(
    () => ({
      hydrated,
      hasCompletedOnboarding,
      isAuthenticated,
      token,
      profile,
      reports,
      notices,
      login,
      register,
      logout,
      completeProfile,
      updateNotificationPreference,
      addReport,
      markAllNoticesRead,
      clearDemo,
    }),
    [hydrated, hasCompletedOnboarding, isAuthenticated, token, profile, reports, notices],
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) throw new Error("useDemo deve ser usado dentro de DemoProvider");
  return context;
}
