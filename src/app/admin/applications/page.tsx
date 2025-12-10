import { db } from "@/db";
import { applications, applicationForms } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";

export default async function ApplicationsPage() {
  const allApplications = await db
    .select()
    .from(applications)
    .innerJoin(applicationForms, eq(applications.formId, applicationForms.id));

  return (
    <div>
      <h1 className="text-2xl font-bold">Submitted Applications</h1>
      <ul>
        {allApplications.map(({ applications: app, application_forms: form }) => (
          <li key={app.id}>
            <Link href={`/admin/applications/${app.id}`}>
              Application for {form.name} submitted at{" "}
              {app.createdAt.toLocaleString()}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
