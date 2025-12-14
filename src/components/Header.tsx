import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Button } from "./ui/button";

export default async function Header() {
  const { userId } = await auth();
  let isAtLeastAdmin = false;

  if (userId) {
    const dbUser = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    });
    if (dbUser && (dbUser.role === 'admin' || dbUser.role === 'super_admin')) {
      isAtLeastAdmin = true;
    }
  }

  return (
    <header className="bg-primary text-primary-foreground p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          Rental Portal
        </Link>
        <nav>
          <ul className="flex space-x-4">
            {isAtLeastAdmin && (
              <li>
                <Button variant="ghost" asChild>
                  <Link href="/admin">Admin Tools</Link>
                </Button>
              </li>
            )}
            {userId ? (
              <li>
                <Link href="/dashboard">Dashboard</Link>
              </li>
            ) : (
              <>
                <li>
                  <Button variant="secondary" asChild>
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </li>
                <li>
                  <Button asChild>
                    <Link href="/sign-up">Sign Up</Link>
                  </Button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
