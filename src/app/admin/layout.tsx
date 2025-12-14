import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (!dbUser) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading user data...</p>{" "}
        {/* Replace with a proper spinner later if needed */}
      </div>
    );
  }

  if (dbUser.role !== "super_admin") {
    redirect("/"); // Redirect to homepage or an unauthorized page
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <aside className="md:col-span-1">
        <Card>
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/admin">Dashboard</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/admin/projects">Projects</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/admin/forms">Application Forms</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/admin/applications">Applications</Link>
                </Button>
              </li>
              <li>
                <Button asChild variant="ghost" className="w-full justify-start">
                  <Link href="/admin/users">Users</Link>
                </Button>
              </li>
              {dbUser.role === 'super_admin' && (
                <li>
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link href="/admin/super-admin">Super Admin</Link>
                  </Button>
                </li>
              )}
            </ul>
          </nav>
        </Card>
      </aside>
      <main className="md:col-span-3">
        <Card>
          <div className="p-4">{children}</div>
        </Card>
      </main>
    </div>
  );
}
