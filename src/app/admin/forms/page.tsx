import { db } from "@/db";
import { applicationForms } from "@/db/schema";
import { revalidatePath } from "next/cache";

export default function FormsPage() {
  async function createForm(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const shareableLink = Math.random().toString(36).substring(7);

    await db.insert(applicationForms).values({ name, shareableLink });
    revalidatePath("/admin/forms");
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
    </div>
  );
}
