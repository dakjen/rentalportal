import { db } from "@/db";
import { projects, projectUsers, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

type PageProps = {
  params: {
    userId: string;
  };
};

export default async function UserProjectsPage({ params }: PageProps) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return <div>Not authenticated</div>;
  }
  console.log("UserProjectsPage: params.userId =", params.userId);
  const userId = parseInt(params.userId);
  console.log("UserProjectsPage: parsed userId =", userId);

  if (isNaN(userId)) {
    console.error("UserProjectsPage: Invalid userId in URL params:", params.userId);
    return <div>Invalid User ID</div>;
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    return <div>User not found</div>;
  }

  const allProjects = await db.select().from(projects);
  const assignedProjects = await db
    .select()
    .from(projectUsers)
    .where(eq(projectUsers.userId, userId));

  const assignedProjectIds = new Set(
    assignedProjects.map((pu) => pu.projectId)
  );

  async function updateProjectAssignments(formData: FormData) {
    "use server";
    // Get current user details for authorization check
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      // Handle not authenticated
      return;
    }
    const selectedProjectIds = formData.getAll("projectIds").map(Number);

    // Delete existing assignments for the user
    await db.delete(projectUsers).where(eq(projectUsers.userId, userId));

    // Insert new assignments
    if (selectedProjectIds.length > 0) {
      const newAssignments = selectedProjectIds.map((projectId) => ({
        userId,
        projectId,
      }));
      await db.insert(projectUsers).values(newAssignments);
    }

    revalidatePath(`/admin/users/${userId}/projects`);
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        <Link href="/admin/users">
          <Button variant="outline" className="mr-4">
            {"<- Back to Users"}
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Manage Projects for {user.email}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assign Projects</CardTitle>
          <CardDescription>
            Select which projects {user.email} should have access to.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updateProjectAssignments} className="space-y-4">
            {allProjects.map((project) => (
              <div key={project.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`project-${project.id}`}
                  name="projectIds"
                  value={project.id}
                  defaultChecked={assignedProjectIds.has(project.id)}
                />
                <Label htmlFor={`project-${project.id}`}>{project.name}</Label>
              </div>
            ))}
            <Button type="submit">Save Assignments</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
