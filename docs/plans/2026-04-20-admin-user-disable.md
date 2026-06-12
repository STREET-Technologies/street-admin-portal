# Admin User Disable/Suspend Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow ADMIN-role users to disable (suspend) other admin accounts without deleting them, preserving audit trail history, and immediately invalidating their active sessions.

**Architecture:** Add an `isAdminDisabled` boolean column to the `users` table. Block disabled users at login in `adminLogin`. On disable, bulk-delete all Redis refresh tokens for that user using the existing `invalidatePattern` method. The admin portal shows disabled users with a "Suspended" badge and a re-enable action, guarded to ADMIN role only.

**Tech Stack:** NestJS / TypeORM / PostgreSQL / ioredis (street-backend) · React 18 / TanStack Query / shadcn/ui / Tailwind v4 (street-admin-portal)

---

## Repos

- **Backend:** `~/git_repo/STREET/street-backend`
- **Frontend:** `~/git_repo/STREET/street-admin-portal`

---

### Task 1: Migration — add `is_admin_disabled` to users

**Files:**
- Create: `src/database/migrations/1771300000000-AddIsAdminDisabledToUsers.ts`
- Modify: `src/database/entities/user.entity.ts`

**Step 1: Create the migration file**

```typescript
// src/database/migrations/1771300000000-AddIsAdminDisabledToUsers.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsAdminDisabledToUsers1771300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN "isAdminDisabled" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "isAdminDisabled"`,
    );
  }
}
```

**Step 2: Add the field to the User entity**

In `src/database/entities/user.entity.ts`, add after `isAnonymized`:

```typescript
@Column({ type: 'boolean', default: false })
isAdminDisabled: boolean;
```

**Step 3: Verify TypeScript compiles**

```bash
cd ~/git_repo/STREET/street-backend
npm run build
```

Expected: build completes with no errors.

**Step 4: Commit**

```bash
git add src/database/migrations/1771300000000-AddIsAdminDisabledToUsers.ts \
        src/database/entities/user.entity.ts
git commit -m "feat: add isAdminDisabled field to users entity and migration"
```

---

### Task 2: Auth service — block disabled login + bulk token invalidation

**Files:**
- Modify: `src/modules/v1/auth/services/auth.service.ts`

**Context:**
- `adminLogin` is at line ~250. After `if (!user || user.role !== Role.ADMIN)` check (line 259), add the disabled check.
- `invalidatePattern` exists on `redisService` — use it with pattern `refresh_token:{userId}:*` to wipe all device sessions.
- The legacy single-session key `refresh_token:{userId}` (no family suffix) must also be deleted.

**Step 1: Add `invalidateAllAdminTokens` method**

Add this private method to `AuthService` (after the existing `invalidateRefreshToken` method, ~line 668):

```typescript
async invalidateAllAdminTokens(userId: string): Promise<void> {
  await Promise.all([
    this.redisService.invalidatePattern(`${REFRESH_TOKEN_PREFIX}${userId}:*`),
    this.redisService.del(`${REFRESH_TOKEN_PREFIX}${userId}`),
  ]);
}
```

**Step 2: Block disabled users in `adminLogin`**

After the `!user || user.role !== Role.ADMIN` guard (line ~259), add:

```typescript
// Disabled accounts cannot log in
if (user.isAdminDisabled) {
  throw new UnauthorizedException(genericError);
}
```

**Step 3: Verify TypeScript compiles**

```bash
cd ~/git_repo/STREET/street-backend
npm run build
```

Expected: no errors.

**Step 4: Commit**

```bash
git add src/modules/v1/auth/services/auth.service.ts
git commit -m "feat: block disabled admin login; add invalidateAllAdminTokens"
```

---

### Task 3: Users service — disable and enable methods

**Files:**
- Modify: `src/modules/v1/users/services/users.service.ts`
- Modify: `src/modules/v1/users/users.module.ts` (inject AuthService if not already present)

**Context:**
- `UsersService` is in `src/modules/v1/users/services/users.service.ts`.
- Check whether `AuthService` is already injected. If not, inject it via constructor. Be careful about circular dependency — if `AuthService` already injects `UsersService`, use `forwardRef`.
- `findAdminUserById` exists in `users.repository.ts` and returns `User | null` for admin-role users.

**Step 1: Check for circular dependency**

```bash
grep -n "UsersService\|AuthService" ~/git_repo/STREET/street-backend/src/modules/v1/users/users.module.ts
grep -n "UsersService\|AuthService" ~/git_repo/STREET/street-backend/src/modules/v1/auth/services/auth.service.ts | head -5
```

If `AuthService` already imports `UsersService`, you must use `forwardRef`. Otherwise direct injection is fine.

**Step 2: Add the disable/enable methods to UsersService**

Add these two methods (after `updateAdminUserRole`):

```typescript
async disableAdminUser(targetId: string, actorId: string): Promise<User> {
  if (targetId === actorId) {
    throw new BadRequestException('You cannot disable your own account');
  }
  const user = await this.usersRepo.findAdminUserById(targetId);
  if (!user) {
    throw new NotFoundException('Admin user not found');
  }
  if (user.isAdminDisabled) {
    throw new BadRequestException('Account is already disabled');
  }
  user.isAdminDisabled = true;
  const updated = await this.usersRepo.save(user);
  await this.authService.invalidateAllAdminTokens(targetId);
  return updated;
}

async enableAdminUser(targetId: string, actorId: string): Promise<User> {
  if (targetId === actorId) {
    throw new BadRequestException('You cannot re-enable your own account');
  }
  const user = await this.usersRepo.findAdminUserById(targetId);
  if (!user) {
    throw new NotFoundException('Admin user not found');
  }
  if (!user.isAdminDisabled) {
    throw new BadRequestException('Account is not disabled');
  }
  user.isAdminDisabled = false;
  return this.usersRepo.save(user);
}
```

Ensure `BadRequestException` and `NotFoundException` are imported from `@nestjs/common`.

**Step 3: Inject AuthService into UsersService**

In `users.service.ts` constructor, add:
```typescript
private readonly authService: AuthService,
```

In `users.module.ts`, import `AuthModule` (or use `forwardRef` if circular). Check the existing imports. Add `AuthModule` to `imports` array if not present.

**Step 4: Verify TypeScript compiles**

```bash
cd ~/git_repo/STREET/street-backend
npm run build
```

Expected: no errors. If circular dep error, wrap both with `forwardRef(() => AuthService)` / `forwardRef(() => UsersModule)`.

**Step 5: Commit**

```bash
git add src/modules/v1/users/services/users.service.ts \
        src/modules/v1/users/users.module.ts
git commit -m "feat: add disableAdminUser and enableAdminUser to UsersService"
```

---

### Task 4: Admin controller — disable/enable endpoints

**Files:**
- Modify: `src/modules/v1/admin/admin.controller.ts`

**Context:**
- Existing admin-users endpoints are around line 202.
- All admin-users management endpoints use `@AdminRoles(AdminRole.ADMIN)` + `@UseGuards(AdminRoleGuard)`.
- `req.user.sub` is the actor's userId (set by AdminAuthGuard).

**Step 1: Add two endpoints after the existing `updateAdminUserRole` endpoint (~line 226)**

```typescript
@AdminRoles(AdminRole.ADMIN)
@UseGuards(AdminRoleGuard)
@Patch('admin-users/:id/disable')
@ApiOperation({ summary: '[ADMIN] Disable an admin user account' })
async disableAdminUser(
  @Param('id', ParseUUIDPipe) id: string,
  @Request() req: any,
): Promise<{ data: { id: string; isAdminDisabled: boolean } }> {
  const user = await this.usersService.disableAdminUser(id, req.user.sub);
  return { data: { id: user.id, isAdminDisabled: user.isAdminDisabled } };
}

@AdminRoles(AdminRole.ADMIN)
@UseGuards(AdminRoleGuard)
@Patch('admin-users/:id/enable')
@ApiOperation({ summary: '[ADMIN] Re-enable a disabled admin user account' })
async enableAdminUser(
  @Param('id', ParseUUIDPipe) id: string,
  @Request() req: any,
): Promise<{ data: { id: string; isAdminDisabled: boolean } }> {
  const user = await this.usersService.enableAdminUser(id, req.user.sub);
  return { data: { id: user.id, isAdminDisabled: user.isAdminDisabled } };
}
```

**Step 2: Verify TypeScript compiles**

```bash
cd ~/git_repo/STREET/street-backend
npm run build
```

Expected: no errors.

**Step 3: Commit**

```bash
git add src/modules/v1/admin/admin.controller.ts
git commit -m "feat: add PATCH admin-users/:id/disable and enable endpoints"
```

---

### Task 5: Frontend — types, API calls, mutations

**Files:**
- Modify: `src/features/admin-users/types.ts`
- Modify: `src/features/admin-users/api/admin-users-api.ts`
- Modify: `src/features/admin-users/api/admin-users-queries.ts`

**Context:**
- `BackendAdminUser` maps to the raw backend response. The new `isAdminDisabled` field is a boolean.
- `AdminUserViewModel` is the frontend view model used by components.
- Mutations use `useMutation` from TanStack Query. See `src/features/admin-users/api/invites-queries.ts` for the mutation pattern used in this feature.

**Step 1: Update types**

In `src/features/admin-users/types.ts`:

Add `isAdminDisabled: boolean` to `BackendAdminUser`:
```typescript
export interface BackendAdminUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  createdAt: string;
  adminRole: AdminRole;
  isAdminDisabled: boolean;
}
```

Add `isAdminDisabled: boolean` to `AdminUserViewModel`:
```typescript
export interface AdminUserViewModel {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  adminRole: AdminRole;
  isAdminDisabled: boolean;
}
```

Update `toAdminUserViewModel` to pass through `isAdminDisabled`:
```typescript
export function toAdminUserViewModel(user: BackendAdminUser): AdminUserViewModel {
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email;
  return {
    id: user.id,
    name,
    email: user.email,
    createdAt: user.createdAt,
    adminRole: user.adminRole,
    isAdminDisabled: user.isAdminDisabled,
  };
}
```

**Step 2: Add API functions**

In `src/features/admin-users/api/admin-users-api.ts`, add:

```typescript
export async function disableAdminUser(userId: string): Promise<void> {
  await api.patch(`admin/admin-users/${userId}/disable`, {});
}

export async function enableAdminUser(userId: string): Promise<void> {
  await api.patch(`admin/admin-users/${userId}/enable`, {});
}
```

**Step 3: Add mutations**

In `src/features/admin-users/api/admin-users-queries.ts`, add:

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminUsers, updateAdminUserRole, disableAdminUser, enableAdminUser } from "./admin-users-api";
import { toAdminUserViewModel } from "../types";

// ... existing exports unchanged ...

export function useDisableAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => disableAdminUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUserKeys.all }),
  });
}

export function useEnableAdminUserMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => enableAdminUser(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminUserKeys.all }),
  });
}
```

**Step 4: Verify TypeScript compiles**

```bash
cd ~/git_repo/STREET/street-admin-portal
npm run typecheck 2>/dev/null || npx tsc --noEmit
```

Expected: no errors.

**Step 5: Commit**

```bash
git add src/features/admin-users/types.ts \
        src/features/admin-users/api/admin-users-api.ts \
        src/features/admin-users/api/admin-users-queries.ts
git commit -m "feat: add isAdminDisabled to admin user types and disable/enable mutations"
```

---

### Task 6: Frontend UI — AdminUsersPage disable/enable actions

**Files:**
- Modify: `src/features/admin-users/components/AdminUsersPage.tsx`

**Context:**
The current card layout is in `AdminUsersPage.tsx`. Each card shows a `Select` for role (if ADMIN and not self) or a static badge (if viewer/self). We need to add:
1. A "Suspended" badge on the card when `admin.isAdminDisabled === true`.
2. A disable button (only when: current user is ADMIN, target is not self, target is not disabled).
3. A re-enable button (only when: current user is ADMIN, target is not self, target IS disabled).
4. Disabled users have their card visually muted (opacity, greyed name).

**Step 1: Import new hooks and icons**

Add to imports:
```typescript
import { UserX, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDisableAdminUserMutation, useEnableAdminUserMutation } from "../api/admin-users-queries";
```

**Step 2: Wire up mutations**

Inside the component, after the existing `revokeMutation`:
```typescript
const disableMutation = useDisableAdminUserMutation();
const enableMutation = useEnableAdminUserMutation();
```

Add a handler function:
```typescript
async function handleToggleDisabled(userId: string, currentlyDisabled: boolean) {
  try {
    if (currentlyDisabled) {
      await enableMutation.mutateAsync(userId);
      toast.success("Account re-enabled");
    } else {
      await disableMutation.mutateAsync(userId);
      toast.success("Account suspended — active sessions invalidated");
    }
  } catch {
    toast.error("Failed to update account status");
  }
}
```

**Step 3: Update the card rendering**

Replace the `<Card key={admin.id}>` block with:

```tsx
<Card
  key={admin.id}
  className={admin.isAdminDisabled ? "opacity-60" : undefined}
>
  <CardHeader className="pb-3">
    <div className="flex items-start justify-between gap-2">
      <CardTitle className="flex items-center gap-2 text-base">
        <Shield className="size-4 shrink-0 text-muted-foreground" />
        <span className={`truncate ${admin.isAdminDisabled ? "line-through text-muted-foreground" : ""}`}>
          {admin.name}
        </span>
        {currentUser?.email === admin.email && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary shrink-0">
            You
          </span>
        )}
        {admin.isAdminDisabled && (
          <Badge variant="secondary" className="shrink-0 text-xs">
            Suspended
          </Badge>
        )}
      </CardTitle>
      <div className="flex items-center gap-1 shrink-0">
        {isAdmin && currentUser?.email !== admin.email ? (
          <>
            {!admin.isAdminDisabled && (
              <Select
                value={admin.adminRole}
                onValueChange={(v) => handleRoleChange(admin.id, v as AdminRole)}
              >
                <SelectTrigger className="w-24 h-6 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={`size-6 ${admin.isAdminDisabled ? "text-muted-foreground hover:text-foreground" : "text-muted-foreground hover:text-destructive"}`}
              onClick={() => void handleToggleDisabled(admin.id, admin.isAdminDisabled)}
              disabled={disableMutation.isPending || enableMutation.isPending}
              aria-label={admin.isAdminDisabled ? "Re-enable account" : "Suspend account"}
              title={admin.isAdminDisabled ? "Re-enable account" : "Suspend account"}
            >
              {admin.isAdminDisabled
                ? <UserCheck className="size-3.5" />
                : <UserX className="size-3.5" />
              }
            </Button>
          </>
        ) : (
          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground capitalize shrink-0">
            {admin.adminRole ?? "admin"}
          </span>
        )}
      </div>
    </div>
  </CardHeader>
  <CardContent className="space-y-1 text-sm">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Mail className="size-3.5 shrink-0" />
      <span className="truncate">{admin.email}</span>
    </div>
    <p className="text-xs text-muted-foreground">
      Added {formatDate(admin.createdAt)}
    </p>
  </CardContent>
</Card>
```

**Step 4: Verify TypeScript compiles**

```bash
cd ~/git_repo/STREET/street-admin-portal
npm run typecheck 2>/dev/null || npx tsc --noEmit
```

Expected: no errors.

**Step 5: Commit**

```bash
git add src/features/admin-users/components/AdminUsersPage.tsx
git commit -m "feat: show suspended badge and disable/enable actions on team page"
```

---

## Post-implementation

**Run the migration on staging before deploying backend:**
```bash
cd ~/street-backend-staging && npm run migration:run
```

**Manual test flow:**
1. As ADMIN, suspend another admin user → "Suspended" badge appears, card greys out.
2. Attempt to log in as the suspended user → "Invalid email or password" (generic, no enumeration).
3. Re-enable the user → badge disappears, card returns to normal, login works again.
4. Verify self-disable is blocked (button absent for "You" card).
