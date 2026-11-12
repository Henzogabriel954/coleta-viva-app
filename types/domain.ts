export type ReportStatus = "pendente" | "andamento" | "resolvido";

export type ReportCategory = "Descarte irregular" | "Entulho" | "Lixo doméstico";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notificationsEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type ResidentProfile = {
  name: string;
  address: string;
  phone: string;
  email?: string;
  notificationsEnabled: boolean;
};

export type Report = {
  id: string;
  category: ReportCategory;
  description: string;
  address: string;
  createdAt: string;
  status: ReportStatus;
  imageUri?: string;
  imageTone: "amber" | "sage" | "sand";
  updates: Array<{ title: string; detail: string; at: string }>;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  time: string;
  kind: "route" | "success" | "report";
  read: boolean;
};

export type Truck = {
  id: string;
  label: string;
  service: string;
  distanceMeters: number;
  etaMinutes: number;
  mapX: number;
  mapY: number;
  color: string;
};
