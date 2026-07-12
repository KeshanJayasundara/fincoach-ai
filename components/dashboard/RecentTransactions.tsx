// RecentTransactions.tsx
"use client";

import { useRouter } from "next/navigation";
import { RecentTransaction } from "@/actions/dashboard";
import { getCategoryIcon } from "@/lib/categoryIcons";

interface Props {
  transactions: RecentTransaction[];
}

export default function RecentTransactions({ transactions }: Props) {
  const router = useRouter();

  return (
    <div className="bg-white border border-[#EAE8FB] rounded-xl shadow-[0_1px_3px_rgba(91,79,232,0.07)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#EAE8FB]">
        <div className="text-[13px] font-bold text-[#1A1635] tracking-[-0.1px]">Recent transactions</div>
        <button
          onClick={() => router.push("/dashboard/transactions")}
          className="px-3 py-1.5 text-[12px] font-medium text-[#4A4568] bg-transparent border border-[#EAE8FB] rounded-lg hover:bg-[#F8F7FF] hover:border-[#5B4FE8] transition-all"
        >
          View all
        </button>
      </div>

      {/* Transactions List */}
      <div className="divide-y divide-[#EAE8FB]">
        {transactions.length > 0 ? (
          transactions.map((tx) => {
            const { icon: Icon, bg } = getCategoryIcon(tx.category);
            return (
              <div key={tx.id} className="flex items-center gap-3 p-4">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: bg }}
                >
                  <Icon className="w-4 h-4 text-[#4A4568]" strokeWidth={2.25} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-[#1A1635] truncate">{tx.name}</div>
                  <div className="text-[11px] text-[#8B87A8]">
                    {tx.category} · {tx.date}
                  </div>
                </div>
                <div className={`text-[13px] font-semibold flex-shrink-0 ${tx.type === "expense" ? "text-[#DC2626]" : "text-[#16A34A]"}`}>
                  {tx.type === "expense" ? "-" : "+"}LKR {tx.amount.toLocaleString()}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-[13px] text-[#8B87A8] text-center py-8">No transactions yet</div>
        )}
      </div>
    </div>
  );
}