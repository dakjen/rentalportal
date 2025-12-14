import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/db";
import { applications, applicationForms, users } from "@/db/schema";
import { count } from "drizzle-orm";

export default async function AdminPage() {
  const applicationCount = await db.select({ value: count() }).from(applications);
  const formCount = await db.select({ value: count() }).from(applicationForms);
  const userCount = await db.select({ value: count() }).from(users);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Applications</CardTitle>
            <CardDescription>Number of applications received</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{applicationCount[0].value}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Application Forms</CardTitle>
            <CardDescription>Number of application forms</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{formCount[0].value}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
            <CardDescription>Number of users in the system</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{userCount[0].value}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}