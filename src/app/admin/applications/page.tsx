import { db } from "@/db";
import { applications, applicationForms } from "@/db/schema";
import { eq } from "drizzle-orm";
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
import { Button } from "@/components/ui/button";

export default async function ApplicationsPage() {
  const allApplications = await db
    .select()
    .from(applications)
    .innerJoin(applicationForms, eq(applications.formId, applicationForms.id));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Submitted Applications</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>
            Here are all the applications that have been submitted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Form Name</TableHead>
                <TableHead>Submitted At</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allApplications.map(({ applications: app, application_forms: form }) => (
                <TableRow key={app.id}>
                  <TableCell>{form.name}</TableCell>
                  <TableCell>{app.createdAt.toLocaleString()}</TableCell>
                  <TableCell>
                    <Link href={`/admin/applications/${app.id}`}>
                      <Button variant="outline">View</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
