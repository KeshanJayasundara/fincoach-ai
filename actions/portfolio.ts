"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { revalidatePath } from "next/cache";

export interface AssetInput {
  name: string;
  category: string;
  units?: string;
  value: number;
}

export async function createAsset(data: AssetInput) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const asset = await prisma.asset.create({
    data: {
      userId: session.user.id,
      name: data.name,
      category: data.category,
      units: data.units || null,
      value: data.value,
      costBasis: data.value, // starting point: 0% gain/loss until updated
      currency: session.user.currency || "USD",
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

  return prisma.asset.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteAsset(assetId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  await prisma.asset.deleteMany({
    where: { id: assetId, userId: session.user.id }, // scoped to owner, can't delete others' assets
  });

  revalidatePath("/dashboard/portfolio");
}

export async function updateAssetValue(assetId: string, newValue: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const existing = await prisma.asset.findFirst({
    where: { id: assetId, userId: session.user.id },
  });
  if (!existing) throw new Error("Asset not found");

  const asset = await prisma.asset.update({
    where: { id: assetId },
    data: {
      costBasis: existing.value, // shift current value into costBasis before overwriting
      value: newValue,
    },
  });

  revalidatePath("/dashboard/portfolio");
  return asset;
}