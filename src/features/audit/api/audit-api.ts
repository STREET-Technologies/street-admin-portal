import { api } from "@/lib/api-client";

export interface AuditEntry {
  id: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  actor: { id: string; name: string; adminRole: string } | null;
}

export interface AuditMeta {
  total: number;
  page: number;
  limit: number;
}

export interface AuditResponse {
  data: AuditEntry[];
  meta: AuditMeta;
}

export async function getUserActivity(
  userId: string,
  page = 1,
  limit = 50,
): Promise<AuditResponse> {
  return api.getRaw<AuditResponse>(
    `admin/users/${userId}/activity?page=${page}&limit=${limit}`,
  );
}

export async function getVendorActivity(
  vendorId: string,
  page = 1,
  limit = 50,
): Promise<AuditResponse> {
  return api.getRaw<AuditResponse>(
    `admin/vendors/${vendorId}/activity?page=${page}&limit=${limit}`,
  );
}
