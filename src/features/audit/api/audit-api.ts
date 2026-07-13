import { api, toQueryString } from "@/lib/api-client";
import type { PaginatedResponse } from "@/types";

export interface AuditEntry {
  id: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  createdAt: string;
  actor: { id: string; name: string; adminRole: string } | null;
}

export type AuditResponse = PaginatedResponse<AuditEntry>;

export function getUserActivity(
  userId: string,
  page = 1,
  limit = 50,
): Promise<AuditResponse> {
  return api.getPaginated<AuditEntry>(
    `admin/users/${userId}/activity${toQueryString({ page, limit })}`,
  );
}

export function getVendorActivity(
  vendorId: string,
  page = 1,
  limit = 50,
): Promise<AuditResponse> {
  return api.getPaginated<AuditEntry>(
    `admin/vendors/${vendorId}/activity${toQueryString({ page, limit })}`,
  );
}
