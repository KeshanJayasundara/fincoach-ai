"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";
import { TransactionType, TransactionCategory, TransactionSource, Currency } from "@/lib/enums";

export async function addTransaction(data: {
  type: TransactionType;                  // "income" | "expense" වෙනුවට enum
  amount: number;
  currency?: Currency;                    // string වෙනුවට enum
  category: TransactionCategory;          // string වෙනුවට enum
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

export async function getTransactions(filters?: {
  type?:      TransactionType;            // string වෙනුවට enum
  category?:  TransactionCategory;        // string වෙනුවට enum
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