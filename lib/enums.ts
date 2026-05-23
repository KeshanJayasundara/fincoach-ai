// lib/enums.ts

export enum TransactionType {
  Income  = "income",
  Expense = "expense",
}

export enum TransactionCategory {
  // ────────────────────────────────
  // 💰 INCOME CATEGORIES
  // ────────────────────────────────
  SalaryIncome      = "Salary / Income",
  FreelanceIncome   = "Freelance Income",
  BusinessIncome    = "Business Income",
  Investment        = "Investment Returns",
  RentalIncome      = "Rental Income",
  DividendIncome    = "Dividends",
  BonusIncome       = "Bonus / Incentive",
  SideHustle        = "Side Hustle",
  GovtBenefit       = "Government Benefit",
  PensionIncome     = "Pension",
  GiftReceived      = "Gift Received",
  Refund            = "Refund / Cashback",
  OtherIncome       = "Other Income",

  // ────────────────────────────────
  // 🛒 FOOD & DRINK
  // ────────────────────────────────
  FoodGrocery       = "Food & Grocery",
  DiningOut         = "Dining Out",
  CoffeeSnacks      = "Coffee & Snacks",
  Takeaway          = "Takeaway / Delivery",
  Alcohol           = "Alcohol & Bar",

  // ────────────────────────────────
  // 🏠 HOUSING
  // ────────────────────────────────
  Rent              = "Rent / Mortgage",
  Utilities         = "Utilities",
  Internet          = "Internet & Phone",
  HomeMaintenance   = "Home Maintenance",
  HomeInsurance     = "Home Insurance",
  Furniture         = "Furniture & Appliances",

  // ────────────────────────────────
  // 🚗 TRANSPORT
  // ────────────────────────────────
  Transport         = "Transport",
  FuelParking       = "Fuel & Parking",
  PublicTransport   = "Public Transport",
  Taxi              = "Taxi / Ride Share",
  VehicleMaintenance= "Vehicle Maintenance",
  VehicleInsurance  = "Vehicle Insurance",

  // ────────────────────────────────
  // 🏥 HEALTH
  // ────────────────────────────────
  HealthMedical     = "Health & Medical",
  Pharmacy          = "Pharmacy",
  Gym               = "Gym & Fitness",
  MentalHealth      = "Mental Health",
  DentalVision      = "Dental & Vision",
  HealthInsurance   = "Health Insurance",

  // ────────────────────────────────
  // 🎓 EDUCATION
  // ────────────────────────────────
  Education         = "Education",
  Tuition           = "Tuition & Courses",
  BooksSupplies     = "Books & Supplies",
  OnlineLearning    = "Online Learning",

  // ────────────────────────────────
  // 🎬 ENTERTAINMENT
  // ────────────────────────────────
  Entertainment     = "Entertainment",
  Streaming         = "Streaming Services",
  Gaming            = "Gaming",
  HobbiesLeisure    = "Hobbies & Leisure",
  Events            = "Events & Concerts",

  // ────────────────────────────────
  // 🛍️ SHOPPING
  // ────────────────────────────────
  Shopping          = "Shopping",
  Clothing          = "Clothing & Fashion",
  Electronics       = "Electronics & Tech",
  PersonalCare      = "Personal Care & Beauty",
  GiftGiven         = "Gift Given",

  // ────────────────────────────────
  // ✈️ TRAVEL
  // ────────────────────────────────
  Travel            = "Travel",
  Flights           = "Flights",
  Hotels            = "Hotels & Stay",
  TravelActivities  = "Travel Activities",

  // ────────────────────────────────
  // 💼 BUSINESS
  // ────────────────────────────────
  BusinessExpense   = "Business Expense",
  SoftwareTools     = "Software & Tools",
  Marketing         = "Marketing & Ads",
  OfficeSupplies    = "Office Supplies",
  ProfessionalFees  = "Professional Fees",

  // ────────────────────────────────
  // 💳 FINANCE
  // ────────────────────────────────
  LoanRepayment     = "Loan Repayment",
  CreditCardBill    = "Credit Card Bill",
  BankFees          = "Bank Fees",
  Taxes             = "Taxes",
  Savings           = "Savings & Deposit",
  Charity           = "Charity & Donation",

  // ────────────────────────────────
  // 👶 FAMILY
  // ────────────────────────────────
  Childcare         = "Childcare",
  PetCare           = "Pet Care",
  FamilySupport     = "Family Support",

  // ────────────────────────────────
  // 📦 OTHER
  // ────────────────────────────────
  Other             = "Other",
}

// ✅ Income categories වෙනම group කරලා — add transaction modal වලදී useful
export const IncomeCategoriesList = [
  TransactionCategory.SalaryIncome,
  TransactionCategory.FreelanceIncome,
  TransactionCategory.BusinessIncome,
  TransactionCategory.Investment,
  TransactionCategory.RentalIncome,
  TransactionCategory.DividendIncome,
  TransactionCategory.BonusIncome,
  TransactionCategory.SideHustle,
  TransactionCategory.GovtBenefit,
  TransactionCategory.PensionIncome,
  TransactionCategory.GiftReceived,
  TransactionCategory.Refund,
  TransactionCategory.OtherIncome,
];

// ✅ Expense categories වෙනම group කරලා
export const ExpenseCategoriesList = [
  TransactionCategory.FoodGrocery,
  TransactionCategory.DiningOut,
  TransactionCategory.CoffeeSnacks,
  TransactionCategory.Takeaway,
  TransactionCategory.Alcohol,
  TransactionCategory.Rent,
  TransactionCategory.Utilities,
  TransactionCategory.Internet,
  TransactionCategory.HomeInsurance,
  TransactionCategory.HomeMaintenance,
  TransactionCategory.Furniture,
  TransactionCategory.Transport,
  TransactionCategory.FuelParking,
  TransactionCategory.PublicTransport,
  TransactionCategory.Taxi,
  TransactionCategory.VehicleMaintenance,
  TransactionCategory.VehicleInsurance,
  TransactionCategory.HealthMedical,
  TransactionCategory.Pharmacy,
  TransactionCategory.Gym,
  TransactionCategory.MentalHealth,
  TransactionCategory.DentalVision,
  TransactionCategory.HealthInsurance,
  TransactionCategory.Education,
  TransactionCategory.Tuition,
  TransactionCategory.BooksSupplies,
  TransactionCategory.OnlineLearning,
  TransactionCategory.Entertainment,
  TransactionCategory.Streaming,
  TransactionCategory.Gaming,
  TransactionCategory.HobbiesLeisure,
  TransactionCategory.Events,
  TransactionCategory.Shopping,
  TransactionCategory.Clothing,
  TransactionCategory.Electronics,
  TransactionCategory.PersonalCare,
  TransactionCategory.GiftGiven,
  TransactionCategory.Travel,
  TransactionCategory.Flights,
  TransactionCategory.Hotels,
  TransactionCategory.TravelActivities,
  TransactionCategory.BusinessExpense,
  TransactionCategory.SoftwareTools,
  TransactionCategory.Marketing,
  TransactionCategory.OfficeSupplies,
  TransactionCategory.ProfessionalFees,
  TransactionCategory.LoanRepayment,
  TransactionCategory.CreditCardBill,
  TransactionCategory.BankFees,
  TransactionCategory.Taxes,
  TransactionCategory.Savings,
  TransactionCategory.Charity,
  TransactionCategory.Childcare,
  TransactionCategory.PetCare,
  TransactionCategory.FamilySupport,
  TransactionCategory.Other,
];

export enum TransactionSource {
  Manual = "MANUAL",
  Import = "IMPORT",
  Bank   = "BANK",
}

export enum Currency {
  LKR = "LKR",
  USD = "USD",
  EUR = "EUR",
  GBP = "GBP",
  AED = "AED",
  SGD = "SGD",
  INR = "INR",
  AUD = "AUD",
}