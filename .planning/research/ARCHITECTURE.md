# Architecture Research

**Domain:** Internal admin dashboard
**Researched:** 2026-02-09
**Confidence:** High -- patterns are well-established and validated across multiple authoritative sources (bulletproof-react, TanStack docs, shadcn/ui examples, Stripe design docs). Adapted specifically for a Vite + React 18 SPA with REST API.

---

## System Overview

```
+-----------------------------------------------------------------------+
|  Browser (Vite React 18 SPA)                                          |
|                                                                       |
|  +------------------+    +------------------+    +-----------------+  |
|  |   App Shell       |    |   Auth Context   |    |  Query Client   |  |
|  |  (Layout+Router)  |    |  (token, user)   |    |  (TanStack RQ)  |  |
|  +--------+---------+    +--------+---------+    +--------+--------+  |
|           |                       |                       |           |
|  +--------v-----------------------v-----------------------v--------+  |
|  |                        Feature Modules                          |  |
|  |  +----------+ +----------+ +----------+ +----------+ +--------+ |  |
|  |  |  Users   | | Retailers| | Couriers | |  Orders  | | Notes  | |  |
|  |  | feature/ | | feature/ | | feature/ | | feature/ | |feature/| |  |
|  |  +----+-----+ +----+-----+ +----+-----+ +----+-----+ +---+---+ |  |
|  |       |             |             |             |          |      |  |
|  +-------+-------------+-------------+-------------+----------+-----+  |
|          |             |             |             |          |        |
|  +-------v-------------v-------------v-------------v----------v-----+  |
|  |                     API Service Layer                            |  |
|  |  +------------+  +------------------+  +---------------------+   |  |
|  |  | api-client |  | domain services  |  | response transform  |   |  |
|  |  | (fetch)    |  | (users, vendors) |  | (Backend -> View)   |   |  |
|  |  +-----+------+  +--------+---------+  +-----------+---------+   |  |
|  +--------+-------------------+----------------------------+--------+  |
|           |                   |                            |          |
+-----------+-------------------+----------------------------+----------+
            |                   |                            |
            v                   v                            v
    +-------+-------------------+----------------------------+--------+
    |               NestJS Backend (REST API)                         |
    |  Base URL: /v1                                                  |
    |  Auth: Bearer token                                             |
    |  Endpoints: /admin/users, /admin/vendors, /admin/notes, etc.   |
    +-----------------------------------------------------------------+
```

---

## Component Responsibilities

| Layer | Component | Responsibility |
|-------|-----------|---------------|
| **App Shell** | `App.tsx` | Provider composition (QueryClient, Router, Auth, Theme, Tooltip) |
| **App Shell** | `AppLayout` | Sidebar + main content area + breadcrumbs |
| **App Shell** | `AppSidebar` | Primary navigation (shadcn Sidebar component) |
| **App Shell** | `ProtectedRoute` | Auth guard -- redirects to login if no token |
| **Routing** | `router.tsx` | Route definitions, lazy-loaded feature pages |
| **Auth** | `AuthProvider` | Login/logout, token storage, user session context |
| **Features** | `users/` | User list, detail view, search, edit |
| **Features** | `retailers/` | Vendor/retailer list, detail view, orders |
| **Features** | `couriers/` | Courier list, detail view |
| **Features** | `orders/` | Order list, detail view, status tracking |
| **Features** | `notes/` | Notes CRUD, attached to any entity |
| **Features** | `referrals/` | Referral code management |
| **Features** | `settings/` | App settings, admin config |
| **Shared UI** | `components/ui/` | shadcn/ui primitives (Button, Card, Dialog, etc.) |
| **Shared UI** | `components/shared/` | Composed components (DataTable, DetailPanel, StatusBadge) |
| **API Layer** | `lib/api-client.ts` | Centralized fetch wrapper with auth, error handling |
| **API Layer** | `features/*/api/` | Domain-specific API functions + React Query hooks |
| **State** | TanStack Query | All server state (entities, lists, search results) |
| **State** | React Context | Auth session, theme, sidebar collapse state |
| **State** | React state / URL | Filters, pagination, modals, tab selection |

---

## Recommended Project Structure

```
src/
├── app/                          # Application shell & bootstrap
│   ├── App.tsx                   # Root component, provider composition
│   ├── router.tsx                # Route definitions (react-router-dom)
│   ├── providers.tsx             # All providers composed in one file
│   └── layout/
│       ├── AppLayout.tsx         # Sidebar + <Outlet /> content area
│       ├── AppSidebar.tsx        # Sidebar navigation (shadcn Sidebar)
│       ├── Breadcrumbs.tsx       # Dynamic breadcrumb trail
│       └── ProtectedRoute.tsx    # Auth guard wrapper
│
├── components/                   # Shared UI components
│   ├── ui/                       # shadcn/ui primitives (DO NOT EDIT)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   └── shared/                   # Composed reusable components
│       ├── DataTable.tsx         # Generic sortable/filterable table
│       ├── DetailPanel.tsx       # Entity detail card layout
│       ├── StatusBadge.tsx       # Colored status indicator
│       ├── EntityHeader.tsx      # Name + avatar + status header
│       ├── EmptyState.tsx        # "No data" placeholder
│       ├── LoadingState.tsx      # Skeleton/spinner states
│       ├── ErrorState.tsx        # Error recovery UI
│       ├── SearchInput.tsx       # Debounced search with suggestions
│       └── ConfirmDialog.tsx     # Reusable confirmation modal
│
├── features/                     # Domain modules (bulk of the code)
│   ├── auth/
│   │   ├── components/
│   │   │   └── LoginForm.tsx
│   │   ├── api/
│   │   │   └── auth-api.ts       # Login endpoint call
│   │   ├── hooks/
│   │   │   └── useAuth.ts        # Auth context hook
│   │   ├── context/
│   │   │   └── AuthProvider.tsx   # Auth state + token management
│   │   └── types.ts
│   │
│   ├── users/
│   │   ├── components/
│   │   │   ├── UserListPage.tsx       # Search + results table
│   │   │   ├── UserDetailPage.tsx     # Full user detail view
│   │   │   ├── UserInfoCard.tsx       # Basic info panel
│   │   │   ├── UserAddressesTab.tsx   # Addresses list/edit
│   │   │   ├── UserOrdersTab.tsx      # Orders table
│   │   │   └── UserDevicesTab.tsx     # Devices list
│   │   ├── api/
│   │   │   ├── user-api.ts           # Raw API functions
│   │   │   └── user-queries.ts       # React Query hooks
│   │   ├── types.ts                   # User-specific types
│   │   └── utils.ts                   # User-specific transforms
│   │
│   ├── retailers/
│   │   ├── components/
│   │   │   ├── RetailerListPage.tsx
│   │   │   ├── RetailerDetailPage.tsx
│   │   │   ├── RetailerInfoCard.tsx
│   │   │   └── RetailerOrdersTab.tsx
│   │   ├── api/
│   │   │   ├── retailer-api.ts
│   │   │   └── retailer-queries.ts
│   │   ├── types.ts
│   │   └── utils.ts
│   │
│   ├── couriers/
│   │   ├── components/
│   │   ├── api/
│   │   └── types.ts
│   │
│   ├── orders/
│   │   ├── components/
│   │   ├── api/
│   │   └── types.ts
│   │
│   ├── notes/
│   │   ├── components/
│   │   │   └── NotesSection.tsx       # Reusable notes panel
│   │   ├── api/
│   │   │   ├── notes-api.ts
│   │   │   └── notes-queries.ts
│   │   └── types.ts
│   │
│   ├── referrals/
│   │   ├── components/
│   │   ├── api/
│   │   └── types.ts
│   │
│   └── settings/
│       └── components/
│           └── SettingsPage.tsx
│
├── lib/                          # Preconfigured libraries
│   ├── api-client.ts             # Centralized fetch wrapper
│   ├── query-client.ts           # TanStack Query client config
│   └── utils.ts                  # cn() and other Tailwind utilities
│
├── hooks/                        # Shared custom hooks
│   ├── use-debounce.ts
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── types/                        # Shared TypeScript types
│   └── index.ts                  # Base entity types, status enums
│
├── constants/                    # App-wide constants
│   └── navigation.ts             # Sidebar nav items config
│
├── assets/                       # Static assets (images, fonts)
│
├── index.css                     # Tailwind base + custom CSS
├── main.tsx                      # Vite entry point
└── vite-env.d.ts                 # Vite type declarations
```

### Key Principles Behind This Structure

1. **Feature-first organization** -- Each domain (users, retailers, orders) owns its components, API calls, types, and hooks. You never have to hunt across 5 directories to understand one feature.

2. **Unidirectional dependency flow** -- `lib/` and `components/ui/` are imported by everyone. `features/` import from `lib/` and `components/`, never from each other. `app/` composes features together.

3. **Co-located API + queries** -- Each feature has an `api/` folder containing raw fetch functions AND React Query hooks. This keeps the data-fetching logic next to the components that use it.

4. **Shared components are truly shared** -- `components/shared/` contains composed components used across 2+ features (DataTable, StatusBadge). Feature-specific components stay in their feature folder.

5. **No barrel files** -- Import directly from files, not through index.ts re-exports. Vite tree-shakes better with direct imports, and it avoids circular dependency issues.

---

## Architectural Patterns

### 1. Centralized API Client

A single fetch wrapper handles auth headers, base URL, response unwrapping, and error handling. All feature-specific API functions use this client.

```typescript
// src/lib/api-client.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/v1';

class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('access_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(options.headers as Record<string, string>),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('access_token');
    window.location.href = '/login';
    throw new ApiError(401, 'Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError(response.status, response.statusText, errorData);
  }

  const result = await response.json();

  // Unwrap backend's { data: T } envelope
  if (result && typeof result === 'object' && 'data' in result) {
    return result.data as T;
  }

  return result as T;
}

// Convenience methods
export const api = {
  get: <T>(endpoint: string) =>
    apiClient<T>(endpoint),

  post: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body: unknown) =>
    apiClient<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),

  delete: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: 'DELETE' }),
};

export { ApiError };
```

**Why this pattern:**
- Single place to add auth headers, handle 401 redirects, unwrap response envelopes
- Typed generics propagate through to feature-level API functions
- No dependency on axios -- native fetch is sufficient for a REST client
- `ApiError` class enables typed error handling in UI components

### 2. Feature-Level API + React Query Hooks

Each feature defines raw API functions (pure data fetching) and React Query hooks (caching, invalidation, mutations) separately.

```typescript
// src/features/users/api/user-api.ts
import { api } from '@/lib/api-client';
import type { BackendUser, UserSearchResponse } from '../types';

export const userApi = {
  getById: (userId: string) =>
    api.get<BackendUser>(`/admin/users/${userId}`),

  search: (query: string, limit = 10) =>
    api.get<UserSearchResponse>(
      `/admin/users?search=${encodeURIComponent(query)}&limit=${limit}`
    ),

  update: (userId: string, data: Partial<BackendUser>) =>
    api.patch<BackendUser>(`/admin/users/${userId}`, data),
};
```

```typescript
// src/features/users/api/user-queries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from './user-api';
import { transformBackendUser } from '../utils';

// Query key factory -- prevents key collisions and enables targeted invalidation
export const userKeys = {
  all:      ['users'] as const,
  lists:    () => [...userKeys.all, 'list'] as const,
  list:     (query: string) => [...userKeys.lists(), query] as const,
  details:  () => [...userKeys.all, 'detail'] as const,
  detail:   (id: string) => [...userKeys.details(), id] as const,
};

export function useUser(userId: string) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: async () => {
      const backend = await userApi.getById(userId);
      return transformBackendUser(backend);
    },
    enabled: !!userId,
  });
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: userKeys.list(query),
    queryFn: async () => {
      const response = await userApi.search(query);
      return response.users.map(transformBackendUser);
    },
    enabled: query.length >= 2,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: Partial<BackendUser> }) =>
      userApi.update(userId, data),

    onSuccess: (_data, variables) => {
      // Invalidate the specific user detail + any list that might contain them
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}
```

**Why this pattern:**
- **Query key factories** prevent stale data bugs by ensuring consistent, hierarchical cache keys
- **Separation of raw API from hooks** means API functions can be reused outside React (tests, scripts)
- **Transform at the hook level**, not in the API client -- keeps the API layer honest to the backend shape
- **Targeted invalidation** on mutation success -- only refetch what changed

### 3. App Layout with Sidebar Navigation (Stripe-Style)

Stripe's dashboard uses a persistent left sidebar with grouped navigation, a content area with breadcrumbs, and entity detail views that open as full pages (not modals).

```typescript
// src/app/layout/AppLayout.tsx
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { Breadcrumbs } from './Breadcrumbs';
import { Outlet } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

export function AppLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 items-center gap-2 border-b px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <Breadcrumbs />
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
```

```typescript
// src/app/layout/AppSidebar.tsx
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader,
} from '@/components/ui/sidebar';
import { Users, Store, Truck, ShoppingCart, Tag, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navGroups = [
  {
    label: 'Customers',
    items: [
      { title: 'Users', icon: Users, href: '/users' },
      { title: 'Retailers', icon: Store, href: '/retailers' },
      { title: 'Couriers', icon: Truck, href: '/couriers' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { title: 'Orders', icon: ShoppingCart, href: '/orders' },
      { title: 'Referral Codes', icon: Tag, href: '/referrals' },
    ],
  },
  {
    label: 'System',
    items: [
      { title: 'Settings', icon: Settings, href: '/settings' },
    ],
  },
];

export function AppSidebar() {
  const { pathname } = useLocation();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        {/* Logo / brand */}
      </SidebarHeader>
      <SidebarContent>
        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                  >
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
```

**Why this navigation structure (modeled after Stripe):**
- **Grouped nav items** -- Stripe groups by domain (Payments, Customers, Products). We group by entity role (Customers, Operations, System).
- **Active state from URL** -- `pathname.startsWith(item.href)` highlights the active section even on nested routes like `/users/abc-123`.
- **Data-driven config** -- `navGroups` array makes it trivial to add/reorder items without touching JSX.
- **No nested flyout menus** -- For a small entity set, flat grouped links are faster to scan than nested menus.

### 4. Protected Route Pattern

```typescript
// src/app/layout/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    // Preserve the URL they were trying to visit
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
```

```typescript
// src/app/router.tsx
import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { ProtectedRoute } from './layout/ProtectedRoute';

const LoginPage = lazy(() => import('@/features/auth/components/LoginForm'));
const UserListPage = lazy(() => import('@/features/users/components/UserListPage'));
const UserDetailPage = lazy(() => import('@/features/users/components/UserDetailPage'));
const RetailerListPage = lazy(() => import('@/features/retailers/components/RetailerListPage'));
// ... etc

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <UserListPage /> },
      { path: '/users', element: <UserListPage /> },
      { path: '/users/:userId', element: <UserDetailPage /> },
      { path: '/retailers', element: <RetailerListPage /> },
      { path: '/retailers/:retailerId', element: <RetailerDetailPage /> },
      // ... other routes
    ],
  },
]);
```

**Why:**
- **Lazy loading** reduces initial bundle size -- admin portals have many pages but users only visit a few per session
- **Layout route** with `<Outlet />` means the sidebar persists across navigation without re-mounting
- **State preservation** on auth redirect -- after login, users land where they originally intended

### 5. Entity Detail View Composition (Tabs + Cards)

Stripe's detail pages follow a consistent pattern: header with entity info, then tabbed content below. Each tab contains cards with related data.

```typescript
// src/features/users/components/UserDetailPage.tsx
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '../api/user-queries';
import { UserInfoCard } from './UserInfoCard';
import { UserAddressesTab } from './UserAddressesTab';
import { UserOrdersTab } from './UserOrdersTab';
import { UserDevicesTab } from './UserDevicesTab';
import { NotesSection } from '@/features/notes/components/NotesSection';
import { EntityHeader } from '@/components/shared/EntityHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>();
  const { data: user, isLoading, error } = useUser(userId!);

  if (isLoading) return <LoadingState />;
  if (error || !user) return <ErrorState message="User not found" />;

  return (
    <div className="space-y-6">
      {/* Header: avatar, name, status, quick actions */}
      <EntityHeader
        name={user.name}
        avatar={user.avatar}
        status={user.status}
        subtitle={user.email}
      />

      {/* Summary cards row */}
      <UserInfoCard user={user} />

      {/* Tabbed detail content */}
      <Tabs defaultValue="orders">
        <TabsList>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <UserOrdersTab userId={userId!} />
        </TabsContent>
        <TabsContent value="addresses">
          <UserAddressesTab userId={userId!} />
        </TabsContent>
        <TabsContent value="devices">
          <UserDevicesTab userId={userId!} />
        </TabsContent>
        <TabsContent value="notes">
          <NotesSection entityType="user" entityId={userId!} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**Why this composition:**
- **EntityHeader** is shared across Users, Retailers, Couriers -- same visual pattern, different data
- **Each tab loads its own data** via its own React Query hook -- no single massive data fetch
- **NotesSection** is a cross-cutting feature used on any entity detail page -- it lives in `features/notes/` and accepts `entityType` + `entityId` props
- **Tabs use shadcn/ui Tabs** which are accessible (keyboard navigable, ARIA attributes) out of the box

### 6. Backend-to-Frontend Transform Layer

Keep backend types honest (match the API exactly) and transform into frontend view models at the query level.

```typescript
// src/features/users/types.ts

// Matches the exact shape returned by GET /v1/admin/users/:id
export interface BackendUser {
  id: string;
  phone: string | null;
  profileImage: string | null;
  language: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  ssoProvider: string | null;
  createdAt: string;
  updatedAt: string;
}

// What our UI components receive -- clean, display-ready
export interface UserViewModel {
  id: string;
  name: string;          // Combined firstName + lastName
  email: string;
  phone: string;
  avatar?: string;
  status: string;
  joinDate: string;
  ssoProvider?: string;
  totalOrders: number;
  totalSpent: number;
}
```

```typescript
// src/features/users/utils.ts
import type { BackendUser, UserViewModel } from './types';

export function transformBackendUser(user: BackendUser): UserViewModel {
  return {
    id: user.id,
    name: [user.firstName, user.lastName].filter(Boolean).join(' ') || 'Unknown User',
    email: user.email ?? '',
    phone: user.phone ?? '',
    avatar: user.profileImage ?? undefined,
    status: 'active', // Backend doesn't have status yet
    joinDate: user.createdAt,
    ssoProvider: user.ssoProvider ?? undefined,
    totalOrders: 0,   // TODO: populate from backend
    totalSpent: 0,     // TODO: populate from backend
  };
}
```

**Why separate types:**
- When the backend adds a field, you update `BackendUser` and the transform -- UI components are unaffected
- When the UI needs a derived field (e.g., `name` from `firstName`+`lastName`), it goes in the transform
- TypeScript catches mismatches between backend and frontend shapes at compile time

### 7. Auth Context Pattern

```typescript
// src/features/auth/context/AuthProvider.tsx
import { createContext, useCallback, useEffect, useState } from 'react';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    setState({
      isAuthenticated: !!token,
      isLoading: false,
      token,
    });
  }, []);

  const login = useCallback((token: string) => {
    localStorage.setItem('access_token', token);
    setState({ isAuthenticated: true, isLoading: false, token });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setState({ isAuthenticated: false, isLoading: false, token: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
```

```typescript
// src/features/auth/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '../context/AuthProvider';

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Why Context for auth (not React Query):**
- Auth state is synchronous and client-local (token in localStorage)
- It rarely changes (login/logout only) so re-render cost is negligible
- It needs to be available before any API call can be made

---

## Data Flow Diagrams

### Request Flow: User Detail Page

```
UserDetailPage mounts
        |
        v
useUser(userId) hook called
        |
        v
React Query checks cache
        |
   [cache hit?] --yes--> return cached data, show UI
        |                  (background refetch if stale)
        no
        |
        v
userApi.getById(userId) called
        |
        v
api.get<BackendUser>('/admin/users/{id}')
        |
        v
lib/api-client.ts:
  1. Reads token from localStorage
  2. Sets Authorization header
  3. Fetches from backend
  4. Unwraps { data: T } envelope
  5. Returns typed BackendUser
        |
        v
useUser hook transforms:
  transformBackendUser(backend) -> UserViewModel
        |
        v
React Query caches result at key ['users', 'detail', userId]
        |
        v
Component re-renders with { data, isLoading, error }
```

### Mutation Flow: Update User

```
User clicks "Save" on edit form
        |
        v
useUpdateUser().mutate({ userId, data })
        |
        v
mutationFn calls userApi.update(userId, data)
        |
        v
api.patch('/admin/users/{id}', data)
        |
        v
Backend processes PATCH, returns updated user
        |
        v
onSuccess callback fires:
  1. invalidateQueries(['users', 'detail', userId])
     -> triggers refetch of user detail
  2. invalidateQueries(['users', 'list'])
     -> triggers refetch of any user list
        |
        v
UI automatically updates with fresh data
```

### State Management Decision Tree

```
What kind of state is it?
        |
        +--> From the server? (entities, lists, search results)
        |       -> TanStack React Query
        |       -> Cached, auto-refetched, queryKey-based
        |
        +--> Auth / session?
        |       -> React Context (AuthProvider)
        |       -> Rarely changes, needed by everything
        |
        +--> URL-driven? (current page, filters, search query, selected tab)
        |       -> URL state (react-router searchParams)
        |       -> Shareable, bookmarkable, survives refresh
        |
        +--> Component-local? (modal open, form input, hover state)
                -> useState / useReducer
                -> Dies with the component, no sharing needed
```

---

## Anti-Patterns to Avoid

### 1. God Components
**Bad:** A single `AdminDashboard.tsx` that handles search, entity display, tabs, notes, orders, and referral codes all in one file.
**Good:** Compose from focused components. `UserDetailPage` orchestrates `EntityHeader`, `UserInfoCard`, tab components, and `NotesSection`.

### 2. Global State for Everything
**Bad:** Putting the selected user, search results, notes list, and modal state all into Redux/Zustand/Context.
**Good:** Server data in React Query. Modal open/close in local `useState`. Search query in URL params. Auth in Context. Each state type in its natural home.

### 3. API Shape Leaking into UI
**Bad:** `<p>{user.firstName} {user.lastName}</p>` scattered across 12 components. When the backend renames `firstName` to `first_name`, you fix 12 files.
**Good:** Transform once in `transformBackendUser()`, use `user.name` everywhere.

### 4. Swallowing Errors
**Bad:** Every API call wrapped in `try/catch` that returns `null` or `[]` silently. The user sees an empty screen and has no idea what happened.
**Good:** Let errors propagate. React Query provides `error` state. Use `<ErrorState />` components to show what went wrong with a retry button.

### 5. Client-Side Pagination of Large Datasets
**Bad:** Fetching all 10,000 orders and paginating in JavaScript.
**Good:** Use server-side pagination. Pass `page` and `limit` as query params. The backend already supports `?limit=10&page=1`.

### 6. Tight Component-to-Route Coupling
**Bad:** Components that call `useNavigate()` or read `useParams()` deep in the tree, making them impossible to reuse or test.
**Good:** Page-level components read route params and pass data down as props. Leaf components are route-agnostic.

### 7. Missing Loading/Empty/Error States
**Bad:** A blank white screen while data loads. A table with no rows and no explanation.
**Good:** Every async view has three states: loading (skeleton), empty (helpful message + action), and error (description + retry).

### 8. Hardcoded Layout
**Bad:** `width: 280px` sidebar, `margin-left: 280px` main content, breakpoints scattered across components.
**Good:** Use shadcn/ui's `SidebarProvider` which handles collapse state, responsive behavior, and CSS containment.

### 9. Barrel File Re-exports in Vite
**Bad:** `features/users/index.ts` that re-exports everything from the feature. Vite cannot tree-shake barrel files efficiently, and circular dependencies creep in.
**Good:** Import directly: `import { useUser } from '@/features/users/api/user-queries'`.

### 10. Permissions as an Afterthought
**Bad:** Building the entire dashboard, then adding `if (isAdmin)` checks everywhere at the end.
**Good:** Plan permission boundaries early. Even if there is only one role now, structure components so permission gates can be added without restructuring.

---

## Integration Points

### With Existing Backend (NestJS)

| Frontend Concern | Backend Endpoint | Notes |
|---|---|---|
| Auth login | `POST /v1/auth/login` | Returns `{ access_token }` |
| User search | `GET /v1/admin/users?search=` | Paginated, returns `{ users, total, page, limit }` |
| User detail | `GET /v1/admin/users/:id` | Returns `{ data: BackendUser }` |
| User update | `PATCH /v1/admin/users/:id` | Accepts partial BackendUser fields |
| User addresses | `GET /v1/admin/users/:id/addresses` | Returns `UserAddress[]` |
| User orders | `GET /v1/admin/users/:id/orders` | Paginated, returns `{ orders, meta }` |
| User devices | `GET /v1/admin/users/:id/devices` | Returns `Device[]` |
| Vendor search | `GET /v1/admin/vendors?name=` | Paginated, returns `{ data, meta }` |
| Vendor detail | `GET /v1/admin/vendors/:id` | Returns `{ data: BackendVendor }` |
| Vendor update | `PATCH /v1/admin/vendors/:id` | Accepts partial BackendVendor fields |
| Vendor orders | `GET /v1/admin/vendors/:id/orders` | Paginated, returns `{ orders, meta }` |
| Notes (any entity) | `GET /v1/admin/notes/:type/:id` | Returns `Note[]` |
| Create note | `POST /v1/admin/notes` | Body: `{ entityType, entityId, content, priority }` |
| Referral codes | `GET /v1/referrals/admin/codes` | Returns `ReferralCode[]` |
| Create referral | `POST /v1/referrals/admin/codes` | Body: partial referral code data |
| Toggle referral | `PATCH /v1/referrals/admin/codes/:id/status` | Body: `{ isActive }` |

### With Existing Tech Stack

| Technology | Version | Role in Architecture |
|---|---|---|
| Vite | 5.4 | Build tool, dev server, path aliases (`@/`) |
| React | 18.3 | UI library (no server components) |
| TypeScript | 5.5 | Type safety across API/transform/component layers |
| react-router-dom | 6.26 | Client-side routing, layout routes, lazy loading |
| @tanstack/react-query | 5.56 | Server state cache, background refetch, mutations |
| shadcn/ui + Radix | various | UI primitives (Sidebar, Tabs, Dialog, Table, etc.) |
| Tailwind CSS | 3.4 | Utility-first styling |
| tailwind-merge + clsx | via `cn()` | Conditional class composition |
| zod | 3.23 | Form validation (react-hook-form integration) |
| react-hook-form | 7.53 | Form state management |
| lucide-react | 0.462 | Icon library |
| date-fns | 3.6 | Date formatting |
| recharts | 2.12 | Charts/graphs for dashboard metrics |

### Migration Path from Current Structure

The existing codebase uses a flat `components/` folder with a `services/api.ts` monolith. The migration path:

1. **Create `lib/api-client.ts`** -- Extract the fetch wrapper from `services/api.ts`
2. **Create `features/` directories** -- One per domain entity
3. **Move components** -- `UserCard.tsx` -> `features/users/components/`, `NotesSection.tsx` -> `features/notes/components/`, etc.
4. **Split `services/api.ts`** -- Each domain's API functions move into `features/{domain}/api/`
5. **Add React Query hooks** -- Wrap raw API calls in `useQuery`/`useMutation` with proper key factories
6. **Add `app/layout/`** -- Extract layout components, set up route-based code splitting
7. **Move types** -- Split `types/index.ts` into feature-specific type files, keep shared base types

This can be done incrementally -- feature by feature -- without breaking the existing app.

---

## Sources

- [Bulletproof React - Project Structure](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-structure.md) -- Gold-standard feature-based folder organization
- [React Folder Structure in 5 Steps (Robin Wieruch, 2025)](https://www.robinwieruch.de/react-folder-structure/) -- Progressive folder structure approach
- [Separate API Layers in React Apps (Profy.dev)](https://profy.dev/article/react-architecture-api-layer) -- 6-step API layer separation
- [Services Layer Approach in ReactJS (DEV Community)](https://dev.to/chema/services-layer-approach-in-reactjs-1eo2) -- Service abstraction pattern
- [Building a Type-Safe API Client in TypeScript (DEV Community)](https://dev.to/limacodes/building-a-type-safe-api-client-in-typescript-beyond-axios-vs-fetch-4a3i) -- Typed fetch wrapper patterns
- [Type-Safe API Layer in React Using Axios + TypeScript (Medium)](https://medium.com/@ramankumawat119/building-a-type-safe-api-layer-in-react-using-axios-typescript-b32031973d92) -- Domain-based API organization
- [TanStack React Query for Server State Management (OneUptime, 2026)](https://oneuptime.com/blog/post/2026-01-15-react-query-tanstack-server-state/view) -- Query patterns for admin dashboards
- [Optimistic Updates - TanStack Query Docs](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates) -- Mutation and cache invalidation patterns
- [Mastering Mutations in React Query (TkDodo)](https://tkdodo.eu/blog/mastering-mutations-in-react-query) -- Best practices for mutations
- [shadcn/ui Sidebar Component](https://ui.shadcn.com/docs/components/radix/sidebar) -- Sidebar composition pattern
- [shadcn-admin (GitHub: satnaing)](https://github.com/satnaing/shadcn-admin) -- Reference Vite + shadcn admin dashboard
- [shadcn/ui Dashboard Example](https://ui.shadcn.com/examples/dashboard) -- Official dashboard layout reference
- [Stripe Dashboard Basics](https://docs.stripe.com/dashboard/basics) -- Navigation and information hierarchy
- [Stripe Apps Design Patterns](https://docs.stripe.com/stripe-apps/patterns) -- UI patterns for admin tools
- [Stripe Apps UI Components](https://docs.stripe.com/stripe-apps/components) -- Layout and content component reference
- [Dashboard Design Patterns](https://dashboarddesignpatterns.github.io/patterns.html) -- Academic dashboard pattern catalog
- [Common Mistakes in React Admin Dashboards (DEV Community)](https://dev.to/vaibhavg/common-mistakes-in-react-admin-dashboards-and-how-to-avoid-them-1i70) -- Admin-specific anti-patterns
- [15 React Anti-Patterns and Fixes (JSDevSpace, 2025)](https://jsdev.space/react-anti-patterns-2025/) -- General React anti-patterns
- [Protected Routes with React Router v7 (DEV Community)](https://dev.to/ra1nbow1/building-reliable-protected-routes-with-react-router-v7-1ka0) -- Auth guard implementation
- [React Router Private Routes (Robin Wieruch)](https://www.robinwieruch.de/react-router-private-routes/) -- Protected route patterns
- [Path Aliases in Vite + TypeScript + React (Medium)](https://medium.com/@tusharupadhyay691/stop-struggling-with-path-aliases-in-vite-typescript-react-heres-the-ultimate-fix-1ce319eb77d0) -- Vite alias configuration
- [React Architecture Patterns and Best Practices 2025 (GeeksforGeeks)](https://www.geeksforgeeks.org/reactjs/react-architecture-pattern-and-best-practices/) -- General architecture overview
- [How to Structure a React App in 2025 (Medium: Ramon Prata)](https://ramonprata.medium.com/how-to-structure-a-react-app-in-2025-spa-ssr-or-native-10d8de7a245a) -- SPA-specific structure decisions
- [React Admin - Key Concepts (Marmelab)](https://marmelab.com/react-admin/Architecture.html) -- Component composition over God Components
- [Advanced React Component Composition (Frontend Mastery)](https://frontendmastery.com/posts/advanced-react-component-composition-guide/) -- Tabs, panels, compound component patterns
