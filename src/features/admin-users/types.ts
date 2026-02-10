/** Shape returned by GET /admin/admin-users (backend user entity). */
export interface BackendAdminUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  createdAt: string;
}

/** Frontend view model for admin users. */
export interface AdminUserViewModel {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export function toAdminUserViewModel(
  user: BackendAdminUser,
): AdminUserViewModel {
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  return {
    id: user.id,
    name,
    email: user.email,
    createdAt: user.createdAt,
  };
}
