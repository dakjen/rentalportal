import { db } from "@/db";
import { applications, applicationForms, projects, users } from "@/db/schema";
import { eq, desc, inArray, InferSelectModel } from "drizzle-orm";
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
import { auth } from "@clerk/nextjs/server";

interface UserInfo {
  id: number;
  clerkId: string;
  email: string;
  role: "super_admin" | "admin" | "investor" | "owner" | "property_management" | "marketing";
  projectUsers: { projectId: number; userId: number }[];
}

async function ProjectList({ user }: { user: UserInfo }) {
  let filteredProjects: InferSelectModel<typeof projects>[] = [];
  if (user.role === "admin" || user.role === "super_admin") {
    filteredProjects = await db.select().from(projects);
  } else {
    const userProjectIds = user.projectUsers.map((pu) => pu.projectId);
    if (userProjectIds.length > 0) {
      filteredProjects = await db.select().from(projects).where(inArray(projects.id, userProjectIds));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>Select a project to view its applications.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProjects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>{project.name}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/applications?projectId=${project.id}`}>
                    <Button variant="outline">View Forms</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {filteredProjects.length === 0 && (
              <TableRow>
                <TableCell colSpan={2}>No projects assigned or found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

async function FormList({ projectId, user }: { projectId: number; user: UserInfo }) {
  console.log("--- FormList Component ---");
  console.log("User:", JSON.stringify(user, null, 2));
  console.log("Project ID:", projectId);

  // Authorization check
  if (user.role !== "admin" && user.role !== "super_admin" && !user.projectUsers.some(pu => pu.projectId === projectId)) {
    console.log("User is not authorized to view forms for this project.");
    return <div>Not authorized to view forms for this project.</div>;
  }

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });
  const forms = await db
    .select()
    .from(applicationForms)
    .where(eq(applicationForms.projectId, projectId));
  
  console.log("Forms fetched:", JSON.stringify(forms, null, 2));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Application Forms for <span className="font-bold">{project?.name}</span>
        </CardTitle>
        <CardDescription>Select a form to view its applications.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Form Name</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form.id}>
                <TableCell>{form.name}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/applications?formId=${form.id}`}>
                    <Button variant="outline">View Applications</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {forms.length === 0 && (
              <TableRow>
                <TableCell colSpan={2}>No forms yet for this project.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

async function ApplicationList({ formId, user }: { formId: number; user: UserInfo }) {
  const form = await db.query.applicationForms.findFirst({
    where: eq(applicationForms.id, formId),
    with: {
      project: true,
    },
  });

  // Authorization check
  if (!form || (user.role !== "admin" && user.role !== "super_admin" && !user.projectUsers.some(pu => pu.projectId === form.projectId))) {
    return <div>Not authorized to view applications for this form.</div>;
  }

  const allApplications = await db
    .select()
    .from(applications)
    .where(eq(applications.formId, formId))
    .orderBy(desc(applications.createdAt));

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Applications for <span className="font-bold">{form?.name}</span>
        </CardTitle>
        <CardDescription>
          Project: {form?.project.name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Submitted At</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allApplications.map((app) => (
              <TableRow key={app.id}>
                <TableCell>{app.createdAt.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/admin/applications/${app.id}`}>
                    <Button variant="outline">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
            {allApplications.length === 0 && (
              <TableRow>
                <TableCell colSpan={2}>No applications yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: { projectId?: string; formId?: string };
}) {
  const { userId: clerkUserId } = await auth();

  if (!clerkUserId) {
    return <div>Not authenticated</div>;
  }

  const dbUser = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkUserId),
    with: {
      projectUsers: true,
    },
  });

  if (!dbUser) {
    return <div>User not found in DB</div>;
  }
  
  console.log("--- Applications Page ---");
  console.log("DB User:", JSON.stringify(dbUser, null, 2));

  const { projectId, formId } = searchParams;

  let content;
  let title = "Submitted Applications";
  let backLink = "/admin/applications";

  if (formId) {
    content = <ApplicationList formId={Number(formId)} user={dbUser} />;
    const form = await db.query.applicationForms.findFirst({
      where: eq(applicationForms.id, Number(formId)),
      columns: {
        projectId: true,
      }
    });
    title = "Applications";
    backLink = `/admin/applications?projectId=${form?.projectId}`;
  } else if (projectId) {
    content = <FormList projectId={Number(projectId)} user={dbUser} />;
    title = "Application Forms";
  } else {
    content = <ProjectList user={dbUser} />;
    title = "Projects";
  }

  return (
    <div>
      <div className="flex items-center mb-4">
        { (projectId || formId) && <Link href={backLink}><Button variant="outline" className="mr-4">{"<- Back"}</Button></Link> }
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      {content}
    </div>
  );
}
