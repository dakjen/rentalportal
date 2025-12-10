import { db } from "@/db";
import { applicationForms } from "@/db/schema";
import { revalidatePath } from "next/cache";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function FormsPage() {
  const forms = await db.select().from(applicationForms);

  async function createForm(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const shareableLink = Math.random().toString(36).substring(7);

    await db.insert(applicationForms).values({ name, shareableLink });
    revalidatePath("/admin/forms");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Application Forms</h1>
      <Card>
        <CardHeader>
          <CardTitle>Create New Form</CardTitle>
          <CardDescription>
            Create a new application form to share with applicants.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createForm} className="flex items-center gap-4">
            <Input
              type="text"
              name="name"
              placeholder="Form Name"
              className="flex-1"
            />
            <Button type="submit">Create Form</Button>
          </form>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Existing Forms</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Form Name</TableHead>
                <TableHead>Shareable Link</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>{form.name}</TableCell>
                  <TableCell>
                    <Link href={`/apply/${form.shareableLink}`} passHref>
                      <a target="_blank" rel="noopener noreferrer">
                        /apply/{form.shareableLink}
                      </a>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/forms/${form.id}`}>
                      <Button variant="outline">Edit</Button>
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
