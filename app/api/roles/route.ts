import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

const MAX_ACTIVE_ROLES = 2;

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const roles = await prisma.userRole.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "asc" }],
  });

  return NextResponse.json({ roles });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const activeRoles = await prisma.userRole.count({
    where: { userId: session.user.id, status: "ACTIVE" },
  });

  if (activeRoles >= MAX_ACTIVE_ROLES) {
    return NextResponse.json(
      { error: `Maximum ${MAX_ACTIVE_ROLES} active roles allowed` },
      { status: 400 }
    );
  }

  const { roleName, displayName, emoji } = await req.json();
  if (!roleName?.trim() || !displayName?.trim()) {
    return NextResponse.json(
      { error: "roleName and displayName required" },
      { status: 400 }
    );
  }

  try {
    const role = await prisma.userRole.create({
      data: {
        userId: session.user.id,
        roleName: roleName.trim(),
        displayName: displayName.trim(),
        emoji: emoji || "💼",
        isPrimary: activeRoles === 0,
        status: "ACTIVE",
      },
    });

    await prisma.userTypeHistory.create({
      data: {
        userId: session.user.id,
        toType: roleName.trim(),
        reason: "Role added via settings",
      },
    });

    return NextResponse.json({ role }, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "This role already exists" }, { status: 409 });
    }
    console.error("Create role error:", err);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}