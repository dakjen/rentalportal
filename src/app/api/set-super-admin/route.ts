import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!dbUser) {
      return new NextResponse("User not found in database", { status: 404 });
    }

    await db
      .update(users)
      .set({ role: "super_admin" })
      .where(eq(users.clerkId, clerkId));

    return new NextResponse("Super admin role assigned successfully", {
      status: 200,
    });
  } catch (error) {
    console.error("Error assigning super admin role:", error);
    return new NextResponse("Error assigning super admin role", {
      status: 500,
    });
  }
}
