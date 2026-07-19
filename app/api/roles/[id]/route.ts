import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";


export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await prisma.userRole.findUnique({ where: { id } });
  if (!role || role.userId !== session.user.id) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }

  const { roleName, displayName, emoji } = await req.json();
  if (!roleName?.trim() || !displayName?.trim()) {
    return NextResponse.json(
      { error: "roleName and displayName required" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.userRole.update({
      where: { id },
      data: {
        roleName: roleName.trim(),
        displayName: displayName.trim(),
        emoji: emoji || role.emoji,
      },
    });

    await createNotification({
      userId: session.user.id,
      type: "system",
      title: "Role updated",
      message: `Your role "${role.roleName}" was updated to "${roleName.trim()}".`,
      link: "/dashboard/settings",
    });

    return NextResponse.json({ role: updated });
  } catch (err: any) {
    if (err.code === "P2002") {
      return NextResponse.json({ error: "This role already exists" }, { status: 409 });
    }
    console.error("Update role error:", err);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

// PATCH - archive කරනවා (Primary role archive කරන්න බැහැ)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await prisma.userRole.findUnique({ where: { id } });
  if (!role || role.userId !== session.user.id) {
    return NextResponse.json({ error: "Role not found" }, { status: 404 });
  }
  if (role.isPrimary) {
    return NextResponse.json({ error: "Cannot archive primary role" }, { status: 400 });
  }

  const updated = await prisma.userRole.update({
    where: { id },
    data: { status: "ARCHIVED", archivedAt: new Date() },
  });

  await createNotification({
    userId: session.user.id,
    type: "system",
    title: "Role archived",
    message: `Your role "${role.roleName}" was archived.`,
    link: "/dashboard/settings",
  });

  return NextResponse.json({ role: updated });
}