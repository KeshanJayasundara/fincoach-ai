import { resetPassword } from "@/actions/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📥 Reset Password API received:", body);

    const result = await resetPassword(body);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error: any) {
    console.error("Reset Password API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}