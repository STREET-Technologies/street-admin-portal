import { useState } from "react";
import { Wallet, Ticket, ChevronLeft, ChevronRight } from "lucide-react";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { CopyButton } from "@/components/shared/CopyButton";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/format-utils";
import { cn } from "@/lib/utils";
import { useUserCreditQuery } from "../api/user-queries";
import type { CreditLedgerEntry } from "../api/user-api";

/** Ledger entries shown per page before paging kicks in. */
const LEDGER_PAGE_SIZE = 5;

interface UserCreditTabProps {
  userId: string;
}

/** Minimal prev/next pager, styled to match the DataTable pagination bar. */
function Pager({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="mt-3 flex items-center justify-end gap-1">
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPage(page - 1)}
        disabled={page === 0}
        aria-label="Previous page"
      >
        <ChevronLeft className="size-4" />
      </Button>
      <span className="min-w-[5rem] text-center text-sm text-muted-foreground">
        Page {page + 1} of {pageCount}
      </span>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => onPage(page + 1)}
        disabled={page >= pageCount - 1}
        aria-label="Next page"
      >
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

/** Human labels for the append-only credit ledger entry types. */
const LEDGER_LABELS: Record<CreditLedgerEntry["entryType"], string> = {
  REFERRAL_BONUS: "Referral bonus",
  REFERRER_REWARD: "Referrer reward",
  REDEMPTION: "Redeemed to discount",
  REFUND: "Refund",
  ADJUSTMENT: "Manual adjustment",
  CLAWBACK: "Clawback",
};

export function UserCreditTab({ userId }: UserCreditTabProps) {
  const { data, isLoading, isError, refetch } = useUserCreditQuery(userId);
  const [ledgerPage, setLedgerPage] = useState(0);

  if (isLoading) {
    return <LoadingState variant="card" />;
  }

  if (isError || !data) {
    return (
      <ErrorState
        title="Couldn't load credit"
        message="The user's credit wallet failed to load."
        onRetry={() => void refetch()}
      />
    );
  }

  const { balance, ledger, redemptions } = data;

  // Client-side paging over the fetched ledger (backend returns up to 50).
  const ledgerPageCount = Math.max(1, Math.ceil(ledger.length / LEDGER_PAGE_SIZE));
  const safeLedgerPage = Math.min(ledgerPage, ledgerPageCount - 1);
  const pagedLedger = ledger.slice(
    safeLedgerPage * LEDGER_PAGE_SIZE,
    safeLedgerPage * LEDGER_PAGE_SIZE + LEDGER_PAGE_SIZE,
  );

  return (
    <div className="space-y-8">
      {/* Balance headline */}
      <section className="rounded-lg border p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          STREET credit balance
        </p>
        <p className="mt-1 text-3xl font-semibold tabular-nums">
          {formatCurrency(balance)}
        </p>
      </section>

      {/* Credit ledger */}
      <section>
        <h2 className="text-base font-semibold leading-none">Credit ledger</h2>
        {ledger.length === 0 ? (
          <div className="mt-4 border-t pt-5">
            <EmptyState
              icon={Wallet}
              title="No credit activity"
              description="This user hasn't earned or spent any credit yet."
            />
          </div>
        ) : (
          <>
            <ul className="mt-4 divide-y border-t">
              {pagedLedger.map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">
                      {LEDGER_LABELS[entry.entryType]}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.description ?? "—"} · {formatDate(entry.createdAt)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-semibold tabular-nums",
                      entry.amount < 0
                        ? "text-rose-600 dark:text-rose-400"
                        : "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {entry.amount < 0 ? "−" : "+"}
                    {formatCurrency(Math.abs(entry.amount))}
                  </span>
                </li>
              ))}
            </ul>
            {ledgerPageCount > 1 && (
              <Pager
                page={safeLedgerPage}
                pageCount={ledgerPageCount}
                onPage={setLedgerPage}
              />
            )}
          </>
        )}
      </section>

      {/* Generated discount codes */}
      <section>
        <div className="space-y-1">
          <h2 className="text-base font-semibold leading-none">
            Discount codes
          </h2>
          <p className="text-xs text-muted-foreground">
            Codes generated by redeeming credit
          </p>
        </div>
        {redemptions.length === 0 ? (
          <div className="mt-4 border-t pt-5">
            <EmptyState
              icon={Ticket}
              title="No discount codes"
              description="This user hasn't redeemed any credit into a discount code."
            />
          </div>
        ) : (
          <ul className="mt-4 divide-y border-t">
            {redemptions.map((code) => (
              <li
                key={code.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-sm font-medium">
                      {code.discountCode}
                    </span>
                    <CopyButton value={code.discountCode} label="Copy code" />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatCurrency(code.amount)} off · min{" "}
                    {formatCurrency(code.minimumOrderAmount)}
                    {code.expiresAt ? ` · exp ${formatDate(code.expiresAt)}` : ""}
                  </p>
                </div>
                <StatusBadge status={code.status} size="sm" />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
