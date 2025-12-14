"use server";

import { db } from "@/db";
import { applications } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function submitApplication(
  formId: number,
  answers: Record<number, FormDataEntryValue>,
  shareableLink: string
) {
  await db.insert(applications).values({
    formId,
    answers,
  });

  revalidatePath(`/apply/${shareableLink}`);
  // You might want to handle redirection on the client-side after this
}
