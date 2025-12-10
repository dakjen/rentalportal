import { db, applicationForms } from "@/db/mock";
import Link from "next/link";

export default function FormsPage() {
  async function createForm(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const shareableLink = Math.random().toString(36).substring(7);

    applicationForms.push({ id: applicationForms.length + 1, name, shareableLink });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Application Forms</h1>
      <form action={createForm}>
        <input
          type="text"
          name="name"
          placeholder="Form Name"
          className="border p-2"
        />
        <button type="submit" className="bg-blue-500 text-white p-2">
          Create Form
        </button>
      </form>
      <ul className="mt-4">
        {applicationForms.map((form) => (
          <li key={form.id}>
            <Link href={`/admin/forms/${form.id}`}>{form.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
