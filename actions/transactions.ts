"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
  TransactionType,
  TransactionCategory,
  TransactionSource,
  Currency,
} from "@/lib/enums";

export async function addTransaction(data: {
  type: TransactionType;                  // "income" | "expense" -> enum
  amount: number;
  currency?: Currency;                    // string -> enum
  category: TransactionCategory;          // string -> enum
  description?: string;
  date?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const transaction = await prisma.transaction.create({
    data: {
      userId:     session.user.id,
      type:       data.type,
      amount:     data.amount,
      currency:   data.currency || Currency.LKR,
      amountBase: data.amount,
      category:   data.category,
      description: data.description,
      date:       data.date ? new Date(data.date) : new Date(),
      source:     TransactionSource.Manual,   // "MANUAL" string වෙනුවට enum
    },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
  return transaction;
}

/**
 * Bulk-inserts transactions parsed from an imported CSV/XLS/XLSX file.
 * Each row must already be validated/normalised on the client (amount > 0,
 * a valid category, and a date string) before being sent here.
 */
export async function importTransactions(
  rows: {
    type: TransactionType;
    amount: number;
    currency: Currency;
    category: TransactionCategory;
    description?: string;
    date: string;
  }[],
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!rows.length) {
    return { count: 0, importBatch: null };
  }

  // Server-side sanity check — never trust client validation alone.
  const clean = rows.filter(
    (r) =>
      Number.isFinite(r.amount) &&
      r.amount > 0 &&
      r.category &&
      r.date &&
      !Number.isNaN(new Date(r.date).getTime()),
  );

  if (!clean.length) {
    throw new Error("No valid rows to import.");
  }

  const importBatch = `import-${Date.now()}`;

  const result = await prisma.transaction.createMany({
    data: clean.map((r) => ({
      userId:      session.user!.id,
      type:        r.type,
      amount:      r.amount,
      currency:    r.currency || Currency.LKR,
      amountBase:  r.amount,
      category:    r.category,
      description: r.description,
      date:        new Date(r.date),
      source:      TransactionSource.Import,
      importBatch,
    })),
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");

  return { count: result.count, importBatch };
}

export async function getTransactions(filters?: {
  type?:      TransactionType;            // string -> enum
  category?:  TransactionCategory;        // string -> enum
  startDate?: string;
  endDate?:   string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const where: any = { userId: session.user.id };

  if (filters?.type)      where.type     = filters.type;
  if (filters?.category)  where.category = filters.category;
  if (filters?.startDate) where.date     = { gte: new Date(filters.startDate) };
  if (filters?.endDate)   where.date     = { ...where.date, lte: new Date(filters.endDate) };

  return await prisma.transaction.findMany({
    where,
    orderBy: { date: "desc" },
    take: 100,
  });
}

export async function deleteTransaction(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.transaction.delete({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/transactions");
}