import type { ReportStatus } from "@/types/domain";

export const statusLabel = (status: ReportStatus) => {
  const labels: Record<ReportStatus, string> = {
    pendente: "Pendente",
    andamento: "Em andamento",
    resolvido: "Resolvido",
  };
  return labels[status];
};

export const statusTheme = (status: ReportStatus) => {
  const theme: Record<ReportStatus, { background: string; text: string; border: string }> = {
    pendente: { background: "#FFF6DF", text: "#8A6A2E", border: "#F4D9A0" },
    andamento: { background: "#EAF5EE", text: "#45745B", border: "#A8D5BA" },
    resolvido: { background: "#E8F7EA", text: "#3F7650", border: "#8FCB9B" },
  };
  return theme[status];
};

export const dateLabel = (isoDate?: string) => {
  if (!isoDate) return "Recente";
  try {
    const d = new Date(isoDate);
    if (isNaN(d.getTime())) return "Recente";
    return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
      .format(d)
      .replace(".", "");
  } catch {
    return "Recente";
  }
};
