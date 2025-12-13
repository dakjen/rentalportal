import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return new NextResponse("This route is only available in development.", {
      status: 403,
    });
  }

  try {
    const authResult = await auth(); // Await the auth() call
    const { userId } = authResult; // Destructure userId from the awaited result

    console.log("API /api/set-admin: auth() result =", authResult);
    console.log("API /api/set-admin: userId =", userId);

    if (!userId) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.clerkId, userId));

    console.log(`API /api/set-admin: Successfully updated role for user ${userId} to admin.`);
    return new NextResponse("User role set to admin successfully.", {
      status: 200,
    });
  } catch (error) {
    console.error("API /api/set-admin: Error setting user role to admin:", error);
    return new NextResponse("Error setting user role to admin", {
      status: 500,
    });
  }
}
