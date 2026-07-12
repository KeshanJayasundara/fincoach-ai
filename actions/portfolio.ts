"use server";

import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export interface CreateAssetInput {
  name: string;
  category: string;
  units?: string;
  value: number;
  costBasis?: number;
}

export async function createAsset(data: CreateAssetInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { preferredCurrency: true },
  });

  const asset = await prisma.asset.create({
    data: {
      userId: session.user.id,
      name: data.name,
      category: data.category,
      units: data.units || null,
      value: data.value,
      costBasis: data.costBasis ?? data.value, // no P&L until a cost basis is set
      currency: user?.preferredCurrency || "USD",
    },
  });

  revalidatePath("/dashboard/portfolio");
  return asset;
}

export async function getAssets() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const assets = await prisma.asset.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return assets;
}

export async function deleteAsset(assetId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  await prisma.asset.deleteMany({
    where: { id: assetId, userId: session.user.id }, // scoped to this user only
  });

  revalidatePath("/dashboard/portfolio");
}