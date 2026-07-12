import { NextResponse } from "next/server";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// PUT - role එකේ displayName / emoji edit කරනවා
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await prisma.userRole.findUnique({ where: { id: params.id } });
  if (!role || role.userId !== session.user.id) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  const { displayName, emoji } = await req.json();
  if (!displayName?.trim()) {
    return NextResponse.json({ error: "displayName required" }, { status: 400 });
  }

  const updated = await prisma.userRole.update({
    where: { id: params.id },
    data: {
      displayName: displayName.trim(),
      emoji: emoji || role.emoji,
    },
  });

  return NextResponse.json({ role: updated });
}

// PATCH - archive කරනවා (Primary role archive කරන්න බැහැ)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await prisma.userRole.findUnique({ where: { id: params.id } });
  if (!role || role.userId !== session.user.id) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }
  if (role.isPrimary) {
    return NextResponse.json({ error: "Cannot archive primary role" }, { status: 400 });
  }

  const updated = await prisma.userRole.update({
    where: { id: params.id },
    data: { status: "ARCHIVED", archivedAt: new Date() },
  });

  return NextResponse.json({ role: updated });
}