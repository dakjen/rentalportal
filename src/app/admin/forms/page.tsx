import { db } from "@/db";
import { applicationForms, projects, users } from "@/db/schema";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

export default async function FormsPage() {
  const { userId } = await auth();

  if (!userId) {
    return <div>Not authenticated</div>;
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    with: {
      projectUsers: true,
    },
  });

  if (!dbUser) {
    return <div>User not found in DB</div>;
  }
  
  console.log("--- Forms Page ---");
  console.log("DB User:", JSON.stringify(dbUser, null, 2));

  let userProjectIds: number[] = [];
  const isSuperAdminOrAdmin = dbUser.role === "admin" || dbUser.role === "super_admin";

  if (!isSuperAdminOrAdmin) {
    userProjectIds = dbUser.projectUsers.map((pu) => pu.projectId);
  }

  const allProjects = await (isSuperAdminOrAdmin
    ? db.select().from(projects)
    : db.select().from(projects).where(inArray(projects.id, userProjectIds)));

  const forms = await db
    .select({
      id: applicationForms.id,
      name: applicationForms.name,
      shareableLink: applicationForms.shareableLink,
      projectName: projects.name,
      projectId: applicationForms.projectId,
    })
    .from(applicationForms)
    .leftJoin(projects, eq(applicationForms.projectId, projects.id))
    .where(
      isSuperAdminOrAdmin
        ? undefined
        : inArray(applicationForms.projectId, userProjectIds)
    );
    
  console.log("Forms fetched:", JSON.stringify(forms, null, 2));

  async function createForm(formData: FormData) {
    "use server";
    // Re-check authentication and authorization
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return;
    }

    const currentUserDb = await db.query.users.findFirst({
      where: eq(users.clerkId, currentUserId),
      with: {
        projectUsers: true,
      },
    });

    if (!currentUserDb) {
      return;
    }

    const name = formData.get("name") as string;
    const projectId = Number(formData.get("projectId"));
    const shareableLink = Math.random().toString(36).substring(7);

    // Check if user is authorized for this project
    if (
      currentUserDb.role !== "admin" && currentUserDb.role !== "super_admin" &&
      !currentUserDb.projectUsers.some((pu) => pu.projectId === projectId)
    ) {
      console.error("User not authorized to create form for this project.");
      return;
    }

    await db.insert(applicationForms).values({ name, shareableLink, projectId });
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
            <Select name="projectId" required>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Project" />
              </SelectTrigger>
              <SelectContent>
                {allProjects.map((project) => (
                  <SelectItem key={project.id} value={String(project.id)}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <TableHead>Project</TableHead>
                <TableHead>Shareable Link</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell>{form.name}</TableCell>
                  <TableCell>{form.projectName ?? "N/A"}</TableCell>
                  <TableCell>
                    <Link
                      href={`/apply/${form.shareableLink}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      /apply/{form.shareableLink}
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
