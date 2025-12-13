import { db } from "@/db";
import { users } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation"; // Corrected import for redirect
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { eq } from "drizzle-orm";
import { clerkClient } from "@clerk/nextjs/server";

type UserRole = "admin" | "investor" | "owner" | "property_management";

export default async function UsersPage({
  searchParams,
}: {
  searchParams?: { status?: string; message?: string };
}) {
  const allUsers = await db.select().from(users);
  const params = searchParams ? await searchParams : {}; // Await searchParams

  async function updateUserRole(formData: FormData) {
    "use server";
    const userId = Number(formData.get("userId"));
    const role = formData.get("role") as UserRole;

    await db.update(users).set({ role }).where(eq(users.id, userId));
    revalidatePath("/admin/users");
  }

  async function addUser(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;

    const clerk = await clerkClient();
    const clerkUsers = await clerk.users.getUserList({
      emailAddress: [email],
    });

    if (clerkUsers.data.length === 0) {
      console.error("User not found in Clerk");
      redirect("/admin/users?status=error&message=User not found in Clerk");
    }

    const clerkUser = clerkUsers.data[0];

    const dbUser = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, clerkUser.id));

    if (dbUser.length > 0) {
      console.error("User already exists in database");
      redirect("/admin/users?status=error&message=User already exists in database");
    }

    await db.insert(users).values({
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress,
    });

    redirect("/admin/users?status=success&message=User added successfully");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      {params.message && (
        <p className={`mb-4 p-2 rounded-md ${
          params.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {params.message}
        </p>
      )}
      <div className="flex flex-col gap-8">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
              <CardDescription>
                Add a new user to the system by their email address. The user
                must already have an account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={addUser} className="flex items-center gap-4">
                <Input
                  type="email"
                  name="email"
                  placeholder="user@example.com"
                  required
                />
                <Button type="submit">Add User</Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <form action={updateUserRole}>
                        <input type="hidden" name="userId" value={user.id} />
                        <div className="flex items-center gap-4">
                          <Select name="role" defaultValue={user.role}>
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="investor">Investor</SelectItem>
                              <SelectItem value="owner">Owner</SelectItem>
                              <SelectItem value="property_management">
                                Property Management
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Button type="submit">Save</Button>
                        </div>
                      </form>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/users/${user.id}/projects`}>
                        <Button variant="outline">Manage Projects</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
