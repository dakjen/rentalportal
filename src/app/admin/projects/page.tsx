import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { projects, users } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { eq, inArray, InferSelectModel } from "drizzle-orm";

export default async function ProjectsPage() {
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

  let filteredProjects: InferSelectModel<typeof projects>[] = [];
  if (dbUser.role === "admin") {
    filteredProjects = await db.select().from(projects);
  } else {
    const userProjectIds = dbUser.projectUsers.map((pu) => pu.projectId);
    if (userProjectIds.length > 0) {
      filteredProjects = await db.select().from(projects).where(inArray(projects.id, userProjectIds));
    }
  }

  async function createProject(formData: FormData) {
    "use server";

    // Re-check authentication and authorization
    const { userId: currentUserId } = await auth();
    if (!currentUserId) {
      return;
    }

    const currentUserDb = await db.query.users.findFirst({
      where: eq(users.clerkId, currentUserId),
    });

    if (currentUserDb?.role !== "admin") {
      console.error("Only admins can create projects.");
      return;
    }

    const name = formData.get("name") as string;

    if (name) {
      await db.insert(projects).values({ name });
      revalidatePath("/admin/projects");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Projects</h1>
      <div className="flex flex-col gap-8">
        {dbUser.role === "admin" && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Create a New Project</CardTitle>
                <CardDescription>
                  Create a new project to associate application forms with.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form action={createProject} className="flex gap-4">
                  <Input name="name" placeholder="Project Name" required />
                  <Button type="submit">Create</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle>Existing Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {filteredProjects.map((project) => (
                <li key={project.id} className="border p-2 rounded-md">
                  {project.name}
                </li>
              ))}
              {filteredProjects.length === 0 && <p>No projects yet.</p>}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
