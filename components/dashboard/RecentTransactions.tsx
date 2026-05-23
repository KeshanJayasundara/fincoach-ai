// RecentTransactions.tsx
"use client";

import { useRouter } from "next/navigation";

interface Transaction {
  id: number;
  icon: string;
  iconBg: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  type: "expense" | "income";
}

export default function RecentTransactions() {
  const router = useRouter();

  const transactions: Transaction[] = [
    { id: 1, icon: "🛒", iconBg: "#FEF3C7", name: "Keells Super", category: "Food & Grocery", date: "Apr 28", amount: 4800, type: "expense" },
    { id: 2, icon: "💼", iconBg: "#DCFCE7", name: "Hospital Salary", category: "Salary / Income", date: "Apr 25", amount: 130000, type: "income" },
    { id: 3, icon: "💻", iconBg: "#DBEAFE", name: "Freelance Payment", category: "Freelance", date: "Apr 22", amount: 55000, type: "income" },
    { id: 4, icon: "🍕", iconBg: "#EEF0FD", name: "Pizza Hut", category: "Dining Out", date: "Apr 20", amount: 3200, type: "expense" },
  ];

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
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center gap-3 p-4">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
              style={{ background: tx.iconBg }}
            >
              {tx.icon}
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
        ))}
      </div>
    </div>
  );
}