# Admin Invite System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the manual script-based admin user creation with an email invite flow where an admin sends an invite (email + role), the recipient clicks a time-limited link, sets their own password, and lands in the portal logged in.

**Architecture:** New `admin_invites` table stores one-time tokens (7-day expiry). Backend adds two new flows: `POST /auth/admin/accept-invite` (unauthenticated, sets cookies on success) and three admin-gated invite management endpoints. Portal adds an InviteAdminDialog on the Team page and a standalone unauthenticated `/accept-invite` route.

**Tech Stack:** NestJS + TypeORM + @nestjs-modules/mailer (Pug templates) / React + TanStack Query + shadcn/ui + TanStack Router

**Linear:** TT-62

---

## Repo layout

```
street-backend/
  src/modules/v1/auth/
    services/auth.service.ts          ← add inviteAdmin(), acceptInvite()
    controllers/auth.controller.ts    ← add POST /auth/admin/accept-invite
    dtos/                             ← add accept-invite.dto.ts, invite-admin.dto.ts
  src/modules/v1/admin/
    admin.controller.ts               ← add POST/GET/DELETE invite endpoints
  src/modules/v1/users/
    services/users.service.ts         ← add createAdminUser()
    repositories/users.repository.ts  ← add createAdminUser()
  src/database/
    entities/admin-invite.entity.ts   ← new
    migrations/1770900000000-CreateAdminInvites.ts  ← new
  src/templates/
    admin-invite-email.pug            ← new

street-admin-portal/
  src/features/admin-users/
    types.ts                          ← add AdminInvite types
    api/invites-api.ts                ← new
    api/invites-queries.ts            ← new
    components/AdminUsersPage.tsx     ← add InviteAdminDialog + pending list
    components/InviteAdminDialog.tsx  ← new
  src/app/routes/
    accept-invite.tsx                 ← new (unauthenticated route)
  src/features/admin-users/components/
    AcceptInvitePage.tsx              ← new
```

---

## BACKEND

### Task 1: AdminInvite entity + migration

**Files:**
- Create: `src/database/entities/admin-invite.entity.ts`
- Create: `src/database/migrations/1770900000000-CreateAdminInvites.ts`

**Step 1: Create the entity**

```typescript
// src/database/entities/admin-invite.entity.ts
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { AdminRole } from '../../core/enums/admin-role.enum';

@Entity('admin_invites')
export class AdminInvite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column({ type: 'varchar', length: 20 })
  adminRole: AdminRole;

  @Column({ length: 64 })
  token: string;

  @Column({ nullable: true })
  invitedById: string | null;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  usedAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
```

**Step 2: Create the migration**

```typescript
// src/database/migrations/1770900000000-CreateAdminInvites.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAdminInvites1770900000000 implements MigrationInterface {
  name = 'CreateAdminInvites1770900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "admin_invites" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" character varying NOT NULL,
        "adminRole" character varying(20) NOT NULL,
        "token" character varying(64) NOT NULL,
        "invitedById" uuid,
        "expiresAt" TIMESTAMP NOT NULL,
        "usedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admin_invites" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_admin_invites_token" UNIQUE ("token")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_admin_invites_token" ON "admin_invites" ("token")`);
    await queryRunner.query(`CREATE INDEX "IDX_admin_invites_email" ON "admin_invites" ("email")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "admin_invites"`);
  }
}
```

**Step 3: Commit**

```bash
cd /Users/gunnar/git_repo/STREET/street-backend
git add src/database/entities/admin-invite.entity.ts src/database/migrations/1770900000000-CreateAdminInvites.ts
git commit -m "feat(TT-62): add AdminInvite entity and migration"
```

---

### Task 2: Register entity + add createAdminUser to UsersRepository/Service

`UsersService` has no user-creation method — it only has `findOrCreate*` for phone/Google. We need to add `createAdminUser` to the repository and service.

**Files:**
- Modify: `src/modules/v1/users/repositories/users.repository.ts` — add `createAdminUser()`
- Modify: `src/modules/v1/users/services/users.service.ts` — add `createAdminUser()`
- Modify: `src/modules/v1/auth/auth.module.ts` — register `AdminInvite` entity
- Modify: `src/modules/v1/admin/admin.module.ts` — register `AdminInvite` entity

**Step 1: Add createAdminUser to UsersRepository**

Find the `UsersRepository` class at `src/modules/v1/users/repositories/users.repository.ts`. Add this method (after the existing create methods):

```typescript
async createAdminUser(dto: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  adminRole: AdminRole;
}): Promise<User> {
  const user = this.usersRepository.create({
    email: dto.email,
    password: dto.password,
    firstName: dto.firstName,
    lastName: dto.lastName,
    role: Role.ADMIN,
    adminRole: dto.adminRole,
  });
  return this.usersRepository.save(user);
}
```

Ensure `Role` and `AdminRole` enums are imported. `Role` is at `src/core/enums/role.enum.ts`.

**Step 2: Add createAdminUser to UsersService**

In `src/modules/v1/users/services/users.service.ts`, add:

```typescript
async createAdminUser(dto: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  adminRole: AdminRole;
}): Promise<User> {
  return this.usersRepository.createAdminUser(dto);
}
```

Ensure `AdminRole` is imported from `src/core/enums/admin-role.enum.ts`.

**Step 3: Register AdminInvite entity in AuthModule**

In `src/modules/v1/auth/auth.module.ts`, update the TypeOrmModule.forFeature call:

```typescript
// Before:
TypeOrmModule.forFeature([FcmToken])

// After:
TypeOrmModule.forFeature([FcmToken, AdminInvite])
```

Add import: `import { AdminInvite } from '../../../database/entities/admin-invite.entity';`

**Step 4: Register AdminInvite entity in AdminModule**

In `src/modules/v1/admin/admin.module.ts`, update the TypeOrmModule.forFeature call — add `AdminInvite` to the existing array:

```typescript
TypeOrmModule.forFeature([AdminNote, Order, ReferralCode, ReferralUse, ReferralSettings, AdminInvite])
```

Add import: `import { AdminInvite } from '../../../database/entities/admin-invite.entity';`

**Step 5: Verify build**

```bash
cd /Users/gunnar/git_repo/STREET/street-backend
npm run build
```

Expected: no TypeScript errors.

**Step 6: Commit**

```bash
git add src/modules/v1/users/repositories/users.repository.ts \
        src/modules/v1/users/services/users.service.ts \
        src/modules/v1/auth/auth.module.ts \
        src/modules/v1/admin/admin.module.ts
git commit -m "feat(TT-62): register AdminInvite entity, add createAdminUser to UsersService"
```

---

### Task 3: Email template

**Files:**
- Create: `src/templates/admin-invite-email.pug`

Look at `src/templates/onboarding-complete-email.pug` as a style reference. The templates use Barlow font, black gradient banner, and a CTA button. Match that style.

**Step 1: Create the template**

```pug
//- src/templates/admin-invite-email.pug
doctype html
html(lang="en")
  head
    meta(charset="UTF-8")
    meta(name="viewport" content="width=device-width, initial-scale=1.0")
    title You've been invited to STREET Admin
    style.
      @import url('https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&display=swap');
      body { margin: 0; padding: 0; font-family: 'Barlow', Arial, sans-serif; background-color: #f5f5f5; }
      .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 40px 32px; text-align: center; }
      .logo { color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 4px; }
      .body { padding: 40px 32px; }
      h1 { font-size: 22px; font-weight: 600; color: #111; margin: 0 0 16px; }
      p { font-size: 15px; color: #444; line-height: 1.6; margin: 0 0 20px; }
      .role-badge { display: inline-block; background: #f0f0f0; border-radius: 4px; padding: 4px 12px; font-size: 13px; font-weight: 600; color: #111; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 24px; }
      .cta { text-align: center; margin: 32px 0; }
      .btn { display: inline-block; background: #000000; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-size: 15px; font-weight: 600; letter-spacing: 0.5px; }
      .expiry { font-size: 13px; color: #888; text-align: center; margin-top: 8px; }
      .footer { background: #fafafa; border-top: 1px solid #eee; padding: 24px 32px; text-align: center; font-size: 12px; color: #aaa; }
  body
    .container
      .header
        .logo STREET
      .body
        h1 You've been invited to STREET Admin
        p You've been given #{adminRole} access to the STREET admin portal. Click the button below to set your password and get started.
        .role-badge #{adminRole}
        .cta
          a.btn(href=inviteUrl) Accept Invite & Set Password
        .expiry This link expires in 7 days.
        p If you weren't expecting this invite, you can safely ignore this email.
      .footer
        p &copy; STREET London. Questions? Contact support@street.london
```

**Step 2: Commit**

```bash
git add src/templates/admin-invite-email.pug
git commit -m "feat(TT-62): add admin invite email template"
```

---

### Task 4: AuthService — inviteAdmin() and acceptInvite()

**Files:**
- Modify: `src/modules/v1/auth/services/auth.service.ts`
- Create: `src/modules/v1/auth/dtos/invite-admin.dto.ts`
- Create: `src/modules/v1/auth/dtos/accept-invite.dto.ts`

**Step 1: Create DTOs**

```typescript
// src/modules/v1/auth/dtos/invite-admin.dto.ts
import { IsEmail, IsEnum } from 'class-validator';
import { AdminRole } from '../../../../core/enums/admin-role.enum';

export class InviteAdminDto {
  @IsEmail()
  email: string;

  @IsEnum(AdminRole)
  adminRole: AdminRole;
}
```

```typescript
// src/modules/v1/auth/dtos/accept-invite.dto.ts
import { IsString, MinLength } from 'class-validator';

export class AcceptInviteDto {
  @IsString()
  token: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  @MinLength(8)
  password: string;
}
```

**Step 2: Add AdminInvite repository to AuthService**

In `src/modules/v1/auth/services/auth.service.ts`, add to the constructor:

```typescript
// Add to imports at top of file:
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, LessThan } from 'typeorm';
import { randomBytes } from 'crypto';
import { AdminInvite } from '../../../../database/entities/admin-invite.entity';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { AdminRole } from '../../../../core/enums/admin-role.enum';

// Add to constructor parameters:
@InjectRepository(AdminInvite)
private readonly adminInviteRepo: Repository<AdminInvite>,
```

> Note: If `@InjectRepository` is already used in this file for another entity, follow the same pattern. If not, the import comes from `@nestjs/typeorm`.

**Step 3: Add inviteAdmin() method to AuthService**

Add this method to `AuthService`:

```typescript
async inviteAdmin(
  email: string,
  adminRole: AdminRole,
  invitedById: string,
): Promise<void> {
  const existing = await this.usersService.findUserByEmail(email);
  if (existing) {
    throw new ConflictException('An account with this email already exists');
  }

  // Invalidate any pending invites for this email (prevent duplicate links)
  await this.adminInviteRepo.update(
    { email, usedAt: IsNull() },
    { usedAt: new Date() },
  );

  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await this.adminInviteRepo.save({
    email,
    adminRole,
    token,
    invitedById,
    expiresAt,
  });

  const portalUrl = this.configService.get<string>('ADMIN_PORTAL_URL') ?? 'https://streetadmin.tech';
  const inviteUrl = `${portalUrl}/accept-invite?token=${token}`;

  await this.mailerService.sendMail({
    to: email,
    subject: "You've been invited to STREET Admin",
    template: 'admin-invite-email',
    context: { email, adminRole, inviteUrl },
  });
}
```

**Step 4: Add acceptInvite() method to AuthService**

```typescript
async acceptInvite(
  token: string,
  firstName: string,
  lastName: string,
  password: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const invite = await this.adminInviteRepo.findOne({ where: { token } });

  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    throw new BadRequestException('Invite link is invalid or has expired');
  }

  const existing = await this.usersService.findUserByEmail(invite.email);
  if (existing) {
    throw new ConflictException('An account with this email already exists');
  }

  const hashedPassword = await hashPassword(password);
  const user = await this.usersService.createAdminUser({
    email: invite.email,
    password: hashedPassword,
    firstName,
    lastName,
    adminRole: invite.adminRole,
  });

  await this.adminInviteRepo.update(invite.id, { usedAt: new Date() });

  const payload = {
    sub: user.id,
    phone: user.phone ?? null,
    role: user.role,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    adminRole: user.adminRole,
  };

  const accessToken = await this.jwtService.signAsync(payload);
  const refreshToken = await this._issueRefreshToken(payload, user.id);
  return { accessToken, refreshToken };
}
```

> `hashPassword` is already imported in auth.service.ts (used for vendor staff creation). If not, import from `src/core/helpers/core.helper.ts`.

**Step 5: Verify build**

```bash
npm run build
```

Expected: no errors.

**Step 6: Commit**

```bash
git add src/modules/v1/auth/services/auth.service.ts \
        src/modules/v1/auth/dtos/invite-admin.dto.ts \
        src/modules/v1/auth/dtos/accept-invite.dto.ts
git commit -m "feat(TT-62): add inviteAdmin and acceptInvite to AuthService"
```

---

### Task 5: AuthController — accept-invite endpoint

**Files:**
- Modify: `src/modules/v1/auth/controllers/auth.controller.ts`

The accept-invite endpoint is **unauthenticated** (no `AdminAuthGuard`). It validates the token, creates the user, and sets auth cookies — mirroring the `POST /auth/admin/login` response.

**Step 1: Add endpoint**

In `auth.controller.ts`, add the import for `AcceptInviteDto`:

```typescript
import { AcceptInviteDto } from '../dtos/accept-invite.dto';
```

Add the endpoint method (add near the admin login endpoint):

```typescript
@Post('admin/accept-invite')
@HttpCode(HttpStatus.OK)
async acceptAdminInvite(
  @Body() dto: AcceptInviteDto,
  @Res({ passthrough: true }) res: Response,
) {
  const { accessToken, refreshToken } = await this.authService.acceptInvite(
    dto.token,
    dto.firstName,
    dto.lastName,
    dto.password,
  );

  // Match the cookie config from adminLogin
  const isProduction = this.configService.get('NODE_ENV') === 'production';
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/auth/refresh',
    maxAge: 90 * 24 * 60 * 60 * 1000,
  });

  return { message: 'Invite accepted' };
}
```

> Check the existing `adminLogin` endpoint for the exact cookie config already in use and **match it exactly** — do not invent a different config. The cookie settings must be consistent between login and accept-invite.

**Step 2: Verify build**

```bash
npm run build
```

**Step 3: Smoke test with curl (after running migration)**

```bash
# First run migration on local dev:
npm run migration:run

# Send a test invite (requires an admin JWT cookie — use browser devtools to grab it from staging)
# Then test the accept endpoint:
curl -X POST http://localhost:8080/v1/auth/admin/accept-invite \
  -H "Content-Type: application/json" \
  -d '{"token":"<token-from-invite-email>","firstName":"Test","lastName":"User","password":"test1234"}' \
  -v
# Expected: 200, Set-Cookie headers for access_token and refresh_token
```

**Step 4: Commit**

```bash
git add src/modules/v1/auth/controllers/auth.controller.ts
git commit -m "feat(TT-62): add POST /auth/admin/accept-invite endpoint"
```

---

### Task 6: AdminController — invite management endpoints

Three admin-only endpoints: send invite, list pending invites, revoke invite.

**Files:**
- Modify: `src/modules/v1/admin/admin.controller.ts`

**Step 1: Inject AdminInvite repo into AdminController**

`AdminModule` already imports `AuthModule`. Instead of re-injecting the repo, expose the invite methods via `AuthService` which is already available.

In `admin.controller.ts`, check if `AuthService` is already injected. If not, add to the constructor:

```typescript
// Import at top:
import { AuthService } from '../auth/services/auth.service';
import { InviteAdminDto } from '../auth/dtos/invite-admin.dto';

// In constructor:
private readonly authService: AuthService,
```

> Check the existing constructor signature — `AuthService` may already be injected. If so, skip this step.

For the list and revoke endpoints, inject the `AdminInvite` repo directly since AdminModule now has it registered:

```typescript
// Import at top:
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, MoreThan } from 'typeorm';
import { AdminInvite } from '../../../database/entities/admin-invite.entity';

// In constructor:
@InjectRepository(AdminInvite)
private readonly adminInviteRepo: Repository<AdminInvite>,
```

**Step 2: Add the three endpoints**

Add these three methods to `AdminController` (group them near the admin-users section):

```typescript
@Post('admin-users/invite')
@AdminRoles(AdminRole.ADMIN)
@UseGuards(AdminRoleGuard)
async inviteAdmin(
  @Body() dto: InviteAdminDto,
  @Req() req: RequestWithUser,
) {
  await this.authService.inviteAdmin(dto.email, dto.adminRole, req.user.sub);
  return { message: 'Invite sent' };
}

@Get('admin-users/invites')
@AdminRoles(AdminRole.ADMIN)
@UseGuards(AdminRoleGuard)
async listPendingInvites() {
  const invites = await this.adminInviteRepo.find({
    where: {
      usedAt: IsNull(),
      expiresAt: MoreThan(new Date()),
    },
    order: { createdAt: 'DESC' },
  });
  return { data: invites };
}

@Delete('admin-users/invites/:inviteId')
@AdminRoles(AdminRole.ADMIN)
@UseGuards(AdminRoleGuard)
async revokeInvite(@Param('inviteId') inviteId: string) {
  const invite = await this.adminInviteRepo.findOne({ where: { id: inviteId } });
  if (!invite || invite.usedAt) {
    throw new NotFoundException('Invite not found or already used');
  }
  await this.adminInviteRepo.update(inviteId, { usedAt: new Date() });
  return { message: 'Invite revoked' };
}
```

> `RequestWithUser` should already be imported — it's used in other admin endpoints. `NotFoundException` comes from `@nestjs/common`.

**Step 3: Add ADMIN_PORTAL_URL to env template**

Add to `/.env.template` and local `.env`:
```
ADMIN_PORTAL_URL=http://localhost:8081
```

For staging `.env` on server: `ADMIN_PORTAL_URL=https://streetadmin.tech`

**Step 4: Verify build**

```bash
npm run build
```

Expected: no errors.

**Step 5: Commit**

```bash
git add src/modules/v1/admin/admin.controller.ts .env.template
git commit -m "feat(TT-62): add invite send/list/revoke endpoints to AdminController"
```

---

### Task 7: Run migration on staging + smoke test backend

**Step 1: Deploy backend to staging**

```bash
ssh -i ~/.ssh/gunnar-aws.pem ubuntu@18.135.139.245
cd ~/street-backend-staging && git pull origin master && npm run build && npm run migration:run && pm2 restart street_backend_staging
```

**Step 2: Check PM2 logs**

```bash
pm2 logs street_backend_staging --lines 30 --nostream
```

Expected: no errors, migration logged as applied.

**Step 3: Smoke test invite endpoint**

From browser devtools on staging: copy the `access_token` cookie value from an active admin session. Then:

```bash
curl -X POST https://streetadmin.tech/v1/admin/admin-users/invite \
  -H "Content-Type: application/json" \
  -H "Cookie: access_token=<your-token>" \
  -d '{"email":"test-invite@example.com","adminRole":"viewer"}' \
  -v
```

Expected: `200 { "message": "Invite sent" }` and an email arrives at the address.

**Step 4: List pending invites**

```bash
curl https://streetadmin.tech/v1/admin/admin-users/invites \
  -H "Cookie: access_token=<your-token>"
```

Expected: JSON with the pending invite token.

---

## PORTAL

### Task 8: Types + API layer

**Files:**
- Modify: `src/features/admin-users/types.ts`
- Create: `src/features/admin-users/api/invites-api.ts`

**Step 1: Add Invite types**

In `src/features/admin-users/types.ts`, append:

```typescript
export interface BackendAdminInvite {
  id: string;
  email: string;
  adminRole: AdminRole;
  invitedById: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface SendInvitePayload {
  email: string;
  adminRole: AdminRole;
}
```

**Step 2: Create invites-api.ts**

```typescript
// src/features/admin-users/api/invites-api.ts
import { api } from "@/lib/api-client";
import type { BackendAdminInvite, SendInvitePayload } from "../types";

export function getPendingInvites(): Promise<BackendAdminInvite[]> {
  return api
    .getRaw<{ data: BackendAdminInvite[] }>("admin/admin-users/invites")
    .then((res) => res.data);
}

export function sendInvite(payload: SendInvitePayload): Promise<void> {
  return api.post("admin/admin-users/invite", payload).then(() => undefined);
}

export function revokeInvite(inviteId: string): Promise<void> {
  return api.delete(`admin/admin-users/invites/${inviteId}`).then(() => undefined);
}

export function acceptInvite(payload: {
  token: string;
  firstName: string;
  lastName: string;
  password: string;
}): Promise<void> {
  return api.post("auth/admin/accept-invite", payload).then(() => undefined);
}
```

> Note: `acceptInvite` is called from the unauthenticated `/accept-invite` route — the API client's 401 handler won't interfere because this endpoint returns 200/400/409, never 401.

**Step 3: Commit**

```bash
cd /Users/gunnar/git_repo/STREET/street-admin-portal
git add src/features/admin-users/types.ts src/features/admin-users/api/invites-api.ts
git commit -m "feat(TT-62): add invite types and API functions"
```

---

### Task 9: Query and mutation hooks

**Files:**
- Create: `src/features/admin-users/api/invites-queries.ts`

```typescript
// src/features/admin-users/api/invites-queries.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getPendingInvites,
  sendInvite,
  revokeInvite,
} from "./invites-api";
import { adminUserKeys } from "./admin-users-queries";
import type { SendInvitePayload } from "../types";

export const inviteKeys = {
  all: ["admin-invites"] as const,
  pending: () => [...inviteKeys.all, "pending"] as const,
};

export function usePendingInvitesQuery() {
  return useQuery({
    queryKey: inviteKeys.pending(),
    queryFn: getPendingInvites,
  });
}

export function useSendInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SendInvitePayload) => sendInvite(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inviteKeys.pending() });
      toast.success("Invite sent");
    },
    onError: () => {
      toast.error("Failed to send invite");
    },
  });
}

export function useRevokeInviteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => revokeInvite(inviteId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: inviteKeys.pending() });
      toast.success("Invite revoked");
    },
    onError: () => {
      toast.error("Failed to revoke invite");
    },
  });
}
```

**Step 2: Commit**

```bash
git add src/features/admin-users/api/invites-queries.ts
git commit -m "feat(TT-62): add invite query and mutation hooks"
```

---

### Task 10: InviteAdminDialog component

**Files:**
- Create: `src/features/admin-users/components/InviteAdminDialog.tsx`

Pattern reference: `src/features/retailers/components/AddStaffDialog.tsx` — uses controlled inputs + mutation, shows success state with copy-able result.

```typescript
// src/features/admin-users/components/InviteAdminDialog.tsx
import { useState } from "react";
import { Mail, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiError } from "@/lib/api-client";
import { useSendInviteMutation } from "../api/invites-queries";
import type { AdminRole } from "../types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteAdminDialog({ open, onOpenChange }: Props) {
  const [email, setEmail] = useState("");
  const [adminRole, setAdminRole] = useState<AdminRole>("support");
  const [sent, setSent] = useState(false);

  const mutation = useSendInviteMutation();

  function handleClose(value: boolean) {
    if (!value) {
      setEmail("");
      setAdminRole("support");
      setSent(false);
    }
    onOpenChange(value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    mutation.mutate(
      { email: email.trim(), adminRole },
      {
        onSuccess: () => setSent(true),
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            // Toast already shown by mutation onError — override with specific message
            // (the mutation's generic onError will fire first; this is belt-and-suspenders)
          }
        },
      },
    );
  }

  if (sent) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Sent</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="rounded-full bg-muted p-4">
              <Mail className="size-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              An invite link has been sent to <span className="font-medium text-foreground">{email}</span>.
              It expires in 7 days.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => handleClose(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="invite-email">Email address</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Select
              value={adminRole}
              onValueChange={(v) => setAdminRole(v as AdminRole)}
            >
              <SelectTrigger id="invite-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="admin">Admin — full access</SelectItem>
                <SelectItem value="support">Support — read + write users/orders</SelectItem>
                <SelectItem value="viewer">Viewer — read-only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Send Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

**Step 2: Commit**

```bash
git add src/features/admin-users/components/InviteAdminDialog.tsx
git commit -m "feat(TT-62): add InviteAdminDialog component"
```

---

### Task 11: Wire InviteAdminDialog + pending invites into AdminUsersPage

**Files:**
- Modify: `src/features/admin-users/components/AdminUsersPage.tsx`

Read the full current file first, then make these additions:

**Step 1: Add imports**

```typescript
import { formatDistanceToNow } from "date-fns";
import { UserPlus, X } from "lucide-react";
import { InviteAdminDialog } from "./InviteAdminDialog";
import {
  usePendingInvitesQuery,
  useRevokeInviteMutation,
} from "../api/invites-queries";
```

**Step 2: Add state for invite dialog**

Inside the component, add:

```typescript
const [inviteOpen, setInviteOpen] = useState(false);
const { data: pendingInvites = [] } = usePendingInvitesQuery();
const revokeMutation = useRevokeInviteMutation();
```

**Step 3: Add "Invite" button to the page header**

Find the existing page header section (where the "Team" heading is rendered). Add the invite button — only visible to admins:

```typescript
// Add next to the existing page title/actions
{isAdmin && (
  <Button onClick={() => setInviteOpen(true)} size="sm">
    <UserPlus className="mr-2 size-4" />
    Invite
  </Button>
)}
```

**Step 4: Add pending invites section**

Below the existing admin user cards grid, add:

```typescript
{isAdmin && pendingInvites.length > 0 && (
  <div className="mt-8">
    <h2 className="text-sm font-medium text-muted-foreground mb-3">
      Pending Invites ({pendingInvites.length})
    </h2>
    <div className="divide-y rounded-lg border">
      {pendingInvites.map((invite) => (
        <div
          key={invite.id}
          className="flex items-center justify-between px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{invite.email}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {invite.adminRole} · expires{" "}
              {formatDistanceToNow(new Date(invite.expiresAt), {
                addSuffix: true,
              })}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => revokeMutation.mutate(invite.id)}
            disabled={revokeMutation.isPending}
            aria-label="Revoke invite"
          >
            <X className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  </div>
)}
```

**Step 5: Add dialog to JSX**

At the bottom of the component's return, before the closing fragment:

```typescript
<InviteAdminDialog open={inviteOpen} onOpenChange={setInviteOpen} />
```

**Step 6: Commit**

```bash
git add src/features/admin-users/components/AdminUsersPage.tsx
git commit -m "feat(TT-62): add invite button and pending invites list to AdminUsersPage"
```

---

### Task 12: Accept invite route + page (unauthenticated)

**Files:**
- Create: `src/app/routes/accept-invite.tsx`
- Create: `src/features/admin-users/components/AcceptInvitePage.tsx`

The accept-invite page is a **public route** (outside `_authenticated`). It reads `?token=` from the URL, shows a password setup form, calls `POST /auth/admin/accept-invite`, and on success redirects to `/users` (the portal home — the cookies are set, so they're now logged in).

**Step 1: Create the route file**

```typescript
// src/app/routes/accept-invite.tsx
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AcceptInvitePage } from "@/features/admin-users/components/AcceptInvitePage";

const searchSchema = z.object({
  token: z.string().catch(""),
});

export const Route = createFileRoute("/accept-invite")({
  component: AcceptInvitePage,
  validateSearch: searchSchema,
});
```

**Step 2: Create AcceptInvitePage component**

```typescript
// src/features/admin-users/components/AcceptInvitePage.tsx
import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Route } from "@/app/routes/accept-invite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api-client";
import { acceptInvite } from "../api/invites-api";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function AcceptInvitePage() {
  const { token } = Route.useSearch();
  const navigate = useNavigate();
  const { validateToken } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const isInvalidToken = !token;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await acceptInvite({ token, firstName: firstName.trim(), lastName: lastName.trim(), password });
      // Cookies are now set. Validate the session so the AuthProvider loads the user.
      await validateToken();
      setDone(true);
      setTimeout(() => void navigate({ to: "/users" }), 1200);
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        toast.error("Invite link is invalid or has expired");
      } else if (err instanceof ApiError && err.status === 409) {
        toast.error("An account with this email already exists");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isInvalidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">Invalid invite link</p>
          <p className="text-sm text-muted-foreground">
            This link is missing a token. Check your email for the original invite.
          </p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium">Welcome to STREET Admin</p>
          <p className="text-sm text-muted-foreground">Redirecting you in…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <span className="street-logo text-3xl text-secondary dark:text-foreground">STREET</span>
          <p className="mt-2 text-sm text-muted-foreground">Set your password to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => onChange(e.target.value)}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              placeholder="At least 8 characters"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Create Account
          </Button>
        </form>
      </div>
    </div>
  );
}
```

> Note the duplicate `onChange` — remove the first one (`onChange={(e) => onChange(e.target.value)}`). This is a typo; only `setLastName` should be called.

> `validateToken` may not be exported from `useAuth()`. Check `src/features/auth/context/AuthProvider.tsx` — if it's only in the context and not the hook, call `window.location.href = '/users'` instead of `await validateToken()` + navigate. The hard redirect forces a full session re-validation.

**Step 3: Verify the route is picked up**

TanStack Router auto-generates `routeTree.gen.ts` when the dev server starts. Run the dev server briefly to confirm:

```bash
npm run dev
```

Expected: no errors, `/accept-invite` resolves to the component.

**Step 4: Commit**

```bash
git add src/app/routes/accept-invite.tsx \
        src/features/admin-users/components/AcceptInvitePage.tsx
git commit -m "feat(TT-62): add accept-invite unauthenticated route and page"
```

---

## End-to-End Test Checklist

Run this manually after both repos are deployed to staging:

- [ ] Login as admin → Team page → click Invite button → dialog opens
- [ ] Enter email + role → Send Invite → success state shown, invite email received
- [ ] Team page shows pending invite with email + expiry + revoke (X) button
- [ ] Click revoke → invite disappears from list
- [ ] Open invite link in incognito window → `/accept-invite?token=...` loads
- [ ] Submit first/last name + password → redirected to `/users` as the new user
- [ ] Back in original session → pending invites list is empty (invite consumed)
- [ ] Try opening the invite link again → "invalid or expired" error
- [ ] Login as support role → no Invite button visible, no pending invites section

---

## Deployment Notes

**Staging:**

Backend:
```bash
ssh -i ~/.ssh/gunnar-aws.pem ubuntu@18.135.139.245
cd ~/street-backend-staging && git pull origin master && npm run build && npm run migration:run && pm2 restart street_backend_staging
```

Add to staging `.env` on server:
```
ADMIN_PORTAL_URL=https://streetadmin.tech
```

Portal: push to `staging` branch → Vercel auto-deploys.

**Production:** Minor version bump required (invite system = meaningful feature). Bump `package.json` version in both `street-backend` and `street-admin-portal`, tag backend `v4.2.x`, deploy via `~/deploy.sh`.
