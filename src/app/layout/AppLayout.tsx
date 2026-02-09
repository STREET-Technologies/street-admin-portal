/**
 * Stub layout for Task 1 -- will be fully implemented in Task 2.
 * Renders children in a basic container so routing can work.
 */
export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-auto p-6">{children}</main>
    </div>
  );
}
