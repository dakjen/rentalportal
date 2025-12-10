import { db } from "@/db";
import {
  applicationForms,
  applications,
  applicationQuestions,
  questions,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type PageProps = {
  params: {
    shareableLink: string;
  };
};

export default async function ApplyPage({ params }: PageProps) {
  const { shareableLink } = params;

  const form = await db
    .select()
    .from(applicationForms)
    .where(eq(applicationForms.shareableLink, shareableLink))
    .then((res) => res[0]);

  if (!form) {
    return <div>Form not found</div>;
  }

  const formQuestions = await db
    .select()
    .from(applicationQuestions)
    .where(eq(applicationQuestions.formId, form.id))
    .innerJoin(questions, eq(applicationQuestions.questionId, questions.id))
    .orderBy(applicationQuestions.order);

  async function submitApplication(formData: FormData) {
    "use server";

    const answers = formQuestions.reduce((acc, { questions: question }) => {
      const answer = formData.get(String(question.id));
      if (answer) {
        acc[question.id] = answer;
      }
      return acc;
    }, {} as Record<number, FormDataEntryValue>);

    await db.insert(applications).values({
      formId: form.id,
      answers,
    });

    revalidatePath(`/apply/${shareableLink}`);
    // You might want to redirect to a "thank you" page
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{form.name}</h1>
      <form action={submitApplication} className="flex flex-col gap-4 mt-4">
        {formQuestions.map(({ questions: question }) => (
          <div key={question.id}>
            <label>{question.text}</label>
            {question.type === "text" && (
              <input type="text" name={String(question.id)} className="border p-2 w-full" />
            )}
            {question.type === "textarea" && (
              <textarea name={String(question.id)} className="border p-2 w-full"></textarea>
            )}
            {question.type === "radio" && (
              <div>
                {Array.isArray(question.options) &&
                  question.options.map((option: any) => (
                    <div key={option}>
                      <input type="radio" name={String(question.id)} value={option} />
                      <label className="ml-2">{option}</label>
                    </div>
                  ))}
              </div>
            )}
            {question.type === "checkbox" && (
              <div>
                {Array.isArray(question.options) &&
                  question.options.map((option: any) => (
                    <div key={option}>
                      <input type="checkbox" name={String(question.id)} value={option} />
                      <label className="ml-2">{option}</label>
                    </div>
                  ))}
              </div>
            )}
          </div>
        ))}
        <button type="submit" className="bg-blue-500 text-white p-2">
          Submit Application
        </button>
      </form>
    </div>
  );
}
