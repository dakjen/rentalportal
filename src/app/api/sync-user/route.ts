import { clerkClient } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    console.log("API /api/sync-user: Received userId =", userId);

    if (!userId) {
      console.error("API /api/sync-user: User ID is required");
      return new NextResponse("User ID is required", { status: 400 });
    }

    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });
    console.log("API /api/sync-user: dbUser found =", !!dbUser);

    if (!dbUser) {
      console.log("API /api/sync-user: User not in DB, fetching from Clerk...");
      const clerk = await clerkClient();
      const clerkUser = await clerk.users.getUser(userId);
      if (clerkUser) {
        console.log("API /api/sync-user: Clerk user found, inserting into DB.");
        await db.insert(users).values({
          clerkId: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
        });
        console.log("API /api/sync-user: User inserted into DB.");
      } else {
        console.error("API /api/sync-user: Clerk user not found.");
        return new NextResponse("Clerk user not found", { status: 404 });
      }
    }

    console.log("API /api/sync-user: User synced successfully.");
    return new NextResponse("User synced successfully", { status: 200 });
  } catch (error) {
    console.error("API /api/sync-user: Error syncing user:", error);
    return new NextResponse("Error syncing user", { status: 500 });
  }
}
