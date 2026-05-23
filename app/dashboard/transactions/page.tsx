"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, MoreHorizontal } from "lucide-react";
import { getTransactions, deleteTransaction } from "@/actions/transactions";
import {
  TransactionType,
  TransactionCategory,
  IncomeCategoriesList,
  ExpenseCategoriesList,
} from "@/lib/enums";

const getCategoryIcon = (category: TransactionCategory | string): { icon: string; bg: string } => {
  const icons: Partial<Record<TransactionCategory, { icon: string; bg: string }>> = {
    // 💰 Income
    [TransactionCategory.SalaryIncome]:       { icon: "💼", bg: "#DCFCE7" },
    [TransactionCategory.FreelanceIncome]:    { icon: "💻", bg: "#DBEAFE" },
    [TransactionCategory.BusinessIncome]:     { icon: "🏢", bg: "#D1FAE5" },
    [TransactionCategory.Investment]:         { icon: "📈", bg: "#DCFCE7" },
    [TransactionCategory.RentalIncome]:       { icon: "🏠", bg: "#FEF9C3" },
    [TransactionCategory.DividendIncome]:     { icon: "💹", bg: "#DCFCE7" },
    [TransactionCategory.BonusIncome]:        { icon: "🎁", bg: "#FEE2E2" },
    [TransactionCategory.SideHustle]:         { icon: "⚡", bg: "#EDE9FE" },
    [TransactionCategory.GovtBenefit]:        { icon: "🏛️", bg: "#DBEAFE" },
    [TransactionCategory.PensionIncome]:      { icon: "👴", bg: "#FEF3C7" },
    [TransactionCategory.GiftReceived]:       { icon: "🎀", bg: "#FCE7F3" },
    [TransactionCategory.Refund]:             { icon: "↩️", bg: "#DCFCE7" },
    [TransactionCategory.OtherIncome]:        { icon: "💰", bg: "#F3E8FF" },

    // 🛒 Food & Drink
    [TransactionCategory.FoodGrocery]:        { icon: "🛒", bg: "#FEF3C7" },
    [TransactionCategory.DiningOut]:          { icon: "🍕", bg: "#EEF0FD" },
    [TransactionCategory.CoffeeSnacks]:       { icon: "☕", bg: "#FEF3C7" },
    [TransactionCategory.Takeaway]:           { icon: "🥡", bg: "#FEE2E2" },
    [TransactionCategory.Alcohol]:            { icon: "🍺", bg: "#FEF9C3" },

    // 🏠 Housing
    [TransactionCategory.Rent]:               { icon: "🏠", bg: "#DBEAFE" },
    [TransactionCategory.Utilities]:          { icon: "⚡", bg: "#FEE2E2" },
    [TransactionCategory.Internet]:           { icon: "📶", bg: "#EDE9FE" },
    [TransactionCategory.HomeMaintenance]:    { icon: "🔧", bg: "#FEF3C7" },
    [TransactionCategory.HomeInsurance]:      { icon: "🛡️", bg: "#DBEAFE" },
    [TransactionCategory.Furniture]:          { icon: "🛋️", bg: "#F3E8FF" },

    // 🚗 Transport
    [TransactionCategory.Transport]:          { icon: "🚗", bg: "#FEF9C3" },
    [TransactionCategory.FuelParking]:        { icon: "⛽", bg: "#FEE2E2" },
    [TransactionCategory.PublicTransport]:    { icon: "🚌", bg: "#DBEAFE" },
    [TransactionCategory.Taxi]:               { icon: "🚕", bg: "#FEF3C7" },
    [TransactionCategory.VehicleMaintenance]: { icon: "🔩", bg: "#F3E8FF" },
    [TransactionCategory.VehicleInsurance]:   { icon: "🛡️", bg: "#DBEAFE" },

    // 🏥 Health
    [TransactionCategory.HealthMedical]:      { icon: "🏥", bg: "#E0E7FF" },
    [TransactionCategory.Pharmacy]:           { icon: "💊", bg: "#FEE2E2" },
    [TransactionCategory.Gym]:                { icon: "💪", bg: "#DCFCE7" },
    [TransactionCategory.MentalHealth]:       { icon: "🧠", bg: "#EDE9FE" },
    [TransactionCategory.DentalVision]:       { icon: "🦷", bg: "#DBEAFE" },
    [TransactionCategory.HealthInsurance]:    { icon: "🛡️", bg: "#D1FAE5" },

    // 🎓 Education
    [TransactionCategory.Education]:          { icon: "📚", bg: "#DBEAFE" },
    [TransactionCategory.Tuition]:            { icon: "🎓", bg: "#EDE9FE" },
    [TransactionCategory.BooksSupplies]:      { icon: "📖", bg: "#FEF3C7" },
    [TransactionCategory.OnlineLearning]:     { icon: "💡", bg: "#DBEAFE" },

    // 🎬 Entertainment
    [TransactionCategory.Entertainment]:      { icon: "🎬", bg: "#EDE9FE" },
    [TransactionCategory.Streaming]:          { icon: "📺", bg: "#FEE2E2" },
    [TransactionCategory.Gaming]:             { icon: "🎮", bg: "#EEF0FD" },
    [TransactionCategory.HobbiesLeisure]:     { icon: "🎨", bg: "#FCE7F3" },
    [TransactionCategory.Events]:             { icon: "🎟️", bg: "#FEF3C7" },

    // 🛍️ Shopping
    [TransactionCategory.Shopping]:           { icon: "🛍️", bg: "#FCE7F3" },
    [TransactionCategory.Clothing]:           { icon: "👗", bg: "#EDE9FE" },
    [TransactionCategory.Electronics]:        { icon: "📱", bg: "#DBEAFE" },
    [TransactionCategory.PersonalCare]:       { icon: "💄", bg: "#FCE7F3" },
    [TransactionCategory.GiftGiven]:          { icon: "🎁", bg: "#FEF3C7" },

    // ✈️ Travel
    [TransactionCategory.Travel]:             { icon: "✈️", bg: "#DBEAFE" },
    [TransactionCategory.Flights]:            { icon: "🛫", bg: "#EDE9FE" },
    [TransactionCategory.Hotels]:             { icon: "🏨", bg: "#FEF9C3" },
    [TransactionCategory.TravelActivities]:   { icon: "🗺️", bg: "#DCFCE7" },

    // 💼 Business
    [TransactionCategory.BusinessExpense]:    { icon: "💼", bg: "#DBEAFE" },
    [TransactionCategory.SoftwareTools]:      { icon: "🖥️", bg: "#EDE9FE" },
    [TransactionCategory.Marketing]:          { icon: "📣", bg: "#FEE2E2" },
    [TransactionCategory.OfficeSupplies]:     { icon: "🖊️", bg: "#FEF3C7" },
    [TransactionCategory.ProfessionalFees]:   { icon: "⚖️", bg: "#DBEAFE" },

    // 💳 Finance
    [TransactionCategory.LoanRepayment]:      { icon: "🏦", bg: "#FEE2E2" },
    [TransactionCategory.CreditCardBill]:     { icon: "💳", bg: "#FEE2E2" },
    [TransactionCategory.BankFees]:           { icon: "🏧", bg: "#FEF3C7" },
    [TransactionCategory.Taxes]:              { icon: "📋", bg: "#FEE2E2" },
    [TransactionCategory.Savings]:            { icon: "🐷", bg: "#DCFCE7" },
    [TransactionCategory.Charity]:            { icon: "❤️", bg: "#FCE7F3" },

    // 👶 Family
    [TransactionCategory.Childcare]:          { icon: "👶", bg: "#FEF9C3" },
    [TransactionCategory.PetCare]:            { icon: "🐾", bg: "#DCFCE7" },
    [TransactionCategory.FamilySupport]:      { icon: "👨‍👩‍👧", bg: "#DBEAFE" },

    // 📦 Other
    [TransactionCategory.Other]:              { icon: "📄", bg: "#F3E8FF" },
  };
  return icons[category as TransactionCategory] || { icon: "📄", bg: "#F3E8FF" };
};

const getCategoryBadge = (category: TransactionCategory | string): { label: string; bg: string; color: string } => {
  const badges: Partial<Record<TransactionCategory, { label: string; bg: string; color: string }>> = {
    // 💰 Income
    [TransactionCategory.SalaryIncome]:       { label: "Salary",      bg: "#DCFCE7", color: "#14532D" },
    [TransactionCategory.FreelanceIncome]:    { label: "Freelance",   bg: "#DBEAFE", color: "#1E3A8A" },
    [TransactionCategory.BusinessIncome]:     { label: "Business",    bg: "#D1FAE5", color: "#064E3B" },
    [TransactionCategory.Investment]:         { label: "Investment",  bg: "#DCFCE7", color: "#14532D" },
    [TransactionCategory.RentalIncome]:       { label: "Rental",      bg: "#FEF9C3", color: "#713F12" },
    [TransactionCategory.DividendIncome]:     { label: "Dividend",    bg: "#DCFCE7", color: "#14532D" },
    [TransactionCategory.BonusIncome]:        { label: "Bonus",       bg: "#FEE2E2", color: "#7F1D1D" },
    [TransactionCategory.SideHustle]:         { label: "Side Hustle", bg: "#EDE9FE", color: "#4C1D95" },
    [TransactionCategory.GovtBenefit]:        { label: "Govt",        bg: "#DBEAFE", color: "#1E3A8A" },
    [TransactionCategory.PensionIncome]:      { label: "Pension",     bg: "#FEF3C7", color: "#78350F" },
    [TransactionCategory.GiftReceived]:       { label: "Gift",        bg: "#FCE7F3", color: "#831843" },
    [TransactionCategory.Refund]:             { label: "Refund",      bg: "#DCFCE7", color: "#14532D" },
    [TransactionCategory.OtherIncome]:        { label: "Income",      bg: "#DCFCE7", color: "#14532D" },

    // 🛒 Food
    [TransactionCategory.FoodGrocery]:        { label: "Grocery",     bg: "#FEF3C7", color: "#78350F" },
    [TransactionCategory.DiningOut]:          { label: "Dining",      bg: "#EEF0FD", color: "#3C3489" },
    [TransactionCategory.CoffeeSnacks]:       { label: "Coffee",      bg: "#FEF3C7", color: "#78350F" },
    [TransactionCategory.Takeaway]:           { label: "Takeaway",    bg: "#FEE2E2", color: "#7F1D1D" },
    [TransactionCategory.Alcohol]:            { label: "Alcohol",     bg: "#FEF9C3", color: "#713F12" },

    // 🏠 Housing
    [TransactionCategory.Rent]:               { label: "Rent",        bg: "#DBEAFE", color: "#1E3A8A" },
    [TransactionCategory.Utilities]:          { label: "Utilities",   bg: "#FEE2E2", color: "#7F1D1D" },
    [TransactionCategory.Internet]:           { label: "Internet",    bg: "#EDE9FE", color: "#4C1D95" },
    [TransactionCategory.HomeMaintenance]:    { label: "Maintenance", bg: "#FEF3C7", color: "#78350F" },
    [TransactionCategory.HomeInsurance]:      { label: "Insurance",   bg: "#DBEAFE", color: "#1E3A8A" },
    [TransactionCategory.Furniture]:          { label: "Furniture",   bg: "#F3E8FF", color: "#4A4568" },

    // 🚗 Transport
    [TransactionCategory.Transport]:          { label: "Transport",   bg: "#FEF9C3", color: "#713F12" },
    [TransactionCategory.FuelParking]:        { label: "Fuel",        bg: "#FEE2E2", color: "#7F1D1D" },
    [TransactionCategory.PublicTransport]:    { label: "Public",      bg: "#DBEAFE", color: "#1E3A8A" },
    [TransactionCategory.Taxi]:               { label: "Taxi",        bg: "#FEF3C7", color: "#78350F" },
    [TransactionCategory.VehicleMaintenance]: { label: "Vehicle",     bg: "#F3E8FF", color: "#4A4568" },
    [TransactionCategory.VehicleInsurance]:   { label: "Insurance",   bg: "#DBEAFE", color: "#1E3A8A" },

    // 🏥 Health
    [TransactionCategory.HealthMedical]:      { label: "Medical",     bg: "#FEE2E2", color: "#7F1D1D" },
    [TransactionCategory.Pharmacy]:           { label: "Pharmacy",    bg: "#FEE2E2", color: "#7F1D1D" },
    [TransactionCategory.Gym]:                { label: "Gym",         bg: "#DCFCE7", color: "#14532D" },
    [TransactionCategory.MentalHealth]:       { label: "Mental",      bg: "#EDE9FE", color: "#4C1D95" },
    [TransactionCategory.DentalVision]:       { label: "Dental",      bg: "#DBEAFE", color: "#1E3A8A" },
    [TransactionCategory.HealthInsurance]:    { label: "Insurance",   bg: "#D1FAE5", color: "#064E3B" },

    // 🎓 Education
    [TransactionCategory.Education]:          { label: "Education",   bg: "#DBEAFE", color: "#1E3A8A" },
    [TransactionCategory.Tuition]:            { label: "Tuition",     bg: "#EDE9FE", color: "#4C1D95" },
    [TransactionCategory.BooksSupplies]:      { label: "Books",       bg: "#FEF3C7", color: "#78350F" },
    [TransactionCategory.OnlineLearning]:     { label: "Online",      bg: "#DBEAFE", color: "#1E3A8A" },

    // 🎬 Entertainment
    [TransactionCategory.Entertainment]:      { label: "Fun",         bg: "#EDE9FE", color: "#4C1D95" },
    [TransactionCategory.Streaming]:          { label: "Streaming",   bg: "#FEE2E2", color: "#7F1D1D" },
    [TransactionCategory.Gaming]:             { label: "Gaming",      bg: "#EEF0FD", color: "#3C3489" },
    [TransactionCategory.HobbiesLeisure]:     { label: "Hobbies",     bg: "#FCE7F3", color: "#831843" },
    [TransactionCategory.Events]:             { label: "Events",      bg: "#FEF3C7", color: "#78350F" },

    // 🛍️ Shopping
    [TransactionCategory.Shopping]:           { label: "Shopping",    bg: "#FCE7F3", color: "#831843" },
    [TransactionCategory.Clothing]:           { label: "Clothing",    bg: "#EDE9FE", color: "#4C1D95" },
    [TransactionCategory.Electronics]:        { label: "Electronics", bg: "#DBEAFE", color: "#1E3A8A" },
    [TransactionCategory.PersonalCare]:       { label: "Beauty",      bg: "#FCE7F3", color: "#831843" },
    [TransactionCategory.GiftGiven]:          { label: "Gift",        bg: "#FEF3C7", color: "#78350F" },

    // ✈️ Travel
    [TransactionCategory.Travel]:             { label: "Travel",      bg: "#DBEAFE", color: "#1E3A8A" },
    [TransactionCategory.Flights]:            { label: "Flights",     bg: "#EDE9FE", color: "#4C1D95" },
    [TransactionCategory.Hotels]:             { label: "Hotels",      bg: "#FEF9C3", color: "#713F12" },
    [TransactionCategory.TravelActivities]:   { label: "Activities",  bg: "#DCFCE7", color: "#14532D" },

    // 💼 Business
    [TransactionCategory.BusinessExpense]:    { label: "Business",    bg: "#DBEAFE", color: "#1E3A8A" },
    [TransactionCategory.SoftwareTools]:      { label: "Software",    bg: "#EDE9FE", color: "#4C1D95" },
    [TransactionCategory.Marketing]:          { label: "Marketing",   bg: "#FEE2E2", color: "#7F1D1D" },
    [TransactionCategory.OfficeSupplies]:     { label: "Office",      bg: "#FEF3C7", color: "#78350F" },
    [TransactionCategory.ProfessionalFees]:   { label: "Pro Fees",    bg: "#DBEAFE", color: "#1E3A8A" },

    // 💳 Finance
    [TransactionCategory.LoanRepayment]:      { label: "Loan",        bg: "#FEE2E2", color: "#7F1D1D" },
    [TransactionCategory.CreditCardBill]:     { label: "Credit",      bg: "#FEE2E2", color: "#7F1D1D" },
    [TransactionCategory.BankFees]:           { label: "Bank Fee",    bg: "#FEF3C7", color: "#78350F" },
    [TransactionCategory.Taxes]:              { label: "Tax",         bg: "#FEE2E2", color: "#7F1D1D" },
    [TransactionCategory.Savings]:            { label: "Savings",     bg: "#DCFCE7", color: "#14532D" },
    [TransactionCategory.Charity]:            { label: "Charity",     bg: "#FCE7F3", color: "#831843" },

    // 👶 Family
    [TransactionCategory.Childcare]:          { label: "Childcare",   bg: "#FEF9C3", color: "#713F12" },
    [TransactionCategory.PetCare]:            { label: "Pet",         bg: "#DCFCE7", color: "#14532D" },
    [TransactionCategory.FamilySupport]:      { label: "Family",      bg: "#DBEAFE", color: "#1E3A8A" },

    // 📦 Other
    [TransactionCategory.Other]:              { label: "Other",       bg: "#F3E8FF", color: "#4A4568" },
  };
  return badges[category as TransactionCategory] || { label: "Other", bg: "#F3E8FF", color: "#4A4568" };
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | TransactionType>("all");
  const [filterCategory, setFilterCategory] = useState<"all" | TransactionCategory>("all");
  const [filterMonth, setFilterMonth] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  // ✅ Type අනුව categories dynamically වෙනස් වෙනවා
  const visibleCategories = useMemo(() => {
    if (filterType === TransactionType.Income)  return IncomeCategoriesList;
    if (filterType === TransactionType.Expense) return ExpenseCategoriesList;
    return Object.values(TransactionCategory);
  }, [filterType]);

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter(tx =>
        tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(tx => filterType === "all"     || tx.type     === filterType)
      .filter(tx => filterCategory === "all" || tx.category === filterCategory)
      .filter(tx => {
        if (filterMonth === "all") return true;
        return new Date(tx.date).toISOString().slice(0, 7) === filterMonth;
      });
  }, [transactions, searchTerm, filterType, filterCategory, filterMonth]);

  const totalIncome  = transactions.filter(t => t.type === TransactionType.Income).reduce((sum, t)  => sum + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === TransactionType.Expense).reduce((sum, t) => sum + t.amount, 0);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await deleteTransaction(id);
      loadTransactions();
    } catch {
      alert("Failed to delete transaction");
    }
  };

  const getLastMonths = () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        value: d.toISOString().slice(0, 7),
        label: d.toLocaleString("default", { month: "long", year: "numeric" }),
      });
    }
    return months;
  };

  return (
    <div className="space-y-4">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
          <div className="text-[12px] font-medium text-[#8B87A8]">April income</div>
          <div className="text-[18px] font-bold text-[#1A1635]">LKR {totalIncome.toLocaleString()}</div>
          <div className="text-[11px] font-semibold text-[#16A34A]">↑ 8.3% vs March</div>
        </div>
        <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
          <div className="text-[12px] font-medium text-[#8B87A8]">April expenses</div>
          <div className="text-[18px] font-bold text-[#1A1635]">LKR {totalExpense.toLocaleString()}</div>
          <div className="text-[11px] font-semibold text-[#DC2626]">↑ 12.1% vs March</div>
        </div>
        <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
          <div className="text-[12px] font-medium text-[#8B87A8]">Total transactions</div>
          <div className="text-[18px] font-bold text-[#1A1635]">{transactions.length}</div>
          <div className="text-[11px] font-semibold text-[#8B87A8]">
            {transactions.filter(t => t.type === TransactionType.Expense).length} expenses ·{" "}
            {transactions.filter(t => t.type === TransactionType.Income).length} income
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-[#EAE8FB] rounded-xl p-4 shadow-[0_1px_3px_rgba(91,79,232,0.07)]">
        <div className="flex flex-col gap-3">

          {/* Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B87A8]" size={14} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-[12px] text-[#1A1635] placeholder:text-[#C4C0DC] border border-[#D1CCFF] rounded-lg focus:border-[#5B4FE8] outline-none bg-white"
            />
          </div>

          {/* Dropdowns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">

            {/* Type — TransactionType enum */}
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as "all" | TransactionType);
                setFilterCategory("all"); // type වෙනස් වුණාම category reset
              }}
              className="w-full px-3 py-2 text-[12px] border border-[#D1CCFF] rounded-lg bg-white focus:border-[#5B4FE8] outline-none cursor-pointer font-medium text-[#4A4568]"
            >
              <option value="all">All types</option>
              {Object.values(TransactionType).map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            {/* Category — type අනුව dynamically filter වෙනවා */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as "all" | TransactionCategory)}
              className="w-full px-3 py-2 text-[12px] border border-[#D1CCFF] rounded-lg bg-white focus:border-[#5B4FE8] outline-none cursor-pointer font-medium text-[#4A4568]"
            >
              <option value="all">All categories</option>
              {visibleCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Month */}
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="w-full col-span-2 sm:col-span-1 px-3 py-2 text-[12px] border border-[#D1CCFF] rounded-lg bg-white focus:border-[#5B4FE8] outline-none cursor-pointer font-medium text-[#4A4568]"
            >
              <option value="all">All Months</option>
              {getLastMonths().map(m => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-[#EAE8FB] rounded-xl shadow-[0_1px_3px_rgba(91,79,232,0.07)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-150">
            <thead>
              <tr className="border-b border-[#EAE8FB]">
                <th className="text-left py-3 px-4 text-[10.5px] font-bold text-[#8B87A8] uppercase tracking-[0.06em]">Description</th>
                <th className="text-left py-3 px-4 text-[10.5px] font-bold text-[#8B87A8] uppercase tracking-[0.06em]">Category</th>
                <th className="text-left py-3 px-4 text-[10.5px] font-bold text-[#8B87A8] uppercase tracking-[0.06em]">Date</th>
                <th className="text-right py-3 px-4 text-[10.5px] font-bold text-[#8B87A8] uppercase tracking-[0.06em]">Amount</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[13px] text-[#8B87A8]">
                    Loading...
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-[13px] text-[#8B87A8]">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const { icon, bg } = getCategoryIcon(tx.category);
                  const badge = getCategoryBadge(tx.category);
                  return (
                    <tr key={tx.id} className="border-b border-[#EAE8FB] hover:bg-[#F8F7FF] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                            style={{ background: bg }}
                          >
                            {icon}
                          </div>
                          <div>
                            <div className="text-[13px] font-semibold text-[#1A1635]">
                              {tx.description || tx.category}
                            </div>
                            <div className="text-[11px] text-[#8B87A8]">{tx.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center px-2 py-1 text-[11px] font-semibold rounded-full"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[12px] text-[#8B87A8]">
                        {new Date(tx.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className={`py-3 px-4 text-right text-[13px] font-semibold font-mono ${
                        tx.type === TransactionType.Income ? "text-[#16A34A]" : "text-[#DC2626]"
                      }`}>
                        {tx.type === TransactionType.Income ? "+" : "-"}LKR {tx.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-1.5 text-[#8B87A8] hover:text-red-600 rounded-lg hover:bg-[#F8F7FF]"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}